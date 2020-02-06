const genId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

const App = {
    blocks: [
        {id: genId(), title: "s.listener"},
        {id: genId(), title: "s"},
        {id: genId(), title: "req"},
        {id: genId(), inputs: ["one"], title: "globalOptionsHandler{}"},
        {id: genId(), inputs: ["one", "two"], inflow: true, outflow: true, title: "handler.ServeHTTP()"},
        {id: genId(), inflow: true, outflow: true, title: "s.mu.Lock()"},
        {id: genId(), inflow: true, outflow: true, title: "assignment", inputs: [""], outputs: ["name?"]},
        {id: genId(), inflow: true, outflow: true, title: "conditional", inputs: [""], outputs: ["if>", "else>"]},
        {id: genId(), inputs: ["one", "two", "three"], outputs: ["one", "two"],  inflow: true, outflow: true, title: "foobar()"},
    ],
    view: function(vnode) {
        return m("main", {class: "app"}, [
            m(Sidebar),
            m(Grid, {blocks: vnode.state.blocks}),
        ])
    }
}

const Sidebar = {
    view: function() {
        return m("nav", {class: "sidebar"}, [
            m("h1", {class: "title"}, "Sheeeit")
        ])
    }
}

const Grid = {
    oncreate: function(vnode) {
        $.contextMenu({
            selector: '.grid', 
            build: function($trigger, e) {
                return {
                    callback: function(key, options) {
                        
                    },
                    items: {
                        "expr": {name: "Expression Block", callback: function(itemKey, opt, e){
                            App.blocks.push({title: "New"});
                            m.redraw();
                            return true;             
                        }},
                        "flow": {name: "Flow Block"},
                        "control": {name: "Control Block"}
                    }
                };
            }
        });

        jsPlumb.setContainer(vnode.dom);
    },
    view: function(vnode) {
        return m("div", {class: "grid"},
          vnode.attrs.blocks.map((attrs) => m(Block, attrs))
        )
    }
}

const Block = {
    oncreate: function(vnode) {
        let size = stylePropInt(document.documentElement, "--grid-size");
        jsPlumb.draggable(vnode.dom,{
            grid: [size, size]
        });

        let fontSize = stylePropInt(vnode.dom, "font-size");
        let textWidth = vnode.attrs.title.length*fontSize*0.8;
        vnode.dom.style.width = (Math.max(Math.ceil(textWidth/30),2)*30)+"px";

        let color = styleProp(vnode.dom.firstChild, "background-color")
        let headerId = vnode.dom.id+"-header";
        if (vnode.attrs.inflow) {
            jsPlumb.addEndpoint(headerId, {
                endpoint: "Rectangle",
                isTarget: true,
                cssClass: "inflow",
                anchor: [0, 0.5, -1, 0],
                paintStyle:{ fill: color },
                scope:"flow"
            });
        }
        if (vnode.attrs.outflow) {
            jsPlumb.addEndpoint(headerId, {
                endpoint:"Rectangle",
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
                connectorOverlays: [
                    [ "Arrow", { foldback:0.8, width:35 } ]
                ]
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
                overlays: [[ "Label", { label: val, location: [0,0.5], id: vnode.dom.id+"-out"+idx, cssClass: "output-label port-label" } ]],
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
                endpoint.endpoint = "Rectangle";
                endpoint.cssClass = "outflow port";
                endpoint.paintStyle = { fill: "#475054" }
                endpoint.connector = [ "Flowchart", { alwaysRespectStubs: true }];
                endpoint.connectorOverlays = [[ "Arrow", { foldback:0.8, width:35 } ]];
                endpoint.connectorStyle = { stroke:"white", strokeWidth:10 };
                endpoint.maxConnections = 1;
                endpoint.dragOptions = { scope:"flow" };
                endpoint.dropOptions = { scope:"" };
            }
            jsPlumb.addEndpoint(endpoint.containerId, endpoint);
            
        });
    },
    view: function(vnode) {
        let className = "block"
        if (vnode.attrs.inflow || vnode.attrs.outflow) {
            className += " flow";
        }
        let inputs = vnode.attrs.inputs||[];
        let outputs = vnode.attrs.outputs||[];
        let bodyHeight = Math.max(inputs.length, outputs.length) * stylePropInt(document.documentElement, "--grid-size");
        return m("div", {class: className, id: vnode.attrs.id}, [
            m("div", {class: "header", id: vnode.attrs.id+"-header"}, [
                m("div[contentEditable]", {
                    class: "title",
                    oninput: (e) => {
                        console.log(e.target.parentNode.parentNode.id, $(e.target).width());
                    }
                }, m.trust(vnode.attrs.title))
            ]),
            m("div", {class: "body", id: vnode.attrs.id+"-body", style: {height: bodyHeight+"px"}})
        ])
    }
}

function stylePropInt(el, prop) {
    return parseInt(styleProp(el, prop), 10);
}

function styleProp(el, prop) {
    return getComputedStyle(el).getPropertyValue(prop);
}

