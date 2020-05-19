import { Style } from "./style.js";
import * as atom from "./atom.js";
import * as shapes from "./shapes.js";

export const Block = {
    checkposition: function (vnode) {
        let vnodePosition = parseInt(vnode.dom.style.left.replace("px", ""))
        if (vnodePosition <= $(".sidebar").innerWidth()) {
            vnodePosition += $(".sidebar").innerWidth() - vnodePosition + 30
            vnode.dom.style.left = vnodePosition + "px"
        }
    },

    autosize: function (vnode) {
        let fontSize = stylePropInt(vnode.dom, "font-size");
        vnode.attrs.title = vnode.attrs.title.replace(/<br>/g, '').replace(/&nbsp;/g, '').replace(/<div>/g, '').replace(/<\/div>/g, '')
        let textWidth = vnode.attrs.title.length * fontSize * 0.8;

        if (vnode.attrs.title == "switch") {
            textWidth *= 3;
        }
        let newWidth = (Math.max(Math.ceil(textWidth / 40), 2) * 30) + 30;
        let inputListLength, outputListLength = 0;
        if (vnode.attrs.inputs) {
            inputListLength = vnode.attrs.inputs.length
        }
        if (vnode.attrs.outputs) {
            outputListLength = vnode.attrs.outputs.length
        }
        let i;
        for (i = 0; i < Math.max(inputListLength, outputListLength); i++) {
            let inputWidth, outputWidth = 0
            if (vnode.attrs.inputs) {
                if (i < vnode.attrs.inputs.length) {
                    inputWidth = (Math.max(Math.ceil((vnode.attrs.inputs[i].length * fontSize * 0.8) / 40), 2) * 30) / 0.9
                }
            }
            if (vnode.attrs.outputs) {
                if (i < vnode.attrs.outputs.length) {
                    outputWidth = (Math.max(Math.ceil((vnode.attrs.outputs[i].length * fontSize * 0.8) / 40), 2) * 30)
                }
            }
            if (inputWidth + outputWidth > newWidth) {
                newWidth = (Math.max(Math.ceil((inputWidth + outputWidth) / 30), 2) * 30)
            }
        };
        vnode.dom.style.width = newWidth + "px";
        jsPlumb.repaintEverything();
    },
    onupdate: function (vnode) {
        this.autosize(vnode);
    },
    oncreate: function (vnode) {
        let size = stylePropInt(document.documentElement, "--grid-size");
        jsPlumb.draggable(vnode.dom, {
            grid: [size, size],
            containment: "parent",
        });
        $(window).on('mousemove', null, null, (event) => {
            this.checkposition(vnode)
        })
        this.autosize(vnode);
        // when creating a new empty expression block
        if (vnode.attrs.title === "") {
            vnode.dom.firstChild.firstChild.focus();
        }
    },
    view: function ({ attrs }) {
        let style = new Style("block");

        let flowBlock = false;
        let exprBlock = false;
        if (attrs.inflow || attrs.outflow) {
            style.addClass("flow")
            flowBlock = true;
        }
        if (!attrs.inflow && !attrs.outflow && !attrs.outputs) {
            exprBlock = true;
        }

        let gridSize = stylePropInt(document.documentElement, "--grid-size");
        style.setStyle({
            marginLeft: "4px",
            left: (attrs.x * gridSize) + "px",
            top: (attrs.y * gridSize) + "px",
            width: "120px",
            position: "absolute",
            backgroundColor: "#475054",
            zIndex: "10",
            WebkitTransform: "translate3d(0,0,0)",
            filter: "drop-shadow(3px 3px 5px #111)",
            borderRadius: "var(--corner-size)"
        });
        let headerAttrs = {
            id: attrs.id,
            title: attrs.title,
            connect: attrs.connect,
            flow: flowBlock,
            expr: exprBlock,
            inflow: attrs.inflow,
            outflow: attrs.outflow
        };
        let bodyAttrs = {
            id: attrs.id,
            inputs: attrs.inputs,
            outputs: attrs.outputs,
            connects: attrs.connects
        };
        return m("div", { id: attrs.id, style: style, class: style.class() }, [
            m(Header, headerAttrs),
            (attrs.title == "switch") ?
                m(SwitchBody, bodyAttrs) :
                m(PortsBody, bodyAttrs)
        ])
    }
}

const Header = {
    view: function ({ attrs }) {

        let outer = Style.from({
            height: "var(--grid-size)",
            borderRadius: "var(--corner-size)",
            color: "white",
            textAlign: "left",
            paddingLeft: "10px",
            paddingRight: "10px",
            paddingTop: "0px"
        });
        let flow = Style.from({
            backgroundColor: "var(--sidebar-color)",
            borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
            borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
            borderBottom: "var(--pixel-size) solid #42494d",
            borderRight: "var(--pixel-size) solid #42494d",
        })
        let inner = Style.from({
            height: "var(--grid-size)",
            MozUserSelect: "none",
            paddingTop: "0.25rem",
            fontSize: "1rem"
        })
        let handlers = {
            oninput: (e) => {
                let id = e.target.parentNode.parentNode.id;
                App.updateBlock(id, { title: e.target.innerHTML });
            },
            ondblclick: (e) => {
                var node = e.srcElement;
                if (document.body.createTextRange) {
                    const range = document.body.createTextRange();
                    range.moveToElementText(node);
                    range.select();
                } else if (window.getSelection) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(node);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
        let title = <div contentEditable
            class="title"
            style={inner}
            oninput={handlers.oninput}
            ondblclick={handlers.ondblclick}>
            {m.trust(attrs.title)}
        </div>;
        let headerAttrs = {
            id: attrs.id + "-header",
            class: "header"
        };
        if (attrs.flow === true) {
            headerAttrs["style"] = Style.from(outer).extendStyle(flow);
            return m("div", headerAttrs, [
                (attrs.inflow) ? m(InflowEndpoint, { id: attrs.id + "-in" }) : undefined,
                title,
                (attrs.outflow) ? m(OutflowEndpoint, { id: attrs.id + "-out", connect: attrs.connect }) : undefined
            ]);
        }
        headerAttrs["style"] = Style.from(outer);
        if (attrs.expr === true) {
            return m("div", headerAttrs, [title, m(Endpoint, { id: attrs.id + "-out", connect: attrs.connect, output: true, header: true })]);
        }
        return m("div", headerAttrs, title);
    }
}

const SwitchBody = {
    view: function (node) {
        let { attrs } = node;
        let inputs = attrs.inputs || [];
        let outputs = attrs.outputs || [];
        let gridSize = stylePropInt(document.documentElement, "--grid-size");
        let bodyHeight = Math.max(inputs.length, outputs.length) * gridSize * 5;
        let switch_ = Style.from({
            height: bodyHeight + "px",
            gridTemplateColumns: "auto",
            borderRadius: "0 0 4px 4px",
            backgroundColor: "var(--sidebar-color)"
        })
        let cases = Style.from({
            borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
            borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
            borderTop: "var(--pixel-size) solid #42494d",
            borderLeft: "var(--pixel-size) solid #42494d"
        })
        return <div id={attrs.id + "-body"} class="body switch" style={switch_}>
            <div>{inputs.map((val, idx) => m(Port, { input: true, desc: val }))}</div>
            <div style={cases}>
                <SwitchCase />
                <SwitchCase />
                <SwitchCase />
            </div>
        </div>
    }
}

const SwitchCase = {
    view: function () {
        return <div class="case decl-container">
            <atom.Grip />
            <atom.Textbox>weofij</atom.Textbox>
            <OutflowEndpoint case={true} class="case" />
        </div>
    }
}

const PortsBody = {
    view: function (node) {
        let { attrs } = node;
        let inputs = attrs.inputs || [];
        let outputs = attrs.outputs || [];
        let gridSize = stylePropInt(document.documentElement, "--grid-size");
        let bodyHeight = Math.max(inputs.length, outputs.length) * gridSize;
        let style = Style.from({
            height: bodyHeight + "px",
            display: "grid",
            gridTemplateColumns: "auto auto",
            borderRadius: "0 0 4px 4px"
        });
        return <div class="body" id={attrs.id + "-body"} style={style}>
            <div>{inputs.map((val, idx) => m(Port, { id: attrs.id, input: true, desc: val }))}</div>
            <div>{outputs.map((val, idx) => m(Port, { id: attrs.id, output: true, desc: val, connects: attrs.connects }))}</div>
        </div>
    }
}

const Port = {
    view: function (node) {
        let { attrs } = node;

        let id = attrs.id;
        let connect = undefined;
        let style = {
            paddingTop: "2px",
            height: "28px"
        }
        if (attrs.input === true) {
            style.marginLeft = "15px";
        }
        if (attrs.output === true) {
            style.marginRight = "15px";
            style.textAlign = "right";
            id += "-out";
        }

        let val = attrs.desc;
        let punctuation = val[val.length - 1];
        if ([">", "?"].includes(punctuation)) {
            val = val.substr(0, val.length - 1);
        }
        if (attrs.connects) {
            connect = attrs.connects[val];
        }
        switch (punctuation) {
            case ">":
                return <div style={style}>
                    <OutflowEndpoint id={`${id}-${val}`} body={true} connect={connect} />
                    {val}
                </div>
            case "?":
                return <atom.BlockTextbox>{val}</atom.BlockTextbox>;
            default:
                return <div style={style}>
                    <Endpoint id={`${id}-${val}`} output={attrs.output} connect={connect} />
                    {val}
                </div>
        }
    }
}

function InflowEndpoint() {
    return {
        oncreate: function ({ dom }) {
            jsPlumb.addEndpoint(dom, {
                endpoint: "Blank",
                isTarget: true,
                cssClass: "inflow",
                width: 30,
                height: 30,
                anchor: [0, 0.5, -1, 0, 0, 0],
                scope: "flow",
            });
        },
        view: function ({ attrs }) {
            let wrap = new Style("inflow", {
                position: "absolute",
                marginLeft: "-23px"
            });

            return <div id={attrs.id} {...wrap.attrs()}>
                <shapes.ArrowTail color="#475054" />
            </div>
        }
    }
}

export function OutflowEndpoint({ attrs }) {
    let wrap = new Style(OutflowEndpoint);
    wrap.setStyle({
        marginRight: "-24px",
        marginTop: "-28px",
        float: "right",
    }, () => !attrs.case && !attrs.body && !attrs.entry)

    wrap.addClass("body", () => attrs.body);
    wrap.setStyle({
        marginTop: "0",
        marginRight: "-28px",
        float: "right",
    }, () => attrs.body)

    wrap.addClass("case", () => attrs.case);
    wrap.setStyle({
        top: "13px",
        left: "6px",
        float: "right",
    }, () => attrs.case)

    wrap.addClass("entry", () => attrs.entry);
    wrap.setStyle({
        position: "relative",
    }, () => attrs.entry)

    wrap.addClass(attrs.class, () => attrs.class);


    return {
        oncreate: function ({ dom, attrs }) {

            jsPlumb.addEndpoint(dom, {
                endpoint: "Blank",
                isSource: true,
                anchor: [0, 0, 1, 0, 4, 14],
                // cssClass: klass,
                scope: "flow",
                connectorStyle: { stroke: "white", strokeWidth: 10 },
                connector: ["Flowchart", {
                    alwaysRespectStubs: true,
                    cornerRadius: 4,
                }]
            });

            if (attrs.connect) {
                jsPlumb.connect({
                    source: attrs.id,
                    target: attrs.connect,
                    paintStyle: { stroke: "white", strokeWidth: 10 },
                    connector: ["Flowchart", {
                        alwaysRespectStubs: true,
                        cornerRadius: 4,
                    }],
                    endpoint: "Blank",
                    anchors: [[0, 0, 1, 0, 4, 0], [0, 0.5, -1, 0, 0, 10]]
                });
            }
        },
        view: ({attrs}) => {
            let color = attrs.color || "#475054";   
            return <div id={attrs.id} {...wrap.attrs()}>
                <shapes.ArrowHead color={color} />
            </div>
        }
    }
}

function Endpoint(initial) {
    let { output, header } = initial.attrs;
    let size = initial.attrs.size || 28

    let style = new Style(Endpoint);
    if (output === true) {
        style.float = "right";
        style.marginRight = "-29px";
    } else {
        style.position = "absolute";
        style.marginLeft = "-28px";
    };
    if (header === true) {
        style.marginTop = "-25px";
        style.marginRight = "-24px";
        style.addClass("endpoint header");
    }
    return {
        oncreate: function ({ attrs, dom }) {
            let { output, header, connect, id } = attrs;

            function exprEndpoint(dom, style, params) {
                jsPlumb.addEndpoint(dom, Object.assign({
                    endpoint: "Blank",
                    cssClass: `${style.class()} output`,
                    scope: "ports",
                    connectorStyle: { stroke: "gray", strokeWidth: 8 },
                    connector: ["Bezier", { curviness: 100 }]
                }, params));
            }

            function connectExpr(id, connect) {
                jsPlumb.connect({
                    endpoint: "Blank",
                    source: id,
                    target: connect,
                    paintStyle: { stroke: "gray", strokeWidth: 8 },
                    connector: ["Bezier", { curviness: 100 }],
                    anchors: [[0, 0, 1, 0, 15, 12], [0, 0, -1, 0, 12, 12]]
                });
            }

            if (output === true) {
                if (header === true) {
                    exprEndpoint(dom, style, {
                        maxConnections: 1,
                        anchor: [0, 0, 1, 0, 14, 14],
                        isSource: true,
                    })
                } else {
                    exprEndpoint(dom, style, {
                        maxConnections: -1,
                        anchor: [0, 0, 1, 0, 15, 12],
                        isSource: true,
                    })
                }
            } else {
                exprEndpoint(dom, style, {
                    isTarget: true,
                    cssClass: `${style.class()} input`,
                    anchor: [0, 0, -1, 0, 12, 12],
                })
            }
            if (connect) {
                connectExpr(id, connect);
            }
        },
        view: function () {
            return <shapes.Ring color="#475054" fill="#2a2a2c" size={size} {...style.attrs()} />
        }
    }
}



function stylePropInt(el, prop) {
    return parseInt(styleProp(el, prop), 10);
}

function styleProp(el, prop) {
    return getComputedStyle(el).getPropertyValue(prop);
}

// Style.defineClass("OutflowEndpoint body", {
//     backgroundColor: "#7d898f !important",
// })