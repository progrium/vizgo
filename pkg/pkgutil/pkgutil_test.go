package pkgutil

import (
	"testing"
)

func TestExports(t *testing.T) {
	pkg, err := Load("github.com/progrium/vizgo/pkg/pkgutil")
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		name   string
		kind   string
		exists bool
	}{
		{name: "Var", kind: "type", exists: true},
		{name: "BuiltinTypes", kind: "var", exists: true},
		{name: "Load", kind: "func", exists: true},
		{name: "memberFQN", exists: false},
	}

	got := pkg.Exports()
	for _, tc := range tests {
		var found *Export
		for _, e := range got {
			if e.FQN.Name() == tc.name {
				found = &e
				break
			}
		}
		if tc.exists && found != nil {
			if found.Kind != tc.kind {
				t.Fatalf("expected: %v, got: %v", tc.kind, found.Kind)
			}
		}
		if tc.exists && found == nil {
			t.Fatalf("expected export not found: %v", tc.name)
		}
		if !tc.exists && found != nil {
			t.Fatalf("unexpected export found: %v", tc.name)
		}
	}
}

func TestTypes(t *testing.T) {
	pkg, err := Load("github.com/progrium/vizgo/pkg/pkgutil")
	if err != nil {
		t.Fatal(err)
	}

	types := pkg.AvailableTypes()
	for _, want := range []string{"int", "bool", "complex128", "Export", "Function", "FQN"} {
		found := false
		for _, got := range types {
			if got == want {
				found = true
			}
		}
		if !found {
			t.Fatalf("unable to find available type: %v", want)
		}
	}
}

func TestMembers(t *testing.T) {
	pkg, err := Load("github.com/progrium/vizgo/pkg/pkgutil")
	if err != nil {
		t.Fatal(err)
	}
	members := pkg.Members("Var")
	if members[0].Name != "Name" {
		t.Fatalf("Name not found in members for Var: %v", members)
	}
	if members[1].Name != "Type" {
		t.Fatalf("Type not found in members for Var: %v", members)
	}
}

func TestFunction(t *testing.T) {
	pkg, err := Load("github.com/progrium/vizgo/pkg/pkgutil")
	if err != nil {
		t.Fatal(err)
	}
	got := pkg.Function("Load")
	if len(got.In) != 1 {
		t.Fatalf("unexpected In count: %v", got.In)
	}
	if len(got.Out) != 2 {
		t.Fatalf("unexpected Out count: %v", got.Out)
	}
	if len(got.Locals) == 0 {
		t.Fatalf("unexpected Locals count: %v", got.Locals)
	}
}
