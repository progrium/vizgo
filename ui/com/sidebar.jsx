import * as atom from "./atom.js";
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
                    <atom.Textbox oninput={packageInput} dark={true}>{pkg.Name}</atom.Textbox>                    
                </atom.Panel>
                <atom.Stack>
                {pkg.Declarations.map((decl,idx) => {
                    switch (decl.Kind) {
                    case "imports":
                        return <Imports key={idx} data={decl.Imports} idx={idx} />
                    case "constants":
                        return <Constants key={idx} data={decl.Constants} idx={idx} />
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

function AddButton({attrs, style}) {
    style.add("rounded-md", {
        borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderTop: "1px solid #42494d",
        borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderLeft: "var(--pixel-size) solid #42494d",
    })
    let btnStyle = style.constructor.from("p-2 pt-0 pb-0 rounded-md", {
        borderTop: "2px solid var(--sidebar-outline-color)",
        borderBottom: "2px solid var(--background-color)",
        borderLeft: "2px solid var(--sidebar-outline-color)",
        borderRight: "2px solid var(--background-color)",
    })
    return (
        <span><button {...btnStyle.attrs()}><i class="fas fa-plus"></i></button></span>
    )
}

function Type({attrs}) {
    var typ = attrs.data || {};
    var idx = attrs.idx || 0;

    let dataPath = `/Package/Declarations/${idx}/Type`;

    const ontrash = (e) => {
        setTimeout(() => {
            Session.unset(`/Package/Declarations/${idx}`);
        }, 20);
    }

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

    return (
        <atom.Panel>
            <atom.Trashable onclick={ontrash}>
                <atom.GripLabel>Type</atom.GripLabel>
            </atom.Trashable>
            <atom.Fieldbox oninput={typeInput} type={typ.Type} value={typ.Name}></atom.Fieldbox>
            <atom.Stack class="pl-1 mt-2">
                {typ.Fields.map((field,idx) =>
                    <atom.Grippable>
                        <atom.Fieldbox 
                            oninput={makeFieldInput(idx)}
                            dark={true} 
                            type={field[1]} 
                            value={field[0]}></atom.Fieldbox>
                    </atom.Grippable>
                )}
            </atom.Stack>
            <atom.Stack class="pl-1 mt-2">
                {typ.Methods.map((method,idx) =>
                    <Method data={method} type={typ} basepath={`${dataPath}/Methods/${idx}`} />
                )}
            </atom.Stack>
        </atom.Panel>
    )
}

function Function({attrs, style}) {
    var fn = attrs.data || {};
    var label = attrs.label || "Function";
    var container = attrs.container || atom.Panel;
    var idx = attrs.idx || 0;
    var basePath = attrs.basepath || `/Package/Declarations/${idx}/Function`;
    var fnPath = basePath;

    let name = (attrs.type) ? `${attrs.type.Name}-${fn.Name}`: fn.Name;
    let args = (fn.In||[]).map((e) => e[0]).join(", ");
    let type = (fn.Out||[]).join(", ");
    let signature = `${fn.Name}(${args})`;

    style.add("selected", () => fnPath === App.selected())

    const ontrash = (e) => {
        // TODO: support methods
        Session.unset(`/Package/Declarations/${idx}`);
    }

    const onclick = () => {
        if (fnPath !== App.selected()) {
            App.select(fnPath, name)
        }
    };

    const fnInput = (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Session.set(`${basePath}/Name`, v.split("(")[0]);
            break;
        case "type":
            Session.set(`${basePath}/Out`, v.split(","));
            break;
        }
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

    return h(container, {id: name, onclick: onclick}, (
        <div>
            <atom.Trashable onclick={ontrash}>
                <atom.GripLabel>{label}</atom.GripLabel>
            </atom.Trashable>
            <div>
                <atom.Fieldbox 
                    oninput={fnInput} 
                    type={type} 
                    value={signature}></atom.Fieldbox>
                <atom.Stack class="text-xs pl-1 mt-2">
                    {(fn.In||[]).map((arg, idx) =>
                        <atom.Grippable>
                            <atom.Fieldbox 
                                oninput={makeArgInput(idx)}
                                dark={true} 
                                type={arg[1]} 
                                value={arg[0]}></atom.Fieldbox>
                        </atom.Grippable>
                    )}
                </atom.Stack>
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
    var idx = attrs.idx || 0;
    let dataPath = `/Package/Declarations/${idx}/Variables`


    const ontrash = (e) => {
        setTimeout(() => {
            Session.unset(`/Package/Declarations/${idx}`);
        }, 20);
    }

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

    return (
        <atom.Panel>
            <atom.Trashable onclick={ontrash}>
                <atom.GripLabel>Variables</atom.GripLabel>    
            </atom.Trashable>
            {(vars||[]).map((v, idx) =>
                <atom.Stack axis="h">
                    <atom.Fieldbox 
                        oninput={makeVarInput(idx)} 
                        type={v.Type} 
                        value={v.Name}></atom.Fieldbox>
                    <atom.Textbox 
                        oninput={makeValInput(idx)} 
                        dark={true}>
                            {v.Value}
                    </atom.Textbox>
                </atom.Stack>
            )}
        </atom.Panel>
    )
}

function Constants({attrs}) {
    var consts = attrs.data || [];
    var idx = attrs.idx || 0;
    let dataPath = `/Package/Declarations/${idx}/Constants`

    const ontrash = (e) => {
        Session.unset(`/Package/Declarations/${idx}`);
    }

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

    return (
        <atom.Panel>
            <atom.Trashable onclick={ontrash}>
                <atom.GripLabel>Constants</atom.GripLabel>    
            </atom.Trashable>
            {(consts||[]).map((cnst, idx) =>
                <atom.Stack axis="h">
                    <atom.Fieldbox 
                        oninput={makeVarInput(idx)} 
                        type={cnst.Type} 
                        value={cnst.Name}></atom.Fieldbox>
                    <atom.Textbox 
                        oninput={makeValInput(idx)} 
                        dark={true}>
                            {cnst.Value}
                    </atom.Textbox>
                </atom.Stack>
            )}
        </atom.Panel>
    )
}

function Imports({attrs}) {
    var imports = attrs.data || [];
    var idx = attrs.idx || 0;
    let dataPath = `/Package/Declarations/${idx}/Imports`

    const ontrash = (e) => {
        Session.unset(`/Package/Declarations/${idx}`);
    }

    const makeImportInput = (idx) => (e,v) => {
        Session.set(`${dataPath}/${idx}/Package`, v);
    };

    return (
        <atom.Panel>
            <atom.Trashable onclick={ontrash}>
                <atom.GripLabel>Imports</atom.GripLabel>    
            </atom.Trashable>
            {imports.map((imprt, idx) => {
                return (
                    <atom.Stack axis="h">
                        <atom.Textbox oninput={makeImportInput(idx)}>{imprt.Package}</atom.Textbox>
                        <atom.Textbox readonly={true} dark={true}>{imprt.Package}</atom.Textbox>
                    </atom.Stack>
                )
            })}
        </atom.Panel>
    )
}

