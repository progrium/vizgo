package gen

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"
)

type Source struct {
	stack [][]string
	stmts []string
}

func New(pkg string) *Source {
	src := &Source{}
	src.Decl("package", pkg)
	return src
}

func (s *Source) String() string {
	out, _ := s.Format()
	return out
}

func (s *Source) Format() (string, error) {
	src := strings.Join(s.stmts, "\n")
	cmd := exec.Command("gofmt")
	cmd.Stdin = bytes.NewBufferString(src)
	out, err := cmd.Output()
	if err != nil {
		return string(out), err
	}
	return string(out), nil
}

func (s *Source) Block(fn func(*Source)) string {
	s.stack = append(s.stack, s.stmts)
	s.stmts = []string{}
	fn(s)
	stmts := s.stmts
	s.stmts, s.stack = s.stack[len(s.stack)-1], s.stack[:len(s.stack)-1]
	return strings.Join(stmts, "\n")
}

func (s *Source) Pop() (stmt string) {
	stmt, s.stmts = s.stmts[len(s.stmts)-1], s.stmts[:len(s.stmts)-1]
	return
}

func (s *Source) Decl(args ...interface{}) {
	var parts []string
	var block func(*Source)
	for _, arg := range args {
		switch a := arg.(type) {
		case string:
			parts = append(parts, a)
		case func(*Source):
			block = a
		}
	}
	line := strings.Join(parts, " ")
	if block != nil {
		s.stmts = append(s.stmts, fmt.Sprintf("%s {\n%s\n}", line, s.Block(block)))
	} else {
		s.stmts = append(s.stmts, line)
	}
}

func (s *Source) signature(args []string, typ string) string {
	return fmt.Sprintf("(%s) %s", strings.Join(args, ", "), typ)
}

func (s *Source) Fn(name string, args []string, typ string, block func(*Source)) {
	s.Decl("func", fmt.Sprintf("%s%s", name, s.signature(args, typ)), block)
}

func (s *Source) Call(name string, args ...string) {
	s.Decl(fmt.Sprintf("%s(%s)", name, strings.Join(args, ", ")))
}

func (ss *Source) Comment(s string) {
	ss.Decl(fmt.Sprintf("// %s", s))
}

func (s *Source) Str(v string) string {
	return fmt.Sprintf(`"%s"`, v)
}

func (s *Source) Chain(args ...string) string {
	return strings.Join(args, ".")
}

func (s *Source) Var(name, typ, value string) string {
	if value != "" {
		return fmt.Sprintf("var %s %s = %s", name, typ, value)
	}
	return fmt.Sprintf("var %s %s", name, typ)
}

func (s *Source) Assign(name, value string, declare bool) string {
	op := "="
	if declare {
		op = ":="
	}
	return fmt.Sprintf("%s %s %s", name, op, value)
}
