package vizgo

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/Schobers/bindatafs"
	"github.com/gorilla/handlers"
	"github.com/progrium/hotweb/pkg/hotweb"
	"github.com/progrium/vizgo/pkg/data/ui"
	"github.com/spf13/afero"
	"github.com/zserge/webview"
)

const (
	listenAddr = "127.0.0.1:9999"

	windowWidth  = 1280
	windowHeight = 720
)

func Run() {
	var fs afero.Fs = bindatafs.NewFs(ui.MustAsset, ui.AssetInfo, ui.AssetNames)
	dir := "ui"

	if os.Getenv("UI_DIR") != "" {
		var err error
		dir, err = filepath.Abs(os.Getenv("UI_DIR"))
		if err != nil {
			panic(err)
		}
		fmt.Println("* Using UI_DIR for frontend")
		fs = afero.NewOsFs()
	}

	hw := hotweb.New(hotweb.Config{
		Filesystem: fs,
		ServeRoot:  dir,
		JsxFactory: "h",
	})
	go func() {
		log.Fatal(hw.Watch())
	}()

	url := fmt.Sprintf("http://%s", listenAddr)

	go func() {
		log.Printf("serving at %s\n", url)
		http.ListenAndServe(listenAddr, handlers.LoggingHandler(os.Stdout, hw))
	}()

	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("Vizgo")
	w.SetSize(windowWidth, windowHeight, webview.HintNone)
	w.Navigate(url)

	NewSession(w)

	w.Run()
}
