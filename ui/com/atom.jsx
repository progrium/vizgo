import * as shapes from "./shapes.js";
import { Style } from "../lib/style.js";
import { stripInput } from "../lib/misc.js"

export function Stack({attrs,style,children}) {
    var axis = attrs.axis || "v";

    style.add("flex");
    style.add("flex-row", () => axis == "h");
    style.add("flex-col", () => axis == "v");

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
    style.add("flex items-end mb-1");
    return (
        <div>
            <Label class="pr-2">{children}</Label>
            <shapes.Dots rows={3} class="mb-1" />
        </div>
    )
}

export function Subpanel({style,children}) {
    style.add({
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
    style.add({
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
    style.add("mr-1");
    return <shapes.Dots cols={2} />
}


export function Label({attrs, style, children}) {
    style.add({
        marginLeft: "2px",
        fontSize: "small",
        filter: "drop-shadow(1px 1px 0.5px #00000066)",
    });
    return <div>{children}</div>
}

export function Textbox({ attrs, style, children, state, vnode }) {
    var readonly = attrs.readonly || false;
    var dark = attrs.dark || false;
    var oninput_ = attrs.oninput || undefined;

    if (!state.editmode || readonly) {
        vnode.state.editvalue = children;
    }

    let value = state.editvalue || "";

    style.add({
        borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderTop: "var(--pixel-size) solid #42494d",
        borderLeft: "var(--pixel-size) solid #42494d",
        flexGrow: "1",
        boxShadow: "inset 2px 2px 3px #333",
        height: "36px", // use a proper value here
    });
    style.add("dark", () => dark);
    style.add("light", () => !dark);

    let inner = Style.from({
        border: "1px solid black",
        padding: "4px",
        paddingLeft: "8px",
        color: "white",
        overflow: "hidden",
        height: "36px", // use a proper value here
    });

    const oninput = (e) => {
        vnode.state.editvalue = stripInput(e.target.innerHTML);
        if (oninput_) {
            oninput_(e, vnode.state.editvalue);
        }
        
    }

    const onfocus = () => {
        vnode.state.editmode = true;
    }

    const onblur = () => {
        vnode.state.editmode = false;
    }

    return (
        <div>
            <div contenteditable={!readonly} oninput={oninput} onfocus={onfocus} onblur={onblur} style={inner.style()}>
                {h.trust(value)}
            </div>
        </div>
    )
}

export function BlockTextbox({style, children}) {
    style.add({
        marginRight: "4px",
        marginLeft: "2px",
        borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderTop: "var(--pixel-size) solid #42494d",
        borderLeft: "var(--pixel-size) solid #42494d",
        flexGrow: "1",
        boxShadow: "inset 2px 2px 3px #333",
        height: "36px", // use a proper value here
    });
    style.add("light");

    let inner = Style.from({
        paddingTop: "1px",
        paddingBottom: "1px",
        paddingLeft: "4px",
        border: "1px solid black",
        padding: "4px",
        paddingLeft: "8px",
        color: "white",
        overflow: "hidden",
        height: "36px", // use a proper value here
    });

    return (
        <div>
            <div style={inner.style()}>
                {children}
            </div>
        </div>
    )
}


export function Fieldbox({ attrs, style, state, vnode }) {
    var value = attrs.value || "";
    var type = attrs.type || "";
    var oninput_ = attrs.oninput || undefined;

    if (!state.editmode) {
        vnode.state.editvalue = value;
        vnode.state.edittype = type;
    }

    let editvalue = state.editvalue || value;
    let edittype = state.edittype || type;

    style.add({
        borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderTop: "var(--pixel-size) solid #42494d",
        borderLeft: "var(--pixel-size) solid #42494d",
        flexGrow: "1",
        boxShadow: "inset 2px 2px 3px #333",
    });
    style.add("dark", () => attrs.dark);
    style.add("light", () => !attrs.dark);

    let typeStyle = Style.from({
        color: "lightgray",
        backgroundColor: "transparent",
        textAlign: "right",
        width: "80px",
    });

    let inner = Style.from({
        border: "1px solid black",
        padding: "4px",
        paddingLeft: "8px",
        color: "white",
        overflow: "hidden",
    });

    const onValInput = (e) => {
        vnode.state.editvalue = stripInput(e.target.innerHTML);
        if (oninput_) {
            oninput_(e, vnode.state.editvalue, "value");
        }
    }

    const onTypInput = (e) => {
        vnode.state.edittype = stripInput(e.target.value);
        if (oninput_) {
            oninput_(e, vnode.state.edittype, "type");
        }
    }

    const onfocus = () => {
        vnode.state.editmode = true;
    }

    const onblur = () => {
        vnode.state.editmode = false;
    }

    return (
        <div>
            <div class="flex flex-row items-center" style={inner.style()}>
                <span contenteditable 
                    oninput={onValInput} 
                    onfocus={onfocus} 
                    onblur={onblur} 
                    class="flex-grow">{h.trust(editvalue)}</span>
                <span class="text-right text-xs ml-2">
                    <input list="types" 
                        oninput={onTypInput} 
                        onfocus={onfocus} 
                        onblur={onblur} 
                        type="text" 
                        class="flex-auto" 
                        style={typeStyle.style()} 
                        value={edittype} />
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
    style.add({
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
