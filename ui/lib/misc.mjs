import * as inline from "/lib/inline.mjs";

export const Grip = {
    view: function(vnode) {
        let style = inline.style({
            class: "grip",

            backgroundColor: "var(--sidebar-color)",
            backgroundImage: "radial-gradient(#444 50%, transparent 50%)",
            backgroundSize: "4px 4px",
            backgroundRepeat: "repeat",
            backgroundPosition: "-0px",
            width: "8px",
            flex: "0 0 auto",
            marginRight: "4px"
        });
        return m("div", style({}))
    }
}

export const Textbox = {
    style: inline.style({
        outer: {
            class: "input",

            borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
            borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
            borderTop: "var(--pixel-size) solid #42494d",
            borderLeft: "var(--pixel-size) solid #42494d",
            flexGrow: "1",
            backgroundColor: "#7d898f",
            boxShadow: "inset 2px 2px 3px #333"
        },
        inner: {
            border: "1px solid black",
            padding: "4px",
            paddingLeft: "8px",
            color: "white",
            overflow: "hidden"
        }
    }),
    view: function(vnode) {
        let style = this.style("outer");
        if (vnode.attrs.dark === true) {
            style["style"].backgroundColor = "#475054";
        }
        return m("div", style, 
                m("div", this.style("inner"), vnode.children));
    }
}