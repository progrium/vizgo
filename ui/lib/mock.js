
export const session = {
    Selected: "#main",
    Package: {
        Name: "main",
        Declarations: [
            ["imports", [
                { Package: "fmt" }
            ]],
            ["function", {
                Name: "main",
                In: [
                ],
                Out: [
                ],
                Entry: "main.0",
                Blocks: [
                    { Type: "call", ID: "main.0", Label: "fmt.Println()", Position: [14, 14] },
                    { Type: "return", ID: "main.return", Position: [24, 14] },
                ]
            }],
            ["type", {
                Name: "foobar",
                Type: "struct",
                Fields: [
                    ["Foo", "string"],
                    ["Bar", "bool"],
                ],
                Methods: [
                    {
                        Name: "String",
                        In: [
                        ],
                        Out: [
                            "string"
                        ],
                        Entry: "String.0",
                        Blocks: [
                            { Type: "call", ID: "main.0", Label: "fmt.Println()", Position: [14, 14] },
                            { Type: "return", ID: "main.return", Position: [24, 14] },
                        ]
                    }
                ]
            }]
        ]
        
    }
}