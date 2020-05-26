import * as shapes from "./shapes.js";
import { Style } from "../lib/style.js";
import { Remote } from "../lib/remote.js";

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
        paddingBottom: "20px",
        borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderBottom: "1px solid black",
        borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderRight: "var(--pixel-size) solid #42494d",
        backgroundColor: "transparent"
    })
    return (
        <div>{children}</div>
    )
}


export function Grip({style,attrs}) {
    style.addClass("mr-1");
    return <shapes.Dots cols={2} />
}


export function Label({attrs, style, children}) {
    style.setStyle({
        marginLeft: "2px",
        fontSize: "small",
        filter: "drop-shadow(1px 1px 0.5px #00000066)",
    });
    return <div>{children}</div>
}

export function Textbox({ attrs, style, children, state, vnode }) {
    var editmode = state.editmode || false;
    var value = state.value || "";

    if (!editmode) {
        state.value = children;
    }

    style.addClass("input-outer");
    style.addClass("dark", () => attrs.dark);
    style.addClass("light", () => !attrs.dark);

    const oninput = (e) => {
        vnode.state.value = e.target.innerHTML;
        Remote.set(attrs["data-path"], e.target.innerHTML);
    }

    const onfocus = () => {
        vnode.state.editmode = true;
        console.log("focus");
    }

    const onblur = () => {
        vnode.state.editmode = false;
        console.log("blur");
    }

    return (
        <div>
            <div contenteditable oninput={oninput} onfocus={onfocus} onblur={onblur} style={inputInner.style()}>
                {h.trust(value)}
            </div>
        </div>
    )
}

export function BlockTextbox({style, children}) {
    style.setStyle({
        marginRight: "4px",
        marginLeft: "2px",
    });
    style.extendStyle(inputOuter);
    style.addClass("light");

    let inner = Style.from({
        paddingTop: "1px",
        paddingBottom: "1px",
        paddingLeft: "4px"
    });
    inner.extendStyle(inputInner);

    return (
        <div>
            <div style={inner.style()}>
                {children}
            </div>
        </div>
    )
}


export function Fieldbox({ attrs, style, children }) {
    var value = attrs.value || "";

    style.addClass("input-outer");
    style.addClass("dark", () => attrs.dark);
    style.addClass("light", () => !attrs.dark);

    let type = Style.from({
        color: "lightgray",
        backgroundColor: "transparent",
        textAlign: "right",
        width: "80px",
    });
    return (
        <div>
            <div class="input-inner flex flex-row items-center">
                <span contenteditable class="flex-grow">{h.trust(value)}</span>
                <span class="text-right text-xs ml-2">
                    <input list="types" type="text" class="flex-auto" style={type.style()} value={attrs.type} />
                </span>
            </div>
            <datalist id="types">
                <option value="struct" />
                <option value="bool" />
                <option value="string" />
                <option value="int" />
                <option value="float" />
                <option value="map[string]string" />
                <option value="[]blah" />
            </datalist>
        </div>
    )
}

export function Divider({style}) {
    style.setStyle({
        content: '""',
        flex: "0 0 auto",
        position: "relative",
        boxSizing: "border-box",
        width: "2.5px",
        backgroundColor: "grey",
        height: "100%",
        cursor: "ew-resize",
        userSelect: "none",
    });
    return (
        <div data-target=".Sidebar"></div>
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
    backgroundColor: "#585f62 !important", //475054
})

Style.defineClass("light", {
    backgroundColor: "#7d898f !important",
})