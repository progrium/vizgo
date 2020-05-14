package app

type TypeID string

type Import struct {
	Alias   string
	Package string
}

type Constant struct {
	Name  string
	Value string
	Type  TypeID
}

type Variable struct {
	Name  string
	Value string
	Type  TypeID
}

type Field struct {
	Name string
	Type TypeID
}

type Argument struct {
	Name string
	Type TypeID
}

type Function struct {
	Name   string
	In     []Argument
	Out    []TypeID
	Blocks []Block
	Entry  []BlockOutput
}

type BlockType string

type BlockOutput struct {
	Name    string
	Type    TypeID
	Flow    bool
	Connect string
}

type BlockInput struct {
	Name string
	Type TypeID
}

type GridPosition struct {
	X int
	Y int
}

type Block struct {
	Type     BlockType
	Label    string
	ID       string
	Inputs   []BlockInput
	Outputs  []BlockOutput
	Connect  string
	Position GridPosition
}

type Type struct {
	Name    string
	Type    TypeID
	Fields  []Field
	Methods []Function
}

type Package struct {
	Name      string
	Imports   []Import
	Constants []Constant
	Variables []Variable
	Types     []Type
	Functions []Function
}

type Session struct {
	Package  Package
	Selected string
}
