import { Style } from "../lib/style.js";


export function Dots({ attrs, style }) {
    var color = attrs.color || "#444";
    var size = attrs.size || 4;
    var cols = attrs.cols;
    var rows = attrs.rows;

    style.add({
        backgroundImage: `radial-gradient(${color} 50%, transparent 50%)`,
        backgroundColor: "transparent",
        backgroundRepeat: "repeat",
        backgroundSize: `${size}px ${size}px`,
        opacity: "70%",
        width: "100%",
    });    
    style.add({ width: `${size*cols}px` }, () => cols !== undefined)
    style.add({ height: `${size*rows}px` }, () => rows !== undefined)

    return <div />
}


export function Ring({ attrs, style }) {
    var color = attrs.color || "#444";
    var fill = attrs.fill || "rgba(0,0,0,0)";
    var size = attrs.size || 28;

    style.add({
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: `radial-gradient(circle at center, ${fill} 35%, ${color} 0)`,
    });

    return <div />
}

export function Circle({ attrs, style }) {
    var color = attrs.color || "#444";
    var size = attrs.size || 28;

    style.add({
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: color,
    });

    return <div />
}

export function ArrowHead({ attrs, style }) {
    var color = attrs.color || "#444";
    var base = attrs.size || 28;

    let side = base / Math.sqrt(2);
    let height = Math.sqrt(Math.pow(side, 2) - (Math.pow(base, 2) / 4));
    let offsetY = (side / 2) - (height / 2) + 1;

    style.add({
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
    //triangle.add(attrs.style);

    return <div><div style={triangle.style()} /></div>
}

export function ArrowTail({ attrs, style }) {
    var color = attrs.color || "#444";
    var base = attrs.size || 30;

    let side = base / Math.sqrt(2);
    let height = Math.sqrt(Math.pow(side, 2) - (Math.pow(base, 2) / 4));
    let offsetY = (side / 2) - (height / 2) + 1;

    style.add({
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
    //tail.add(attrs.style);

    let trianglePath = "polygon(0 0, 100% 0, 100% 100%)";
    let triangle = Style.from({
        transform: "rotate(45deg)",
        position: "relative",
        width: `${side}px`,
        height: `${side}px`,
        backgroundColor: "#fff",
        left: `-${side / 2}px`,
        top: `${offsetY}px`,
        clipPath: trianglePath,
        WebkitClipPath: trianglePath,
        display: "none",
    });

    return (
        <div>
            <div style={tail.style()} />
            <div class="arrow" style={triangle.style()} />
        </div>
    )
}

export function Diamond({attrs, style}) {
    var size = attrs.size || 15;
    var color = attrs.color || "#444";
    style.add({
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        transform: "rotate(45deg)",
    })
    return <div />
}

export function DiamondCutout({ attrs, style }) {
    var color = attrs.color || "#444";
    var base = attrs.size || 28;

    let size = 25;

    style.add({
        width: `${base}px`,
        height: `${base}px`,
        borderRadius: "var(--corner-size)",
        backgroundColor: "white",
        overflow: "hidden",

    });

    let diamondPath = `polygon(0% 0%, 0% 100%, ${size}% 100%, 50% ${100-size}%, ${size}% 50%, 50% ${size}%, ${100-size}% 50%, ${size}% 100%, 100% 100%, 100% 0%)`;
    let diamond = Style.from({
        borderRadius: "var(--corner-size)",
        width: `${base}px`,
        height: `${base}px`,
        clipPath: diamondPath,
        WebkitClipPath: diamondPath,
        backgroundColor: color,
        transform: "scale(1.25)",

    });

    return (
        <div>
            <div style={diamond.style()} />
        </div>
    )
}
