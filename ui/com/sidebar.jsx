import * as atom from "./atom.js";

var m = h;

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
                    <atom.Textbox dark={true}>{pkg.Name}</atom.Textbox>                    
                </atom.Panel>
                {pkg.Declarations.map((decl) => {
                    switch (decl[0]) {
                    case "imports":
                        return <Imports data={decl[1]} />
                    case "constants":
                        return <Constants data={decl[1]} />
                    case "variables":
                        return <Constants />
                    case "function":
                        return <Function data={decl[1]} />
                    case "type":
                        return <Type data={decl[1]} />
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
    return (
        <atom.Panel>
            <atom.GripLabel>Type</atom.GripLabel>
            <atom.Fieldbox type={typ.Type}>{typ.Name}</atom.Fieldbox>
            <atom.Stack class="pl-1 mt-2">
                {typ.Fields.map((field) =>
                    <atom.Grippable><atom.Fieldbox dark={true} type={field[1]}>{field[0]}</atom.Fieldbox></atom.Grippable>
                )}
            </atom.Stack>
            <atom.Stack class="pl-1 mt-2">
                {typ.Methods.map((method) =>
                    <Method data={method} type={typ} />
                )}
            </atom.Stack>
        </atom.Panel>
    )
}

function Function({attrs, vnode}) {
    var fn = attrs.data || {};
    var label = attrs.label || "Function";
    var container = attrs.container || atom.Panel;

    let name = (attrs.type) ? `${attrs.type.Name}-${fn.Name}`: fn.Name;

    const onclick = () => App.switchGrid(name);

    return h(container, {id: name, onclick: onclick}, (
        <div>
            <atom.GripLabel>{label}</atom.GripLabel>
            <FunctionBody fn={fn} />
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
                <atom.Fieldbox type="string">bazbox</atom.Fieldbox>
                <atom.Textbox dark={true}>"Hello world!"</atom.Textbox>
            </atom.Stack>
        </atom.Panel>
    )
}

function Imports({attrs}) {
    var imports = attrs.data || [];
    return (
        <atom.Panel>
            <atom.GripLabel>Imports</atom.GripLabel>
            {imports.map((imprt) => {
                return (
                    <atom.Stack axis="h">
                        <atom.Textbox>{imprt.Package}</atom.Textbox>
                        <atom.Textbox dark={true}>{imprt.Package}</atom.Textbox>
                    </atom.Stack>
                )
            })}
        </atom.Panel>
    )
}

function FunctionBody({attrs}) {
    var fn = attrs.fn || {};

    let args = (fn.In||[]).map((e) => e[0]).join(", ");
    let type = (fn.Out||[]).join(", ");
    return (
        <div>
            <atom.Fieldbox type={type}>{fn.Name}({args})</atom.Fieldbox>
            <atom.Stack class="text-xs pl-1 mt-2">
                {(fn.In||[]).map((arg) =>
                    <atom.Grippable><atom.Fieldbox dark={true} type={arg[1]}>{arg[0]}</atom.Fieldbox></atom.Grippable>
                )}
            </atom.Stack>
        </div>
    )
}

