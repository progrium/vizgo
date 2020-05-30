package vizgo

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
	Name string `json:"0"`
	Type TypeID `json:"1"`
}

type Argument struct {
	Name string `json:"0"`
	Type TypeID `json:"1"`
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
	Label    string            `json:"label,omitempty"`
	ID       string            `json:"id"`
	Inputs   []string          `json:"inputs,omitempty"`
	Outputs  []string          `json:"outputs,omitempty"`
	Connect  string            `json:"connect,omitempty"`
	Connects map[string]string `json:"connects,omitempty"`
	Position Position          `json:"position"`
}

type Type struct {
	Name    string
	Type    TypeID
	Fields  []Field
	Methods []Function
}

type Declaration struct {
	Kind      string
	Imports   []Import
	Constants []Constant
	Variables []Variable
	Function  Function
	Type      Type
}

type Package struct {
	Name         string
	Declarations []Declaration
}

type State struct {
	Package  Package
	Selected string
}
