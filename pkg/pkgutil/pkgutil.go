package pkgutil

import (
	"fmt"
	"go/types"
	"path"
	"reflect"
	"strings"

	packages "golang.org/x/tools/go/packages"
)

var BuiltinTypes = []string{
	"int", "int8", "int16", "int32", "int64",
	"uint", "uint8", "uint16", "uint32", "uint64",
	"bool",
	"rune",
	"byte",
	"uintptr",
	"float32",
	"float64",
	"complex128",
	"complex64",
	"string",
}

type Var struct {
	Name string
	Type string
}

type Export struct {
	FQN  FQN
	Type string
	Kind string
}

type Function struct {
	Name   string
	In     []Var
	Out    []Var
	Locals []Var
}

type FQN string

func (n FQN) Package() string {
	dir := path.Dir(n.String())
	base := path.Base(n.String())
	parts := strings.SplitN(base, ".", 2)
	if dir == "." {
		return parts[0]
	}
	return fmt.Sprintf("%s/%s", dir, parts[0])
}

func (n FQN) Base() string {
	return path.Base(n.String())
}

func (n FQN) Name() string {
	parts := strings.SplitN(n.Base(), ".", 2)
	return parts[1]
}

func (n FQN) String() string {
	return string(n)
}

type Package struct {
	*packages.Package

	FQN FQN
}

func Load(fqn string) (*Package, error) {
	fqn_ := FQN(fqn)
	cfg := &packages.Config{Mode: packages.NeedTypesInfo | packages.NeedTypes}
	pkgs, err := packages.Load(cfg, fqn_.Package())
	if err != nil {
		return nil, err
	}
	return &Package{
		Package: pkgs[0],
		FQN:     fqn_,
	}, nil
}

// AvailableTypes returns identifiers for types that can be used from this package
func (pkg *Package) AvailableTypes() (T []string) {
	T = append(T, BuiltinTypes...)

	for _, export := range pkg.Exports() {
		if export.Kind == "type" {
			T = append(T, export.FQN.Name())
		}
	}

	for fqn, subpkg := range pkg.Imports {
		prefix := path.Base(fqn)
		p := Package{subpkg, FQN(fqn)}
		for _, export := range p.Exports() {
			if export.Kind == "type" {
				T = append(T, strings.Join([]string{prefix, export.FQN.Name()}, "."))
			}
		}
	}

	return
}

// Members returns methods and fields (if a struct) for a type in the package
func (pkg *Package) Members(typeName string) []Var {
	var members []Var
	o := pkg.Types.Scope().Lookup(typeName)

	if o == nil {
		return []Var{}
	}

	t, exists := o.Type().(*types.Named)
	if !exists {
		return []Var{}
	}

	tt, isStruct := t.Underlying().(*types.Struct)
	if isStruct {
		for i := 0; i < tt.NumFields(); i++ {
			v := tt.Field(i)
			members = append(members, Var{
				Name: v.Name(),
				Type: v.Type().String(),
			})
		}
	}

	m := types.NewMethodSet(types.NewPointer(t))
	for i := 0; i < m.Len(); i++ {
		s := m.At(i)
		members = append(members, Var{
			Name: s.Obj().Name(),
			Type: s.Type().String(),
		})
	}

	return members
}

// Exports returns a list of exports for the package
func (pkg *Package) Exports() []Export {
	var exports []Export

	for _, name := range pkg.Types.Scope().Names() {
		o := pkg.Types.Scope().Lookup(name)
		if !o.Exported() {
			continue
		}
		switch t := o.(type) {
		case *types.Func:
			exports = append(exports, Export{
				Type: t.Type().(*types.Signature).String(),
				Kind: "func",
				FQN:  memberFQN(o, name),
			})
		case *types.Var:
			exports = append(exports, Export{
				Type: t.Type().String(),
				Kind: "var",
				FQN:  memberFQN(o, name),
			})
		case *types.Const:
			exports = append(exports, Export{
				Type: strings.Replace(t.Type().String(), "untyped ", "", -1),
				Kind: "const",
				FQN:  memberFQN(o, name),
			})
		default:
			switch nt := o.Type().(type) {
			case *types.Named:
				var T string
				switch tt := nt.Underlying().(type) {
				case *types.Interface:
					T = "interface"
				case *types.Struct:
					T = "struct"
				case *types.Array:
					T = "array"
				case *types.Slice:
					T = "slice"
				case *types.Chan:
					T = "chan"
				case *types.Map:
					T = "map"
				case *types.Signature:
					T = "signature"
				case *types.Basic:
					T = tt.Name()
				default:
					typeErr(tt)
				}
				exports = append(exports, Export{
					Type: T,
					Kind: "type",
					FQN:  memberFQN(o, name),
				})
			default:
				typeErr(t)
			}
		}
	}
	return exports
}

// Function returns in/out/locals for a function in the package
// TODO: Methods!
func (pkg *Package) Function(funcName string) Function {
	fn, exists := pkg.Types.Scope().Lookup(funcName).(*types.Func)
	if !exists {
		return Function{}
	}

	var locals []Var
	for _, name := range fn.Scope().Names() {
		// TODO: lookup type
		locals = append(locals, Var{
			Name: name,
		})
	}

	sig := fn.Type().(*types.Signature)

	params := sig.Params()
	var in []Var
	for i := 0; i < params.Len(); i++ {
		param := params.At(i)
		in = append(in, Var{
			Name: param.Name(),
			Type: param.Type().String(),
		})
	}

	results := sig.Results()
	var out []Var
	for i := 0; i < results.Len(); i++ {
		result := results.At(i)
		out = append(out, Var{
			Name: result.Name(),
			Type: result.Type().String(),
		})
	}

	return Function{
		Name:   funcName,
		Locals: locals,
		In:     in,
		Out:    out,
	}
}

func typeErr(t interface{}) {
	fmt.Println("type:", reflect.ValueOf(t).Type())
	panic("unknown type")
}

func memberFQN(o types.Object, name string) FQN {
	return FQN(strings.Join([]string{o.Pkg().Path(), name}, "."))
}
