import * as block from "./block.js";
import * as shapes from "./shapes.js";
import { App } from "../lib/app.js";

export function Grid({attrs,style,hooks,vnode}) {
    var source = attrs.source || "";
    var blocks = attrs.blocks || [];
    var entry = attrs.entry || "";

    hooks.oncreate = () => {
        jsPlumb.setContainer(vnode.dom);
    }

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
            <Connector src={[400,400]} dst={[600,600]} />
            <Preview source={source} />
            {blocks.map((attrs, idx) => {
                attrs["key"] = attrs["id"];
                attrs["idx"] = idx;
                return <block.Block data-idx={idx} {...attrs} />
            })}
            {(App.selected() !== undefined) && <Entrypoint connect={(entry)?`${entry}-in`:undefined} />}
            {flowConnects(entry, blocks)}
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
    var src = attrs.src || [0, 0];
    var dst = attrs.dst || [0, 0];
    var offset = attrs.offset || 50;

    let strokeWidth = 10;

    const calcMiddle = (src, dest) => [(src[0] + dest[0]) / 2, (src[1] + dest[1]) / 2];
    const calcOffset = (pt, offset) => [pt[0]+offset, pt[1]];

    function directLine(src, dest) {
        return `M${src[0]} ${src[1]} L${dest[0]} ${dest[1]}`;
    }
    function L(src, dest) {
        return `M${src[0]} ${src[1]} L${src[0]} ${dest[1]} M${src[0]} ${dest[1]} L${dest[0]} ${dest[1]}`;
    }
    function mirroredL(src, dest) {
        return `M${src[0]} ${src[1]} L${dest[0]} ${src[1]} M${dest[0]} ${src[1]} L${dest[0]} ${dest[1]}`;
    }
    function Path(src, dest, offset) {
        let middle = calcMiddle(src, dest);
        if (middle[0] > dest[0] + offset) {
            return mirroredL(src, middle) + " " + L(middle, dest);
        } else {
            return (
                directLine(calcOffset(src, -offset), src) +
                " " +
                L(calcOffset(src, -offset), middle) +
                " " +
                mirroredL(middle, calcOffset(dest, offset)) +
                " " +
                directLine(dest, calcOffset(dest, offset))
            );
        }
    }
    
    function Cable(src, dest, srcOffset, destOffset, physicsDrop) {
        let srcCtl = calcOffset(src, srcOffset);
        let destCtl = calcOffset(dest, destOffset);
    
        if (srcCtl[1] > destCtl[1]) {
            srcCtl[1] += physicsDrop;
        } else {
            destCtl[1] += physicsDrop;
        }
    
        return `M${src[0]} ${src[1]} C${srcCtl[0]},${srcCtl[1]} ${destCtl[0]},${destCtl[1]} ${dest[0]}, ${dest[1]}`;
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
