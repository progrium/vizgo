import { Style } from "./style.js";
import * as atom from "./atom.js";
import * as block from "./block.js";
import * as shapes from "./shapes.js";

export const Sidebar = {
    oncreate: function({dom}) {
        dom.addEventListener("scroll", function(e) {
            // console.log("scroll", e.target.scrollTop);
            $("#handle-block")[0].style['top'] = (400-e.target.scrollTop) + "px"; //(i * dom.offsetTop) + "px";
            // $("#handle-block")[0].style['height'] = (dom.offsetHeight - 2) + "px";
        })
    },
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
                <Declaration fixed={true}><PackageDeclaration /></Declaration>
                <div id="declarations">
                    <Declaration fixed={true}><ImportDeclarations /></Declaration>
                    <Declaration fixed={true}><ConstDeclarations /></Declaration>
                    <Declaration fixed={true}><TypeDeclaration /></Declaration>
                    <Declaration fixed={true}><FuncDeclaration /></Declaration>
                </div>
            </div>
        </nav >
    }
}




export function EntryEndpoint() {
    return {
        oncreate: function ({ dom, attrs }) {

            jsPlumb.addEndpoint(dom, {
                endpoint: "Blank",
                isSource: true,
                anchor: [0, 0, 1, 0, 0, 14],
                cssClass: "entry",
                scope: "flow",
                connectorStyle: { stroke: "white", strokeWidth: 10 },
                connector: ["Flowchart", {
                    alwaysRespectStubs: true,
                    cornerRadius: 4,
                }]
            });

            // if (attrs.connect) {
            //     jsPlumb.connect({
            //         source: attrs.id,
            //         target: attrs.connect,
            //         paintStyle: { stroke: "white", strokeWidth: 10 },
            //         connector: ["Flowchart", {
            //             alwaysRespectStubs: true,
            //             cornerRadius: 4,
            //         }],
            //         endpoint: "Blank",
            //         anchors: [[0, 0, 1, 0, 4, 0], [0, 0.5, -1, 0, 0, 10]]
            //     });
            // }
        },
        view: () => (
            <shapes.ArrowHead color="rgb(75, 126, 28)" class="ml-3 my-8" />
        )
    }
}

export function Declaration() {
    let style = Style.from({
        display: "flex",
        padding: "4px",
        paddingLeft: "8px",
        paddingRight: "8px",
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
    let style = new Style(TypeDeclaration, {
        flexGrow: "1",
        width: "100%",
        paddingTop: "4px",
    });
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

            let fieldStyle = Style.from({
                marginTop: "8px",
                minHeight: "30px",
                paddingLeft: "4px",
            })

            let methodsStyle = Style.from({
                marginTop: "8px",
                minHeight: "30px",
                marginLeft: "4px",
            })

            let methodStyle = Style.from({
                paddingTop: "8px",
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingBottom: "8px",
                borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderTop: "var(--pixel-size) solid #42494d",
                borderLeft: "var(--pixel-size) solid #42494d"
            })

            let gripStyle = Style.from({
                marginTop: "4px", 
                marginBottom: "4px",
            })
            return <div class={style.class()} style={style.style()}>
                <GripLabel class="mb-1">Type</GripLabel>
                <atom.Fieldbox type="struct">serverFoo</atom.Fieldbox>
                <div>
                    <div style={fieldStyle.style()}>
                        <Grippable style={gripStyle.style()}><atom.Fieldbox dark={true} type="string">Foobar</atom.Fieldbox></Grippable>
                        <Grippable style={gripStyle.style()}><atom.Fieldbox dark={true} type="bool">BooleanField</atom.Fieldbox></Grippable>
                        <Grippable style={gripStyle.style()}><atom.Fieldbox dark={true} type="int64">Number</atom.Fieldbox></Grippable>
                    </div>
                    <div style={methodsStyle.style()}>
                        {methods.map((mtd, idx) => 
                            // <Declaration  fixed={true}
                            //     key={idx} 
                            //     idx={idx}></Declaration>
                            <div style={methodStyle.style()}><MethodDeclaration type={mtd.type}>{mtd.name}()</MethodDeclaration></div>
                            )}
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

    let fieldStyle = Style.from({
        marginTop: "8px",
        minHeight: "30px",
        paddingLeft: "4px",
    })
    let gripStyle = Style.from({
        marginTop: "4px", 
        marginBottom: "4px",
    })

    return {
        view: function ({ attrs, children }) {
            return <div {...style.attrs()}>
                <GripLabel class="mb-1">Method</GripLabel>
                <atom.Fieldbox type={attrs.type}>{children}</atom.Fieldbox>
                <div style={fieldStyle.style()}>
                    <Grippable style={gripStyle.style()}><atom.Fieldbox dark={true} class="text-xs" type="http.ResponseWriter">rw</atom.Fieldbox></Grippable>
                    <Grippable style={gripStyle.style()}><atom.Fieldbox dark={true} class="text-xs" type="http.Request">req</atom.Fieldbox></Grippable>
                </div>
            </div>
        }
    }
}

function FuncDeclaration() {
    let style = Style.from(Base.decl);
    style.add("decl-func decl");

    return {
        view: () => (
            <div class={style.class()} style={style.style()}>
                <GripLabel class="mb-1">Function</GripLabel>
                <atom.Textbox>Foobar()</atom.Textbox>
                <div class="decl-body" style={Style.from(Base.declBody).style()}></div>
            </div>
        )
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

export function Grippable() {
    return {
        view: function ({attrs, children}) {
            let style = new Style(Grippable);
            style.addClass(attrs.class);
            style.setStyle(attrs.style);
            style.addClass("flex");
            return (
                <div class={style.class()}>
                    <atom.Grip style={style.style()} />
                    <div class="flex-grow">
                        {children}
                    </div>
                </div>
            )
        }
    }
}

function GripLabel() {
    return {
        view: function({attrs, children}) {
            let style = new Style(GripLabel, {
                position: "relative",
            });
            style.addClass(attrs.class);
            style.setStyle(attrs.style);
            style.addClass("flex items-end");
            return (
                <div {...style.attrs()}>
                    <atom.Label class="px-1 absolute" style={{left: "6px", background: "var(--sidebar-color)"}}>{children}</atom.Label>
                    <shapes.Dots rows={3} class="mb-1" />
                </div>
            )
        }
    }
}



function ConstDeclarations() {
    let style = Style.from(Base.decl);
    style.add("decl-const decl");

    return {
        view: function () {
            return <div class={style.class()} style={style.style()}>
                <GripLabel class="mb-1">Constants</GripLabel>
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
