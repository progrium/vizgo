
import * as inline from "/lib/inline.mjs";
import * as misc from "/lib/misc.mjs";

export const Sidebar = {
    view: function() {
        let style = inline.style({
            outer: {
                class: "sidebar",

                overflowY: "auto",
                height: "100%",
                direction: "rtl",
                width: "var(--sidebar-width)",
                zIndex: "1",
                backgroundColor: "var(--sidebar-color)",
                paddingTop: "0px",
                order: "0",
                flex: "0 0 auto",
                alignSelf: "auto",
                filter: "drop-shadow(2px 2px 5px #111)",
                outline: "var(--pixel-size) solid var(--outline-color)"
            },
            inner: {
                direction: "ltr"
            }
        })
        return m("nav", style("outer"), [
            m("div", style("inner"), [
                m(FixedDeclaration, m(PackageDeclaration)),
                m("div", {id:"declarations"}, [
                    m(Declaration, m(ImportDeclarations)),
                    m(Declaration, m(ConstDeclarations)),
                    m(Declaration, m(TypeDeclaration)),
                    m(Declaration, m(TypeDeclaration)),
                    m(Declaration, m(FuncDeclaration)),
                    m(Declaration, m(FuncDeclaration)),
                ])
            ])
        ])
    }
}

export const Handle = {
    view: function(vnode) {
        return m("div", inline.style({
            class: "handle", 

            content: '""',
            flex: "0 0 auto",
            position: "relative",
            boxSizing: "border-box",
            width: "2.5px",
            backgroundColor: "grey",
            height: "100%",
            cursor: "ew-resize",
            userSelect: "none"
        })({
            "data-target": ".sidebar"
        }))
    }
}



const FixedDeclaration = {
    view: function(vnode) {
        return m("div", Declaration.style({class: "decl-container fixed"}), vnode.children);
    }
}

export const Declaration = {
    style: inline.style({
        class: "decl-container",

        display: "flex",
        padding: "4px",
        borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderBottom: "2px solid black",
        borderRight: "var(--pixel-size) solid #42494d",
        backgroundColor: "var(--sidebar-color)"
        
    }),
    view: function(vnode) {
        return m("div", this.style({}), [m(misc.Grip), vnode.children]);
    }
}

const TypeDeclaration = {
    view: function() {
        let style = inline.style({
            marginTop: "10px"
        });
        return m("div", Base.extend("decl", {class: "decl-type decl"}), [
            m(Label, "Type"), 
            m(Fieldbox, {type: "struct"}, "serverFoo"),
            m("div", [
                m("div", Base.style("declBody"), [
                    m(Declaration, m(Fieldbox, {dark: true, type: "string"}, "Foobar")),
                    m(Declaration, m(Fieldbox, {dark: true, type: "bool"}, "BooleanField")),
                    m(Declaration, m(Fieldbox, {dark: true, type: "int64"}, "Number"))
                ]),
                m("div", Base.style("declBody"), [
                    m(Declaration, m(MethodDeclaration, {type: "string, error"}, "DoFoobar()")),
                    m(Declaration, m(MethodDeclaration, {type: "string, error"}, "DoFoobar()"))
                ])
            ]),
        ])
    }
}

const MethodDeclaration = {
    view: function(vnode) {
        return m("div", Base.extend("decl", {class: "decl-func decl"}), [
            m(Label, "Method"), 
            m(Fieldbox, {type: vnode.attrs.type}, vnode.children),
            m("div", Base.style("declBody"), [
                m(Declaration, m(Fieldbox, {dark: true, type: "http.ResponseWriter"}, "rw")),
                m(Declaration, m(Fieldbox, {dark: true, type: "http.Request"}, "req")),
            ])
        ])
    }
}

const FuncDeclaration = {
    view: function() {
        return m("div", Base.extend("decl", {class: "decl-func decl"}), [
            m(Label, "Function"), 
            m(misc.Textbox, "Foobar()"),
            m("div", Base.style("declBody"))
        ])
    }
}

const PackageDeclaration = {
    view: function() {
        return m("div", Base.extend("decl", {class: "decl-package decl"}), [
            m(Label, "Package"), 
            m(misc.Textbox, {dark: true}, "foobar")
        ])
    }
}




const Fieldbox = {
    view: function(vnode) {
        let style = misc.Textbox.style("outer");
        if (vnode.attrs.dark === true) {
            style["style"].backgroundColor = "#475054";
        }
        return m("div", style, m("div", misc.Textbox.style("inner"), [
            m("span", vnode.children),
            m("span", {"style": "float: right; color: lightgray; font-size: smaller;"}, vnode.attrs.type),
        ]));
    }
}

const ConstDeclarations = {
    view: function() {
        return m("div", Base.extend("decl", {class: "decl-const decl"}), [
            m(Label, "Constants"), 
            m("div", {style: "display: flex;"}, [
                m(Fieldbox, {type: "string"}, "bazbox"),
                m(misc.Textbox, {dark: true}, "\"Hello world\"")
            ])
        ])
    }
}

const ImportDeclarations = {
    view: function() {
        return m("div", Base.extend("decl", {class: "decl-const decl"}), [
            , 
            m("div", {style: "display: flex;"}, [
                m(misc.Textbox, "foo"),
                m(misc.Textbox, {dark: true}, "github.com/progrium/tractor/foo")
            ]),
            m("div", {style: "display: flex;"}, [
                m(misc.Textbox, "foo"),
                m(misc.Textbox, {dark: true}, "github.com/progrium/tractor/foo")
            ])
        ])
    }
}

const Label = {
    view: function(vnode) {
        let style = inline.style({
            class: "label",

            marginLeft: "2px", 
            fontSize: "small"
        })
        return m("div", style({}), vnode.children)
    }
}

const Base = {
    extend: (name, obj) => Object.assign(Base.style(name), obj),
    style: inline.style({
        decl: {
            flexGrow: "1", 
            width: "100%"
        },
        declBody: {
            class: "decl-body",

            marginTop: "4px",
            marginLeft: "10px",
            minHeight: "30px",
            borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
            borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
            borderTop: "var(--pixel-size) solid #42494d",
            borderLeft: "var(--pixel-size) solid #42494d"
        }
        
    })
}
