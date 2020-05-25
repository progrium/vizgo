
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
                    { type: "call", id: "main.0", inputs: ["string", "error"], outputs: ["string", "error"], label: "fmt.Println()", connect: "main.1-in", position: [6, 5] },
                    { type: "return", id: "main.1", inputs: ["string", "error"], position: [16, 5] },
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
                        Entry: "foo-String.0",
                        Blocks: [
                            { type: "return", id: "foo-String.0", position: [6, 5] },
                        ]
                    }
                ]
            }]
        ]

    }
}