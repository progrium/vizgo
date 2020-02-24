
export const Sidebar = {
    view: function() {
        return m("nav", {class: "sidebar"}, [
            m(FixedDeclaration, m(PackageDeclaration)),
            m("div", {style: "overflow-y: auto; height: 90%;"}, [
                m(Declaration, m(ImportDeclarations)),
                m(Declaration, m(TypeDeclaration)),
                m(Declaration, m(ConstDeclarations)),
                m(Declaration, m(TypeDeclaration)),
                m(Declaration, m(FuncDeclaration)),
            ])
        ])
    }
}

export const Handle = {
    view: function(vnode) {
        return m("div", {class: "handle", "data-target": ".sidebar"})
    }
}

export const Grip = {
    view: function(vnode) {
        return m("div", {class: "grip"})
    }
}


const FixedDeclaration = {
    view: function(vnode) {
        return m("div", {class: "decl-container fixed"}, vnode.children);
    }
}

const Declaration = {
    view: function(vnode) {
        return m("div", {class: "decl-container"}, [m(Grip), vnode.children]);
    }
}

const TypeDeclaration = {
    view: function() {
        return m("div", {class: "decl-type decl"}, [
            m("div", {class: "label"}, "Type"), 
            m(Fieldbox, {type: "struct"}, "serverFoo"),
            m("div", {class: "decl-body"}, [
                m(Declaration, m(Fieldbox, {type: "string"}, "Foobar")),
                m(Declaration, m(Fieldbox, {type: "bool"}, "BooleanField")),
                m(Declaration, m(Fieldbox, {type: "int64"}, "Number")),
                m(Declaration, m(MethodDeclaration, {type: "string, error"}, "DoFoobar()")),
            ]),
        ])
    }
}

const MethodDeclaration = {
    view: function(vnode) {
        return m("div", {class: "decl-func decl"}, [
            m("div", {class: "label"}, "Method"), 
            m(Fieldbox, {type: vnode.attrs.type}, vnode.children),
            m("div", {class: "decl-body"}, [
                m(Declaration, m(Fieldbox, {type: "http.ResponseWriter"}, "rw")),
                m(Declaration, m(Fieldbox, {type: "http.Request"}, "req")),
            ])
        ])
    }
}

const FuncDeclaration = {
    view: function() {
        return m("div", {class: "decl-func decl"}, [
            m("div", {class: "label"}, "Function"), 
            m(Textbox, "Foobar()"),
            m("div", {class: "decl-body"})
        ])
    }
}

const PackageDeclaration = {
    view: function() {
        return m("div", {class: "decl-package decl"}, [
            m("div", {class: "label"}, "Package"), 
            m(DarkTextbox, "foobar")
        ])
    }
}

const DarkTextbox = {
    view: function(vnode) {
        return m("div", {class: "input dark"}, m("div", vnode.children));
    }
}


const Textbox = {
    view: function(vnode) {
        return m("div", {class: "input"}, m("div", vnode.children));
    }
}

const Fieldbox = {
    view: function(vnode) {
        return m("div", {class: "input"}, m("div", [
            m("span", vnode.children),
            m("span", {"style": "float: right; color: lightgray; font-size: smaller;"}, vnode.attrs.type),
        ]));
    }
}

const ConstDeclarations = {
    view: function() {
        return m("div", {class: "decl-const decl"}, [
            m("div", {class: "label"}, "Constants"), 
            m("div", {style: "display: flex;"}, [
                m(Fieldbox, {type: "string"}, "bazbox"),
                m(DarkTextbox, "\"Hello world\"")
            ])
        ])
    }
}

const ImportDeclarations = {
    view: function() {
        return m("div", {class: "decl-const decl"}, [
            m("div", {class: "label"}, "Imports"), 
            m("div", {style: "display: flex;"}, [
                m(Textbox, "foo"),
                m(DarkTextbox, "github.com/progrium/tractor/foo")
            ]),
            m("div", {style: "display: flex;"}, [
                m(Textbox, "foo"),
                m(DarkTextbox, "github.com/progrium/tractor/foo")
            ])
        ])
    }
}

