import * as atom from "./atom.js";
import * as conn from "./conn.js";
import { App } from "../lib/app.js";
import { Session } from "../lib/session.js";

export function Sidebar({attrs, style}) {
    var pkg = attrs.package || {};

    style.add({
        width: "var(--sidebar-width)",
        backgroundColor: "var(--sidebar-color)",
        overflowY: "auto",
        userSelect: "none",
        height: "100%",
        direction: "rtl",
        zIndex: "1",
        filter: "drop-shadow(2px 0px 5px #111)",
    })

    let footer = style.constructor.from({
        borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
    }, "p-2")

    const packageInput = (e, v) => {
        Session.set("/Package/Name", v);
    }
    
    return (
        <nav>
            <atom.Stack style={{direction: "ltr"}}>
                <atom.Panel>
                    <atom.GripLabel>Package</atom.GripLabel>
                    <atom.Textbox onchange={packageInput} value={pkg.Name} />
                    <Imports data={pkg.Imports} />
                </atom.Panel>
                <atom.Stack>
                {pkg.Declarations.map((decl,idx) => {
                    switch (decl.Kind) {
                    case "constants":
                        return <Variables name="Constants" key={idx} data={decl.Constants} idx={idx} />
                    case "variables":
                        return <Variables key={idx} data={decl.Variables} idx={idx} />
                    case "function":
                        return <Function key={idx} data={decl.Function} idx={idx} />
                    case "type":
                        return <Type key={idx} data={decl.Type} idx={idx} />
                    default:
                        return <atom.Panel key={idx}><textarea>{JSON.stringify(decl)}</textarea></atom.Panel>
                    }
                })}
                </atom.Stack>
                <atom.Stack style={footer} axis="h"><AddButton id="add-decl" /></atom.Stack>
            </atom.Stack>
        </nav>
    )
}

function AddButton({style}) {
    style.add("rounded", {
        borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderTop: "1px solid #42494d",
        borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderLeft: "var(--pixel-size) solid #42494d",
    })
    let btnStyle = style.constructor.from("p-2 pt-0 pb-0 rounded", {
        borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderBottom: "var(--pixel-size) solid black",
        borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderRight: "var(--pixel-size) solid black",
    })
    return (
        <span><button {...btnStyle.attrs()}><i class="fas fa-plus"></i></button></span>
    )
}

function Type({attrs}) {
    var typ = attrs.data || {};
    var idx = attrs.idx || 0;

    let dataPath = `/Package/Declarations/${idx}/Type`;
    let fieldActions = [
        ["fa-plus-circle", () => {
            Session.append(`${dataPath}/Fields`, {Name: "", Type: "interface{}"});
        }]
    ];
    let methodActions = [
        ["fa-plus-circle", () => {
            Session.append(`${dataPath}/Methods`, {Name: "", Type: ""});
        }]
    ];

    let actions = [
        ["fa-trash-alt", () => {
            setTimeout(() => {
                Session.unset(`/Package/Declarations/${idx}`);
            }, 20);
        }],
    ];

    const typeInput = (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Session.set(`${dataPath}/Name`, v);
            break;
        case "type":
            Session.set(`${dataPath}/Type`, v);
            break;
        }
    };

    const makeFieldInput = (idx) => (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Session.set(`${dataPath}/Fields/${idx}/0`, v);
            break;
        case "type":
            Session.set(`${dataPath}/Fields/${idx}/1`, v);
            break;
        }
    };

    const makeOnDelete = (idx) => (e) => {
        Session.unset(`${dataPath}/Fields/${idx}`);
    };


    return (
        <atom.Panel>
            <atom.Actionable actions={actions}>
                <atom.GripLabel>Type</atom.GripLabel>
            </atom.Actionable>
            <atom.Fieldbox onchange={typeInput} type={typ.Type} value={typ.Name}></atom.Fieldbox>
            <atom.Nested class="mt-2" spacing={2} label="Fields" actions={fieldActions}>
                <atom.Stack class="pl-1 mt-2">
                    {typ.Fields.map((field,idx) =>
                        <atom.Grippable>
                            <atom.Fieldbox 
                                onchange={makeFieldInput(idx)}
                                ondelete={makeOnDelete(idx)}
                                type={field[1]} 
                                value={field[0]}></atom.Fieldbox>
                        </atom.Grippable>
                    )}
                </atom.Stack>
            </atom.Nested>
            <atom.Nested class="mt-2" spacing={2} label="Methods" actions={methodActions}>
                <atom.Stack class="pl-1 mt-2">
                    {typ.Methods.map((method,idx) =>
                        <Method data={method} type={typ} basepath={`${dataPath}/Methods/${idx}`} />
                    )}
                </atom.Stack>
            </atom.Nested>
        </atom.Panel>
    )
}

function Function({attrs, style, hooks, vnode}) {
    var fn = attrs.data || {};
    var label = attrs.label || "Function";
    var container = attrs.container || atom.Panel;
    var idx = attrs.idx || 0;
    var basePath = attrs.basepath || `/Package/Declarations/${idx}/Function`;
    var fnPath = basePath;

    hooks.oncreate = () => {
        vnode.dom.addEventListener("edit", (e) => {
            vnode.dom.querySelector("input").select();
            h.redraw();
        });

        if (vnode.attrs.data.Name === "_") {
            vnode.dom.dispatchEvent(new Event("edit"));
        }
    };
    hooks.onupdate = () => {
        if (fnPath === App.selected()) {
            $("#entrypoint")[0].style['top'] = $(".selected").position()['top'] + "px";
            $("#entrypoint")[0].style['height'] = vnode.dom.offsetHeight + "px";
            conn.redrawAll();
        }
    };

    let name = (attrs.type) ? `${attrs.type.Name}-${fn.Name}`: fn.Name;
    let args = (fn.In||[]).map((e) => e[0]).join(", ");
    let type = (fn.Out||[]).join(", ");
    let signature = `${fn.Name}(${args})`;
    
    if (fn.Name == "_") {
        signature = fn.Name;
    }

    let argumentActions = [
        ["fa-plus-circle", () => {
            Session.append(`${basePath}/In`, {Name: "", Type: "interface{}"});
        }]
    ];

    style.add("selected", () => fnPath === App.selected())

    let actions = [
        ["fa-trash-alt", () => {
            setTimeout(() => {
                // TODO: support methods
                Session.unset("/Selected");
                Session.unset(`/Package/Declarations/${idx}`);
                conn.redrawAll();
            }, 20);
        }],
    ];

    const onclick = () => {
        if (fnPath !== App.selected()) {
            App.select(fnPath);
        }
    };

    const fnChange = (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Session.set(`${basePath}/Name`, v.split("(")[0]);
            break;
        case "type":
            Session.set(`${basePath}/Out`, v.split(","));
            break;
        }
        Session.select(basePath);
    };

    const makeArgInput = (idx) => (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Session.set(`${basePath}/In/${idx}/0`, v);
            break;
        case "type":
            Session.set(`${basePath}/In/${idx}/1`, v);
            break;
        }
    };

    const makeOnDelete = (idx) => (e) => {
        Session.unset(`${basePath}/In/${idx}`);
    };


    return h(container, {id: name, onclick: onclick}, (
        <div>
            <atom.Actionable actions={actions}>
                <atom.GripLabel>{label}</atom.GripLabel>
            </atom.Actionable>
            <div>
                <atom.Fieldbox 
                    onchange={fnChange} 
                    type={type} 
                    value={signature}></atom.Fieldbox>
                <atom.Nested class="mt-2" spacing={2} label="Arguments" actions={argumentActions}>
                    <atom.Stack class="text-xs pl-1 mt-2">
                        {(fn.In||[]).map((arg, idx) =>
                            <atom.Grippable>
                                <atom.Fieldbox 
                                    onchange={makeArgInput(idx)}
                                    ondelete={makeOnDelete(idx)}
                                    type={arg[1]} 
                                    value={arg[0]}></atom.Fieldbox>
                            </atom.Grippable>
                        )}
                    </atom.Stack>
                </atom.Nested>
            </div>
        </div>
    ));
}

function Method(vnode) {
    vnode.attrs.label = "Method";
    vnode.attrs.container = atom.Subpanel;
    return Function(vnode)
}

function Variables({attrs}) {
    var vars = attrs.data || [];
    var name = attrs.name || "Variables";
    var idx = attrs.idx || 0;

    let dataPath = `/Package/Declarations/${idx}/${name}`
    let actions = [
        ["fa-plus-circle", () => {
            Session.append(dataPath, {Name: "_", Value: ""});
        }],
        ["fa-trash-alt", () => {
            setTimeout(() => {
                Session.unset(`/Package/Declarations/${idx}`);
            }, 20);
        }],
    ];

    const makeVarInput = (idx) => (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Session.set(`${dataPath}/${idx}/Name`, v);
            break;
        case "type":
            Session.set(`${dataPath}/${idx}/Type`, v);
            break;
        }
    };

    const makeValInput = (idx) => (e,v) => {
        Session.set(`${dataPath}/${idx}/Value`, v);
    };

    const makeOnDelete = (idx) => (e) => {
        Session.unset(`${dataPath}/${idx}`);
    };

    return (
        <atom.Panel>
            <atom.Actionable actions={actions}>
                <atom.GripLabel>{name}</atom.GripLabel>    
            </atom.Actionable>
            {(vars||[]).map((v, idx) =>
                <atom.Stack axis="h">
                    <atom.Fieldbox 
                        ondelete={makeOnDelete(idx)}
                        onchange={makeVarInput(idx)} 
                        type={v.Type} 
                        class="w-full"
                        value={v.Name} />
                    <div class="m-1 flex-none">=</div>
                    <atom.Textbox 
                        onchange={makeValInput(idx)} 
                        dark={true}
                        noautofocus={true}
                        class="w-full text-xs"
                        value={v.Value} />
                </atom.Stack>
            )}
        </atom.Panel>
    )
}

function Imports({attrs}) {
    var imports = attrs.data || [];
    
    let dataPath = `/Package/Imports`
    let actions = [
        ["fa-plus-circle", () => {
            Session.append(dataPath, {Package: ""});
        }]
    ];

    const makeImportInput = (idx) => (e,v) => {
        Session.set(`${dataPath}/${idx}/Package`, v);    
    };

    const makeOnDelete = (idx) => (e) => {
        Session.unset(`${dataPath}/${idx}`);
    };

    return (
        <atom.Nested class="mt-2" spacing={2} label="Imports" actions={actions}>
            {imports.map((imprt, idx) => {
                return (
                    <atom.Stack key={idx} axis="h">
                        <atom.Textbox  
                            ondelete={makeOnDelete(idx)}
                            onchange={makeImportInput(idx)} 
                            value={imprt.Package} />
                    </atom.Stack>
                )
            })}
        </atom.Nested>               
    )
}

