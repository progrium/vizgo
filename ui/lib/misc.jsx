import { Style } from "/lib/style.mjs";

export function Grip() {
    let style = new Style(Grip);
    style.backgroundColor = "var(--sidebar-color)";
    style.backgroundImage = "radial-gradient(#444 50%, transparent 50%)";
    style.backgroundSize = "4px 4px";
    style.backgroundRepeat = "repeat";
    style.backgroundPosition = "-0px";
    style.width = "8px";
    style.flex = "0 0 auto";
    style.marginRight = "4px";
    return {
        view: () => <div class={style.class()} style={style} />
    }
}


export class Textbox {
    static outer() {
        let outer = new Style(Textbox);
        outer.add("input");
        outer.borderBottom = "var(--pixel-size) solid var(--sidebar-outline-color)";
        outer.borderRight = "var(--pixel-size) solid var(--sidebar-outline-color)";
        outer.borderTop = "var(--pixel-size) solid #42494d";
        outer.borderLeft = "var(--pixel-size) solid #42494d";
        outer.flexGrow = "1";
        outer.backgroundColor = "#7d898f";
        outer.boxShadow = "inset 2px 2px 3px #333";
        return outer;
    }

    static inner() {
        let inner = new Style();
        inner.border = "1px solid black";
        inner.padding = "4px";
        inner.paddingLeft = "8px";
        inner.color = "white";
        inner.overflow = "hidden";
        return inner;
    }

    view(node) {
        let { attrs, children } = node;
        let style = Style.from(Textbox.outer());
        if (attrs.dark === true) {
            style.backgroundColor = "#475054";
        }
        return <div class={style.class()} style={style}>
            <div style={Textbox.inner()}>
                {children}
            </div>
        </div>
    }
}
