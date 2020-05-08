import { Style } from "./style.js";
import * as atom from "./atom.js";

export const Sidebar = {
    view: function () {
        let outer = Style.from({
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
        })
        let inner = Style.from({
            direction: "ltr"
        })
        return <nav class="sidebar" style={outer.style()}>
            <div style={inner.style()}>
                <FixedDeclaration><PackageDeclaration /></FixedDeclaration>
                <div id="declarations">
                    <Declaration><ImportDeclarations /></Declaration>
                    <Declaration><ConstDeclarations /></Declaration>
                    <Declaration><TypeDeclaration /></Declaration>
                    <Declaration><TypeDeclaration /></Declaration>
                    <Declaration><FuncDeclaration /></Declaration>
                </div>
            </div>
        </nav>
    }
}

export const Handle = {
    view: function () {
        let style = new Style(Handle);
        style.add("handle");
        style.content = '""';
        style.flex = "0 0 auto";
        style.position = "relative";
        style.boxSizing = "border-box";
        style.width = "2.5px";
        style.backgroundColor = "grey";
        style.height = "100%";
        style.cursor = "ew-resize";
        style.userSelect = "none";
        return <div class={style.class()} style={style.style()} data-target=".sidebar" />
    }
}



function FixedDeclaration() {
    return {
        view: function (node) {
            return <div class="decl-container" style={Style.from(Base.declaration).style()}>
                {node.children}
            </div>
        }
    }
}

export function Declaration() {
    return {
        view: function (node) {
            let { children } = node;
            return <div class="decl-container" style={Style.from(Base.declaration).style()}>
                <atom.Grip />
                {children}
            </div>
        }
    }
}

function TypeDeclaration() {
    let style = Style.from(Base.decl);
    style.add("decl-type decl");

    return {
        view: function (node) {
            let { attrs, children } = node;
            return <div class={style.class()} style={style.style()}>
                <atom.Label>Type</atom.Label>
                <atom.Fieldbox type="struct">serverFoo</atom.Fieldbox>
                <div>
                    <div class="decl-body" style={Style.from(Base.declBody).style()}>
                        <Declaration><atom.Fieldbox dark={true} type="string">Foobar</atom.Fieldbox></Declaration>
                        <Declaration><atom.Fieldbox dark={true} type="bool">BooleanField</atom.Fieldbox></Declaration>
                        <Declaration><atom.Fieldbox dark={true} type="int64">Number</atom.Fieldbox></Declaration>
                    </div>
                    <div class="decl-body" style={Style.from(Base.declBody).style()}>
                        <Declaration><MethodDeclaration type="string, error">DoFoobar()</MethodDeclaration></Declaration>
                        <Declaration><MethodDeclaration type="string, error">DoFoobar()</MethodDeclaration></Declaration>
                    </div>
                </div>
            </div>
        }
    }
}

function MethodDeclaration() {
    let style = Style.from(Base.decl);
    style.add("decl-func decl");

    return {
        view: function (node) {
            let { attrs, children } = node;
            return <div class={style.class()} style={style.style()}>
                <atom.Label>Method</atom.Label>
                <atom.Fieldbox type={attrs.type}>{children}</atom.Fieldbox>
                <div class="decl-body" style={Style.from(Base.declBody).style()}>
                    <Declaration><atom.Fieldbox dark={true} type="http.ResponseWriter">rw</atom.Fieldbox></Declaration>
                    <Declaration><atom.Fieldbox dark={true} type="http.Request">req</atom.Fieldbox></Declaration>
                </div>
            </div>
        }
    }
}

function FuncDeclaration() {
    let style = Style.from(Base.decl);
    style.add("decl-func decl");

    return {
        view: function () {
            return <div class={style.class()} style={style.style()}>
                <atom.Label>Function</atom.Label>
                <atom.Textbox>Foobar()</atom.Textbox>
                <div class="decl-body" style={Style.from(Base.declBody).style()}></div>
            </div>
        }
    }
}

function PackageDeclaration() {
    let style = Style.from(Base.decl);
    style.add("decl-package decl");
    console.log(style)
    return {
        view: function () {
            return <div class={style.class()} style={style.style()}>
                <atom.Label>Package</atom.Label>
                <atom.Textbox dark={true}>foobar</atom.Textbox>
            </div>
        }
    }
}






function ConstDeclarations() {
    let style = Style.from(Base.decl);
    style.add("decl-const decl");

    return {
        view: function () {
            return <div class={style.class()} style={style.style()}>
                <atom.Label>Constants</atom.Label>
                <div class="flex">
                    <atom.Fieldbox type="string">bazbox</atom.Fieldbox>
                    <atom.Textbox dark={true}>"Hello world!"</atom.Textbox>
                </div>
            </div>
        }
    }
}

function ImportDeclarations() {
    let style = Style.from(Base.decl);
    style.add("decl-const decl");

    return {
        view: function () {
            return <div class={style.class()} style={style.style()}>
                <div class="flex">
                    <atom.Textbox>foo</atom.Textbox>
                    <atom.Textbox dark={true}>github.com/progrium/tractor/foo</atom.Textbox>
                </div>
                <div class="flex">
                    <atom.Textbox>foo</atom.Textbox>
                    <atom.Textbox dark={true}>github.com/progrium/tractor/foo</atom.Textbox>
                </div>
            </div>
        }
    }
}




const Base = {
    decl: Style.from({
        flexGrow: "1",
        width: "100%"
    }),

    declBody: Style.from({
        marginTop: "4px",
        marginLeft: "10px",
        minHeight: "30px",
        borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderTop: "var(--pixel-size) solid #42494d",
        borderLeft: "var(--pixel-size) solid #42494d"
    }),

    declaration: Style.from({
        display: "flex",
        padding: "4px",
        borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderBottom: "2px solid black",
        borderRight: "var(--pixel-size) solid #42494d",
        backgroundColor: "var(--sidebar-color)"
    }),
}
