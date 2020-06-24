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

export function Actionable({attrs, children}) {
    var actions = attrs.actions || [];

    return (
        <Stack axis="h">
            <div class="flex-grow">
                {children}
            </div>
            <Stack axis="h" class="mr-1 text-xs">
                {actions.map((action) => <Icon class="ml-2" fa={`fas ${action[0]}`} onclick={action[1]} />)}
            </Stack>
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

export function Textbox({ attrs, style }) { 
    var readonly = attrs.readonly || false;
    var dark = attrs.dark || false;
    var value = attrs.value || "";
    var onchange_ = attrs.onchange || undefined;
    var ondelete = attrs.ondelete || undefined;
    var noautofocus = attrs.noautofocus || false;

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
        width: "100%",
    });

    const onchange = (e) => {
        if (onchange_) {
            onchange_(e, e.target.value);
        }
    }

    return (
        <div>
            <TextInput
                readonly={readonly}
                onchange={onchange}
                value={value}
                ondelete={ondelete}
                noautofocus={noautofocus}
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
    });
    style.add("light");

    let inner = Style.from({
        padding: "-3px 0px",
        paddingRight: "2px",
        border: "1px solid black",
        color: "white",
        overflow: "hidden",
        height: "26px",
    });

    return (
        <div>
            <div style={inner.style()}>
                {children}
            </div>
        </div>
    )
}


export function Fieldbox({ attrs, style }) {
    var value = attrs.value || "";
    var type = attrs.type || "";
    var readonly = attrs.readonly || false;
    var onchange_ = attrs.onchange || undefined;
    var ondelete = attrs.ondelete || undefined;
    var noautofocus = attrs.noautofocus || false;

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

    let inner = Style.from({
        border: "1px solid black",
        padding: "4px",
        paddingLeft: "8px",
        color: "white",
        overflow: "hidden",
        height: "34px",
    });

    let valueStyle = Style.from({
        backgroundColor: "transparent",
        position: "absolute",
        top: "0",
        left: "8px",
        right: "50px",
        bottom: "0",
        zIndex: "10",
    })

    let typeStyle = Style.from({
        color: "lightgray",
        backgroundColor: "transparent",
        textAlign: "right",
        position: "absolute",
        top: "0",
        left: "50%",
        right: "0",
        bottom: "0",
        zIndex: "0",
        fontSize: ".75rem",
    });

    const onchanger = (name) => (e) => {
        if (onchange_) {
            onchange_(e, e.target.value, name);
        }
    };

    return (
        <div>
            <div class="relative" style={inner.style()}>
                <TextInput
                    onchange={onchanger("value")}
                    ondelete={ondelete}
                    value={value}
                    readonly={readonly}
                    noautofocus={noautofocus}
                    style={valueStyle.style()} />
                <TextInput 
                    list="types" 
                    onchange={onchanger("type")} 
                    readonly={readonly}
                    noautofocus={true}
                    style={typeStyle.style()} 
                    value={type} />
            </div>
        </div>
    )
}

export function TextInput({attrs,style,hooks,vnode}) {
    var value = attrs.value || "";
    var list = attrs.list || undefined;
    var readonly = attrs.readonly || false;
    var onchange = attrs.onchange || undefined;
    var ondelete = attrs.ondelete || undefined;
    var noautofocus = attrs.noautofocus || false;

    hooks.oncreate = () => {
        vnode.dom.addEventListener("keydown", (e) => {
            if (e.keyCode === 8 /* backspace */ && e.target.value === "" && ondelete) {
                vnode.attrs.ondelete(e);
            }
        });

        vnode.dom.addEventListener("edit", (e) => {
            vnode.dom.select();
            h.redraw();
        });

        if (attrs.value == "" && !noautofocus) {
            vnode.dom.focus();
        }

        if (attrs.value === "_" && !noautofocus) {
            vnode.dom.dispatchEvent(new Event("edit"));
        }
    };

    style.add({backgroundColor: "transparent"});
    style.add({pointerEvents: "none"}, () => readonly);

    return (
        <input type="text"
            list={list}
            readonly={readonly}
            onchange={onchange}
            value={value} />
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

    const wrapAction = (cb) => {
        return (e) => {
            state.expanded = true;
            cb(e);
        }
    }

    return (
        <div>
            <Expander expanded={expanded} onclick={onToggleExpander}>
                <Label onclick={onToggleExpander} class="label flex-grow mt-px">{label}</Label>
                {actions.map((action) => <Icon class="mr-1" fa={`fas fa-xs ${action[0]}`} onclick={wrapAction(action[1])} />)}
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