package livehttp

import (
	"log"
	"net"
	"net/http"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"text/template"
	"time"

	"github.com/gorilla/websocket"
	"github.com/progrium/constructor/pkg/jsexports"
	"github.com/radovskyb/watcher"
)

const (
	WatchInterval = time.Millisecond * 50
)

var clients = &sync.Map{}

func StartServer(basepath string, listenAddr string) string {
	ln, err := net.Listen("tcp", listenAddr)
	if err != nil {
		log.Fatal(err)
	}
	basepath, err = filepath.Abs(basepath)
	if err != nil {
		log.Fatal(err)
	}
	go serveHTTP(basepath, ln)
	go watchFiles(basepath)
	return "http://" + ln.Addr().String()
}

func serveHTTP(basepath string, ln net.Listener) {
	defer ln.Close()
	var upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	tmpl := template.Must(template.New("proxy").Parse(ProxyTmpl))
	counter := 0
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if websocket.IsWebSocketUpgrade(r) {
			conn, err := upgrader.Upgrade(w, r, nil)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			defer conn.Close()
			counter++
			id := counter
			ch := make(chan string)
			clients.Store(ch, struct{}{})
			log.Println("new hmr connection")
			for path := range ch {
				err := conn.WriteJSON(map[string]interface{}{
					"path": strings.TrimPrefix(path, basepath),
				})
				if err != nil {
					clients.Delete(ch)
					if !strings.Contains(err.Error(), "broken pipe") {
						log.Println("hmr error:", err)
					}
					return
				} else {
					log.Println("hmr:", id, path)
				}
			}
			return
		}
		if strings.HasPrefix(r.URL.Path, "/lib") {
			if r.URL.Query().Get("ts") == "" && path.Base(r.URL.Path)[0] != '_' {
				w.Header().Set("content-type", "text/javascript")
				exports, err := jsexports.Exports(path.Join(basepath, r.URL.Path))
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					log.Println(err)
					return
				}
				tmpl.Execute(w, map[string]interface{}{
					"Path":    r.URL.Path,
					"Exports": exports,
					"Reload":  contains(exports, "liveReload"),
				})
				return
			}
		}
		http.FileServer(http.Dir(basepath)).ServeHTTP(w, r)
	})
	log.Fatal(http.Serve(ln, nil))
}

func watchFiles(filepath string) {
	watch := watcher.New()
	watch.SetMaxEvents(1)
	watch.FilterOps(watcher.Write)
	if err := watch.AddRecursive(filepath); err != nil {
		log.Fatalln(err)
	}
	go func() {
		for {
			select {
			case event := <-watch.Event:
				// log.Println(event)
				clients.Range(func(k, v interface{}) bool {
					k.(chan string) <- event.Path
					return true
				})
			case err := <-watch.Error:
				log.Fatalln(err)
			case <-watch.Closed:
				return
			}
		}
	}()
	if err := watch.Start(WatchInterval); err != nil {
		log.Fatalln(err)
	}
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

const ProxyTmpl = `import * as hmr from '/lib/_hmr.mjs';
import * as mod from '{{.Path}}?ts=0';

{{range .Exports}}let {{.}}Proxy = mod.{{.}};
{{end}}

hmr.accept('{{.Path}}', async (ts) => {
{{ if .Reload }}	location.reload();
{{ else }}	let newMod = await import("{{.Path}}?ts="+ts);
{{range .Exports}}	{{.}}Proxy = newMod.{{.}};
{{end}}
{{- end -}}
});

export {
{{range .Exports}}	{{.}}Proxy as {{.}},
{{end}}
};
`
