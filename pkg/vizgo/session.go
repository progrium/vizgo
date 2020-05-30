package vizgo

import (
	"encoding/json"
	"fmt"

	"github.com/progrium/vizgo/pkg/dataview"
	"github.com/zserge/webview"
)

type Session struct {
	State    *State
	View     *dataview.View
	Frontend chan interface{}
}

func NewSession(w webview.WebView) *Session {
	state := DefaultState
	sess := &Session{
		State:    state,
		View:     dataview.New(state),
		Frontend: make(chan interface{}),
	}
	sess.View.Observe(func(c dataview.Cursor) {
		b, err := json.Marshal(sess.View.Value())
		if err != nil {
			panic(err)
		}
		w.Dispatch(func() {
			w.Eval(fmt.Sprintf("App.update(JSON.parse(`%s`))", string(b)))
		})
	})
	w.Bind("sess_state", sess._state)
	w.Bind("sess_select", sess._select)
	w.Bind("sess_set", sess._set)
	w.Bind("sess_block_create", sess._block_create)
	return sess
}

// these methods are not meant to be called by Go code

func (s *Session) _state() interface{} {
	return s.View.Value()
}

func (s *Session) _select(fn string) {
	s.View.Select("Selected").Set(fn)
}

func (s *Session) _set(path string, v interface{}) {
	s.View.Select(path).Set(v)
}

func (s *Session) _block_create(typ string, x, y int) {
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

}

func (s *Session) _block_disconnect(src, dst string) {

}

func (s *Session) _block_move(id, x, y int) {
	fmt.Println("TODO: _block_move", id, x, y)
}
