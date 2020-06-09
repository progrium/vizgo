package gen

import (
	"fmt"
	"testing"
)

func TestGen(t *testing.T) {
	s := &Source{}
	s.Decl("package", "foo")
	s.Decl("import", `("fmt")`)
	s.Fn("main", []string{}, "", func(s *Source) {
		s.Call("fmt.Println", s.Str("Hello world"))
	})
	fmt.Println(s.String())

	t.Fatal("TODO")
}
