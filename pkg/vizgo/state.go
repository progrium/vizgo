package vizgo

var DefaultState = &State{
	Selected:  "",
	Source:    "",
	ImportIDs: make(map[string][]string),
	Package: Package{
		Name:         "main",
		PkgPath:      "./local/out",
		Imports:      []Import{},
		Declarations: []Declaration{},
	},
}
