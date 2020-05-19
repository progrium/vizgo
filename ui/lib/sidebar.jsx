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

        height: "100%",
        direction: "rtl",
        margin: "1px",
        zIndex: "1",
        filter: "drop-shadow(2px 0px 5px #111)",
    })

    return (
        <nav>
            <Stack style={{direction:"ltr"}}>
                <Panel>
                    <GripLabel>Package</GripLabel>
                    <atom.Textbox dark={true}>{pkg.Name}</atom.Textbox>                    
                </Panel>
                <Panel>
                    <GripLabel>Imports</GripLabel>
                    <Stack axis="h">
                        <atom.Textbox>foo</atom.Textbox>
                        <atom.Textbox dark={true}>github.com/progrium/tractor/foo</atom.Textbox>
                    </Stack>
                    <Stack axis="h">
                        <atom.Textbox>foo</atom.Textbox>
                        <atom.Textbox dark={true}>github.com/progrium/tractor/foo</atom.Textbox>
                    </Stack>
                </Panel>
                <Panel>
                    <GripLabel>Constants</GripLabel>
                    <Stack axis="h">
                        <atom.Fieldbox type="string">bazbox</atom.Fieldbox>
                        <atom.Textbox dark={true}>"Hello world!"</atom.Textbox>
                    </Stack>
                </Panel>
                <Panel>
                    <GripLabel>Function</GripLabel>
                    <Function />
                    
                </Panel>
                <Panel>
                    <GripLabel>Type</GripLabel>
                    <atom.Fieldbox type="struct">serverFoo</atom.Fieldbox>
                    <Stack class="pl-1 mt-2">
                        <Grippable><atom.Fieldbox dark={true} type="string">Foobar</atom.Fieldbox></Grippable>
                        <Grippable><atom.Fieldbox dark={true} type="bool">BooleanField</atom.Fieldbox></Grippable>
                        <Grippable><atom.Fieldbox dark={true} type="int64">Number</atom.Fieldbox></Grippable>
                    </Stack>
                    <Stack class="pl-1 mt-2">
                        <Subpanel>
                            <GripLabel>Method</GripLabel>
                            <Function />
                        </Subpanel>
                        <Subpanel>
                            <GripLabel>Method</GripLabel>
                            <Function />
                        </Subpanel>
                    </Stack>
                </Panel>
            </Stack>
        </nav>
    )
}

function Function({attrs,style}) {
    return (
        <div>
            <atom.Fieldbox>Foobar(rw, req)</atom.Fieldbox>
            <Stack class="text-xs pl-1 mt-2">
                <Grippable><atom.Fieldbox dark={true} type="http.ResponseWriter">rw</atom.Fieldbox></Grippable>
                <Grippable><atom.Fieldbox dark={true} type="*http.Request">req</atom.Fieldbox></Grippable>
            </Stack>
        </div>
    )
}



// to atom 

function Stack({attrs,style,children}) {
    var axis = attrs.axis || "v";

    style.addClass("flex");
    style.addClass("flex-row", () => axis == "h");
    style.addClass("flex-col", () => axis == "v");

    return (
        <div>{children}</div>
    )
}

export function Grippable({style, children}) {
    return (
        <Stack axis="h">
            <atom.Grip class="mt-1 mb-1" />
            <div class="flex-grow">
                {children}
            </div>
        </Stack>
    )
}

function GripLabel({style, children}) {
    style.addClass("flex items-end mb-1");
    return (
        <div>
            <atom.Label class="pr-2">{children}</atom.Label>
            <shapes.Dots rows={3} class="mb-1" />
        </div>
    )
}

function Subpanel({style,children}) {
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

function Panel({style,children}) {
    style.setStyle({
        padding: "8px",
        paddingTop: "4px",
        borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
        borderBottom: "2px solid black",
        borderRight: "var(--pixel-size) solid #42494d",
        backgroundColor: "transparent"
    })
    return (
        <div>{children}</div>
    )
}