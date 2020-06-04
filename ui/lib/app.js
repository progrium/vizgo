import * as hotweb from '/.hotweb/client.mjs'
import * as misc from './misc.js';
import * as main from '../com/main.js';

import { Session } from "./session.js";
import { Style } from "./style.js";
import { h } from "./h.js";


class App {
    static init() {
        misc.setupContextMenu();
        misc.setupDivider();
        misc.setupSortables();
                
        jsPlumb.bind("ready", function () {
            hotweb.watchCSS();
            hotweb.watchHTML();
            hotweb.refresh(() => h.redraw());

            App.session = new Session(App.redraw, () => {
                
                h.mount(document.body, wrap(() => main.Main));

                App.select(App.selected(), "main");

            });    
        });
        
    }

    static selected() {
        return App.session.state.Selected;
    }

    static select(path, name) {
        Session.select(path);

        $("#entrypoint")[0].style['top'] = $(`#${name}`)[0].offsetTop + "px";
        $("#entrypoint")[0].style['height'] = $(`#${name}`)[0].offsetHeight + "px";

        jsPlumb.reset();
        jsPlumb.bind("connectionDetached", function (params, e) {
            if (e === undefined) {
                return;
            }
            let src = params.sourceId.replace("-out", "");
            let dst = params.targetId.replace("-in", "");
            Session.disconnect(src, dst);
            
        });
        jsPlumb.bind("connection", function (params, e) {
            if (e === undefined) {
                return;
            }
            if ($("#" + params.targetId.replace(".", "\\.")).hasClass("jtk-connected")) {
                let src = params.sourceId.replace("-out", "");
                let dst = params.targetId.replace("-in", "");
                Session.connect(src, dst);
            }
        });

        App.redraw();
    }

    static redraw() {
        jsPlumb.repaintEverything();
        h.redraw();
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
        let block = App.session.blockById(attrs.id || "");

        let fontSize = Style.propInt("font-size", dom);
        block.label = misc.stripInput(block.label||"")
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
            drag: function(event) {
                jsPlumb.repaintEverything();
            },
            stop: function (event) {
                let x = event.pos[0]-$(".Sidebar").innerWidth();
                let y = event.pos[1];
                Session.move(`${App.selected()}/Blocks/${vnode.dom.dataset.idx}`, x, y);
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
        // if (vnode.state.connected) {
        //     // otherwise this hook is called twice for some reason
        //     return;
        // }
        let { output, header, connect, id } = attrs;
        // console.log(attrs);
        jsPlumb.removeAllEndpoints(dom);
        
        // console.log(`oncreate ${id} to ${connect}`);
        //vnode.state.connected = true;

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
                
            }, 10);
        } 

        function exprEndpoint(dom, style, params) {
            setTimeout(() => {
                jsPlumb.addEndpoint(dom, Object.assign({
                    endpoint: "Dot",
                    cssClass: `endpoint-anchor output`,
                    scope: "ports",
                    connectorStyle: { stroke: "gray", strokeWidth: 8 },
                    connector: ["Bezier", { curviness: 100 }]
                }, params));
            }, 10);
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
                });
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
        
        if (attrs.connect && !$("#" + attrs.connect.replace(".","\\.")).hasClass("jtk-connected")) {
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

function wrap(cb) {
    return { view: () => h(cb()) };
}

export { App }

window.App = App;

export const noHMR = true;
