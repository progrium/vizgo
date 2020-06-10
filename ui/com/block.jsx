import * as atom from "./atom.js";
import * as shapes from "./shapes.js";

import { Style } from "../lib/style.js";
import { App } from "../lib/app.js";
import { Session } from "../lib/session.js"

export function Block({ attrs, style, hooks }) {
    hooks.oncreate = App.Block_oncreate;
    hooks.onupdate = App.Block_onupdate;

    var flow = (attrs.flow === undefined) ? true : attrs.flow;
    var out = (attrs.out === undefined) ? true : attrs.out;
    var inputs = attrs.inputs || [];
    var outputs = attrs.outputs || [];
    var [x, y] = attrs.position || [0,0];
    var id = attrs.id || "";
    var label = attrs.label || "";
    var connect = attrs.connect || "";
    var connects = attrs.connects || {};

    let gridSize = Style.propInt("--grid-size");
    style.add({
        marginLeft: "4px",
        left: (x * gridSize + $("nav")[0].offsetWidth) + "px",
        top: (y * gridSize) + "px",
        width: "120px",
        position: "absolute",
        backgroundColor: "#475054",
        zIndex: "10",
        boxShadow: "4px 3px 5px #111",
        borderRadius: "var(--corner-size)"
    });
    return (
        <div id={id}>
            <Header 
                block={id} 
                label={label} 
                out={out} 
                flow={flow} 
                connect={connect} />
            {h((label == "switch") ? SwitchBody : PortsBody, {
                block: id,
                inputs: inputs,
                outputs: outputs,
                connects: connects
            })}
        </div>
    )
}

function Title({attrs, style, state, vnode, hooks}) {
    hooks.oncreate = () => {
        vnode.dom.addEventListener("edit", (e) => {
            vnode.state.readonly = false;
            vnode.dom.querySelector("input").select();
            h.redraw();
        });

        if (vnode.attrs.text === "expr") {
            vnode.dom.dispatchEvent(new Event("edit"));
        }
    };

    var value = attrs.text || "";

    if (state.readonly === undefined) {
        state.readonly = true;
    }

    style.add({
        height: "var(--grid-size)",
        MozUserSelect: "none",
        paddingTop: "0.25rem",
    });

    let inner = style.constructor.from("flex-auto", {
        backgroundColor: "transparent",
        width: "100%",
    });
    inner.add({pointerEvents: "none"}, () => state.readonly);

    const onchange = (e) => {
        // TODO: make this an attribute and set up this call to Session.set somewhere else. grid?
        let id = e.target.parentNode.parentNode.parentNode.id;
        Session.set(`${App.selected()}/Blocks/${id.slice(-1)}/label`, e.target.value);
        state.readonly = true;
    };

    const onblur = (e) => {
        state.readonly = true;
    }

    return (
        <div>
            <input type="text" 
                readonly={state.readonly}
                onchange={onchange} 
                onblur={onblur}
                value={value}
                style={inner.style()} />
        </div>
    )
}

function Header({ attrs, style }) {
    var block = attrs.block || "";
    var label = attrs.label || "";
    var flow = (attrs.flow === undefined) ? true : attrs.flow;
    var out = (attrs.out === undefined) ? true : attrs.out;
    var connect = attrs.connect || undefined;

    style.add({
        height: "var(--grid-size)",
        borderRadius: "var(--corner-size)",
        color: "white",

        paddingLeft: "10px",
        paddingRight: "10px",
    });
    
    if (!flow) {
        return (
            <div>
                <Title text={label} />
                <Endpoint
                    id={`${block}-expr`}
                    connect={connect}
                    header={true}
                    output={true} />
            </div>
        )
    }
    return (
        <div>
            <InflowEndpoint block={block} />
            <Title text={label} />
            {out && <OutflowEndpoint block={block} connect={connect} />}
        </div>
    )
}


function InflowEndpoint({ attrs, style, hooks }) {
    hooks.oncreate = App.Inflow_onupdate;
    hooks.onupdate = App.Inflow_onupdate;

    var block = attrs.block || "";

    style.add({
        float: "left",
        marginLeft: "-23px",
        // background: "#475054",
        // borderRadius: "var(--corner-size)",
        // width: "28px",
        // height: "28px",
    });

    return (
        <div id={`${block}-in`}>
            <shapes.ArrowTail color="#475054" />
            {/* <shapes.Diamond style={{marginLeft: "9px", marginTop: "10px"}} color="white" size={10} /> */}
        </div>
    )
}

export function OutflowEndpoint({ attrs, style, hooks, vnode }) {
    const update = () => App.Outflow_onupdate(attrs, vnode.dom.id);
    hooks.oncreate = update;
    hooks.onupdate = update;

    var color = attrs.color || "#475054";   
    var case_ = attrs.case || false;
    var body = attrs.body || false;
    var entry = attrs.entry || false;
    var name = attrs.name || undefined;
    var block = attrs.block || "";

    let id = `${block}-out`;
    if (name) {
        id += `-${name}`;
    }

    style.add({
        marginRight: "-23px",
        marginTop: "-28.5px",
        float: "right",
    }, () => !case_ && !body && !entry)

    style.add("body", {
        marginTop: "0",
        marginRight: "-28px",
        float: "right",
    }, () => body);

    style.add("case", {
        top: "13px",
        left: "6px",
        float: "right",
    }, () => case_);

    style.add("entry", {
        position: "relative",
    }, () => entry);

    return (
        <div id={id}>
            <shapes.ArrowHead color={color} />
        </div>
    ) 
}

function SwitchBody({attrs}) {
    var inputs = attrs.inputs || [];
    var outputs = attrs.outputs || [];
    var block = attrs.block || "";
    
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
        <div id={`${block}-body`} class="body switch" style={switch_}>
            <div>{inputs.map((val, idx) => h(Port, { key: idx, block: block, type: "in", desc: val }))}</div>
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
    var block = attrs.block || "";
    var connects = attrs.connects || {};
    
    let gridSize = Style.propInt("--grid-size");
    let bodyHeight = Math.max(inputs.length, outputs.length) * gridSize;
    style.add({
        height: bodyHeight + "px",
        display: "grid",
        gridTemplateColumns: "auto auto",
        borderRadius: "0 0 4px 4px"
    });
    return (
        <div class="body" id={`${block}-body`}>
            <div>{inputs.map((val, idx) => h(Port, { key: idx, block: block, type: "in", desc: val }))}</div>
            <div>{outputs.map((val, idx) => h(Port, { key: idx, block: block, type: "out", desc: val, connects: connects }))}</div>
        </div>
    )
}

function parsePortName(desc) {
    let name = desc;
    let punctuation = desc[desc.length - 1];
    if ([">", "?"].includes(punctuation)) {
        name = name.substr(0, name.length - 1);
    }
    return [name, punctuation];
}

function Port({attrs, style}) {
    var connects = attrs.connects || {};
    var block = attrs.block || "";
    var type = attrs.type || "";
    var desc = attrs.desc || "";

    let [name, flag] = parsePortName(desc);
    let id = `${block}-${type}-${name}`;
    let connect = undefined;
    if (connects) {
        connect = connects[name];
    }

    style.add({
        paddingTop: "2px",
        height: "28px"
    });
    style.add({
        marginLeft: "15px"
    }, () => type === "in")
    style.add({
        marginRight: "15px",
        textAlign: "right",
    }, () => type === "out")
    
    if (flag === ">") {
        return (
            <div>
                <OutflowEndpoint 
                    id={id} 
                    body={true} 
                    connect={connect} />
                {name}
            </div>
        )
    }
    if (flag === "?") {
        return (
            <atom.BlockTextbox>{name}</atom.BlockTextbox>
        )
    }
    return (
        <div>
            <Endpoint 
                id={id} 
                output={(type === "out")} 
                connect={connect} />
            {name}
        </div>
    )
}


function Endpoint({attrs, style, hooks, vnode}) {
    hooks.oncreate = () => App.Endpoint_oncreate(vnode);

    var output = attrs.output || false;
    var header = attrs.header || false;
    var connect = attrs.connect || undefined;
    var size = attrs.size || 28;

    style.add({
        float: "right",
        marginRight: "-29px",
    }, () => output === true);
    style.add({
        position: "absolute",
        marginLeft: "-28px",
    }, () => output === false);
    style.add("endpoint header", {
        marginTop: "-29px",
        marginRight: "-24px",
    }, () => header === true);

    return (
        <div>
            <shapes.Ring color="#475054" fill="#2a2a2c" size={size} />
        </div>
    )
}
