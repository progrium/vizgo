import * as decl from "/lib/decl.mjs";

//deps: $, jsPlumb
const genId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

export const App = {
    blocks: [
        {id: "block1", title: "s.listener", x: 2, y: 12},
        {id: "block2", title: "s", x: 1, y: 10},
        {id: "block3", title: "req", x: 1, y: 8},
        {id: "block4", inputs: ["one"], title: "globalOptionsHandler{}", x: 1, y: 15},
        {id: "block5", inputs: ["one", "two"], inflow: true, outflow: true, title: "handler.ServeHTTP()", x: 12, y: 15},
        {id: "block6", inflow: true, outflow: true, title: "s.mu.Lock()", x: 1, y: 6},
        {id: "block7", inflow: true, outflow: true, title: "assignment", inputs: [""], outputs: ["name?"], x: 8, y: 1},
        {id: "block8", inflow: true, outflow: true, title: "conditional", inputs: [""], outputs: ["if>", "else>"], x: 8, y: 5},
        {id: "block9", inputs: ["one", "two", "three"], outputs: ["one", "two"],  inflow: true, outflow: true, title: "foobar()", x: 10, y: 10},
    ],
    view: function(vnode) {
        return m("main", {class: "app"}, [
            // m(decl.Sidebar),
            m(decl.Handle),
            m(Grid, {blocks: vnode.state.blocks})
        ])
    },
    updateBlock: function(id, obj) {
        App.blocks = App.blocks.map((el) => {
            if (el.id !== id) {
                return el;
            }
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
                const newWidth = Math.min(resizeData.startWidth + cursorScreenXDelta, resizeData.maxWidth);
                $(resizeData.resizeTarget).outerWidth(newWidth);
                jsPlumb.repaintEverything();
            }
        });
        
        $(window).on('mouseup', null, null, (event) => {
            if (resizeData.tracking) {
                resizeData.tracking = false;
            }
        });
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
    },
    view: function(vnode) {
        return m("div", {class: "grid"},
            vnode.attrs.blocks.map((attrs) => {
                attrs["key"] = attrs["id"];
                return m(Block, attrs)
            })
        )
    }
}

const Block = {
    autosize: function(vnode) {
        let fontSize = stylePropInt(vnode.dom, "font-size");
        let textWidth = vnode.attrs.title.length*fontSize*0.8;
        vnode.dom.style.width = (Math.max(Math.ceil(textWidth/30),2)*30)+"px";
        jsPlumb.repaintEverything();
    },
    onupdate: function(vnode) {
        this.autosize(vnode);
    },
    oncreate: function(vnode) {
        let size = stylePropInt(document.documentElement, "--grid-size");
        jsPlumb.draggable(vnode.dom,{
            grid: [size, size]
        });

        this.autosize(vnode);

        if (vnode.attrs.title === "") {
            vnode.dom.firstChild.firstChild.focus();
        }

        let color = styleProp(vnode.dom.firstChild, "background-color")
        let headerId = vnode.dom.id+"-header";
        if (vnode.attrs.inflow) {
            jsPlumb.addEndpoint(headerId, {
                endpoint: "Blank",
                isTarget: true,
                cssClass: "inflow",
                anchor: [0, 0.5, -1, 0],
                paintStyle:{ fill: color },
                scope:"flow"
            });
        }
        if (vnode.attrs.outflow) {
            jsPlumb.addEndpoint(headerId, {
                endpoint:"Blank",
                isSource: true,
                cssClass: "outflow",
                anchor: [1, 0.5, 1, 0],
                paintStyle:{ fill: color},
                scope:"flow",

                connectorStyle:{ stroke:"white", strokeWidth:10 },
                connector:[ "Flowchart", { 
                    alwaysRespectStubs: true,
                    cornerRadius: 4,
                }],
                // connectorOverlays: [
                //     [ "Arrow", { foldback:0.8, width:35 } ]
                // ]
            });
        }
        let inputs = vnode.attrs.inputs||[];
        inputs.forEach((val,idx) => {
            jsPlumb.addEndpoint(vnode.dom.id+"-body", {
                endpoint:"Dot",
                isTarget: true,
                cssClass: "input port",
                scope: "ports",
                // dragOptions:{ scope:"output" },
                // dropOptions:{ scope:"input" },
                anchor:[0, 1/inputs.length*idx, -1, 0, 0, 20],
                paintStyle:{ fill: "#2a2a2c", stroke:"#475054", strokeWidth:8 },
                overlays:[ 
                    [ "Label", { label:val, location: [1,0.5], id:"myLabel", cssClass: "input-label port-label" } ]
                ],
                connectorStyle: { stroke:"gray", strokeWidth:8 },
                connector:[ "Bezier", { 
                    curviness:100 ,
                } ]
            });
        });
        let outputs = vnode.attrs.outputs||[];
        let expr = false;
        if (!vnode.attrs.outflow && !vnode.attrs.inflow && outputs.length===0) {
            expr = true;
            outputs = ["expr"]
        }
        outputs.forEach((val,idx) => {
            let outflow = false;
            if (val[val.length-1] == ">") {
                val = val.substr(0, val.length-1);
                outflow = true;
            }
            let input = false;
            if (val[val.length-1] == "?") {
                val = val.substr(0, val.length-1);
                input = true;
            }
            let endpoint = {
                containerId: vnode.dom.id+"-body",
                endpoint: "Dot",
                cssClass: "output port",
                scope: "ports",
                // dragOptions:{ scope:"output" },
                // dropOptions:{ scope:"input" },
                maxConnections: -1,
                isSource: true,
                anchor:[1, 1/Math.max(inputs.length, outputs.length)*idx, 1, 0, 0, 20],
                paintStyle: { fill: "#2a2a2c", stroke:"#475054", strokeWidth:8 },
                overlays: [[ "Label", { label: val, location: [0,0.5], id: val, cssClass: "output-label port-label" } ]],
                connectorStyle: { stroke:"gray", strokeWidth:8 },
                connector: [ "Bezier", {curviness:100} ],
                connectorOverlays: []
            }
            if (expr) {
                endpoint.overlays = [];
                endpoint.containerId = vnode.dom.id+"-header";
            }
            if (input) {
                endpoint.paintStyle = {};
            }
            if (outflow) {
                endpoint.endpoint = "Blank";
                endpoint.cssClass = "outflow port";
                endpoint.paintStyle = { fill: "#475054" }
                endpoint.connector = [ "Flowchart", { 
                    alwaysRespectStubs: true,
                    cornerRadius: 4,
                }];
                //endpoint.connectorOverlays = [[ "Arrow", { foldback:0.8, width:35 } ]];
                endpoint.connectorStyle = { stroke:"white", strokeWidth:10 };
                endpoint.maxConnections = 1;
                endpoint.scope = "flow";
                endpoint.overlays = [[ "Label", { label: val, location: [-1,0.5], id: val, cssClass: "output-label port-label" } ]];
            }
            let e = jsPlumb.addEndpoint(endpoint.containerId, endpoint);
            if (input) {
                let el = e.getOverlay(val).getElement();
                el.contentEditable = true;
                el.oninput = (e) => {
                    // TODO
                }
            }
        });
    },
    view: function(vnode) {
        let className = "block"
        if (vnode.attrs.inflow || vnode.attrs.outflow) {
            className += " flow";
        }
        let inputs = vnode.attrs.inputs||[];
        let outputs = vnode.attrs.outputs||[];
        let gridSize = stylePropInt(document.documentElement, "--grid-size");
        let bodyHeight = Math.max(inputs.length, outputs.length) * gridSize;
        return m("div", {class: className, id: vnode.attrs.id, style: {
                left: (vnode.attrs.x*gridSize)+"px",
                top: (vnode.attrs.y*gridSize)+"px"
            }}, [
            m("div", {class: "header", id: vnode.attrs.id+"-header"}, [
                m("div[contentEditable]", {
                    class: "title",
                    oninput: (e) => {
                        let id = e.target.parentNode.parentNode.id;
                        App.updateBlock(id, {title: e.target.innerHTML});
                    },
                    ondblclick: (e) => {
                        e.target.focus();
                        document.execCommand('selectAll',false,null);
                    }
                }, m.trust(vnode.attrs.title))
            ]),
            m("div", {class: "body", id: vnode.attrs.id+"-body", style: {height: bodyHeight+"px"}})
        ])
    }
}


const BlockTemplates = {
    expr: {title: ""},
    assign: {inflow: true, outflow: true, title: "Assign", inputs: [""], outputs: ["name?"]},
};

function stylePropInt(el, prop) {
    return parseInt(styleProp(el, prop), 10);
}

function styleProp(el, prop) {
    return getComputedStyle(el).getPropertyValue(prop);
}


window.App = App;

export const noHMR = true;