import { Style } from "./style.js";

export const VerticalDots = {
    view: ({ attrs }) => {
        let color = attrs.color || "#444";

        let style = new Style('VerticalDots', {
            backgroundImage: `radial-gradient(${color} 50%, transparent 50%)`,
            backgroundColor: "transparent",
            backgroundRepeat: "repeat",
            backgroundSize: "4px 4px",
            width: "8px",
        });
        style.addClass(attrs.class);
        style.setStyle(attrs.style);

        return m("div", style.attrs())
    }
}

export const Ring = {
    view: ({ attrs }) => {
        let color = attrs.color || "#444";
        let fill = attrs.fill || "rgba(0,0,0,0)";
        let size = attrs.size || 28;

        let style = new Style('Ring', {
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color, //"#475054"
            borderRadius: "50%",
            background: `radial-gradient(circle at center, ${fill} 35%, ${color} 0)`,
        });
        style.addClass(attrs.class);
        style.setStyle(attrs.style);

        return m("div", style.attrs())
    }
}

export const ArrowHead = {
    view: ({ attrs }) => {
        let color = attrs.color || "#444";
        let base = attrs.size || 28;

        let side = base / Math.sqrt(2);
        let height = Math.sqrt(Math.pow(side, 2) - (Math.pow(base, 2) / 4));
        let offsetY = (side / 2) - (height / 2) + 1;

        let style = new Style('ArrowHead', {
            width: `${height}px`,
            height: `${base}px`,
        });
        style.addClass(attrs.class);

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
        });
        triangle.setStyle(attrs.style);

        return m("div", style.attrs(), m("div", { style: triangle.style() }))
    }
}

export const ArrowTail = {
    view: ({ attrs }) => {
        let color = attrs.color || "#444";
        let base = attrs.size || 30;

        let side = base / Math.sqrt(2);
        let height = Math.sqrt(Math.pow(side, 2) - (Math.pow(base, 2) / 4));
        let offsetY = (side / 2) - (height / 2) + 1;

        let style = new Style('ArrowTail', {
            width: `${height}px`,
            height: `${base}px`,
        })
        style.addClass(attrs.class);

        let tailPath = "polygon(0 0, 100% 0, 100% 100%, 0 100%, 90% 50%)";
        let tail = Style.from({
            position: "absolute",
            width: `${height}px`,
            height: `${base}px`,
            clipPath: tailPath,
            WebkitClipPath: tailPath,
            backgroundColor: color,
        })
        tail.setStyle(attrs.style);

        let trianglePath = "polygon(0 0, 100% 0, 100% 100%)";
        let triangle = Style.from({
            transform: "rotate(45deg)",
            position: "relative",
            width: `${side}px`,
            height: `${side}px`,
            backgroundColor: "transparent",
            left: `-${side / 2}px`,
            top: `${offsetY}px`,
            clipPath: trianglePath,
            WebkitClipPath: trianglePath,
            opacity: "0"
        });

        return m("div", style.attrs(), [
            m("div", { style: tail.style() }),
            m("div", { style: triangle.style() }),
        ])
    }
}