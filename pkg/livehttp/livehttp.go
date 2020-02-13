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
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if websocket.IsWebSocketUpgrade(r) {
			conn, err := upgrader.Upgrade(w, r, nil)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			ch := make(chan string)
			clients.Store(ch, struct{}{})
			for path := range ch {
				conn.WriteJSON(map[string]interface{}{
					"path": strings.TrimPrefix(path, basepath),
				})
			}
			conn.Close()
			return
		}
		if strings.HasPrefix(r.URL.Path, "/lib") {
			if r.URL.Query().Get("ts") == "" {
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

const ProxyTmpl = `import * as hmr from '/lib/_hmr.mjs?ts=1';
import * as mod from '{{.Path}}?ts=0';

{{range .Exports}}let {{.}}Proxy = mod.{{.}};
{{end}}

hmr.accept('{{.Path}}', async (ts) => {
    let newMod = await import("{{.Path}}?ts="+ts);
{{range .Exports}}    {{.}}Proxy = newMod.{{.}};
{{end}}
});

export {
{{range .Exports}}    {{.}}Proxy as {{.}},
{{end}}
};
`
