import * as shapes from "./shapes.js";
import { Style } from "../lib/style.js";

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

export function Trashable({attrs, children}) {
    var onclick = attrs.onclick || undefined;

    return (
        <Stack axis="h">
            <div class="flex-grow">
                {children}
            </div>
            <div class="ml-2 mr-1 text-xs" onclick={onclick}><i class="fas fa-trash-alt"></i></div>
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

export function Textbox({ attrs, style, hooks, vnode }) { 
    hooks.oncreate = () => {
        vnode.dom.querySelector("input").addEventListener("keydown", (e) => {
            console.log("keydown");
            if (e.keyCode === 8 /* backspace */ && e.target.value === "" && vnode.attrs.ondelete) {
                vnode.attrs.ondelete(e);
            }
        })
    };

    var readonly = attrs.readonly || false;
    var dark = attrs.dark || false;
    var value = attrs.value || "";
    var onchange_ = attrs.onchange || undefined;

    style.add({
        borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderTop: "var(--pixel-size) solid #42494d",
        borderLeft: "var(--pixel-size) solid #42494d",
        flexGrow: "1",
        boxShadow: "inset 2px 2px 3px #333",
    });
    style.add("dark", () => dark);
    style.add("light", () => !dark);

    let inner = Style.from({
        border: "1px solid black",
        padding: "4px",
        paddingLeft: "8px",
        color: "white",
        overflow: "hidden",
        height: "100%",
        backgroundColor: "transparent",
        width: "100%",
    });
    inner.add({pointerEvents: "none"}, () => readonly);

    const onchange = (e) => {
        if (onchange_) {
            onchange_(e, e.target.value);
        }
    }

    return (
        <div>
            <input type="text" 
                readonly={readonly}
                onchange={onchange}
                value={value}
                style={inner.style()} />
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


export function Fieldbox({ attrs, style, hooks, vnode }) {
    hooks.oncreate = () => {
        vnode.dom.querySelector("input").addEventListener("keydown", (e) => {
            console.log("keydown");
            if (e.keyCode === 8 /* backspace */ && e.target.value === "" && vnode.attrs.ondelete) {
                vnode.attrs.ondelete(e);
            }
        })
    };

    var value = attrs.value || "";
    var type = attrs.type || "";
    var onchange_ = attrs.onchange || undefined;
    var ondelete = attrs.ondelete || undefined;

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

    let valueStyle = Style.from({
        backgroundColor: "transparent",
        width: "100%",
    })

    let typeStyle = Style.from({
        color: "lightgray",
        backgroundColor: "transparent",
        textAlign: "right",
        width: "100px",
    });

    let inner = Style.from({
        border: "1px solid black",
        padding: "4px",
        paddingLeft: "8px",
        color: "white",
        overflow: "hidden",
    });

    const onchanger = (name) => (e) => {
        console.log("change")
        if (onchange_) {
            onchange_(e, e.target.value, name);
        }
    };

    return (
        <div>
            <div class="flex flex-row items-center" style={inner.style()}>
                <input type="text"
                    onchange={onchanger("value")}
                    value={value}
                    style={valueStyle.style()} 
                    class="flex-grow" />
                <span class="text-right text-xs ml-2">
                    <input list="types" 
                        onchange={onchanger("type")} 
                        type="text" 
                        class="flex-auto" 
                        style={typeStyle.style()} 
                        value={type} />
                </span>
            </div>
            <datalist id="types">
                <option value="struct" />
                <option value="bool" />
                <option value="string" />
                <option value="int" />
                <option value="float" />
                <option value="map" />
                <option value="[]" />
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
        borderLeft: "1px solid black",
    });
    return (
        <div data-target=".Sidebar"></div>
    )
}


export function Expander({attrs, children}) {
    var expanded = attrs.expanded || false;
    var onclick = attrs.onclick || undefined;

    return (
        <div class="flex select-none h-4">
            <div onclick={onclick} class="-mt-px w-4 text-center">
                <Icon class="mr-2" fa={`fas fa-caret-${(expanded) ? 'down' : 'right'}`} />
            </div>
            {children}
        </div>
    )
}

export function Nested({attrs, style, state, children}) {
    var label = attrs.label || "";
    var spacing = attrs.spacing || 1;
    var actions = attrs.actions || [];

    let expanded = state.expanded || false;

    style.add("flex flex-col");

    const onToggleExpander = () => {
        state.expanded = !state.expanded;
    }

    return (
        <div>
            <Expander expanded={expanded} onclick={onToggleExpander}>
                <Label onclick={onToggleExpander} class="label flex-grow mt-px">{label}</Label>
                {actions.map((action) => <Icon class="mr-1" fa={`fas fa-xs ${action[0]}`} onclick={action[1]} />)}
            </Expander>
            {expanded && children.map((el) => <div class={`my-${spacing} ml-4`}>{el}</div>)}
        </div>
    )
}

export function Icon({attrs, style}) {
    var onclick = attrs.onclick || undefined;
    var ondblclick = attrs.ondblclick || undefined;
    var fa = attrs.fa || "";

    return (
        <div onclick={onclick} ondblclick={ondblclick}>
            <i class={fa}></i>
        </div>
    )
}