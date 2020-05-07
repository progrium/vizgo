import { Style } from "/lib/style.mjs";
import * as inline from "/lib/inline.mjs";
import * as misc from "/lib/misc.js";

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
        return <nav class="sidebar" style={outer}>
            <div style={inner}>
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
        return <div class={style.class()} style={style} data-target=".sidebar" />
    }
}



function FixedDeclaration() {
    return {
        view: function (node) {
            return <div class="decl-container fixed" style={Base.declaration}>
                {node.children}
            </div>
        }
    }
}

export function Declaration() {
    return {
        view: function (node) {
            let { children } = node;
            return <div class="decl-container" style={Base.declaration}>
                <misc.Grip />
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
            return <div class={style.class()} style={style}>
                <Label>Type</Label>
                <Fieldbox type="struct">serverFoo</Fieldbox>
                <div>
                    <div class="decl-body" style={Base.declBody}>
                        <Declaration><Fieldbox dark={true} type="string">Foobar</Fieldbox></Declaration>
                        <Declaration><Fieldbox dark={true} type="bool">BooleanField</Fieldbox></Declaration>
                        <Declaration><Fieldbox dark={true} type="int64">Number</Fieldbox></Declaration>
                    </div>
                    <div class="decl-body" style={Base.declBody}>
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
            return <div class={style.class()} style={style}>
                <Label>Method</Label>
                <Fieldbox type={attrs.type}>{children}</Fieldbox>
                <div class="decl-body" style={Base.declBody}>
                    <Declaration><Fieldbox dark={true} type="http.ResponseWriter">rw</Fieldbox></Declaration>
                    <Declaration><Fieldbox dark={true} type="http.Request">req</Fieldbox></Declaration>
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
            return <div class={style.class()} style={style}>
                <Label>Function</Label>
                <misc.Textbox>Foobar()</misc.Textbox>
                <div class="decl-body" style={Base.declBody}></div>
            </div>
        }
    }
}

function PackageDeclaration() {
    let style = Style.from(Base.decl);
    style.add("decl-package decl");

    return {
        view: function () {
            return <div class={style.class()} style={style}>
                <Label>Package</Label>
                <misc.Textbox dark={true}>foobar</misc.Textbox>
            </div>
        }
    }
}




function Fieldbox() {
    return {
        view: function (node) {
            let { attrs, children } = node;
            let style = Style.from(misc.Textbox.outer());
            if (attrs.dark === true) {
                style.backgroundColor = "#475054";
            }

            let type = new Style();
            type.float = "right";
            type.color = "lightgray";
            type.fontSize = "smaller";

            return <div class={style.class()} style={style}>
                <div style={misc.Textbox.inner()}>
                    <span>{children}</span>
                    <span style={type}>{attrs.type}</span>
                </div>
            </div>
        }
    }
}

function ConstDeclarations() {
    let style = Style.from(Base.decl);
    style.add("decl-const decl");

    return {
        view: function () {
            return <div class={style.class()} style={style}>
                <Label>Constants</Label>
                <div class="flex">
                    <Fieldbox type="string">bazbox</Fieldbox>
                    <misc.Textbox dark={true}>"Hello world!"</misc.Textbox>
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
            return <div class={style.class()} style={style}>
                <div class="flex">
                    <misc.Textbox>foo</misc.Textbox>
                    <misc.Textbox dark={true}>github.com/progrium/tractor/foo</misc.Textbox>
                </div>
                <div class="flex">
                    <misc.Textbox>foo</misc.Textbox>
                    <misc.Textbox dark={true}>github.com/progrium/tractor/foo</misc.Textbox>
                </div>
            </div>
        }
    }
}

function Label() {
    return {
        view: function (node) {
            let { children } = node;
            let style = new Style(this);
            style.add("label");
            style.marginLeft = "2px";
            style.fontSize = "small";
            return <div class={style.class()} style={style}>
                {children}
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
