package vizgo

var DefaultState = &State{
	Selected: "/Package/Declarations/1/Function",
	Source:   "",
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
							Inputs:   []string{"a"},
							Outputs:  []string{"int", "error"},
							Label:    "fmt.Println",
							Connect:  "main.1-in",
							Position: Position{11, 5},
						},
						{
							Type:     "return",
							ID:       "main.1",
							Inputs:   []string{},
							Position: Position{21, 5},
						},
						{
							Type:     "expr",
							ID:       "main.2",
							Connect:  "main.0-in-a",
							Label:    `"Hello world"`,
							Inputs:   []string{},
							Position: Position{3, 10},
						},
					},
				},
			},
			// {
			// 	Kind: "type",
			// 	Type: Type{
			// 		Name: "foobar",
			// 		Type: "struct",
			// 		Fields: []Field{
			// 			{"Foo", "string"},
			// 			{"Bar", "bool"},
			// 			{"Baz", "int"},
			// 		},
			// 		Methods: []Function{
			// 			{
			// 				Name:  "String",
			// 				In:    []Argument{},
			// 				Out:   []TypeID{},
			// 				Entry: "foo-String.0",
			// 				Blocks: []Block{
			// 					{
			// 						Type:     "return",
			// 						ID:       "foo-String.0",
			// 						Position: Position{6, 5},
			// 					},
			// 				},
			// 			},
			// 			{
			// 				Name: "Read",
			// 				In: []Argument{
			// 					{"p", "[]byte"},
			// 				},
			// 				Out: []TypeID{
			// 					"int",
			// 					"error",
			// 				},
			// 				Entry: "foo-Read.0",
			// 				Blocks: []Block{
			// 					{
			// 						Type:     "return",
			// 						ID:       "foo-Read.0",
			// 						Position: Position{6, 5},
			// 					},
			// 				},
			// 			},
			// 		},
			// 	},
			// },
		},
	},
}
