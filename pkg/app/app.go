package app

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

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

func Main() {
	dir, err := filepath.Abs(frontendDir)
	if err != nil {
		panic(err)
	}

	hw := hotweb.New(hotweb.Config{
		ServeRoot:  dir,
		JsxFactory: "h",
	})
	go func() {
		log.Printf("watching %#v\n", frontendDir)
		log.Fatal(hw.Watch())
	}()

	url := fmt.Sprintf("http://%s", listenAddr)

	go func() {
		log.Printf("serving at %s\n", url)
		http.ListenAndServe(listenAddr, handlers.LoggingHandler(os.Stdout, hw))
	}()

	w := webview.New(true)
	defer w.Destroy()

	ch := make(chan interface{})

	go func() {
		ch <- NewSession()
	}()

	w.SetTitle("Vizgo")
	w.SetSize(windowWidth, windowHeight, webview.HintNone)
	w.Navigate(url)
	w.Bind("recv", func() interface{} { return <-ch })
	w.Run()
}

func NewSession() Session {
	return Session{
		Selected: "main",
		Package: Package{
			Name: "main",
			Declarations: []Declaration{
				{"imports", Import{
					Package: "fmt",
				}},
				{"function", Function{
					Name:  "main",
					In:    []Argument{},
					Out:   []TypeID{},
					Entry: "main.0",
					Blocks: []Block{
						{
							Type:     "call",
							ID:       "main.0",
							Inputs:   []string{"string", "error"},
							Outputs:  []string{"string", "error"},
							Label:    "fmt.Println()",
							Connect:  "main.1-in",
							Position: Position{6, 5},
						},
						{
							Type:     "return",
							ID:       "main.1",
							Inputs:   []string{"string", "error"},
							Position: Position{16, 5},
						},
					},
				}},
			},
		},
	}
}
