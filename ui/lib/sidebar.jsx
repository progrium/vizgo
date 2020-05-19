import * as atom from "./atom.js";
import * as shapes from "./shapes.js";

import { Style } from "./style.js";
import { h } from "./h.js";

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
                    switch (decl.Type) {
                    case "imports":
                        return <Imports data={decl.Imports} />
                    case "constants":
                        return <Constants data={decl.Constants} />
                    case "variables":
                        return <Constants />
                    case "function":
                        return <Function data={decl.Function} />
                    case "type":
                        return <Type data={decl.Type} />
                    default:
                        return <atom.Panel><textarea>{JSON.stringify(decl)}</textarea></atom.Panel>
                    }
                })}
            </atom.Stack>
        </nav>
    )
}

function Type() {
    return (
        <atom.Panel>
            <atom.GripLabel>Type</atom.GripLabel>
            <atom.Fieldbox type="struct">serverFoo</atom.Fieldbox>
            <atom.Stack class="pl-1 mt-2">
                <atom.Grippable><atom.Fieldbox dark={true} type="string">Foobar</atom.Fieldbox></atom.Grippable>
                <atom.Grippable><atom.Fieldbox dark={true} type="bool">BooleanField</atom.Fieldbox></atom.Grippable>
                <atom.Grippable><atom.Fieldbox dark={true} type="int64">Number</atom.Fieldbox></atom.Grippable>
            </atom.Stack>
            <atom.Stack class="pl-1 mt-2">
                <atom.Subpanel>
                    <atom.GripLabel>Method</atom.GripLabel>
                    <FunctionBody />
                </atom.Subpanel>
                <atom.Subpanel>
                    <atom.GripLabel>Method</atom.GripLabel>
                    <FunctionBody />
                </atom.Subpanel>
            </atom.Stack>
        </atom.Panel>
    )
}

function Function({attrs}) {
    var fn = attrs.data || {};
    return (
        <atom.Panel>
            <atom.GripLabel>Function</atom.GripLabel>
            <FunctionBody fn={fn} /> 
        </atom.Panel>
    )
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

function FunctionBody({attrs,style}) {
    var fn = attrs.fn || {};

    let args = fn.In.map((e) => e[0]).join(", ");
    let type = fn.Out.join(", ");
    return (
        <div>
            <atom.Fieldbox type={type}>{fn.Name}({args})</atom.Fieldbox>
            <atom.Stack class="text-xs pl-1 mt-2">
                {fn.In.map((arg) =>
                    <atom.Grippable><atom.Fieldbox dark={true} type={arg[1]}>{arg[0]}</atom.Fieldbox></atom.Grippable>
                )}
            </atom.Stack>
        </div>
    )
}

