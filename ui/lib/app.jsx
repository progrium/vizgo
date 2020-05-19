import * as decl from "./decl.js";
import * as sidebar from "./sidebar.js";
import * as atom from "./atom.js";
import * as block from "./block.js";
import { Style } from "./style.js";
import { h } from "./h.js";

//deps: $, jsPlumb
const genId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

let mocksession = {
    Selected: "#main",
    Package: {
        Name: "main",
        Imports: [
            { Package: "fmt" }
        ],
        Functions: [
            {
                Name: "main",
                In: [],
                Out: [],
                Entry: [
                    { Name: "", Flow: true, Connect: "main.0" },
                    { Name: "args", Type: "[]string" },
                ],
                Blocks: [
                    { Type: "call", ID: "main.0", Label: "fmt.Println()", Position: [14, 14] },
                    { Type: "return", ID: "main.return", Position: [24, 14] },
                ]
            }
        ]
    }
}

const BlockTypes = {
    expr: { title: "" },
    call: { inflow: true, outflow: true, title: "()" },
    assign: { inflow: true, outflow: true, title: "Assign", inputs: [""], outputs: ["name?"] },
    return: { inflow: true, outflow: false, title: "Return" },
    defer: { inflow: true, outflow: true, title: "Defer", outputs: ["defer>"] },
    for: { inflow: true, outflow: true, title: "For     ", inputs: ["exp"], outputs: ["loop>"] },
    send: { inflow: true, outflow: true, title: "Send", inputs: ["ch", "send"] },
    range: { inputs: ["range"], outputs: ["loop>", "idx", "val"], inflow: true, outflow: true, title: "For-Range  " },
    condition: { inflow: true, outflow: true, title: "Conditional", inputs: [""], outputs: ["if>", "else>"] },
};

var blockCursor = [0, 14];

class App {
    constructor() {
        this.blocks = [];

        this.createBlock({ type: "range", id: "s", connects: { "idx": "r-error" } });
        this.createBlock({ type: "expr", connect: "r-string", title: "s.listener" });
        this.createBlock({ type: "return", inputs: ["string", "error"], id: "r" });
        this.createBlock({ type: "assign", connect: "r-in" });
    }

    oncreate(vnode) {
        // initApp()   
    }

    updateBlock(id, obj) {
        this.blocks = this.blocks.map((el) => {
            if (el.id !== id) {
                return el;
            }
            return Object.assign(el, obj);
        })
        m.redraw();
    }

    createBlock(obj) {
        let b = Object.assign(BlockTypes[obj.type]);
        let o = Object.assign(b, obj);
        if (o.id === undefined) {
            o.id = genId();
        }
        if (o.x == undefined) {
            o.x = 20 + (10 * blockCursor[0]++);
        }
        if (o.y == undefined) {
            o.y = blockCursor[1];
        }
        this.blocks.push(o);
        m.redraw();
    }

    view(node) {
        let style = new Style(App, {
            position: "fixed",
            overflow: "auto",
            width: "500%",
            height: "100%",
            display: "flex",
        });
        
        return <main {...style.attrs()}>
            {h(sidebar.Sidebar, {package: mocksession.Package})}
            <Divider />
            <Grid blocks={node.state.blocks} />
        </main>
    }
}

export { App }

export function Divider() {
    let style = new Style(Divider, {
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
    return {
        view: () => (
            <div id="split-handle">
                <div data-target=".sidebar" {...style.attrs()}></div>
            </div>
        )
    }
}

const Grid = {
    oncreate: function (vnode) {
        jsPlumb.setContainer(vnode.dom);
        jsPlumb.bind("beforeDrop", function (params) {
            console.log(params);
            return true;
        });
    },
    view: function (node) {
        let { attrs } = node;
        let style = new Style(Grid, {
            backgroundSize: "var(--grid-size) var(--grid-size)",
            backgroundColor: "var(--background-color)",
            backgroundImage: "radial-gradient(#202020 2px, transparent 0)",
            backgroundPosition: "calc(-0.5 * var(--grid-size)) calc(-0.5 * var(--grid-size))",
            padding: "var(--grid-size) var(--grid-size)",
            height: "100%",
            order: "0",
            flex: "1 1 auto",
            alignSelf: "auto",
            border: "1px solid var(--outline-color)",
        });
        

        let blockStyle = Style.from({
            background: "rgb(75, 126, 28) ",
            width: "16px",
            height: "150px",
            borderTopRightRadius: "var(--corner-size)",
            borderBottomRightRadius: "var(--corner-size)",
            position: "absolute",
            top: "400px",
            marginLeft: "-34px",
            
        })

        return <div {...style.attrs()}>
            <div id="handle-block" {...blockStyle.attrs()}>
                    <decl.EntryEndpoint />
            </div>
            {attrs.blocks.map((attrs) => {
                attrs["key"] = attrs["id"];
                return m(block.Block, attrs)
            })}
        </div>
    }
}





window.App = App;

export const noHMR = true;