package app

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/handlers"
	"github.com/progrium/hotweb/pkg/hotweb"
	"github.com/zserge/webview"
)

const (
	listenAddr = "127.0.0.1:9999"

	windowWidth  = 960
	windowHeight = 640

	frontendDir = "./ui"
)

func handleRPC(w webview.WebView, data string) {
	switch {
	case strings.HasPrefix(data, "log:"):
		fmt.Println(strings.TrimPrefix(data, "log:"))
	}
}

func Main() {
	hw := hotweb.New(frontendDir, nil)
	go func() {
		log.Printf("watching %#v\n", frontendDir)
		log.Fatal(hw.Watch())
	}()
	url := fmt.Sprintf("http://%s", listenAddr)
	log.Printf("serving at %s\n", url)
	http.ListenAndServe(listenAddr, handlers.LoggingHandler(os.Stdout, hw))

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
