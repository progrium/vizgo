import * as block from "./block.js";
import * as draw from "./draw.js";
import * as shapes from "./shapes.js";
import { App } from "../lib/app.js";

export function Grid({attrs,style,hooks,vnode}) {
    hooks.oncreate = () => {
        jsPlumb.setContainer(vnode.dom);
    }

    var source = attrs.source || "";
    var blocks = attrs.blocks || [];
    var entry = attrs.entry || "";

    let conn = [];
    if (entry) {
        conn.push(["entrypoint-out", entry+"-in", "flow"]);
    }
    blocks.forEach((b) => {
        if (b.connect) {
            if (b.flow === false) {
                conn.push([`${b.id}-expr`, b.connect, "expr"]);
            } else {
                conn.push([`${b.id}-out`, b.connect, "flow"]);
            }
            
        }
    });

    style.add({
        userSelect: "none",
        MozUserSelect: "none",
        backgroundSize: "var(--grid-size) var(--grid-size)",
        backgroundColor: "var(--background-color)",
        backgroundImage: "radial-gradient(#202020 2px, transparent 0)",
        backgroundPosition: "calc(-0.5 * var(--grid-size)) calc(-0.5 * var(--grid-size))",
        padding: "var(--grid-size) var(--grid-size)",
        height: "100%",
        order: "0",
        flex: "1 1 auto",
        alignSelf: "auto",
    });

    return (
        <div>
            <div id="draw-cursor" class="hidden" style={{position: "absolute"}}><shapes.ArrowHead color="white" style={{marginTop: "-10px", marginLeft: "-5px"}} /></div>
            <div id="connectors">
                <Connector id="draw-line" type="flow" class="hidden" />
                {conn.map((c) => <Connector src={c[0]} dst={c[1]} type={c[2]} /> )}
            </div>
            <Preview source={source} />
            {blocks.map((attrs, idx) => {
                attrs["key"] = attrs["id"];
                attrs["idx"] = idx;
                return <block.Block data-idx={idx} {...attrs} />
            })}
            {(App.selected() !== undefined) && <Entrypoint connect={(entry)?`${entry}-in`:undefined} />}
        </div>
    )
}

function htmlDecode(input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

function Preview({attrs,style,hooks,vnode}) {
    let source = Prism.highlight(htmlDecode(attrs.source), Prism.languages.go, 'go');

    style.add({
        width: "300px",
        height: "500px",
        fontSize: "smaller",
        marginLeft: "900px",
        backgroundColor: "transparent",
        border: "0",
        boxShadow: "none",
    })
    return (
        <pre><code class="language-go">{h.trust(source)}</code></pre>
    )
}

function Entrypoint({attrs,style,hooks,state}) {
    var connect = attrs.connect || undefined;
    // const update = () => App.Outflow_onupdate(attrs, state, "entrypoint-out");
    // hooks.oncreate = update;
    // hooks.onupdate = update;
    style.add({
        background: "var(--sidebar-color)", //rgb(75, 126, 28)
        width: "22px",
        height: "150px",
        borderTopRightRadius: "var(--corner-size)",
        borderBottomRightRadius: "var(--corner-size)",
        position: "absolute",
        top: "400px",
        marginLeft: "-34px",
        
    })
    style.add("invisible", () => !App.selected());
    return (
        <div id="entrypoint">
            <draw.Anchor dir="out" src="entrypoint-out" dst={connect} class="ml-3 my-8" />
            <shapes.ArrowHead id="entrypoint-out" color="var(--sidebar-color)" class="ml-5 my-8" />
        </div>
    )
}

function Connector({attrs, style}) {
    var src = attrs.src || "";
    var dst = attrs.dst || "";
    var type = attrs.type || "flow";
    var color = attrs.color || "red";
    var width = attrs.width || 10;

    style.add("absolute", {
        left: "0px",
        top: "0px",
        width: "0px",
        height: "0px",
        zIndex: "0",
    });
    
    return (
        <svg id={"C"+src+dst+type} data-src={src} data-dst={dst} data-type={type}>
            <path stroke={color} 
                stroke-width={width} 
                stroke-linecap="round" 
                fill="none" />
        </svg>
    )
}

