package vizgo

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"

	"github.com/progrium/vizgo/pkg/gen"
)

func generate(pkg Package) (string, error) {
	f := gen.New(pkg.Name)
	f.Decl("import (")
	for _, imp := range pkg.Imports {
		if imp.Package == "" {
			continue
		}
		if imp.Alias != "" {
			f.Decl(imp.Alias, f.Str(imp.Package))
		} else {
			f.Decl(f.Str(imp.Package))
		}
	}
	f.Decl(")")
	for _, decl := range pkg.Declarations {
		switch decl.Kind {
		case "type":
			typ := decl.Type
			f.Decl("type", typ.Name, typ.Type, func(f *gen.Source) {
				for _, field := range typ.Fields {
					if field.Name == "" {
						continue
					}
					f.Decl(field.Name, field.Type)
				}
			})
			for _, method := range typ.Methods {
				if method.Name == "" {
					continue
				}
				f.Decl("func", fmt.Sprintf("(mr *%s) %s()", typ.Name, method.Name), "{}")
			}

		case "function":
			fn := decl.Function
			var params []string
			for _, param := range fn.In {
				if param.Name == "" {
					continue
				}
				params = append(params, fmt.Sprintf("%s %s", param.Name, param.Type))
			}
			out := strings.Join(fn.Out, ", ")
			if len(fn.Out) > 1 {
				out = fmt.Sprintf("(%s)", out)
			}
			if len(fn.Out) == 0 {
				out = ""
			}
			f.Fn(fn.Name, params, out, func(f *gen.Source) {
				block := fnBlock(fn.Blocks, fn.Entry)
				for block != nil {
					switch block.Type {
					case "call":
						var args []string
						for _, input := range block.Inputs {
							expr := backRefInput(fn.Blocks, block, input)
							if expr != nil {
								args = append(args, expr.Label)
							}
						}
						f.Call(block.Label, args...)
					case "return":
						f.Decl("return")
					default:
						log.Println("unknown block type: ", block.Type)
					}
					if block.Connect != "" {
						block = fnBlock(fn.Blocks, block.Connect)
						continue
					}
					block = nil
				}
			})
		}
	}
	out, err := f.Format()
	if err != nil {
		return out, err
	}
	os.MkdirAll("local/out", 0766)
	return out, ioutil.WriteFile(fmt.Sprintf("local/out/%s.go", pkg.Name), []byte(out), 0644)
}

func fnBlock(blocks []Block, id string) *Block {
	for _, b := range blocks {
		if b.ID == id {
			return &b
		}
	}
	return nil
}

func backRefInput(blocks []Block, dst *Block, input string) *Block {
	for _, b := range blocks {
		if b.Type != "expr" {
			continue
		}
		if b.Connect == fmt.Sprintf("%s-in-%s", dst.ID, input) {
			return &b
		}
	}
	return nil
}
