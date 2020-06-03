package vizgo

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"strconv"
	"strings"

	"github.com/progrium/vizgo/pkg/dataview"
	"github.com/zserge/webview"
)

type Session struct {
	State *State
	View  *dataview.View
}

func NewSession(w webview.WebView) *Session {
	state := DefaultState
	sess := &Session{
		State: state,
		View:  dataview.New(state),
	}
	genSource := func() {
		log.Println("generating source...")
		var pkg Package
		sess.View.Select("Package").ValueTo(&pkg)
		src, err := generate(pkg)
		if err != nil {
			panic(err)
		}
		src = html.EscapeString(src)
		sess.View.Select("Source").Set(src)
	}
	genSource()
	sess.View.Select("Package").Observe(func(c dataview.Cursor) {
		genSource()
	})
	sess.View.Observe(func(c dataview.Cursor) {
		state := sess.View.Value()
		b, err := json.Marshal(state)
		if err != nil {
			panic(err)
		}
		w.Dispatch(func() {
			w.Eval(fmt.Sprintf("App.session.update(JSON.parse(String.raw`%s`))", string(b)))
		})
	})
	w.Bind("sess_state", sess._state)
	w.Bind("sess_select", sess._select)
	w.Bind("sess_set", sess._set)
	w.Bind("sess_block_create", sess._block_create)
	w.Bind("sess_block_connect", sess._block_connect)
	w.Bind("sess_block_disconnect", sess._block_disconnect)
	return sess
}

// these methods are not meant to be called by Go code

func (s *Session) _state() interface{} {
	return s.View.Value()
}

func (s *Session) _select(fn string) {
	log.Println("select:", fn)

	s.View.Select("Selected").Set(fn)
}

func (s *Session) _set(path string, v interface{}) {
	log.Println("set:", path, v)

	s.View.Select(path).Set(v)
}

func (s *Session) _block_create(typ string, x, y int) {
	log.Println("block_create:", typ, x, y)

	cur := s.View.Select(s.State.Selected)
	var fn Function
	cur.ValueTo(&fn)
	b := Block{
		Type:     BlockType(typ),
		ID:       nextBlockID(fn),
		Position: Position{x, y},
	}
	cur.Select("Blocks").Append(b)
}

func (s *Session) _block_connect(src, dst string) {
	log.Println("block_connect:", src, dst)

	var srcPort string
	if strings.Contains(src, "-") {
		parts := strings.Split(src, "-")
		src = parts[0]
		srcPort = parts[1]
	}
	if strings.Contains(dst, "-") {
		parts := strings.Split(dst, "-")
		dst = fmt.Sprintf("%s-in-%s", parts[0], parts[1])
	}

	path := s.View.Select("Selected").Value().(string)
	fn := s.View.Select(path)
	if fn == nil {
		fmt.Println("block_connect: unable to find selected path: ", path)
		return
	}

	if src == "entrypoint" {
		fn.Select("Entry").Set(dst)
		return
	}

	for i, b := range fn.Select("Blocks").Value().([]Block) {
		if b.ID == src {
			if srcPort == "" {
				fn.Select("Blocks", strconv.Itoa(i), "Connect").Set(fmt.Sprintf("%s-in", dst))
				return
			}
			if srcPort == "expr" {
				fn.Select("Blocks", strconv.Itoa(i), "Connect").Set(dst)
				return
			}
			if b.Connects == nil {
				fn.Select("Blocks", strconv.Itoa(i), "Connects").Set(make(map[string]string))
			}
			fn.Select("Blocks", strconv.Itoa(i), "Connects", srcPort).Set(dst)
			return
		}
	}
}

func (s *Session) _block_disconnect(src, dst string) {
	log.Println("block_disconnect:", src, dst)

	var srcPort string
	if strings.Contains(src, "-") && strings.Contains(dst, "-") {
		parts := strings.Split(src, "-")
		src = parts[0]
		srcPort = parts[1]
	}

	path := s.View.Select("Selected").Value().(string)
	fn := s.View.Select(path)
	if fn == nil {
		fmt.Println("block_disconnect: unable to find selected path: ", path)
		return
	}

	if src == "entrypoint" {
		fn.Select("Entry").Set("")
		return
	}

	for i, b := range fn.Select("Blocks").Value().([]Block) {
		if b.ID == src {
			if srcPort == "" {
				fn.Select("Blocks", strconv.Itoa(i), "Connect").Set("")
				return
			}
			if srcPort == "expr" {
				fn.Select("Blocks", strconv.Itoa(i), "Connect").Set("")
				return
			}
			if b.Connects == nil {
				fn.Select("Blocks", strconv.Itoa(i), "Connects").Set(make(map[string]string))
			}
			fn.Select("Blocks", strconv.Itoa(i), "Connects", srcPort).Unset()
			return
		}
	}
}
