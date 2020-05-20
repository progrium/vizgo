import { Style } from "../lib/style.js";

var m = h;

export function Dots({ attrs, style }) {
    var color = attrs.color || "#444";
    var size = attrs.size || 4;
    var cols = attrs.cols;
    var rows = attrs.rows;

    style.setStyle({
        backgroundImage: `radial-gradient(${color} 50%, transparent 50%)`,
        backgroundColor: "transparent",
        backgroundRepeat: "repeat",
        backgroundSize: `${size}px ${size}px`,
        opacity: "70%",
        width: "100%",
    });    
    style.setStyle({ width: `${size*cols}px` }, () => cols !== undefined)
    style.setStyle({ height: `${size*rows}px` }, () => rows !== undefined)

    return <div />
}


export function Ring({ attrs, style }) {
    var color = attrs.color || "#444";
    var fill = attrs.fill || "rgba(0,0,0,0)";
    var size = attrs.size || 28;

    style.setStyle({
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color, //"#475054"
        borderRadius: "50%",
        background: `radial-gradient(circle at center, ${fill} 35%, ${color} 0)`,
    });

    return <div />
}

export function ArrowHead({ attrs, style }) {
    var color = attrs.color || "#444";
    var base = attrs.size || 28;

    let side = base / Math.sqrt(2);
    let height = Math.sqrt(Math.pow(side, 2) - (Math.pow(base, 2) / 4));
    let offsetY = (side / 2) - (height / 2) + 1;

    style.setStyle({
        width: `${height}px`,
        height: `${base}px`,
    });

    let trianglePath = "polygon(0 0, 100% 0, 100% 100%)";
    let triangle = Style.from({
        transform: "rotate(45deg)",
        position: "relative",
        width: `${side}px`,
        height: `${side}px`,
        backgroundColor: color,
        left: `-${side / 2}px`,
        top: `${offsetY}px`,
        clipPath: trianglePath,
        WebkitClipPath: trianglePath,
        zIndex: "10",
    });
    //triangle.setStyle(attrs.style);

    return <div><div style={triangle.style()} /></div>
}

export function ArrowTail({ attrs, style }) {
    var color = attrs.color || "#444";
    var base = attrs.size || 30;

    let side = base / Math.sqrt(2);
    let height = Math.sqrt(Math.pow(side, 2) - (Math.pow(base, 2) / 4));
    // let offsetY = (side / 2) - (height / 2) + 1;

    style.setStyle({
        width: `${height}px`,
        height: `${base}px`,
    });

    let tailPath = "polygon(0 0, 100% 0, 100% 100%, 0 100%, 90% 50%)";
    let tail = Style.from({
        position: "absolute",
        width: `${height}px`,
        height: `${base}px`,
        clipPath: tailPath,
        WebkitClipPath: tailPath,
        backgroundColor: color,
    })
    //tail.setStyle(attrs.style);

    // let trianglePath = "polygon(0 0, 100% 0, 100% 100%)";
    // let triangle = Style.from({
    //     transform: "rotate(45deg)",
    //     position: "relative",
    //     width: `${side}px`,
    //     height: `${side}px`,
    //     backgroundColor: "transparent",
    //     left: `-${side / 2}px`,
    //     top: `${offsetY}px`,
    //     clipPath: trianglePath,
    //     WebkitClipPath: trianglePath,
    //     opacity: "0"
    // });

    return (
        <div>
            <div style={tail.style()} />
        </div>
    )
}