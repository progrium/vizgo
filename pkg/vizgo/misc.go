package vizgo

import (
	"fmt"
)

func findBlock(fn Function, id string) *Block {
	for _, b := range fn.Blocks {
		if b.ID == id {
			return &b
		}
	}
	return nil
}

func nextBlockID(fn Function) string {
	num := len(fn.Blocks)
	name := fmt.Sprintf("%s.%d", fn.Name, num)
	for findBlock(fn, name) != nil {
		num++
		name = fmt.Sprintf("%s.%d", fn.Name, num)
	}
	return name
}
