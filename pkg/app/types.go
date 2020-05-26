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
	Entry  string
}

type BlockType string

type Position [2]int

type Block struct {
	Type     BlockType         `json:"type"`
	Label    string            `json:"label"`
	ID       string            `json:"id"`
	Inputs   []string          `json:"inputs"`
	Outputs  []string          `json:"outputs"`
	Connect  string            `json:"connect"`
	Connects map[string]string `json:"connects"`
	Position Position          `json:"position"`
}

type Type struct {
	Name    string
	Type    TypeID
	Fields  []Field
	Methods []Function
}

type Declaration [2]interface{}

type Package struct {
	Name         string
	Declarations []Declaration
}

type Session struct {
	Package  Package
	Selected string
}
