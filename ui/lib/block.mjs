import * as inline from "/lib/inline.mjs";
import * as misc from "/lib/misc.mjs";
import * as decl from "/lib/decl.mjs";

export const Block = {
    autosize: function(vnode) {
        let fontSize = stylePropInt(vnode.dom, "font-size");
        let textWidth = vnode.attrs.title.length*fontSize*0.8;
        if (vnode.attrs.title == "switch") {
            textWidth *= 3;
        }
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
        // if (vnode.attrs.inflow) {
        //     jsPlumb.addEndpoint(headerId, {
        //         endpoint: "Blank",
        //         isTarget: true,
        //         cssClass: "inflow",
        //         anchor: [0, 0.5, -1, 0],
        //         paintStyle:{ fill: color },
        //         scope:"flow"
        //     });
        // }
        // if (vnode.attrs.outflow) {
        //     jsPlumb.addEndpoint(headerId, {
        //         endpoint:"Blank",
        //         isSource: true,
        //         cssClass: "outflow",
        //         anchor: [1, 0.5, 1, 0],
        //         paintStyle:{ fill: color},
        //         scope:"flow",

        //         connectorStyle:{ stroke:"white", strokeWidth:10 },
        //         connector:[ "Flowchart", { 
        //             alwaysRespectStubs: true,
        //             cornerRadius: 4,
        //         }],
        //         // connectorOverlays: [
        //         //     [ "Arrow", { foldback:0.8, width:35 } ]
        //         // ]
        //     });
        // }
        // let inputs = vnode.attrs.inputs||[];
        // inputs.forEach((val,idx) => {
        //     jsPlumb.addEndpoint(vnode.dom.id+"-body", {
        //         endpoint:"Dot",
        //         isTarget: true,
        //         cssClass: "input port",
        //         scope: "ports",
        //         // dragOptions:{ scope:"output" },
        //         // dropOptions:{ scope:"input" },
        //         anchor:[0, 1/inputs.length*idx, -1, 0, 0, 20],
        //         paintStyle:{ fill: "#2a2a2c", stroke:"#475054", strokeWidth:8 },
        //         // overlays:[ 
        //         //     [ "Label", { label:val, location: [1,0.5], id:"myLabel", cssClass: "input-label port-label" } ]
        //         // ],
        //         connectorStyle: { stroke:"gray", strokeWidth:8 },
        //         connector:[ "Bezier", { 
        //             curviness:100 ,
        //         } ]
        //     });
        // });
        // let outputs = vnode.attrs.outputs||[];
        // let expr = false;
        // if (!vnode.attrs.outflow && !vnode.attrs.inflow && outputs.length===0) {
        //     expr = true;
        //     outputs = ["expr"]
        // }
        // outputs.forEach((val,idx) => {
        //     let outflow = false;
        //     if (val[val.length-1] == ">") {
        //         val = val.substr(0, val.length-1);
        //         outflow = true;
        //     }
        //     let input = false;
        //     if (val[val.length-1] == "?") {
        //         val = val.substr(0, val.length-1);
        //         input = true;
        //     }
        //     let endpoint = {
        //         containerId: vnode.dom.id+"-body",
        //         endpoint: "Dot",
        //         cssClass: "output port",
        //         scope: "ports",
        //         // dragOptions:{ scope:"output" },
        //         // dropOptions:{ scope:"input" },
        //         maxConnections: -1,
        //         isSource: true,
        //         anchor:[1, 1/Math.max(inputs.length, outputs.length)*idx, 1, 0, 0, 20],
        //         paintStyle: { fill: "#2a2a2c", stroke:"#475054", strokeWidth:8 },
        //         //overlays: [[ "Label", { label: val, location: [0,0.5], id: val, cssClass: "output-label port-label" } ]],
        //         connectorStyle: { stroke:"gray", strokeWidth:8 },
        //         connector: [ "Bezier", {curviness:100} ],
        //         connectorOverlays: []
        //     }
        //     if (expr) {
        //         endpoint.overlays = [];
        //         endpoint.containerId = vnode.dom.id+"-header";
        //     }
        //     if (input) {
        //         endpoint.paintStyle = {};
        //     }
        //     if (outflow) {
        //         endpoint.endpoint = "Blank";
        //         endpoint.cssClass = "outflow port";
        //         endpoint.paintStyle = { fill: "#475054" }
        //         endpoint.connector = [ "Flowchart", { 
        //             alwaysRespectStubs: true,
        //             cornerRadius: 4,
        //         }];
        //         //endpoint.connectorOverlays = [[ "Arrow", { foldback:0.8, width:35 } ]];
        //         endpoint.connectorStyle = { stroke:"white", strokeWidth:10 };
        //         endpoint.maxConnections = 1;
        //         endpoint.scope = "flow";
        //         //endpoint.overlays = [[ "Label", { label: val, location: [-1,0.5], id: val, cssClass: "output-label port-label" } ]];
        //     }
        //     let e = jsPlumb.addEndpoint(endpoint.containerId, endpoint);
        //     if (input) {
        //         let overlay = e.getOverlay(val);
        //         if (!overlay) return;
        //         let el = overlay.getElement();
        //         el.contentEditable = true;
        //         el.oninput = (e) => {
        //             // TODO
        //         }
        //     }
        // });
    },
    view: function(vnode) {
        let className = "block"
        let flowBlock = false;
        if (vnode.attrs.inflow || vnode.attrs.outflow) {
            className += " flow";
            flowBlock = true;
        }
        let gridSize = stylePropInt(document.documentElement, "--grid-size");
        let style = inline.style({
            id: vnode.attrs.id,
            class: className,

            left: (vnode.attrs.x*gridSize)+"px",
            top: (vnode.attrs.y*gridSize)+"px",
            width: "120px",
            position: "absolute",
            backgroundColor: "#475054",
            zIndex: "10",
            WebkitTransform: "translate3d(0,0,0)",
            filter: "drop-shadow(3px 3px 5px #111)",
            borderRadius: "var(--corner-size)"
        });
        return m("div", style({}), [
            m(BlockHeader, {id: vnode.attrs.id, title: vnode.attrs.title, flow: flowBlock}),
            (vnode.attrs.title == "switch") ?
                m(BlockSwitch, {id: vnode.attrs.id, inputs: vnode.attrs.inputs, outputs: vnode.attrs.outputs}) :
                m(BlockPorts, {id: vnode.attrs.id, inputs: vnode.attrs.inputs, outputs: vnode.attrs.outputs})
        ])
    }
}

const SwitchCase = {
    view: function(vnode) {
        return m("div", Object.assign(
                decl.Declaration.style({}), 
                {class: "case decl-container"}), [
            m(misc.Grip),
            m(Textbox, "werfgewrf"),
            m(outflow, {case: true})
        ])
    }
}

const BlockSwitch = {
    view: function(vnode) {
        let inputs = vnode.attrs.inputs||[];
        let outputs = vnode.attrs.outputs||[];
        let gridSize = stylePropInt(document.documentElement, "--grid-size");
        let bodyHeight = Math.max(inputs.length, outputs.length) * gridSize * 5;
        let style = inline.style({
            switch: {
                id: vnode.attrs.id+"-body",
                class: "body switch", 

                height: bodyHeight+"px", 
                gridTemplateColumns: "auto",
                borderRadius: "0 0 4px 4px",
                backgroundColor: "var(--sidebar-color)" 
            },
            cases: {
                borderBottom: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderTop: "var(--pixel-size) solid #42494d",
                borderLeft: "var(--pixel-size) solid #42494d"
            }
        });
        return m("div", style("switch"), [
            m("div", {}, inputs.map((val,idx) => m(BlockPort, {input: true, desc: val}))),
            m("div", style("cases"), [
                m(SwitchCase),
                m(SwitchCase),
                m(SwitchCase)
            ])
        ])
    }
}

const BlockPorts = {
    view: function(vnode) {
        let inputs = vnode.attrs.inputs||[];
        let outputs = vnode.attrs.outputs||[];
        let gridSize = stylePropInt(document.documentElement, "--grid-size");
        let bodyHeight = Math.max(inputs.length, outputs.length) * gridSize;
        let style = inline.style({
            id: vnode.attrs.id+"-body",
            class: "body",
            
            height: bodyHeight+"px", 
            display: "grid", 
            gridTemplateColumns: "auto auto",
            borderRadius: "0 0 4px 4px"
        });
        return m("div", style({}), [
            m("div", {}, inputs.map((val,idx) => m(BlockPort, {input: true, desc: val}))),
            m("div", {}, outputs.map((val,idx) => m(BlockPort, {output: true, desc: val})))
        ])
    }
}

const BlockPort = {
    view: function(vnode) {
        let style = {
            paddingTop: "2px", 
            height: "28px"
        }
        if (vnode.attrs.input) {
            style.marginLeft = "15px";
        }
        if (vnode.attrs.output) {
            style.marginRight = "15px";
            style.textAlign = "right";
        }
        let val = vnode.attrs.desc;
        if (val[val.length-1] == ">") {
            val = val.substr(0, val.length-1);
            return m("div", {style: style}, [m(outflow, {body: true}), val])
        }
        if (val[val.length-1] == "?") {
            val = val.substr(0, val.length-1);
            return m(Textbox, val)
        } else {
            return m("div", {style: style}, [m(port, {dir: vnode.attrs.input ? "left" : "right"}), val])
        }
        
    }
}

const inflow = {
    view: function(vnode) {
        let style = inline.style({
            wrap: {
                marginLeft: "-20px",
                top: "5px",
                position: "relative"
            },
            before: {
                position: "absolute",
                zIndex: "50",
                borderRadius: "var(--corner-size)",
                width: "30px",
                height: "30px",
                marginTop: "-6px",
                clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                backgroundColor: "var(--sidebar-color)",
                borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderBottom: "var(--pixel-size) solid #42494d",
                borderRight: "var(--pixel-size) solid #42494d"
            },
            after: {
                position: "absolute",
                zIndex: "500",
                marginLeft: "-12px",
                marginTop: "-2px",
                width: "22px",
                height: "22px",
                borderRadius: "var(--corner-size)",
                transform: "rotate(45deg)",
                borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderTop: "var(--pixel-size) solid #42494d",
                backgroundColor: "var(--background-color)",
                clipPath: "polygon(0 0, 100% 0, 100% 100%)"
            }
        })
        return m("div", style("wrap"), [m("div", style("before")), m("div", style("after"))]);
    }
}

const outflow = {
    view: function(vnode) {
        let backgroundColor = "var(--sidebar-color)";
        let top = "-37px";
        let left = "12px";
        if (vnode.attrs.body) {
            backgroundColor = "#475054";
            top = "12px";
            left = "16px";
        }
        if (vnode.attrs.case) {
            top = "13px";
            left = "6px";
        }
        let style = inline.style({
            wrap: {
                float: "right",
                position: "relative",
                top: top,
                left: left
            },
            before: {
                position: "absolute",
                zIndex: "1000",
                marginLeft: "-15px",
                marginTop: "-12px",
                width: "23px",
                height: "23px",
                backgroundColor: backgroundColor,
                borderRadius: "var(--corner-size)",
                transform: "rotate(45deg)",
                borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderRight: "var(--pixel-size) solid #42494d",
                clipPath: "polygon(0 0, 100% 0, 100% 100%)"
            }
        })
        return m("div", style("wrap"), [m("div", style("before"))]);
    }
}

const port = {
    view: function(vnode) {
        let style = {
            width: "28px",
            height: "28px",
            backgroundColor: "#475054",
            borderRadius: "50%",
            marginTop: "-1px"
        };
        if (vnode.attrs.dir == "right") {
            style.float = "right";
            style.marginRight = "-29px";
        } else {
            style.position = "absolute";
            style.marginLeft = "-28px";
        }
        return m("div", inline.style(style)({}), m("div", inline.style({
            width: "14px",
            height: "14px",
            left: "7px",
            top: "7px",
            position: "relative",
            backgroundColor: "#2a2a2c",
            borderRadius: "50%"
        })({})))
    }
}

const Textbox = {
    view: function(vnode) {
        let outer = misc.Textbox.style("outer");
        outer['style'].marginRight = "2px";
        outer['style'].marginLeft = "1px";
        let inner = misc.Textbox.style("inner");
        inner['style'].paddingTop = "1px";
        inner['style'].paddingBottom = "1px";
        return m("div", outer, 
                m("div", inner, vnode.children));
    }
}


const BlockHeader = {
    view: function(vnode) {
        let style = inline.style({
            outer: {
                id: vnode.attrs.id+"-header",
                class: "header", 

                height: "var(--grid-size)",
                borderRadius: "var(--corner-size)",
                color: "white",
                textAlign: "left",
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingTop: "0px"
            },
            flow: {
                backgroundColor: "var(--sidebar-color)",
                borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderBottom: "var(--pixel-size) solid #42494d",
                borderRight: "var(--pixel-size) solid #42494d",
            },
            inner: {
                class: "title",

                MozUserSelect: "none",
                paddingTop: "0.25rem",
                paddingBottom: "1.7rem",
                fontSize: "1rem"
            }
        });
        let handlers = {
            oninput: (e) => {
                let id = e.target.parentNode.parentNode.id;
                App.updateBlock(id, {title: e.target.innerHTML});
            },
            ondblclick: (e) => { // fixed the text selection so it doesn't select all in firefox
                var node = e.srcElement;
                if (document.body.createTextRange) {
                    const range = document.body.createTextRange();
                    range.moveToElementText(node);
                    range.select();
                } else if (window.getSelection) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(node);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        };
        let title = m("div[contentEditable]", style("inner", handlers), m.trust(vnode.attrs.title));
        if (vnode.attrs.flow === true) {
            return m("div", style(["flow", "outer"]), [
                m(inflow),
                title,
                m(outflow)
            ]);
        }
        return m("div", style("outer"), title);
    }
}


function stylePropInt(el, prop) {
    return parseInt(styleProp(el, prop), 10);
}

function styleProp(el, prop) {
    return getComputedStyle(el).getPropertyValue(prop);
}
