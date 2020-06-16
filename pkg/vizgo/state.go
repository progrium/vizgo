package vizgo

var DefaultState = &State{
	Selected:  "",
	Source:    "",
	ImportIDs: make(map[string][]string),
	Package: Package{
		Name:    "main",
		PkgPath: "github.com/progrium/vizgo/local/out",
		Imports: []Import{
			{Package: ""},
		},
		Declarations: []Declaration{},
	},
}
