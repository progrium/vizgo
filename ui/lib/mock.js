
export const session = {
    Selected: "main",
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
                    { type: "call", id: "main.0", inputs: ["string", "error"], label: "fmt.Println()", connect: "main.return", position: [18, 5] },
                    { type: "return", id: "main.return", inputs: ["string", "error"], position: [30, 5] },
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
                        Entry: "String.return",
                        Blocks: [
                            { type: "return", id: "String.return", position: [20, 10] },
                        ]
                    }
                ]
            }]
        ]
        
    }
}