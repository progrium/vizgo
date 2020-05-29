import * as hotweb from '/.hotweb/client.mjs'
import * as main from '../com/main.js';

import { Remote } from "./remote.js";
import { Style } from "./style.js";
import { h } from "./h.js";
import { setupDivider, setupSortables, setupContextMenu, findFn, stripInput } from './misc.js';
import { session } from "./mock.js";


class App {
    static init() {
        setupContextMenu();
        setupDivider();
        setupSortables();

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

        App.switchGrid(App.selected());

        // App.createBlock({ type: "return", inputs: ["string", "error"], id: "r" });

        // App.createBlock({ type: "range", id: "s", connects: { "idx": "r-error" } });
        // App.createBlock({ type: "expr", connect: "r-string", title: "s.listener" });        
        // App.createBlock({ type: "assign", connect: "r-in" });
    }

    static selected() {
        return App.session.Selected;
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
        let fn = findFn(App.session, App.selected());

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
        if (`${dom.style.left.replace("px", "")}` <= $(".Sidebar").innerWidth()) {
            dom.style.left = $(".Sidebar").innerWidth() + 30 + "px"
        }
    }

    static calculateEndpointWidth (endpoints, fontSize) {
        let copy = [...endpoints]
        for (let i = 0; i < copy.length; i++) {
            copy[i] = ((Math.max(Math.ceil((copy[i].length * fontSize * 0.8) / 40), 2) * 30) / 0.97)
        };
        return Math.max(...copy)
    }

    static Block_onupdate({ attrs, dom }) {
        let block = App.getBlockById(attrs.id || "");

        let fontSize = Style.propInt("font-size", dom);
        block.label = stripInput(block.label||"")
        let textWidth = block.label.length * fontSize * 0.8;

        let newWidth = (Math.max(Math.ceil(textWidth / 40), 2) * 30) + 30;

        let inputs = block.inputs ? App.calculateEndpointWidth(block.inputs, fontSize) : 0
        let outputs = block.outputs ? App.calculateEndpointWidth(block.outputs, fontSize) : 0

        if (inputs + outputs > newWidth) {
            newWidth = (Math.max(Math.ceil((inputs + outputs) / 30), 2) * 30)
        }

        dom.style.width = newWidth + "px";
        jsPlumb.repaintEverything();
    }

    static Block_oncreate(vnode) {
        let {attrs, dom} = vnode
        let size = Style.propInt("--grid-size");
        jsPlumb.draggable(dom, {
            grid: [size, size],
            containment: "parent",
            drag: function (event) {
                Remote.move(event.pos, vnode.dom.id)
            }
        });
        $(window).on('mousemove', null, null, (event) => {
            App.checkPosition({ dom })
        })
        App.Block_onupdate(vnode);
        // when creating a new empty expression block
        if (attrs.label === "") {
            dom.firstChild.firstChild.focus(); // consider re-writing this
        }
    }


    static Endpoint_oncreate({ attrs, style, dom, vnode }) {
        if (vnode.state.connected) {
            // otherwise this hook is called twice for some reason
            return;
        }
        let { output, header, connect, id } = attrs;
        jsPlumb.removeAllEndpoints(dom);
        
        // console.log(`oncreate ${id} to ${connect}`);
        vnode.state.connected = true;

        if (connect) {
            setTimeout(() => {
                jsPlumb.connect({
                    endpoint: ["Dot", {
                        cssClass: `endpoint-anchor output`,
                        scope: "ports",
                    }],
                    source: id,
                    target: connect,
                    paintStyle: { stroke: "gray", strokeWidth: 8 },
                    connector: ["Bezier", { curviness: 100 }],
                    anchors: [[0, 0, 1, 0, 15, 12], [0, 0, -1, 0, 12, 12]]
                });
                
            }, 20);
        } 

        function exprEndpoint(dom, style, params) {
            jsPlumb.addEndpoint(dom, Object.assign({
                endpoint: "Dot",
                cssClass: `endpoint-anchor output`,
                scope: "ports",
                connectorStyle: { stroke: "gray", strokeWidth: 8 },
                connector: ["Bezier", { curviness: 100 }]
            }, params));
        }

        if (output === true) {
            // output port
            if (header === true) {
                // expression out
                exprEndpoint(dom, style, {
                    maxConnections: 1,
                    anchor: [0, 0, 1, 0, 14, 14],
                    isSource: true,
                })
            } else {
                // normal out
                exprEndpoint(dom, style, {
                    maxConnections: -1,
                    anchor: [0, 0, 1, 0, 15, 12],
                    isSource: true,
                })
            }
        } else {
            // input port
            exprEndpoint(dom, style, {
                isTarget: true,
                cssClass: `endpoint-anchor input`,
                anchor: [0, 0, -1, 0, 12, 12],
            })
        }
    
    }

    static Inflow_onupdate({ dom }) {
        jsPlumb.removeAllEndpoints(dom);
        jsPlumb.addEndpoint(dom, {
            endpoint: ["Rectangle", {
                cssClass:"endpoint-anchor", 
            }],
            endpointStyle:{ fill:"white" },
            isTarget: true,
            width: 30,
            height: 30,
            anchor: [0, 0.5, -1, 0, 0, 0],
            scope: "flow",
        });
    };

    static Outflow_onupdate( attrs, source ) {
        
        jsPlumb.removeAllEndpoints(source);
        
        if (attrs.connect) {
            setTimeout(() => {
                //console.log(`connecting ${source} to ${attrs.connect}`);
                jsPlumb.connect({
                    source: source,
                    target: attrs.connect,
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
                    anchors: [[0, 0, 1, 0, 4, 13.5], [0, 0.5, -1, 0, 4.5, 0]]
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
    expr: { 
        flow: false, 
        label: "" 
    },
    call: { 
        label: "()" 
    },
    assign: { 
        label: "Assign", 
        inputs: [""], 
        outputs: ["name?"] 
    },
    return: { 
        out: false, 
        label: "Return" 
    },
    defer: { 
        label: "Defer", 
        outputs: ["defer>"] 
    },
    for: { 
        label: "For     ", 
        inputs: ["exp"], 
        outputs: ["loop>"] 
    },
    send: { 
        label: "Send", 
        inputs: ["ch", "send"] 
    },
    range: { 
        label: "For-Range  ", 
        inputs: ["range"], 
        outputs: ["loop>", "idx", "val"] 
    },
    condition: { 
        label: "Conditional", 
        inputs: [""], 
        outputs: ["if>", "else>"] 
    },
};

export { App }

window.App = App;

export const noHMR = true;
