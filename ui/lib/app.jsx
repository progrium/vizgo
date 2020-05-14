import * as decl from "./decl.js";
import * as atom from "./atom.js";
import * as block from "./block.js";
import { Style } from "./style.js";

//deps: $, jsPlumb
const genId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

// {id: "block1", title: "s.listener", x:15, y: 0},
// {id: "block2", title: "s", x: 15, y: 1},
// {id: "block3", title: "req", x: 15, y: 2},
// {id: "block4", inputs: ["one"], title: "globalOptionsHandler{}", x: 15, y: 3},
// {id: "block5", inputs: ["one", "two"], inflow: true, outflow: true, title: "handler.ServeHTTP()", x: 15, y: 5},
// {id: "block6", inflow: true, outflow: true, title: "s.mu.Lock()", x: 15, y: 8},
// {id: "block7", inflow: true, outflow: true, title: "assignment", inputs: [""], outputs: ["name?"], x: 15, y: 9},
// {id: "block8", inflow: true, outflow: true, title: "conditional", inputs: [""], outputs: ["if>", "else>"], x: 15, y: 11},
// {id: "block9", inputs: ["oneeeeeee", "two", "three"], outputs: ["oneeeeeeeee", "two"],  inflow: true, outflow: true, title: "foobar()", x: 15, y: 14},
// {id: "block10", inputs: ["one?"], inflow: true, outflow: true, title: "switch", x: 15, y: 18},
// {id: "block11", inputs: ["range"], outputs: ["loop>", "idx", "val"], inflow: true, outflow: true, title: "for range  ", x: 15, y: 24},
// {id: "block12", inputs: ["ch", "send"], inflow: true, outflow: true, title: "send", x: 26, y: 2},
// {id: "block13", inputs: ["exp"], outputs: ["loop>"], inflow: true, outflow: true, title: "for     ", x: 26, y: 6},
// {id: "block14", inputs: ["", ""], title: "and", x: 26, y: 9},
// {id: "block15", inputs: [""], title: "not", x: 29, y: 9},
// {id: "block16", inputs: ["", ""], title: "multiply", x: 29, y: 12},
// {id: "block17", inputs: ["string", "error"], inflow: true, title: "return", x: 29, y: 14},
// {id: "block18", inflow: true, title: "continue", x: 29, y: 17},
// {id: "block19", outputs: ["defer>"], inflow: true, outflow: true, title: "defer", x: 29, y: 20},


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

export function App(initial) {
    let app = {
        blocks: [],
        view: function (node) {
            let { state } = node;
            let style = new Style(App);
            style.add("app");
            style.position = "fixed";
            style.padding = "0";
            style.margin = "0";
            style.top = "0";
            style.left = "0";
            style.width = "500%";
            style.height = "100%";
            style.display = "flex";
            style.flexDirection = "row";
            style.flexWrap = "nowrap";
            style.justifyContent = "flex-start";
            style.alignContent = "stretch";
            style.alignItems = "stretch";
            return <main class={style.class()} style={style}>
                <decl.Sidebar />
                <decl.Handle />
                <Grid blocks={state.blocks} />
            </main>
        },
        updateBlock: function (id, obj) {
            app.blocks = app.blocks.map((el) => {
                if (el.id !== id) {
                    return el;
                }
                return Object.assign(el, obj);
            })
            m.redraw();
        },
        createBlock: function (obj) {
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
            app.blocks.push(o);
            m.redraw();
        },
        oncreate: function (vnode) {
            const selectTarget = (fromElement, selector) => {
                if (!(fromElement instanceof HTMLElement)) {
                    return null;
                }

                return fromElement.querySelector(selector);
            };

            const resizeData = {
                tracking: false,
                startWidth: null,
                startCursorScreenX: null,
                handleWidth: 10,
                resizeTarget: null,
                parentElement: null,
                maxWidth: null,
            };

            $(document.body).on('mousedown', '.handle', null, (event) => {
                if (event.button !== 0) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                const handleElement = event.currentTarget;
                if (!handleElement.parentElement) {
                    console.error(new Error("Parent element not found."));
                    return;
                }

                // Use the target selector on the handle to get the resize target.
                const targetSelector = handleElement.getAttribute('data-target');
                const targetElement = selectTarget(handleElement.parentElement, targetSelector);
                if (!targetElement) {
                    console.error(new Error("Resize target element not found."));
                    return;
                }

                resizeData.startWidth = $(targetElement).outerWidth();
                resizeData.startCursorScreenX = event.screenX;
                resizeData.resizeTarget = targetElement;
                resizeData.parentElement = handleElement.parentElement;
                resizeData.maxWidth = $(handleElement.parentElement).innerWidth() - resizeData.handleWidth;
                resizeData.tracking = true;
            });

            $(window).on('mousemove', null, null, (event) => {
                if (resizeData.tracking) {
                    const cursorScreenXDelta = event.screenX - resizeData.startCursorScreenX;
                    const snappedCursorScreenXDelta = cursorScreenXDelta - (cursorScreenXDelta % 30);
                    const newWidth = resizeData.startWidth + snappedCursorScreenXDelta;
                    $(resizeData.resizeTarget).outerWidth(newWidth);
                    jsPlumb.repaintEverything();
                }
            });

            $(window).on('mouseup', null, null, (event) => {
                if (resizeData.tracking) {
                    resizeData.tracking = false;
                }
            });

            $(document).ready(function () {
                // sidebar declarations sorting
                $("#declarations").sortable({
                    items: "> div",
                    revert: 150,
                    tolerance: "intersect",
                    handle: "div.grip",
                    containment: "parent",
                    axis: "y",
                });
                $(".decl-body").sortable({
                    items: "> div",
                    revert: 150,
                    tolerance: "pointer",
                    handle: "div.grip",
                    containment: "parent",
                    axis: "y",
                });
            })
        }
    }
    app.createBlock({ type: "range", connects: { "idx": "r-error" } });
    app.createBlock({ type: "expr", connect: "r-string", title: "s.listener" });
    app.createBlock({ type: "return", inputs: ["string", "error"], id: "r" });
    app.createBlock({ type: "assign", connect: "r-in" });
    return app;
};

const Grid = {
    oncreate: function (vnode) {

        $.contextMenu({
            selector: '.grid',
            build: function ($trigger, e) {
                let mocksubitems = {
                    "fold1-key1": { "name": "Foo bar" },
                    "fold2": {
                        "name": "Sub group 2",
                        "items": {
                            "fold2-key1": { "name": "alpha" },
                            "fold2-key2": { "name": "bravo" },
                            "fold2-key3": { "name": "charlie" }
                        }
                    },
                    "fold1-key3": { "name": "delta" }
                };
                return {
                    callback: function (key, options) {
                        App.createBlock(BlockTemplates[key]);
                    },
                    items: {
                        "expr": { name: "Expression" },
                        "locals": { name: "Locals", items: mocksubitems },
                        "imports": { name: "Imports", items: mocksubitems },
                        "builtins": { name: "Builtins", items: mocksubitems },
                        "operators": { name: "Operators", items: mocksubitems },
                        "return": { name: "Return" },
                        "loop": { name: "Loop" },
                        "condition": { name: "Condition" },
                        "assign": { name: "Assign" }
                    }
                };
            }
        });

        jsPlumb.setContainer(vnode.dom);
        jsPlumb.bind("beforeDrop", function (params) {
            console.log(params);
            return true;
        });
    },
    view: function (node) {
        let { attrs } = node;
        let style = new Style(Grid);
        style.add("grid");
        style.backgroundSize = "var(--grid-size) var(--grid-size)";
        style.backgroundColor = "var(--background-color)";
        style.backgroundImage = "radial-gradient(#202020 2px, transparent 0)";
        style.backgroundPosition;
        "calc(-0.5 * var(--grid-size)) calc(-0.5 * var(--grid-size))",
            style.padding = "var(--grid-size) var(--grid-size)";
        style.height = "100%";
        style.order = "0";
        style.flex = "1 1 auto";
        style.alignSelf = "auto";
        style.border = "1px solid var(--outline-color)";

        return <div class={style.class()} style={style}>
            {attrs.blocks.map((attrs) => {
                attrs["key"] = attrs["id"];
                return m(block.Block, attrs)
            })}
        </div>
    }
}





window.App = App;

export const noHMR = true;