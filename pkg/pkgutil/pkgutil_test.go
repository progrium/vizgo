package pkgutil

import (
	"fmt"
	"testing"
)

func TestExports(t *testing.T) {
	pkg, _ := Load("github.com/progrium/vizgo/pkg/pkgutil")
	fmt.Println(pkg.Exports())

	t.Fail()
}

func TestTypes(t *testing.T) {
	pkg, _ := Load("github.com/progrium/vizgo/pkg/pkgutil")
	fmt.Println(pkg.AvailableTypes())

	t.Fail()
}
