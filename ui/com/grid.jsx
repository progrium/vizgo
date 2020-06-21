import * as block from "./block.js";
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
        conn.push(["entrypoint-out", entry+"-in"]);
    }
    blocks.forEach((b) => {
        if (b.connect) {
            conn.push([b.id+"-out", b.connect]);
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
            {conn.map((c) => <Connector src={c[0]} dst={c[1]} /> )}
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

function flowConnects(entry, blocks) {
    let conn = [];
    if (entry) {
        conn.push(["entrypoint-out", entry+"-in"]);
    }
    blocks.forEach((b) => {
        if (b.connect) {
            conn.push([b.id+"-out", b.connect]);
        }
    });
    const pos = (id) => {
        let box = document.querySelector(`#${id}`).getBoundingClientRect();
        return [box.left, box.top];
    }
    console.log(conn.map((c) => [pos(c[0]), pos(c[1])]));
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
    const update = () => App.Outflow_onupdate(attrs, state, "entrypoint-out");
    hooks.oncreate = update;
    hooks.onupdate = update;
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
            <shapes.ArrowHead id="entrypoint-out" color="var(--sidebar-color)" class="ml-5 my-8" />
        </div>
    )
}

function Connector({attrs, style}) {
    var src = attrs.src || "";
    var dst = attrs.src || "";
    var color = attrs.color || "white";
    var width = attrs.width || 10;

    style.add("absolute", {
        left: "0px",
        top: "0px",
        width: "0px",
        height: "0px",
    });
    
    return (
        <svg data-src={src} data-dst={dst}>
            <path stroke={color} 
                stroke-width={width} 
                stroke-linecap="round" 
                fill="none" />
        </svg>
    )
}

function ConnectorUpdate({attrs, style}) {
    var src = attrs.src || [0, 0];
    var dst = attrs.dst || [0, 0];
    var offset = attrs.offset || 50;

    const calcMiddle = (src, dst) => [(src[0] + dst[0]) / 2, (src[1] + dst[1]) / 2];
    const xOffset = (pt, offset) => [pt[0]+offset, pt[1]];
    const line = (src, dst) => `M${src[0]} ${src[1]} L${dst[0]} ${dst[1]}`;
    const L = (src, dst) => `M${src[0]} ${src[1]} L${src[0]} ${dst[1]} M${src[0]} ${dst[1]} L${dst[0]} ${dst[1]}`;
    const flipL = (src, dst) => `M${src[0]} ${src[1]} L${dst[0]} ${src[1]} M${dst[0]} ${src[1]} L${dst[0]} ${dst[1]}`;
    
    function Path(src, dst, offset) {
        let middle = calcMiddle(src, dst);
        if (middle[0] > dst[0] + offset) {
            return [flipL(src, middle), L(middle, dst)].join(" ");
        } else {
            return [
                line(xOffset(src, -offset), src),
                L(xOffset(src, -offset), middle),
                flipL(middle, xOffset(dst, offset)),
                line(dst, xOffset(dst, offset)),
            ].split(" ");
        }
    }
    
    function Cable(src, dst, srcOffset, dstOffset) {
        let srcCtl = xOffset(src, srcOffset);
        let dstCtl = xOffset(dst, dstOffset);
        return `M${src[0]} ${src[1]} C${srcCtl[0]},${srcCtl[1]} ${dstCtl[0]},${dstCtl[1]} ${dst[0]}, ${dst[1]}`;
    }

    let bounds = {
        left: Math.min(src[0], dst[0])-offset-strokeWidth,
        top: Math.min(src[1], dst[1])-offset-strokeWidth,
        width: Math.abs(src[0]-dst[0])+offset*2+strokeWidth*2,
        height: Math.abs(src[1]-dst[1])+offset*2+strokeWidth*2
    }
    style.add({
        "position": "absolute",
        "left": `${bounds.left}px`,
        "top": `${bounds.top}px`,
        "width": `${bounds.width}px`,
        "height": `${bounds.height}px`,
    });

    let offsetSrc = [src[0]-bounds.left, src[1]-bounds.top];
    let offsetDst = [dst[0]-bounds.left, dst[1]-bounds.top];

    return (
        <svg>
            <path stroke="gray" stroke-width="8" stroke-linecap="round" fill="none"  d={Cable(offsetSrc,offsetDst,100, -100,0)} />
            <path stroke="white" stroke-width="10" stroke-linecap="round" fill="none"  d={Path(offsetSrc,offsetDst,50)} />
        </svg>
    )
}
