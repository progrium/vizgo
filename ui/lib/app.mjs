import * as decl from "/lib/decl.mjs";
import * as block from "/lib/block.mjs";
import * as inline from "/lib/inline.mjs";

//deps: $, jsPlumb
const genId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

export const App = {
    blocks: [
        {id: "block1", title: "s.listener", x:15, y: 0},
        {id: "block2", title: "s", x: 15, y: 1},
        {id: "block3", title: "req", x: 15, y: 2},
        {id: "block4", inputs: ["one"], title: "globalOptionsHandler{}", x: 15, y: 3},
        {id: "block5", inputs: ["one", "two"], inflow: true, outflow: true, title: "handler.ServeHTTP()", x: 15, y: 5},
        {id: "block6", inflow: true, outflow: true, title: "s.mu.Lock()", x: 15, y: 8},
        {id: "block7", inflow: true, outflow: true, title: "assignment", inputs: [""], outputs: ["name?"], x: 15, y: 9},
        {id: "block8", inflow: true, outflow: true, title: "conditional", inputs: [""], outputs: ["if>", "else>"], x: 15, y: 11},
        {id: "block9", inputs: ["one", "two", "three"], outputs: ["one", "two"],  inflow: true, outflow: true, title: "foobar()", x: 15, y: 14},
        {id: "block10", inputs: ["one?"], inflow: true, outflow: true, title: "switch", x: 15, y: 18},
        {id: "block11", inputs: ["range"], outputs: ["loop>", "idx", "val"], inflow: true, outflow: true, title: "for range  ", x: 15, y: 24},
        {id: "block12", inputs: ["ch", "send"], inflow: true, outflow: true, title: "send", x: 26, y: 2},
        {id: "block13", inputs: ["exp"], outputs: ["loop>"], inflow: true, outflow: true, title: "for     ", x: 26, y: 6},
        {id: "block14", inputs: ["", ""], title: "and", x: 26, y: 9},
        {id: "block15", inputs: [""], title: "not", x: 29, y: 9},
        {id: "block16", inputs: ["", ""], title: "multiply", x: 29, y: 12},
        {id: "block17", inputs: ["string", "error"], inflow: true, title: "return", x: 29, y: 14},
        {id: "block18", inflow: true, title: "continue", x: 29, y: 17},
        {id: "block19", outputs: ["defer>"], inflow: true, outflow: true, title: "defer", x: 29, y: 20},
    ],
    view: function(vnode) {
        let style = inline.style({
            class: "app",

            position: "fixed",
            padding: "0",
            margin: "0",
            top: "0",
            left: "0",
            width: "500%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            justifyContent: "flex-start",
            alignContent: "stretch",
            alignItems: "stretch"
        })
        return m("main", style({}), [
            m(decl.Sidebar),
            m(decl.Handle),
            m(Grid, {blocks: vnode.state.blocks})
        ])
    },
    updateBlock: function(id, obj) {
        App.blocks = App.blocks.map((el) => {
            if (el.id !== id) {
                return el;
            }
            console.log(el)
            return Object.assign(el, obj);
        })
        m.redraw();
    },
    createBlock: function(obj) {
        let o = Object.assign({}, obj);
        if (o.id === undefined) {
            o.id = genId();
        }
        App.blocks.push(o);
        m.redraw();
    },
    oncreate: function(vnode) {
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

        $(document).ready(function(){
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

const Grid = {
    oncreate: function(vnode) {
        $.contextMenu({
            selector: '.grid', 
            build: function($trigger, e) {
                let mocksubitems = {
                    "fold1-key1": {"name": "Foo bar"},
                    "fold2": {
                        "name": "Sub group 2", 
                        "items": {
                            "fold2-key1": {"name": "alpha"},
                            "fold2-key2": {"name": "bravo"},
                            "fold2-key3": {"name": "charlie"}
                        }
                    },
                    "fold1-key3": {"name": "delta"}
                };
                return {
                    callback: function(key, options) {
                        App.createBlock(BlockTemplates[key]);
                    },
                    items: {
                        "expr": {name: "Expression"},
                        "locals": {name: "Locals", items: mocksubitems},
                        "imports": {name: "Imports", items: mocksubitems},
                        "builtins": {name: "Builtins", items: mocksubitems},
                        "operators": {name: "Operators", items: mocksubitems},
                        "return": {name: "Return"},
                        "loop": {name: "Loop"},
                        "condition": {name: "Condition"},
                        "assign": {name: "Assign"}
                    }
                };
            }
        });

        jsPlumb.setContainer(vnode.dom);
        jsPlumb.bind("beforeDrop", function(params) {
            console.log(params);
            return true;
        });
    },
    view: function(vnode) {
        let style = inline.style({
            class: "grid",

            backgroundSize: "var(--grid-size) var(--grid-size)",
            backgroundColor: "var(--background-color)",
            backgroundImage: "radial-gradient(#202020 2px, transparent 0)",
            backgroundPosition:
                "calc(-0.5 * var(--grid-size)) calc(-0.5 * var(--grid-size))",
            padding: "var(--grid-size) var(--grid-size)",
            height: "100%",
            order: "0",
            flex: "1 1 auto",
            alignSelf: "auto",
            border: "1px solid var(--outline-color)"
        })
        return m("div", style({}),
            vnode.attrs.blocks.map((attrs) => {
                attrs["key"] = attrs["id"];
                return m(block.Block, attrs)
            })
        )
    }
}


const BlockTemplates = {
    expr: {title: ""},
    assign: {inflow: true, outflow: true, title: "Assign", inputs: [""], outputs: ["name?"]},
};


window.App = App;

export const noHMR = true;