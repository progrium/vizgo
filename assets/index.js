let idCounter = 0;
let scale = 0.75;

// logs to stdout
function log(msg) { external.invoke("log:"+msg); } 

// reloader
var ws = new WebSocket("ws://"+window.location.host);
ws.onclose = () => window.location.reload();

// zoomer
window.setZoom = function(zoom, instance, transformOrigin, el) {
    transformOrigin = transformOrigin || [ 0.5, 0.5 ];  
    instance = instance || jsPlumb;
    el = el || instance.getContainer();
    var p = [ "webkit", "moz", "ms", "o" ],
        s = "scale(" + zoom + ")",
        oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";

    for (var i = 0; i < p.length; i++) {
        el.style[p[i] + "Transform"] = s;
        el.style[p[i] + "TransformOrigin"] = oString;
    }

    el.style["transform"] = s;
    el.style["transformOrigin"] = oString;

    instance.setZoom(zoom);    
};

function slugifyName(name) {
    return name.replace(".", "_").replace(" ", "_");
}

function exprNode(name, x, y, inputs) {
    idCounter++;
    buildNode(`${slugifyName(name)}-${idCounter}`, 40*x, 40*y, name, false, false, inputs, ["expr"]);
}

function flowNode(name, x, y, inputs, outputs) {
    idCounter++;
    buildNode(`${slugifyName(name)}-${idCounter}`, 40*x, 40*y, name, true, true, inputs, outputs);
}

function controlNode(name, x, y, inputs, outputs) {
    idCounter++;
    buildNode(`${slugifyName(name)}-${idCounter}`, 40*x, 40*y, name, true, name!=="return", inputs, outputs);
}

function buildNode(element, x, y, name, inflow, outflow, inputs, outputs) {
    var headerClass = "header";
    var nodeClass = "node";
    var bodyHeight = Math.max(inputs.length, outputs.length)*40;
    if (!inflow && !outflow) {
        headerClass += " expr"
    }
    if (inputs.length === 0 && outputs.length <= 1) {
        headerClass += " single"
        bodyHeight = 0;
    }
    if (name.length > 12) {
        nodeClass += " wide"
    }
    $("main").append(
            $("<div />", {class: nodeClass, id: element, style: `left: ${x}px; top: ${y}px;`}).append(
                $("<div />", {class: headerClass, id: element+"-header"}).append(
                    $("<div />", {class: "title"}).text(name)
                )
            ).append(
                $("<div />", {class: "body", id: element+"-body", style: `height: ${bodyHeight}px`})
            )
        );
    jsPlumb.draggable(element,{
        grid: [40,40]
    });
    if (inflow) {
        jsPlumb.addEndpoint(element+"-header", {
            endpoint:"Rectangle",
            isTarget: true,
            cssClass: "header-endpoint",
            anchor:[0, 0.5, -1, 0, 1, 0],
            paintStyle:{ fill: "#4171a9" },
        });
    }
    if (outflow) {
        jsPlumb.addEndpoint(element+"-header", {
            endpoint:"Rectangle",
            isSource: true,
            connectorStyle:{ stroke:"white", strokeWidth:10 },
            cssClass: "header-endpoint",
            anchor:[1, 0.5, -1, 0],
            paintStyle:{ fill: "#4171a9" },
            connector:[ "Flowchart", { 
                alwaysRespectStubs: true,
            }],
            connectorOverlays: [
                [ "Arrow", { foldback:0.8, width:35 } ]
            ]
        });
    }
    inputs.forEach((val,idx) => {
        jsPlumb.addEndpoint(element+"-body", {
            endpoint:"Dot",
            isTarget: true,
            anchor:[0, 1/inputs.length*idx, -1, 0, 0, 20],
            paintStyle:{ fill: "#2a2a2c", stroke:"#3e4249", strokeWidth:8 },
            overlays:[ 
                [ "Label", { label:val, location: [1,0.5], id:"myLabel", cssClass: "input-label" } ]
            ],
            connectorStyle: { stroke:"gray", strokeWidth:8 },
            connector:[ "Bezier", { 
                curviness:100 ,
            } ]
        });
    });
    outputs.forEach((val,idx) => {
        var overlays = [ 
                [ "Label", { label:val, location: [0,0.5], id:"myLabel", cssClass: "output-label" } ]
        ];
        var anchor = 1/Math.max(inputs.length, outputs.length)*idx;
        var container = "-body";
        var endpoint = "Dot";
        var cssClass = "";
        var connector = [ "Bezier", { 
                curviness:100 ,
            } ];
        var connectorOverlays = [];
        var maxConnections = -1;
        var connectorStyle = { stroke:"gray", strokeWidth:8 };
        var paintStyle = { fill: "#2a2a2c", stroke:"#3e4249", strokeWidth:8 };
        if (outputs.length === 1 && !inflow && !outflow) {
            overlays = [];
            container = "-header";
        }
        if (val[val.length-1] == ">") {
            val = val.substr(0, val.length-1);
            endpoint = "Rectangle";
            cssClass = "nonheader-endpoint";
            overlays = [ 
                [ "Label", { label:val, location: [0,0.5], id:"myLabel", cssClass: "output-label" } ]
            ];
            paintStyle = { fill: "#3e4249" }
            connector = [ "Flowchart", { 
                alwaysRespectStubs: true,
            }];
            connectorOverlays = [
                [ "Arrow", { foldback:0.8, width:35 } ]
            ];
            connectorStyle = { stroke:"white", strokeWidth:10 };
            maxConnections = 1;
        }
        jsPlumb.addEndpoint(element+container, {
            endpoint: endpoint,
            cssClass: cssClass,
            maxConnections: maxConnections,
            isSource: true,
            anchor:[1, anchor, 1, 0, 0, 20],
            paintStyle: paintStyle,
            overlays: overlays,
            connectorStyle: connectorStyle,
            connector:connector,
            connectorOverlays: connectorOverlays
        });
        
    });
    
}

jsPlumb.ready(function() {
    
    // init zoom
    const el = document.querySelector('main');
    document.onwheel = (event) => {
        event.preventDefault();

        scale += event.deltaY * -0.01;
        scale = Math.min(Math.max(.125, scale), 4);

        window.setZoom(scale, jsPlumb, [0, 0], el);        
    };
    window.setZoom(scale, jsPlumb, [0, 0], el);

    // init some nodes
    exprNode("srv.Handler", 1, 1, []);
    flowNode("assign handler", 1, 6, ["value"], []);
    flowNode("assign handler", 14, 6, ["value"], []);
    flowNode("assign handler", 14, 12, ["value"], []);
    flowNode("handler.ServeHTTP", 12, 16, ["ResponseWriter", "*Request"], []);
    exprNode("equals", 7, 1, ["a", "b"]);
    exprNode("equals", 14, 4, ["a", "b"]);
    exprNode("equals", 14, 8, ["a", "b"]);
    exprNode("and", 14, 1, ["a", "b"]);
    controlNode("condition", 7, 6, ["expr"], ["if>", "else>"])
    controlNode("condition", 14, 7, ["expr"], ["if>", "else>"])
    controlNode("return", 14, 14, ["error"], [])
    exprNode("rw", 4, 14, []);
    exprNode("req.RequestURI", 1, 14, []);
    exprNode("req.Method", 1, 18, []);
    exprNode("req", 4, 16, []);
    exprNode("globalOptionsHandler{}", 1, 16, []);
    exprNode("DefaultServerMux", 7, 14, []);
});

