import * as atom from "./atom.js";
import { App } from "../lib/app.js";
import { Remote } from "../lib/remote.js";

export function Sidebar({attrs, style}) {
    var pkg = attrs.package || {};

    style.setStyle({
        width: "var(--sidebar-width)",
        backgroundColor: "var(--sidebar-color)",
        outline: "var(--pixel-size) solid var(--outline-color)",
        overflowY: "auto",
        userSelect: "none",

        height: "100%",
        direction: "rtl",
        margin: "1px",
        zIndex: "1",
        filter: "drop-shadow(2px 0px 5px #111)",
    })

    const packageInput = (e, v) => {
        Remote.set("/Package/Name", v);
    }

    return (
        <nav>
            <atom.Stack style={{direction:"ltr"}}>
                <atom.Panel>
                    <atom.GripLabel>Package</atom.GripLabel>
                    <atom.Textbox oninput={packageInput} dark={true}>{pkg.Name}</atom.Textbox>                    
                </atom.Panel>
                {pkg.Declarations.map((decl,idx) => {
                    switch (decl[0]) {
                    case "imports":
                        return <Imports data={decl[1]} idx={idx} />
                    case "constants":
                        return <Constants data={decl[1]} idx={idx} />
                    case "variables":
                        return <Constants data={decl[1]} idx={idx} />
                    case "function":
                        return <Function data={decl[1]} idx={idx} />
                    case "type":
                        return <Type data={decl[1]} idx={idx} />
                    default:
                        return <atom.Panel><textarea>{JSON.stringify(decl)}</textarea></atom.Panel>
                    }
                })}
            </atom.Stack>
        </nav>
    )
}

function Type({attrs}) {
    var typ = attrs.data || {};
    var idx = attrs.idx || 0;

    let dataPath = `/Package/Declarations/${idx}/1/`;

    const typeInput = (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Remote.set(dataPath+"Name", v);
            break;
        case "type":
            Remote.set(dataPath+"Type", v);
            break;
        }
    };

    const makeFieldInput = (idx) => (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Remote.set(`${dataPath}/Fields/${idx}/0`, v);
            break;
        case "type":
            Remote.set(`${dataPath}/Fields/${idx}/1`, v);
            break;
        }
    };

    return (
        <atom.Panel>
            <atom.GripLabel>Type</atom.GripLabel>
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
                {typ.Methods.map((method) =>
                    <Method data={method} type={typ} basepath={`${dataPath}/Methods/${idx}/`} />
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
    var basePath = attrs.basepath || `/Package/Declarations/${idx}/1/`;
    

    let name = (attrs.type) ? `${attrs.type.Name}-${fn.Name}`: fn.Name;
    let args = (fn.In||[]).map((e) => e[0]).join(", ");
    let type = (fn.Out||[]).join(", ");
    let signature = `${fn.Name}(${args})`;

    style.addClass("selected", () => name === App.selected())

    const onclick = () => App.switchGrid(name);

    const fnInput = (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Remote.set(`${basePath}Name`, v);
            break;
        case "type":
            Remote.set(`${basePath}Out`, v.split(","));
            break;
        }
    };

    const makeArgInput = (idx) => (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Remote.set(`${basePath}In/${idx}/0`, v);
            break;
        case "type":
            Remote.set(`${basePath}In/${idx}/1`, v);
            break;
        }
    };

    return h(container, {id: name, onclick: onclick}, (
        <div>
            <atom.GripLabel>{label}</atom.GripLabel>
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

function Constants({attrs}) {
    var consts = attrs.data || [];
    var idx = attrs.idx || 0;
    let dataPath = `/Package/Declarations/${idx}/1/`


    const makeVarInput = (idx) => (e,v,subfield) => {
        switch (subfield) {
        case "value":
            Remote.set(`${dataPath}${idx}/Name`, v);
            break;
        case "type":
            Remote.set(`${dataPath}${idx}/Type`, v);
            break;
        }
    };

    const makeValInput = (idx) => (e,v) => {
        Remote.set(`${dataPath}${idx}/Value`, v);
    };

    return (
        <atom.Panel>
            <atom.GripLabel>Constants</atom.GripLabel>
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
    let dataPath = `/Package/Declarations/${idx}/1/`

    const makeImportInput = (idx) => (e,v) => {
        Remote.set(`${dataPath}${idx}/Package`, v);
    };

    return (
        <atom.Panel>
            <atom.GripLabel>Imports</atom.GripLabel>
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

