package vizgo

import (
	"fmt"
	"log"
	"strings"

	"github.com/dave/jennifer/jen"
)

func generate(pkg Package) (string, error) {
	f := jen.NewFile(pkg.Name)
	for _, decl := range pkg.Declarations {
		switch decl.Kind {
		case "imports":
			for _, imp := range decl.Imports {
				f.ImportAlias(imp.Package, imp.Alias)
			}
		case "function":
			fn := decl.Function
			var params, blocks []jen.Code
			for _, param := range fn.In {
				params = append(params, jen.Id(param.Name).Id(string(param.Type)))
			}
			stmnt := fnBlock(fn.Blocks, fn.Entry)
			for stmnt != nil {
				switch stmnt.Type {
				case "call":
					blocks = append(blocks, callBlock(fn, stmnt)...)
				case "return":
					blocks = append(blocks, callBlock(fn, stmnt)...)
				default:
					log.Println("unknown block type: ", stmnt.Type)
				}
				if stmnt.Connect != "" {
					stmnt = fnBlock(fn.Blocks, stmnt.Connect)
					continue
				}
				stmnt = nil
			}
			f.Func().Id(fn.Name).Params(params...).Block(blocks...)
		}
	}
	return fmt.Sprintf("%#v", f), f.Save("local/vizgo_out.go")
}

func qualCall(label string) *jen.Statement {
	parts := strings.SplitN(label, ".", 2)
	if len(parts) < 2 {
		return jen.Id(label)
	}
	return jen.Qual(parts[0], parts[1])
}

func returnBlock(fn Function, block *Block) (blocks []jen.Code) {
	blocks = append(blocks, jen.Return())
	return
}

func callBlock(fn Function, block *Block) (blocks []jen.Code) {
	var params []jen.Code
	for _, input := range block.Inputs {
		expr := backRefInput(fn.Blocks, block, input)
		if expr != nil {
			params = append(params, jen.Id(expr.Label))
		}
	}
	blocks = append(blocks, qualCall(block.Label).Call(params...))
	return
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
