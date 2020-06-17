package vizgo

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/progrium/vizgo/pkg/dataview"
	"github.com/progrium/vizgo/pkg/pkgutil"
	"github.com/zserge/webview"
)

type Session struct {
	State   *State
	View    *dataview.View
	Pkg     *pkgutil.Package
	Imports map[string]*pkgutil.Package
	WebView webview.WebView
}

func NewSession(w webview.WebView) *Session {
	state := DefaultState
	sess := &Session{
		State:   state,
		View:    dataview.New(state),
		WebView: w,
		Imports: make(map[string]*pkgutil.Package),
	}

	sess.View.Select("Package").Observe(sess.GenerateSource)
	sess.View.Select("Selected").Observe(sess.UpdateLocals)
	sess.View.Select("Source").Observe(sess.UpdatePackageMeta)
	sess.View.Select("Package/Imports").Observe(sess.UpdateImportsMeta)
	sess.View.Observe(sess.PushState)

	sess.GenerateSource(nil)

	w.Bind("sess_state", sess._state)
	w.Bind("sess_select", sess._select)
	w.Bind("sess_set", sess._set)
	w.Bind("sess_unset", sess._unset)
	w.Bind("sess_append", sess._append)
	w.Bind("sess_fn_create", sess._fn_create)
	w.Bind("sess_block_create", sess._block_create)
	w.Bind("sess_block_connect", sess._block_connect)
	w.Bind("sess_block_disconnect", sess._block_disconnect)
	return sess
}

func (s *Session) GenerateSource(c dataview.Cursor) {
	var pkg Package
	s.View.Select("Package").ValueTo(&pkg)
	t := time.Now()
	src, err := generate(pkg)
	log.Println("generated source in", time.Since(t))
	if err != nil {
		log.Println("generation failure:", err)
		fmt.Println(src)
		return
	}
	src = html.EscapeString(src)
	s.View.Select("Source").Set(src)
}

func (s *Session) UpdatePackageMeta(c dataview.Cursor) {
	log.Println("updating package meta...")
	go func() {
		var err error
		t := time.Now()
		s.Pkg, err = pkgutil.Load(s.State.Package.PkgPath)
		log.Println("package load time:", time.Since(t))
		if err != nil {
			log.Println("load error:", err)
		}
		s.View.Select("TypeIDs").Set(s.Pkg.AvailableTypes())

		s.UpdateLocals(nil)
	}()
}

func (s *Session) UpdateImportsMeta(c dataview.Cursor) {
	log.Println("updating imports meta...")
	go func() {
		var err error

		importIDs := make(map[string][]string)
		for _, imprt := range s.State.Package.Imports {
			pkg, found := s.Imports[imprt.Package]
			if !found {
				t := time.Now()
				pkg, err = pkgutil.Load(imprt.Package)
				log.Printf("imported package [%s] load time: %s\n", imprt.Package, time.Since(t))
				if err != nil {
					log.Println("import load error:", err)
					continue
				}
				s.Imports[imprt.Package] = pkg
			}

			var ids []string
			for _, export := range pkg.Exports() {
				ids = append(ids, export.FQN.Name())
			}
			importIDs[path.Base(imprt.Package)] = ids
		}
		s.View.Select("ImportIDs").Set(importIDs)
	}()
}

func (s *Session) UpdateLocals(c dataview.Cursor) {
	if s.State.Selected != "" {
		log.Println("updating locals...")
		var locals []string
		meta := s.Pkg.Function(s.State.Function.Name)
		for _, local := range meta.Locals {
			locals = append(locals, local.Name)
		}
		s.View.Select("Locals").Set(locals)
	}
}

func (s *Session) PushState(c dataview.Cursor) {
	state := s.View.Value()
	b, err := json.Marshal(state)
	if err != nil {
		panic(err)
	}
	s.WebView.Dispatch(func() {
		s.WebView.Eval(fmt.Sprintf("App.session.update(JSON.parse(String.raw`%s`))", string(b)))
	})
}

// these methods are not meant to be called by Go code

func (s *Session) _state() interface{} {
	return s.View.Value()
}

func (s *Session) _select(fn string) {
	log.Println("select:", fn)

	s.View.Select("Function").Set(s.View.Select(fn).Value())
	s.View.Select("Selected").Set(fn)
}

func (s *Session) _set(path string, v interface{}) {
	log.Println("set:", path, v)

	s.View.Select(path).Set(v)
}

func (s *Session) _unset(path string) {
	log.Println("unset:", path)

	s.View.Select(path).Unset()
}

func (s *Session) _append(path string, v interface{}) {
	log.Println("append:", path, v)

	s.View.Select(path).Append(v)
}

func (s *Session) _fn_create() {
	id := uid()
	decl := Declaration{
		Kind: "function",
		Function: Function{
			Name:  "_",
			Entry: id,
			Blocks: []Block{
				{Type: "return", ID: id, Position: [2]int{6, 5}},
			},
		},
	}
	s.View.Select("/Package/Declarations").Append(decl)
}

func (s *Session) _block_create(typ, label string, x, y int) {
	if s.State.Selected == "" {
		return
	}

	log.Println("block_create:", typ, x, y)

	var in, out []string

	if typ == "pkgcall" {
		typ = "call"
		meta := s.Pkg.Function(strings.TrimRight(label, "()"))
		for _, v := range meta.In {
			in = append(in, v.Name)
		}
		for _, v := range meta.Out {
			out = append(out, v.Type)
		}
	}

	if typ == "imported" {
		typ = "call"
		parts := strings.Split(label, ".")
		pkg, found := s.Imports[parts[0]]
		if !found {
			log.Println("failed to block for unloaded import:", parts[0])
			return
		}
		meta := pkg.Function(strings.TrimRight(parts[1], "()"))
		for _, v := range meta.In {
			in = append(in, v.Name)
		}
		for _, v := range meta.Out {
			out = append(out, v.Type)
		}
	}

	cur := s.View.Select(s.State.Selected)
	var fn Function
	cur.ValueTo(&fn)
	b := Block{
		Type:     BlockType(typ),
		ID:       uid(),
		Inputs:   in,
		Outputs:  out,
		Label:    label,
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
