package livehttp

import (
	"log"
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/radovskyb/watcher"
)

const (
	WatchInterval = time.Millisecond * 100
)

var clients = &sync.Map{}

func StartServer(filepath string, listenAddr string) string {
	ln, err := net.Listen("tcp", listenAddr)
	if err != nil {
		log.Fatal(err)
	}
	go serveHTTP(filepath, ln)
	go watchFiles(filepath)
	return "http://" + ln.Addr().String()
}

func serveHTTP(filepath string, ln net.Listener) {
	defer ln.Close()
	var upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if websocket.IsWebSocketUpgrade(r) {
			conn, err := upgrader.Upgrade(w, r, nil)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			ch := make(chan bool)
			clients.Store(ch, struct{}{})
			<-ch
			conn.Close()
			return
		}
		http.FileServer(http.Dir(filepath)).ServeHTTP(w, r)
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
			case <-watch.Event:
				clients.Range(func(k, v interface{}) bool {
					close(k.(chan bool))
					clients.Delete(k)
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
