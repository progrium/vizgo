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
        let newWidth = (Math.max(Math.ceil(textWidth/40),2)*30)+30;
        let inputListLength = 0;
        let outputListLength = 0;
        if (vnode.attrs.inputs) {
            inputListLength = vnode.attrs.inputs.length
        }
        if (vnode.attrs.outputs) {
            outputListLength = vnode.attrs.outputs.length
        }
        let i;
        for (i = 0; i <  Math.max(inputListLength,outputListLength); i++) {
            let inputWidth = 0
            let outputWidth = 0
            if (vnode.attrs.inputs){
                if (i < vnode.attrs.inputs.length) {
                    inputWidth = (Math.max(Math.ceil((vnode.attrs.inputs[i].length*fontSize*0.8)/40),2)*30)/1.5
                }
            }
            if (vnode.attrs.outputs){
                if (i < vnode.attrs.outputs.length) {
                    outputWidth = (Math.max(Math.ceil((vnode.attrs.outputs[i].length*fontSize*0.8)/40),2)*30)/1.5
                }
            }
            if (inputWidth + outputWidth > newWidth){
                newWidth = (Math.max(Math.ceil((inputWidth+outputWidth)/17),2)*30 + 30) 
            }
        };
        vnode.dom.style.width = newWidth+"px";
        jsPlumb.repaintEverything();
    },
    onupdate: function(vnode) {
        this.autosize(vnode);
    },
    oncreate: function(vnode) {
        let size = stylePropInt(document.documentElement, "--grid-size");
        jsPlumb.draggable(vnode.dom,{
            grid: [size, size],
            containment: "parent",
        });

        this.autosize(vnode);

        // when creating a new empty expression block
        if (vnode.attrs.title === "") {
            vnode.dom.firstChild.firstChild.focus();
        }
    },
    view: function(vnode) {
        let className = "block"
        let flowBlock = false;
        let exprBlock = false;
        if (vnode.attrs.inflow || vnode.attrs.outflow) {
            className += " flow";
            flowBlock = true;
        }
        if (!vnode.attrs.inflow && !vnode.attrs.outflow && !vnode.attrs.outputs) {
            exprBlock = true;
        }
        let gridSize = stylePropInt(document.documentElement, "--grid-size");
        let style = inline.style({
            id: vnode.attrs.id,
            class: className,

            marginLeft: "4px",
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
        let headerAttrs = {
            id: vnode.attrs.id, 
            title: vnode.attrs.title, 
            flow: flowBlock, 
            expr: exprBlock,
            inflow: vnode.attrs.inflow,
            outflow: vnode.attrs.outflow
        };
        let bodyAttrs = {
            id: vnode.attrs.id, 
            inputs: vnode.attrs.inputs, 
            outputs: vnode.attrs.outputs
        };
        return m("div", style({}), [
            m(Header, headerAttrs),
            (vnode.attrs.title == "switch") ?
                m(SwitchBody, bodyAttrs) :
                m(PortsBody, bodyAttrs)
        ])
    }
}

const Header = {
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
                fontSize: "1rem"
            }
        });
        let handlers = {
            oninput: (e) => {
                let id = e.target.parentNode.parentNode.id;
                App.updateBlock(id, {title: e.target.innerHTML});
            },
            ondblclick: (e) => {
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
        }
        let title = m("div[contentEditable]", style("inner", handlers), m.trust(vnode.attrs.title));
        if (vnode.attrs.flow === true) {
            return m("div", style(["flow", "outer"]), [
                (vnode.attrs.inflow)?m(InflowEndpoint):undefined,
                title,
                (vnode.attrs.outflow)?m(OutflowEndpoint):undefined
            ]);
        }
        if (vnode.attrs.expr === true) {
            return m("div", style("outer"), [title, m(Endpoint, {output: true, header: true})]);
        }
        return m("div", style("outer"), title);
    }
}

const SwitchBody = {
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
            m("div", {}, inputs.map((val,idx) => m(Port, {input: true, desc: val}))),
            m("div", style("cases"), [
                m(SwitchCase),
                m(SwitchCase),
                m(SwitchCase)
            ])
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
            m(OutflowEndpoint, {case: true, class: "case"})
        ])
    }
}

const PortsBody = {
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
            m("div", {}, inputs.map((val,idx) => m(Port, {input: true, desc: val}))),
            m("div", {}, outputs.map((val,idx) => m(Port, {output: true, desc: val})))
        ])
    }
}

const Port = {
    view: function(vnode) {
        let style = {
            paddingTop: "2px", 
            height: "28px"
        }
        if (vnode.attrs.input === true) {
            style.marginLeft = "15px";
        }
        if (vnode.attrs.output === true) {
            style.marginRight = "15px";
            style.textAlign = "right";
        }
        let val = vnode.attrs.desc;
        if (val[val.length-1] == ">") {
            val = val.substr(0, val.length-1);
            return m("div", {style: style}, [m(OutflowEndpoint, {body: true}), val])
        }
        if (val[val.length-1] == "?") {
            val = val.substr(0, val.length-1);
            return m(Textbox, val)
        } else {
            return m("div", {style: style}, [m(Endpoint, {output: vnode.attrs.output}), val])
        }
        
    }
}

const InflowEndpoint = {
    oncreate: function(vnode) {
        jsPlumb.addEndpoint(vnode.dom, {
            endpoint: "Blank",
            isTarget: true,
            cssClass: "inflow",
            width: 30, 
            height: 30,
            anchor: [0, 0.5, -1, 0, 0, 10],
            scope: "flow",
        });
    },
    view: function(vnode) {
        let style = inline.style({
            wrap: {
                class: "inflow",

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
                marginTop: "-5.9px",
                marginLeft: "-7px",
                clipPath: "polygon(0 0, 62% 0, 62% 100%, 0 100%, 52% 50%)",
                WebkitClipPath: "polygon(0 0, 62% 0, 62% 100%, 0 100%, 52% 50%)",
                backgroundColor: "var(--sidebar-color)",
                borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderLeft: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderBottom: "var(--pixel-size) solid #42494d",
                borderRight: "var(--pixel-size) solid #42494d",
            },
            after: {
                position: "absolute",
                zIndex: "500",
                marginLeft: "-17px",
                marginTop: "-2px",
                width: "22px",
                height: "22px",
                borderRadius: "var(--corner-size)",
                transform: "rotate(45deg)",
                borderRight: "var(--pixel-size) solid var(--sidebar-outline-color)",
                borderTop: "var(--pixel-size) solid #42494d",
                backgroundColor: "var(--background-color)",
                clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                WebkitClipPath: "polygon(0 0, 100% 0, 100% 100%)",
                opacity: "0",
            }
        })
        return m("div", style("wrap"), [m("div", style("before")), m("div", style("after"))]);
    }
}

function OutflowEndpoint(ivnode) {
    let klass = "outflow";
    let backgroundColor = "var(--sidebar-color)";
    let top = "-9.9px";
    let left = "12px";
    if (ivnode.attrs.body) {
        backgroundColor = "#475054";
        top = "12px";
        left = "16px";
        klass += " body"
    }
    if (ivnode.attrs.case) {
        top = "13px";
        left = "6px";
        klass += " case"
    }
    if (ivnode.attrs.class) {
        klass += ` ${ivnode.attrs.class}`
    }
    return {
        oncreate: function(vnode) {
            jsPlumb.addEndpoint(vnode.dom, {
                endpoint:"Blank",
                isSource: true,
                anchor: [0, 0, 1, 0, 4, 0],
                cssClass: klass,
                scope:"flow",
                connectorStyle:{ stroke:"white", strokeWidth:10 },
                connector:[ "Flowchart", { 
                    alwaysRespectStubs: true,
                    cornerRadius: 4,
                }]
            });
        },
        view: function(vnode) {
            let style = inline.style({
                wrap: {
                    class: klass,
                    float: "right",
                    position: "relative",
                    top: top,
                    left: left
                },
                before: {
                    position: "absolute",
                    zIndex: "1000",
                    marginLeft: "-16px",
                    marginTop: "-12.6px",
                    width: "23px",
                    height: "23px",
                    backgroundColor: backgroundColor,
                    borderRadius: "var(--corner-size)",
                    transform: "rotate(45deg)",
                    borderTop: "var(--pixel-size) solid var(--sidebar-outline-color)",
                    borderRight: "var(--pixel-size) solid #42494d",
                    clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                    WebkitClipPath: "polygon(0 0, 100% 0, 100% 100%)",
                }
            })
            return m("div", style("wrap"), [m("div", style("before"))]);
        }
    }
}

const Endpoint = function(ivnode) {
    let style = {
        class: "endpoint",

        width: "28px",
        height: "28px",
        backgroundColor: "#475054",
        borderRadius: "50%",
        marginTop: "-1px"
    };
    if (ivnode.attrs.output === true) {
        style.float = "right";
        style.marginRight = "-29px";
    } else {
        style.position = "absolute";
        style.marginLeft = "-28px";
    };
    if (ivnode.attrs.header === true) {
        style.marginTop = "-25px";
        style.marginRight = "-24px";
        style.class = "endpoint header";
    }
    return {
        oncreate: function(vnode) {
            if (vnode.attrs.output === true) {
                if (vnode.attrs.header === true) {
                    jsPlumb.addEndpoint(vnode.dom,  {
                        endpoint: "Blank",
                        cssClass: `${style.class} output`,
                        scope: "ports",
                        maxConnections: 1,
                        anchor: [0, 0, 1, 0, 14, 14],
                        isSource: true,
                        connectorStyle: { stroke:"gray", strokeWidth:8 },
                        connector: ["Bezier", {curviness: 100}]
                    });
                } else {
                    jsPlumb.addEndpoint(vnode.dom,  {
                        endpoint: "Blank",
                        cssClass: `${style.class} output`,
                        scope: "ports",
                        maxConnections: -1,
                        anchor: [0, 0, 1, 0, 15, 12],
                        isSource: true,
                        connectorStyle: { stroke:"gray", strokeWidth:8 },
                        connector: ["Bezier", {curviness: 100}]
                    });
                }
            } else {
                jsPlumb.addEndpoint(vnode.dom, {
                    endpoint:"Blank",
                    isTarget: true,
                    cssClass: `${style.class} input`,
                    scope: "ports",
                    anchor: [0, 0, -1, 0, 12, 12],
                    connectorStyle: { stroke:"gray", strokeWidth:8 },
                    connector: ["Bezier", {curviness: 100}]
                });
            }
        },
        view: function(vnode) {
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

function stylePropInt(el, prop) {
    return parseInt(styleProp(el, prop), 10);
}

function styleProp(el, prop) {
    return getComputedStyle(el).getPropertyValue(prop);
}
