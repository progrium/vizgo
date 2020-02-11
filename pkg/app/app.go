package app

import (
	"fmt"
	"strings"

	"github.com/progrium/constructor/pkg/livehttp"
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
	url := livehttp.StartServer(frontendDir, listenAddr)
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
