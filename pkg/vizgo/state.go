package vizgo

var DefaultState = &State{
	Selected: "/Package/Declarations/1/Function",
	Package: Package{
		Name: "main",
		Declarations: []Declaration{
			{
				Kind: "imports",
				Imports: []Import{
					{Package: "fmt"},
				},
			},
			{
				Kind: "function",
				Function: Function{
					Name:  "main",
					In:    []Argument{},
					Out:   []TypeID{},
					Entry: "main.0",
					Blocks: []Block{
						{
							Type:     "call",
							ID:       "main.0",
							Inputs:   []string{"string", "error"},
							Outputs:  []string{"string", "error"},
							Label:    "fmt.Println()",
							Connect:  "main.1-in",
							Position: Position{6, 5},
						},
						{
							Type:     "return",
							ID:       "main.1",
							Inputs:   []string{"string", "error"},
							Position: Position{16, 5},
						},
					},
				},
			},
			{
				Kind: "type",
				Type: Type{
					Name: "foobar",
					Type: "struct",
					Fields: []Field{
						{"Foo", "string"},
						{"Bar", "bool"},
						{"Baz", "int"},
					},
					Methods: []Function{
						{
							Name:  "String",
							In:    []Argument{},
							Out:   []TypeID{},
							Entry: "foo-String.0",
							Blocks: []Block{
								{
									Type:     "return",
									ID:       "foo-String.0",
									Position: Position{6, 5},
								},
							},
						},
						{
							Name: "Read",
							In: []Argument{
								{"p", "[]byte"},
							},
							Out: []TypeID{
								"int",
								"error",
							},
							Entry: "foo-Read.0",
							Blocks: []Block{
								{
									Type:     "return",
									ID:       "foo-Read.0",
									Position: Position{6, 5},
								},
							},
						},
					},
				},
			},
		},
	},
}
