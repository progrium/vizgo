import * as hotweb from '/.hotweb/client.mjs'
import * as main from '../com/main.js';

import { Style } from "./style.js";
import { h } from "./h.js";
import { initApp, contextMenu } from './misc.js';

class App {
    static init() {
        contextMenu() // doesn't seem to work
        initApp()
        App.blocks = [];

        function wrap(cb) {
            return { view: () => h(cb()) };
        }
        jsPlumb.ready(function () {
            hotweb.watchCSS();
            hotweb.watchHTML();
            hotweb.refresh(() => h.redraw())
            h.mount(document.body, wrap(() => main.Main));
        })

        App.createBlock({ type: "return", inputs: ["string", "error"], id: "r" });

        App.createBlock({ type: "range", id: "s", connects: { "idx": "r-error" } });
        App.createBlock({ type: "expr", connect: "r-string", title: "s.listener" });
        
        App.createBlock({ type: "assign", connect: "r-in" });
    }

    static switchGrid(dom, fn) {
        console.log("switching", fn);
        $("#handle-block")[0].style['top'] = dom.offsetTop + "px";
        $("#handle-block")[0].style['height'] = dom.offsetHeight + "px";
    }

    static updateBlock(id, obj) {
        App.blocks = App.blocks.map((el) => {
            if (el.id !== id) {
                return el;
            }
            return Object.assign(el, obj);
        })
        m.redraw();
    }

    static getBlockById (id) {
        for (let block of App.blocks) {
            if (block.id === id) {
                return block
            }
        }
        console.log(`Block with id "${id}" doesn't exist!`)
    }

    static createBlock(obj) {
        const blockCursor = [0, 14];

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
        App.blocks.push(o);
        m.redraw();
    }

    static checkPosition({ dom }) { // rewrite this to actually move all the blocks when the sidebar is moved
        let blockPosition = +`${dom.style.left.replace("px", "")}`
        if (blockPosition <= $(".Sidebar").innerWidth()) {
            blockPosition += $(".Sidebar").innerWidth() - blockPosition + 30
            dom.style.left = blockPosition + "px"
        }
    }

    static autosize({ attrs, dom }) {

        let block = App.getBlockById(attrs.id)

        let fontSize = Style.propInt("font-size", dom);
        block.title = (block.title||"").replace(/<br>/g, '').replace(/&nbsp;/g, '').replace(/<div>/g, '').replace(/<\/div>/g, '')
        let textWidth = block.title.length * fontSize * 0.8;

        if (block.title == "switch") {
            textWidth *= 3;
        }
        let newWidth = (Math.max(Math.ceil(textWidth / 40), 2) * 30) + 30;

        let calculateEndpointWidth = (endpoint, fontSize, outputs=false) => {
            if (endpoint) {
                for (let i = 0; i < Math.max(endpoint.length); i++) {
                    if (i < endpoint.length) {
                        let outputMath = outputs ? 1 : 0.9
                        return (Math.max(Math.ceil((endpoint[i].length * fontSize * 0.8) / 40), 2) * 30) / outputMath
                    };
                };
            };
            return 0
        }
        if (block.inputs || block.outputs) {
            let inputs = calculateEndpointWidth(block.inputs, fontSize)
            let outputs = calculateEndpointWidth(block.outputs, fontSize, true)    
            if (inputs + outputs > newWidth) {
                newWidth = (Math.max(Math.ceil((inputs + outputs) / 30), 2) * 30)
            }
        }

        dom.style.width = newWidth + "px";
        jsPlumb.repaintEverything();
    }

    static blockcreate(vnode) {
        let {attrs, dom} = vnode
        let size = Style.propInt("--grid-size");
        jsPlumb.draggable(dom, {
            grid: [size, size],
            containment: "parent",
        });
        $(window).on('mousemove', null, null, (event) => {
            App.checkPosition(vnode)
        })
        App.autosize(vnode);
        // when creating a new empty expression block
        if (attrs.title === "") {
            dom.firstChild.firstChild.focus(); // consider re-writing this
        }
    }


    static endpointcreate({ attrs, style, dom }) {
        let { output, header, connect, id } = attrs;

        function exprEndpoint(dom, style, params) {
            jsPlumb.addEndpoint(dom, Object.assign({
                endpoint: "Blank",
                cssClass: `${style.class()} output`,
                scope: "ports",
                connectorStyle: { stroke: "gray", strokeWidth: 8 },
                connector: ["Bezier", { curviness: 100 }]
            }, params));
        }

        function connectExpr(id, connect) {
            jsPlumb.connect({
                endpoint: "Blank",
                source: id,
                target: connect,
                paintStyle: { stroke: "gray", strokeWidth: 8 },
                connector: ["Bezier", { curviness: 100 }],
                anchors: [[0, 0, 1, 0, 15, 12], [0, 0, -1, 0, 12, 12]]
            });
        }

        if (output === true) {
            if (header === true) {
                exprEndpoint(dom, style, {
                    maxConnections: 1,
                    anchor: [0, 0, 1, 0, 14, 14],
                    isSource: true,
                })
            } else {
                exprEndpoint(dom, style, {
                    maxConnections: -1,
                    anchor: [0, 0, 1, 0, 15, 12],
                    isSource: true,
                })
            }
        } else {
            exprEndpoint(dom, style, {
                isTarget: true,
                cssClass: `${style.class()} input`,
                anchor: [0, 0, -1, 0, 12, 12],
            })
        }
        if (connect) {
            connectExpr(id, connect);
        }
    }

}

const genId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))


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

export { App }

window.App = App;

export const noHMR = true;
