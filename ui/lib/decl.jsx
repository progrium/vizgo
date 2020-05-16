import { Style } from "./style.js";
import * as atom from "./atom.js";
import * as block from "./block.js";
import * as shapes from "./shapes.js";

export const Sidebar = {
    view: function () {
        let outer = Style.from({
            userSelect: "none",
            overflowY: "auto",
            overflowX: "hidden",
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

        let s = {
            borderRadius: "var(--corner-size)",
            borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
            borderRight: "var(--pixel-size) solid #42494d",
        }
        let s2 = {
            borderTopLeftRadius: "var(--corner-size)",
            borderBottomLeftRadius: "var(--corner-size)",
            borderTop: "var(--pixel-size) solid white",
            borderLeft: "var(--pixel-size) solid white",
            borderBottom: "var(--pixel-size) solid black",
            borderRight: "0",
        }

        return <nav class="sidebar" style={outer.style()}>
            <div style={inner.style()}>
                {/* <Declaration fixed={true}><shapes.Port /><shapes.ArrowHead color="white" /><shapes.ArrowTail /></Declaration> */}
                <Declaration fixed={true}><PackageDeclaration /></Declaration>
                <div id="declarations">
                    <Declaration fixed={true}><ImportDeclarations /></Declaration>
                    <Declaration><ConstDeclarations /></Declaration>
                    <Declaration><TypeDeclaration /></Declaration>
                    <Declaration><FuncDeclaration /></Declaration>
                </div>
            </div>
        </nav >
    }
}


export function Handle() {
    let style = new Style(Handle, {
        content: '""',
        flex: "0 0 auto",
        position: "relative",
        boxSizing: "border-box",
        width: "2.5px",
        backgroundColor: "grey",
        height: "100%",
        cursor: "ew-resize",
        userSelect: "none",
    });
    let blockStyle = Style.from({
        background: "rgb(75, 126, 28) ",
        width: "20px",
        height: "150px",
        borderTopRightRadius: "var(--corner-size)",
        borderBottomRightRadius: "var(--corner-size)",
        position: "absolute",
        top: "400px",
        zIndex: "100",
        top: "-1000px"
    })
    return {
        oncreate: ({ dom }) => {
            // $(dom).hide();
        },
        view: () => (
            <div data-target=".sidebar" {...style.attrs()}>
                <div id="handle-block" {...blockStyle.attrs()}>
                    <shapes.ArrowHead color="rgb(75, 126, 28)" class="ml-5 my-1" />
                    <shapes.Ring color="rgb(75, 126, 28)" fill="#374044" class="ml-2 my-1" />
                </div>
            </div>
        )
    }
}

export function Declaration() {
    let style = Style.from({
        display: "flex",
        padding: "4px",
        borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderBottom: "2px solid black",
        borderRight: "var(--pixel-size) solid #42494d",
        backgroundColor: "transparent"
    });
    return {
        view: function (node) {
            let { attrs, children } = node;
            let s = Style.from({}).extendStyle(style);
            s.addClass("decl-container");
            s.addClass("selected", () => attrs.selected === true);
            function onclick() {
                if (attrs.selectable && attrs.onselect) {
                    attrs.onselect(node.dom, attrs.idx);
                }
            }
            return <div onclick={onclick} {...s.attrs()}>
                {attrs.fixed !== true && <atom.Grip />}
                {children}
            </div>
        }
    }
}

function TypeDeclaration() {
    let style = Style.from(Base.decl);
    style.add("decl-type decl");

    let methods = [
        { name: "DoFoobar", type: "string, error" },
        { name: "DoNOTFoobar", type: "bool" }
    ]

    let selected = -1;

    return {
        view: function () {

            function onselect(dom, idx) {
                selected = idx;
                let i = (selected >= 0) ? 1 : -1;
                $("#handle-block")[0].style['top'] = (i * dom.offsetTop) + "px";
                $("#handle-block")[0].style['height'] = (dom.offsetHeight - 2) + "px";
            }

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
                        {methods.map((mtd, idx) => <Declaration key={idx} idx={idx} selected={selected === idx} onselect={onselect} selectable={true}><MethodDeclaration type={mtd.type}>{mtd.name}()</MethodDeclaration></Declaration>)}
                    </div>
                </div>
            </div>
        }
    }
}

function MethodDeclaration() {
    let style = Style.from({
        flexGrow: "1",
        width: "100%",
    })
    style.addClass("decl-func decl");

    return {
        view: function ({ attrs, children }) {
            return <div {...style.attrs()}>
                <atom.Label>Method</atom.Label>
                <atom.Fieldbox type={attrs.type}>{children}</atom.Fieldbox>
                <div class="decl-body" style={Base.declBody.style()}>
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
                <atom.Label>Imports</atom.Label>
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


}
