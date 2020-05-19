import * as shapes from "./shapes.js";
import { Style } from "./style.js";

var m = h;

export function Stack({attrs,style,children}) {
    var axis = attrs.axis || "v";

    style.addClass("flex");
    style.addClass("flex-row", () => axis == "h");
    style.addClass("flex-col", () => axis == "v");

    return (
        <div>{children}</div>
    )
}

export function Grippable({children}) {
    return (
        <Stack axis="h">
            <Grip class="mt-1 mb-1" />
            <div class="flex-grow">
                {children}
            </div>
        </Stack>
    )
}

export function GripLabel({style, children}) {
    style.addClass("flex items-end mb-1");
    return (
        <div>
            <Label class="pr-2">{children}</Label>
            <shapes.Dots rows={3} class="mb-1" />
        </div>
    )
}

export function Subpanel({style,children}) {
    style.setStyle({
        paddingTop: "8px",
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingBottom: "8px",
        borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderTop: "var(--pixel-size) solid #42494d",
        borderLeft: "var(--pixel-size) solid #42494d",
        backgroundColor: "transparent"
    })
    return (
        <div>{children}</div>
    )
}

export function Panel({style,children}) {
    style.setStyle({
        padding: "8px",
        paddingTop: "4px",
        borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderBottom: "2px solid black",
        borderRight: "var(--pixel-size) solid #42494d",
        backgroundColor: "transparent"
    })
    return (
        <div>{children}</div>
    )
}


export function Grip({attrs}) {
    let style = new Style(Grip);
    style.addClass(attrs.class);
    style.setStyle(attrs.style);
    style.addClass("mr-1");
    return <shapes.Dots cols={2} {...style.attrs()} />
}


export function Label({attrs, children}) {
    let style = new Style(Label, {
        marginLeft: "2px",
        fontSize: "small",
    });
    style.addClass(attrs.class);
    style.setStyle(attrs.style);
    return h("div", style.attrs(), children)
}

export function Textbox({ attrs, children }) {
    let style = new Style(Textbox);
    style.addClass("input-outer");
    style.addClass("dark", () => attrs.dark);
    style.addClass("light", () => !attrs.dark);

    return (
        <div class={style.class()} style={style.style()}>
            <div style={inputInner.style()}>
                {children}
            </div>
        </div>
    )
}

export function BlockTextbox({children}) {
    let outer = new Style(BlockTextbox, {
        marginRight: "4px",
        marginLeft: "2px",
    }, inputOuter)
    outer.addClass("light");

    let inner = Style.from({
        paddingTop: "1px",
        paddingBottom: "1px",
        paddingLeft: "4px"
    });
    inner.extendStyle(inputInner);

    return (
        <div class={outer.class()} style={outer.style()}>
            <div style={inner.style()}>
                {children}
            </div>
        </div>
    )
}


export function Fieldbox({ attrs, style, children }) {
    style.addClass("input-outer");
    style.addClass("dark", () => attrs.dark);
    style.addClass("light", () => !attrs.dark);

    let type = Style.from({
        color: "lightgray",
    });

    return (
        <div>
            <div class="input-inner flex flex-row items-center">
                <span class="flex-grow">{children}</span>
                <span class="text-right text-xs" style={type}>{attrs.type}</span>
            </div>
        </div>
    )
}


let inputOuter = Style.defineClass("input-outer", {
    borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
    borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
    borderTop: "var(--pixel-size) solid #42494d",
    borderLeft: "var(--pixel-size) solid #42494d",
    flexGrow: "1",
    boxShadow: "inset 2px 2px 3px #333",
    //backgroundColor: "#7d898f"
})

let inputInner = Style.defineClass("input-inner", {
    border: "1px solid black",
    padding: "4px",
    paddingLeft: "8px",
    color: "white",
    overflow: "hidden",
})

Style.defineClass("dark", {
    backgroundColor: "#475054 !important",
})

Style.defineClass("light", {
    backgroundColor: "#7d898f !important",
})