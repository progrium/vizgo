import { Session } from "../lib/session.js";

export let state = {
    drawing: false,
    moving: false,
    oldSrc: undefined,
    oldDst: undefined,
    newSrc: undefined,
    newDst: undefined,
    localId: undefined,
    remoteId: undefined,
    didConnect: false,
    movingConnId: undefined,
};

export function Anchor({attrs, style}) {
    var dir = attrs.dir || undefined;
    var src = attrs.src || undefined;
    var dst = attrs.dst || undefined;

    let local = src || dst;
    switch (dir) {
    case "out":
        local = src;
        break;
    case "in":
        local = dst;
        break;
    }

    style.add({
        zIndex: "30", 
        width: "30px", 
        height: "30px", 
        border: "1px solid red", 
        position: "absolute",
    });

    const onmousedown = (e) => {
        state.drawing = true;
        state.localId = e.target.dataset['local'];
        state.remoteId = e.target.dataset['remote'];
        state.moving = (e.target.dataset['remote'] !== undefined);

        let srcId = (dir === "out") ? state.localId : state.remoteId;
        let dstId = (dir === "out") ? state.remoteId : state.localId;

        state.oldSrc = document.querySelector(`#${srcId}`);
        state.oldDst = document.querySelector(`#${dstId}`);
        state.newSrc = state.oldSrc;
    
        let cur = document.querySelector("#draw-cursor");
        let conn = undefined;
        if (state.moving) {
            conn = document.querySelector(`svg.Connector[data-src="${srcId}"][data-dst="${dstId}"]`);
        }
        
        const docmousemove = (e) => {
            if (state.newDst) {
                let pt = center(state.newDst);
                cur.style.left = `${pt[0]}px`;
                cur.style.top = `${pt[1]}px`;
            } else {
                cur.style.left = e.pageX+"px";
                cur.style.top = e.pageY+"px";
            }            

            updateConnections();

            if (conn) {
                state.movingConnId = conn.id;
            }
            cur.style.display = "block";
            document.querySelector("#draw-line").style.display = "block"; 
        }

        const docmouseup = (e) => {
            if (state.moving && (!state.newDst || state.oldDst.id !== state.newDst.id)) {
                let targetId = state.oldDst.id;
                setTimeout(() => document.querySelector(`#${targetId}`).classList.remove("jtk-connected"), 20);
                if (!state.didConnect) {
                    let src_ = state.newSrc.id.replace("-out", "");
                    let dst_ = state.oldDst.id.replace("-in", "");
                    Session.disconnect(src_, dst_);
                }
            }
            cur.style.display = "none";
            document.querySelector("#draw-line").style.display = "none";
            state.didConnect = false;
            state.drawing = false;
            state.oldDst = undefined;
            state.newDst = undefined;
            state.oldSrc = undefined;
            state.newSrc = undefined;
            state.moving = false;
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
        if (state.drawing && dst) {
            let src_ = state.newSrc.id.replace("-out", "");
            let dst_ = state.newDst.id.replace("-in", "");
            Session.connect(src_, dst_);
            updateConnections();
            state.didConnect = true;
        }
    };

    const onmouseover = (e) => {
        if (state.drawing && dst) {
            state.newDst = document.querySelector(`#${dst}`);
        }
    };

    const onmouseout = (e) => {
        if (state.drawing && dst) {
            state.newDst = undefined;
        }
    };

    return (
        <div data-local={local} data-dir={dir}
            onmousedown={onmousedown}
            onmouseup={onmouseup}
            onmouseover={onmouseover}
            onmouseout={onmouseout}></div>
    )
}

export function updateConnection(conn, src, dst) {

    let path = conn.firstChild;
    let strokeWidth = path.getAttribute("stroke-width");

    const calcMiddle = (src, dst) => [(src[0] + dst[0]) / 2, (src[1] + dst[1]) / 2];
    const xOffset = (pt, offset) => [pt[0]+offset, pt[1]];
    const line = (src, dst) => `M${src[0]} ${src[1]} L${dst[0]} ${dst[1]}`;
    const L = (src, dst) => `M${src[0]} ${src[1]} L${src[0]} ${dst[1]} M${src[0]} ${dst[1]} L${dst[0]} ${dst[1]}`;
    const flipL = (src, dst) => `M${src[0]} ${src[1]} L${dst[0]} ${src[1]} M${dst[0]} ${src[1]} L${dst[0]} ${dst[1]}`;
    
    function Path(src, dst, offset, strokeWidth) {
        let halfStroke = strokeWidth / 2;
        let middle = xOffset(calcMiddle(src, dst), halfStroke);
        if (middle[0] < dst[0] - offset) {
            return [flipL(src, middle), L(middle, dst)].join(" ");
        } else {
            return [
                line(xOffset(src, offset+halfStroke), src),
                L(xOffset(src, offset+halfStroke), middle),
                flipL(middle, xOffset(dst, -offset+halfStroke)),
                line(dst, xOffset(dst, -offset+halfStroke)),
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

    if (conn.dataset["type"] == "flow")
        path.setAttribute("d", Path(offsetSrc,offsetDst,offset,strokeWidth));
    
    if (conn.dataset["type"] == "expr")
        path.setAttribute("d", Cable(offsetSrc,offsetDst,100, -100,0));

    // return (
    //     <svg>
    //         <path stroke="gray" stroke-width="8" stroke-linecap="round" fill="none"  d={Cable(offsetSrc,offsetDst,100, -100,0)} />
    //         <path stroke="white" stroke-width="10" stroke-linecap="round" fill="none"  d={Path(offsetSrc,offsetDst,50)} />
    //     </svg>
    // )
}

export function updateConnections() {
    // clear remote on anchors
    document.querySelectorAll(".Anchor").forEach((a) => {
        delete a.dataset["remote"];
        a.removeAttribute("data-remote");
    });

    document.querySelectorAll("svg.Connector").forEach((n) => {
        if (n.id == "draw-line" && state.drawing) {
            updateConnection(n, center(state.newSrc), center(document.querySelector("#draw-cursor")));
        }
        if (n.dataset["src"] && n.dataset["dst"]) {
            // set remote on anchors that apply to this connection
            let srcAnchor = document.querySelector(`.Anchor[data-dir="out"][data-local="${n.dataset["src"]}"]`);
            if (srcAnchor) {
                srcAnchor.dataset["remote"] = n.dataset["dst"];
            }
            let dstAnchor = document.querySelector(`.Anchor[data-dir="in"][data-local="${n.dataset["dst"]}"]`);
            if (dstAnchor) {
                dstAnchor.dataset["remote"] = n.dataset["src"];
            }

            let srcEl = document.querySelector(`#${n.dataset["src"]}`);
            let dstEl = document.querySelector(`#${n.dataset["dst"]}`);

            // ensure connected class is added to src and dst targets
            srcEl.classList.add("jtk-connected");
            dstEl.classList.add("jtk-connected");

            updateConnection(n, center(srcEl), center(dstEl));

            if (n.id === state.movingConnId) {
                n.firstChild.setAttribute("d", "");
            }
        }
    });
}

function center(el) {
    let box = el.getBoundingClientRect();
    return [box.left+(box.width/2), box.top+(box.height/2)]
}