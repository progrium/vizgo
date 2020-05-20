import * as atom from "./atom.js";
import * as shapes from "./shapes.js";

import { Style } from "../lib/style.js";
import { App } from "../lib/app.js";

var m = h;

export function Block({ attrs, style, hooks }) {
    hooks.oncreate = App.blockcreate;
    hooks.onupdate = App.autosize;

    var inflow = attrs.inflow || false;
    var outflow = attrs.outflow || false;
    var inputs = attrs.inputs || [];
    var outputs = attrs.outputs || [];
    var [x, y] = attrs.position || [0,0];
    var id = attrs.id || "";
    var label = attrs.label || "";
    var connect = attrs.connect || "";
    var connects = attrs.connects || {};


    let flowBlock = false;
    let exprBlock = false;
    if (inflow || outflow) {
        style.addClass("flow")
        flowBlock = true;
    }
    if (!inflow && !outflow && !outputs) {
        exprBlock = true;
    }

    let gridSize = Style.propInt("--grid-size");
    style.setStyle({
        marginLeft: "4px",
        left: (x * gridSize) + "px",
        top: (y * gridSize) + "px",
        width: "120px",
        position: "absolute",
        backgroundColor: "#475054",
        zIndex: "10",
        WebkitTransform: "translate3d(0,0,0)",
        filter: "drop-shadow(3px 3px 5px #111)",
        borderRadius: "var(--corner-size)"
    });
    let headerAttrs = {
        id: id,
        label: label,
        connect: connect,
        flow: flowBlock,
        expr: exprBlock,
        inflow: inflow,
        outflow: outflow
    };
    let bodyAttrs = {
        id: id,
        inputs: inputs,
        outputs: outputs,
        connects: connects
    };
    return (
        <div id={id}>
            <Header {...headerAttrs} />
            {(label == "switch") ?
                <SwitchBody {...bodyAttrs} /> :
                <PortsBody {...bodyAttrs} />
            }
        </div>
    )
}

function Header({ attrs, style }) {
    style.setStyle({
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
            App.updateBlock(id, { label: e.target.innerHTML });
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
    let title = h("div", {
        class: "title",
        style: inner.style(),
        oninput: handlers.oninput,
        ondblclick: handlers.ondblclick,
        contenteditable: "true",
    }, m.trust(attrs.label));
    let headerAttrs = {
        id: attrs.id + "-header",
        class: "header"
    };
    if (attrs.flow === true) {
        headerAttrs["style"] = Style.from(style).extendStyle(flow);
        return h("div", headerAttrs, [
            (attrs.inflow) ? h(InflowEndpoint, { id: attrs.id + "-in" }) : undefined,
            title,
            (attrs.outflow) ? h(OutflowEndpoint, { id: attrs.id + "-out", connect: attrs.connect }) : undefined
        ]);
    }
    if (attrs.expr === true) {
        return h("div", headerAttrs, [title, h(Endpoint, { id: attrs.id + "-out", connect: attrs.connect, output: true, header: true })]);
    }
    return h("div", headerAttrs, title);
}

function SwitchBody({attrs}) {
    var inputs = attrs.inputs || [];
    var outputs = attrs.outputs || [];
    
    let gridSize = Style.propInt("--grid-size");
    let bodyHeight = Math.max(inputs.length, outputs.length) * gridSize * 5;
    let switch_ = Style.from({
        height: bodyHeight + "px",
        gridTemplateColumns: "auto",
        borderRadius: "0 0 4px 4px",
        backgroundColor: "var(--sidebar-color)"
    });
    let cases = Style.from({
        borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderTop: "var(--pixel-size) solid #42494d",
        borderLeft: "var(--pixel-size) solid #42494d"
    });

    return (
        <div id={attrs.id + "-body"} class="body switch" style={switch_}>
            <div>{inputs.map((val, idx) => h(Port, { input: true, desc: val }))}</div>
            <div style={cases}>
                <SwitchCase />
                <SwitchCase />
                <SwitchCase />
            </div>
        </div>
    )
}

function SwitchCase() {
    return (
        <div>
            <atom.Grip />
            <atom.Textbox>weofij</atom.Textbox>
            <OutflowEndpoint case={true} class="case" />
        </div>
    )
}

function PortsBody({attrs, style}) {
    var inputs = attrs.inputs || [];
    var outputs = attrs.outputs || [];
    
    let gridSize = Style.propInt("--grid-size");
    let bodyHeight = Math.max(inputs.length, outputs.length) * gridSize;
    style.setStyle({
        height: bodyHeight + "px",
        display: "grid",
        gridTemplateColumns: "auto auto",
        borderRadius: "0 0 4px 4px"
    });
    return <div class="body" id={attrs.id + "-body"}>
        <div>{inputs.map((val, idx) => h(Port, { id: attrs.id, input: true, desc: val }))}</div>
        <div>{outputs.map((val, idx) => h(Port, { id: attrs.id, output: true, desc: val, connects: attrs.connects }))}</div>
    </div>
}

function Port({attrs, style}) {
    var connect = undefined;
    if (attrs.output === true) {
        var id = `${attrs.id}-out`;
    } else {
        var id = attrs.id;
    }

    let val = attrs.desc;
    let punctuation = val[val.length - 1];
    if ([">", "?"].includes(punctuation)) {
        val = val.substr(0, val.length - 1);
    }
    if (attrs.connects) {
        connect = attrs.connects[val];
    }
    
    style.setStyle({
        paddingTop: "2px",
        height: "28px"
    });
    style.setStyle({
        marginLeft: "15px"
    }, () => attrs.input === true)
    style.setStyle({
        marginRight: "15px",
        textAlign: "right",
    }, () => attrs.output === true)
    
    switch (punctuation) {
    case ">":
        return (
            <div>
                <OutflowEndpoint id={`${id}-${val}`} body={true} connect={connect} />
                {val}
            </div>
        )
    case "?":
        return (
            <atom.BlockTextbox>{val}</atom.BlockTextbox>
        )
    default:
        return (
            <div>
                <Endpoint id={`${id}-${val}`} output={attrs.output} connect={connect} />
                {val}
            </div>
        )
    }
}

function InflowEndpoint({ attrs, style, hooks }) {
    hooks.oncreate = ({ dom }) => {
        jsPlumb.removeAllEndpoints(dom);
        jsPlumb.addEndpoint(dom, {
            endpoint: "Blank",
            isTarget: true,
            cssClass: "inflow",
            width: 30,
            height: 30,
            anchor: [0, 0.5, -1, 0, 0, 0],
            scope: "flow",
        });
    };

    style.setStyle({
        position: "absolute",
        marginLeft: "-23px"
    });

    return (
        <div id={attrs.id}>
            <shapes.ArrowTail color="#475054" />
        </div>
    )
}

export function OutflowEndpoint({ attrs, style, hooks }) {
    const update = ({ dom }) => {
        // let block = App.getBlockById(attrs.id.replace("-out", ""));
        jsPlumb.removeAllEndpoints(dom);
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

        // console.log(attrs);
        if (attrs.connect) {
            setTimeout(() => {
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
            }, 20);
        }
    }
    hooks.oncreate = update;
    hooks.onupdate = update;

    var color = attrs.color || "#475054";   

    style.setStyle({
        marginRight: "-24px",
        marginTop: "-28px",
        float: "right",
    }, () => !attrs.case && !attrs.body && !attrs.entry)

    style.addClass("body", () => attrs.body);
    style.setStyle({
        marginTop: "0",
        marginRight: "-28px",
        float: "right",
    }, () => attrs.body)

    style.addClass("case", () => attrs.case);
    style.setStyle({
        top: "13px",
        left: "6px",
        float: "right",
    }, () => attrs.case)

    style.addClass("entry", () => attrs.entry);
    style.setStyle({
        position: "relative",
    }, () => attrs.entry)

    return (
        <div id={attrs.id}>
            <shapes.ArrowHead color={color} />
        </div>
    ) 
}


function Endpoint({attrs, style, hooks, vnode}) {
    hooks.oncreate = () => App.endpointcreate(vnode);

    var output = attrs.output || false;
    var header = attrs.header || false;
    var size = attrs.size || 28;

    style.setStyle({
        float: "right",
        marginRight: "-29px",
    }, () => output === true);
    style.setStyle({
        position: "absolute",
        marginLeft: "-28px",
    }, () => output === false);
    style.setStyle({
        marginTop: "-29px",
        marginRight: "-24px",
    }, () => header === true);
    style.addClass("endpoint header", () => header === true);

    return (
        <shapes.Ring color="#475054" fill="#2a2a2c" size={size} />
    )
}
