import * as hotweb from '/.hotweb/client.mjs'
import * as main from '../com/main.js';

import { Remote } from "./remote.js";
import { Style } from "./style.js";
import { h } from "./h.js";
import { initApp, contextMenu, findFn } from './misc.js';
import { session } from "./mock.js";


class App {
    static init() {
        contextMenu() // doesn't seem to work
        initApp()

        App.blocks = [];
        App.entry = "";
        App.session = session;

        function wrap(cb) {
            return { view: () => h(cb()) };
        }
        
        jsPlumb.bind("ready", function () {
            hotweb.watchCSS();
            hotweb.watchHTML();
            hotweb.refresh(() => h.redraw())
            h.mount(document.body, wrap(() => main.Main));
        })

        App.switchGrid(App.session.Selected);

        //App.createBlock({ type: "return", inputs: ["string", "error"], id: "r" });

        // App.createBlock({ type: "range", id: "s", connects: { "idx": "r-error" } });
        // App.createBlock({ type: "expr", connect: "r-string", title: "s.listener" });        
        // App.createBlock({ type: "assign", connect: "r-in" });
    }

    static switchGrid(name) {
        Remote.select(name);
        $("#entrypoint")[0].style['top'] = $(`#${name}`)[0].offsetTop + "px";
        $("#entrypoint")[0].style['height'] = $(`#${name}`)[0].offsetHeight + "px";

        jsPlumb.reset();
        jsPlumb.bind("connectionDetached", function (params, e) {
            if (e === undefined) {
                return;
            }
            let src = params.sourceId.replace("-out", "");
            let dst = params.targetId.replace("-in", "");
            Remote.disconnect(src, dst);
        });
        jsPlumb.bind("connection", function (params, e) {
            if (e === undefined) {
                return;
            }
            let src = params.sourceId.replace("-out", "");
            let dst = params.targetId.replace("-in", "");
            Remote.connect(src, dst);
        });

        App.reloadGrid();
    }

    static reloadGrid() {

        let fn = findFn(App.session, App.session.Selected);
        App.entry = fn.Entry;
        App.blocks = fn.Blocks.map((b) => {
            return Object.assign(clone(BlockTypes[b.type]), b);
        });

        jsPlumb.repaintEverything();
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
        if (o.position == undefined) {
            o.position = blockCursor;
        }
        if (o.position[0] == undefined) {
            o.position[0] = 20 + (10 * blockCursor[0]++);
        }
        if (o.position[1] == undefined) {
            o.position[1] = blockCursor[1];
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

        // let size = Style.propInt("--grid-size");
        // jsPlumb.draggable(dom, {
        //     grid: [size, size],
        //     containment: "parent",
        // });

        let block = App.getBlockById(attrs.id)

        let fontSize = Style.propInt("font-size", dom);
        block.label = (block.label||"").replace(/<br>/g, '').replace(/&nbsp;/g, '').replace(/<div>/g, '').replace(/<\/div>/g, '')
        let textWidth = block.label.length * fontSize * 0.8;

        if (block.label == "switch") {
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
        if (attrs.label === "") {
            dom.firstChild.firstChild.focus(); // consider re-writing this
        }
    }


    static endpointcreate({ attrs, style, dom }) {
        let { output, header, connect, id } = attrs;
        jsPlumb.removeAllEndpoints(dom);

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
            setTimeout(() => {
                jsPlumb.connect({
                    endpoint: "Blank",
                    source: id,
                    target: connect,
                    paintStyle: { stroke: "gray", strokeWidth: 8 },
                    connector: ["Bezier", { curviness: 100 }],
                    anchors: [[0, 0, 1, 0, 15, 12], [0, 0, -1, 0, 12, 12]]
                });
            }, 20);
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

    static updateFlow( attrs, source ) {
        
        jsPlumb.removeAllEndpoints(source);
        
        if (attrs.connect) {

            setTimeout(() => {
                jsPlumb.connect({
                    source: source,
                    target: attrs.connect+"-in",
                    paintStyle: { stroke: "white", strokeWidth: 10 },
                    connector: ["Flowchart", {
                        alwaysRespectStubs: true,
                        cornerRadius: 4,
                    }],
                    detachable: true,
                    maxConnections:1,
                    endpoint: ["Rectangle", {
                        cssClass:"endpoint-anchor", 
                    }],
                    endpointStyle:{ fill:"white" },
                    anchors: [[0, 0, 1, 0, 4, 13], [0, 0.5, -1, 0, 0, 0]]
                });
            }, 30);
        } else {
            jsPlumb.addEndpoint(source, {
                endpoint: ["Rectangle", {
                    cssClass:"endpoint-anchor",
                }],
                endpointStyle:{ fill:"white" },
                isSource: true,
                anchor: [0, 0, 1, 0, 4, 14],
                scope: "flow",
                connectorStyle: { stroke: "white", strokeWidth: 10 },
                connector: ["Flowchart", {
                    alwaysRespectStubs: true,
                    cornerRadius: 4,
                }]
            });
        }
    }
}


function clone(obj) {
    return $.extend(true, {}, obj);
}

const genId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

const BlockTypes = {
    expr: { label: "" },
    call: { inflow: true, outflow: true, label: "()" },
    assign: { inflow: true, outflow: true, label: "Assign", inputs: [""], outputs: ["name?"] },
    return: { inflow: true, outflow: false, label: "Return" },
    defer: { inflow: true, outflow: true, label: "Defer", outputs: ["defer>"] },
    for: { inflow: true, outflow: true, label: "For     ", inputs: ["exp"], outputs: ["loop>"] },
    send: { inflow: true, outflow: true, label: "Send", inputs: ["ch", "send"] },
    range: { inputs: ["range"], outputs: ["loop>", "idx", "val"], inflow: true, outflow: true, label: "For-Range  " },
    condition: { inflow: true, outflow: true, label: "Conditional", inputs: [""], outputs: ["if>", "else>"] },
};

export { App }

window.App = App;

export const noHMR = true;
