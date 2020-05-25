import * as atom from "./atom.js";
import { App } from "../lib/app.js";

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

    return (
        <nav>
            <atom.Stack style={{direction:"ltr"}}>
                <atom.Panel>
                    <atom.GripLabel>Package</atom.GripLabel>
                    <atom.Textbox data-path="/Package/Name" dark={true}>{pkg.Name}</atom.Textbox>                    
                </atom.Panel>
                {pkg.Declarations.map((decl,idx) => {
                    switch (decl[0]) {
                    case "imports":
                        return <Imports data={decl[1]} idx={idx} />
                    case "constants":
                        return <Constants data={decl[1]} idx={idx} />
                    case "variables":
                        return <Constants idx={idx} />
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
    return (
        <atom.Panel>
            <atom.GripLabel>Type</atom.GripLabel>
            <atom.Fieldbox data-path={dataPath+"Name"} type={typ.Type} value={typ.Name}></atom.Fieldbox>
            <atom.Stack class="pl-1 mt-2">
                {typ.Fields.map((field,idx) =>
                    <atom.Grippable>
                        <atom.Fieldbox 
                            data-path={dataPath+`Fields/${idx}`}
                            dark={true} 
                            type={field[1]} 
                            value={field[0]}></atom.Fieldbox>
                    </atom.Grippable>
                )}
            </atom.Stack>
            <atom.Stack class="pl-1 mt-2">
                {typ.Methods.map((method) =>
                    <Method data={method} type={typ} basepath={dataPath+`Methods/${idx}/`} />
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

    return h(container, {id: name, onclick: onclick}, (
        <div>
            <atom.GripLabel>{label}</atom.GripLabel>
            <div>
                <atom.Fieldbox 
                    data-path={basePath+"Name"} 
                    type={type} 
                    value={signature}></atom.Fieldbox>
                <atom.Stack class="text-xs pl-1 mt-2">
                    {(fn.In||[]).map((arg, idx) =>
                        <atom.Grippable>
                            <atom.Fieldbox 
                                data-path={basePath+`In/${idx}`} 
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

function Constants() {
    return (
        <atom.Panel>
            <atom.GripLabel>Constants</atom.GripLabel>
            <atom.Stack axis="h">
                <atom.Fieldbox type="string" value="bazbox"></atom.Fieldbox>
                <atom.Textbox dark={true}>"Hello world!"</atom.Textbox>
            </atom.Stack>
        </atom.Panel>
    )
}

function Imports({attrs}) {
    var imports = attrs.data || [];
    var idx = attrs.idx || 0;
    let dataPath = `/Package/Declarations/${idx}/1/`
    return (
        <atom.Panel>
            <atom.GripLabel>Imports</atom.GripLabel>
            {imports.map((imprt, idx) => {
                return (
                    <atom.Stack axis="h">
                        <atom.Textbox data-path={dataPath+idx}>{imprt.Package}</atom.Textbox>
                        <atom.Textbox dark={true}>{imprt.Package}</atom.Textbox>
                    </atom.Stack>
                )
            })}
        </atom.Panel>
    )
}

