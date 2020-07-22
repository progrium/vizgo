import { Session } from "../lib/session.js";

let state = {
    drawing: false,
    type: undefined,
    movingLocal: false,
    setDst: true,
    oldSrc: undefined,
    oldDst: undefined,
    newSrc: undefined,
    newDst: undefined,
    didConnect: false,
    movingConnId: undefined,
};

export function Connectors({attrs}) {
    var entry = attrs.entry || undefined;
    var blocks = attrs.blocks || [];

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

    return (
        <div>
            <Connector id="draw-line" type="flow" class="hidden" />
            {conn.map((c) => <Connector src={c[0]} dst={c[1]} type={c[2]} /> )}
        </div>
    )
}

export function Connector({attrs, style}) {
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

export function Anchor({attrs, style}) {
    var type = attrs.type || "flow";
    var src = attrs.src || undefined;
    var dst = attrs.dst || undefined;

    let local = src || dst;
    let isSrc = (local === src);

    style.add({
        zIndex: "30", 
        width: "30px", 
        height: "30px", 
        // border: "1px solid red", 
        position: "absolute",
    });

    const onmousedown = (e) => {
        state.movingLocal = (e.target.dataset['remote'] !== undefined);
        if (state.movingLocal && isSrc && type === "flow") return;
        state.type = type;
        state.drawing = true;
        state.setDst = (state.movingLocal) ? !isSrc : isSrc;

        let localId = e.target.dataset['local'];
        let remoteId = e.target.dataset['remote'];
        let srcId = (isSrc) ? localId : remoteId;
        let dstId = (isSrc) ? remoteId : localId;

        state.oldSrc = document.querySelector(`#${srcId}`);
        state.oldDst = document.querySelector(`#${dstId}`);
        if (state.setDst) {
            state.newSrc = state.oldSrc;
        } else {
            state.newDst = state.oldDst;
        }

        if (state.oldSrc) state.oldSrc.classList.add("dragging");
        if (state.oldDst) state.oldDst.classList.add("dragging");
        
    
        let cur = document.querySelector("#draw-cursor");
        document.querySelector("#draw-line").firstChild.setAttribute("d", "");
        let conn = undefined;
        if (state.movingLocal) {
            conn = document.querySelector(`svg.Connector[data-src="${srcId}"][data-dst="${dstId}"]`);
        }
        
        const docmousemove = (e) => {
            let new_ = (state.setDst) ? state.newDst : state.newSrc;
            if (new_) {
                let pt = center(new_);
                cur.style.left = `${pt[0]}px`;
                cur.style.top = `${pt[1]}px`;
            } else {
                cur.style.left = e.pageX+"px";
                cur.style.top = e.pageY+"px";
            }            

            redrawAll();

            if (conn) {
                state.movingConnId = conn.id;
            }
            cur.style.display = "block";
            document.querySelector("#draw-line").style.display = "block"; 
        }

        const docmouseup = (e) => {
            let new_ = (state.setDst) ? state.newDst : state.newSrc;
            let old_ = (state.setDst) ? state.oldDst : state.oldSrc;
            if (state.movingLocal && (!new_ || old_.id !== new_.id)) {
                let oldSrcId = state.oldSrc.id;
                let oldDstId = state.oldDst.id;
                setTimeout(() => {
                    document.querySelector(`#${oldSrcId}`).classList.remove("connected", "dragging");
                    document.querySelector(`#${oldDstId}`).classList.remove("connected", "dragging");
                }, 40);
                if (!state.didConnect) {
                    let src_ = state.oldSrc.id.replace("-out", "");
                    let dst_ = state.oldDst.id.replace("-in", "");
                    Session.disconnect(src_, dst_);
                }
            }
            cur.style.display = "none";
            document.querySelector("#draw-line").firstChild.setAttribute("d", "");
            document.querySelector("#draw-line").style.display = "none";
            state.didConnect = false;
            state.drawing = false;
            state.type = undefined;
            state.oldDst = undefined;
            state.newDst = undefined;
            state.oldSrc = undefined;
            state.newSrc = undefined;
            state.movingLocal = false;
            state.setDst = true;
            setTimeout(() => state.movingConnId = undefined, 20);
            document.body.removeEventListener("mouseup", docmouseup);
            document.body.removeEventListener("mousemove", docmousemove);
            return false;
        }

        document.body.addEventListener("mouseup", docmouseup);
        document.body.addEventListener("mousemove", docmousemove);
        return false;
    };

    const onmouseup = (e) => {
        if (state.type !== type) return;
        let isDroppable = (state.setDst && !isSrc) || (!state.setDst && isSrc);
        if (state.drawing && isDroppable) {
            let newSrcId = state.newSrc.id;
            let newDstId = state.newDst.id;
            setTimeout(() => {
                document.querySelector(`#${newSrcId}`).classList.remove("dragging");
                document.querySelector(`#${newDstId}`).classList.remove("dragging");
            }, 40);
            let src_ = state.newSrc.id.replace("-out", "");
            let dst_ = state.newDst.id.replace("-in", "");
            Session.connect(src_, dst_);
            redrawAll();
            state.didConnect = true;
        }
    };

    const onmouseover = (e) => {
        if (state.type !== type) return;
        let isDroppable = (state.setDst && !isSrc) || (!state.setDst && isSrc);
        if (state.drawing && isDroppable) {
            if (state.setDst) {
                state.newDst = document.querySelector(`#${dst}`);
            } else {
                state.newSrc = document.querySelector(`#${src}`);
            }
            
        }
    };

    const onmouseout = (e) => {
        if (state.type !== type) return;
        let isDroppable = (state.setDst && !isSrc) || (!state.setDst && isSrc);
        if (state.drawing && isDroppable) {
            if (state.setDst) {
                state.newDst = undefined;
            } else {
                state.newSrc = undefined;
            }
        }
    };

    return (
        <div data-local={local} data-dir={isSrc?"dst":"src"}
            onmousedown={onmousedown}
            onmouseup={onmouseup}
            onmouseover={onmouseover}
            onmouseout={onmouseout}></div>
    )
}

export function redrawAll() {
    // clear remote on anchors
    document.querySelectorAll(".Anchor").forEach((a) => {
        delete a.dataset["remote"];
        a.removeAttribute("data-remote");
    });

    document.querySelectorAll("svg.Connector").forEach((c) => {
        if (c.id == "draw-line" && state.drawing) {
            let cursor = document.querySelector("#draw-cursor");
            cursor.style["z-index"] = "0"
            let cursorPos = center(cursor);
            c.dataset.type = state.type;
            if (state.type === "flow") {
                cursor.classList.remove("expr");
                cursor.classList.add("flow");
                cursorPos = offset(cursorPos, -3, -6);
            } else {
                cursor.classList.remove("flow");
                cursor.classList.add("expr");
                cursorPos = offset(cursorPos, -6, -6);
            }
            if (state.setDst) {
                redraw(c, center(state.newSrc), cursorPos);
            } else {
                redraw(c, cursorPos, center(state.newDst));
            }
            
        }
        if (c.dataset["src"] && c.dataset["dst"]) {
            // set remote on anchors that apply to this connection
            let srcAnchor = document.querySelector(`.Anchor[data-dir="dst"][data-local="${c.dataset["src"]}"]`);
            if (srcAnchor) {
                srcAnchor.dataset["remote"] = c.dataset["dst"];
            }
            let dstAnchor = document.querySelector(`.Anchor[data-dir="src"][data-local="${c.dataset["dst"]}"]`);
            if (dstAnchor) {
                dstAnchor.dataset["remote"] = c.dataset["src"];
            }

            let srcEl = document.querySelector(`#${c.dataset["src"]}`);
            let dstEl = document.querySelector(`#${c.dataset["dst"]}`);

            // ensure connected class is added to src and dst targets
            srcEl.classList.add("connected");
            dstEl.classList.add("connected");

            redraw(c, center(srcEl), center(dstEl));

            if (c.id === state.movingConnId) {
                c.firstChild.setAttribute("d", "");
            }
        }
    });
}

function center(el) {
    let box = el.getBoundingClientRect();
    return [Math.floor(box.left+(box.width/2)), Math.floor(box.top+(box.height/2))]
}

function offset(pt, x, y) {
    return [pt[0]+x, pt[1]+y];
}

function redraw(conn, src, dst) {

    let path = conn.firstChild;
    let strokeWidth = (conn.dataset["type"] == "flow") ? 10 : 8;
    let halfStroke = strokeWidth / 2;

    const calcMiddle = (src, dst) => [Math.floor((src[0] + dst[0]) / 2), Math.floor((src[1] + dst[1]) / 2)];
    const xOffset = (pt, offset) => [pt[0]+offset, pt[1]];
    const line = (src, dst) => `M${src[0]} ${src[1]} L${dst[0]} ${dst[1]}`;
    const L = (src, dst) => `M${src[0]} ${src[1]} L${src[0]} ${dst[1]} M${src[0]} ${dst[1]} L${dst[0]} ${dst[1]}`;
    const flipL = (src, dst) => `M${src[0]} ${src[1]} L${dst[0]} ${src[1]} M${dst[0]} ${src[1]} L${dst[0]} ${dst[1]}`;

    function Path(src, dst, offset) {
        let middle = xOffset(calcMiddle(src, dst), halfStroke);
        if (middle[0] < dst[0] - offset) {
            return [flipL(src, middle), L(middle, dst)].join(" ");
        } else {
            let offsetSrc = xOffset(src, offset+halfStroke);
            let offsetDst = xOffset(dst, -offset+halfStroke);
            return [
                line(src, offsetSrc),
                L(offsetSrc, middle),
                flipL(middle, offsetDst),
                line(dst, offsetDst),
            ].join(" ");
        }
    }
    
    function Cable(src, dst, srcOffset, dstOffset) {
        let srcCtl = xOffset(src, srcOffset);
        let dstCtl = xOffset(dst, dstOffset);
        return `M${src[0]} ${src[1]} C${srcCtl[0]},${srcCtl[1]} ${dstCtl[0]},${dstCtl[1]} ${dst[0]}, ${dst[1]}`;
    }

    let offset = 30;
    let bounds = {
        left: Math.min(src[0], dst[0])-offset*2-strokeWidth*2,
        top: Math.min(src[1], dst[1])-offset*2-strokeWidth*2,
        width: Math.abs(src[0]-dst[0])+offset*4+strokeWidth*4,
        height: Math.abs(src[1]-dst[1])+offset*4+strokeWidth*4
    }

    conn.style.left = `${bounds.left}px`;
    conn.style.top = `${bounds.top}px`;
    conn.style.width = `${bounds.width}px`;
    conn.style.height = `${bounds.height}px`;

    let offsetSrc = [src[0]-bounds.left, src[1]-bounds.top];
    let offsetDst = [dst[0]-bounds.left, dst[1]-bounds.top];

    if (conn.dataset["type"] == "flow") {
        path.setAttribute("stroke", "white");
        path.setAttribute("stroke-width", "10");
        path.setAttribute("d", Path(offsetSrc,offsetDst,offset));
    }
        
    
    if (conn.dataset["type"] == "expr") {
        path.setAttribute("stroke", "gray");
        path.setAttribute("stroke-width", "8");
        path.setAttribute("d", Cable(offsetSrc,offsetDst,100, -100,0));
    }
}