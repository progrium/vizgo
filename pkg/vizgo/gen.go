package vizgo

import (
	"fmt"
	"io/ioutil"
	"log"

	"github.com/progrium/vizgo/pkg/gen"
)

func generate(pkg Package) (string, error) {
	f := gen.New(pkg.Name)
	for _, decl := range pkg.Declarations {
		switch decl.Kind {
		case "imports":
			for _, imp := range decl.Imports {
				if imp.Alias != "" {
					f.Decl("import", imp.Alias, f.Str(imp.Package))
				} else {
					f.Decl("import", f.Str(imp.Package))
				}
			}
		case "function":
			fn := decl.Function
			var params []string
			for _, param := range fn.In {
				params = append(params, fmt.Sprintf("%s %s", param.Name, param.Type))
			}
			f.Fn(fn.Name, params, "", func(f *gen.Source) {
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
	return out, ioutil.WriteFile("local/vizgo_out.go", []byte(out), 0644)
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
