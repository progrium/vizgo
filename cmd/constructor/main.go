package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/radovskyb/watcher"
	"github.com/zserge/webview"
)

const (
	windowWidth  = 960
	windowHeight = 640

	AssetsDir = "./assets"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var clients = &sync.Map{}

func startServer() string {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal(err)
	}
	go func() {
		defer ln.Close()
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
			http.FileServer(http.Dir(AssetsDir)).ServeHTTP(w, r)
		})
		log.Fatal(http.Serve(ln, nil))
	}()
	return "http://" + ln.Addr().String()
}

func handleRPC(w webview.WebView, data string) {
	switch {
	case strings.HasPrefix(data, "log:"):
		fmt.Println(strings.TrimPrefix(data, "log:"))
	}
}

func main() {
	watch := watcher.New()
	watch.SetMaxEvents(1)
	watch.FilterOps(watcher.Write)
	if err := watch.AddRecursive(AssetsDir); err != nil {
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
	go func() {
		if err := watch.Start(time.Millisecond * 100); err != nil {
			log.Fatalln(err)
		}
	}()

	url := startServer()
	fmt.Println(url)
	w := webview.New(webview.Settings{
		Width:                  windowWidth,
		Height:                 windowHeight,
		Title:                  "Constructor",
		Resizable:              true,
		URL:                    url,
		ExternalInvokeCallback: handleRPC,
	})
	w.SetColor(255, 255, 255, 255)
	defer w.Exit()
	w.Run()
}
