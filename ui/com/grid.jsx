import * as block from "./block.js";
import * as shapes from "./shapes.js";

var m = h;

export function Grid({attrs,style,hooks,vnode}) {
    hooks.oncreate = () => {
        jsPlumb.setContainer(vnode.dom);
        jsPlumb.bind("beforeDrop", function (params) {
            console.log(params);
            return true;
        });
    }

    style.setStyle({
        backgroundSize: "var(--grid-size) var(--grid-size)",
        backgroundColor: "var(--background-color)",
        backgroundImage: "radial-gradient(#202020 2px, transparent 0)",
        backgroundPosition: "calc(-0.5 * var(--grid-size)) calc(-0.5 * var(--grid-size))",
        padding: "var(--grid-size) var(--grid-size)",
        height: "100%",
        order: "0",
        flex: "1 1 auto",
        alignSelf: "auto",
        border: "1px solid var(--outline-color)",
    });

    return (
        <div>
            <Entrypoint connect={(attrs.blocks.length>0) ? attrs.blocks[0].id : undefined} />    
            {attrs.blocks.map((attrs) => {
                attrs["key"] = attrs["id"];
                return <block.Block {...attrs} />
            })}
        </div>
    )
}

function Entrypoint({attrs,style,hooks}) {
    const update = ({ dom }) => {
        jsPlumb.removeAllEndpoints(dom);
        jsPlumb.addEndpoint(dom, {
            endpoint: "Blank",
            isSource: true,
            anchor: [0, 0, 1, 0, 0, 14],
            cssClass: "entry",
            scope: "flow",
            connectorStyle: { stroke: "white", strokeWidth: 10 },
            connector: ["Flowchart", {
                alwaysRespectStubs: true,
                cornerRadius: 4,
            }]
        });
        if (attrs.connect) {
            setTimeout(() => {
                jsPlumb.connect({
                    source: dom.id,
                    target: attrs.connect,
                    paintStyle: { stroke: "white", strokeWidth: 10 },
                    connector: ["Flowchart", {
                        alwaysRespectStubs: true,
                        cornerRadius: 4,
                    }],
                    endpoint: "Blank",
                    anchors: [[0, 0, 1, 0, 4, 0], [0, 0.5, -1, 0, 0, 10]]
                });
            }, 20);
        }
    }
    hooks.oncreate = update;
    hooks.onupdate = update;
    style.setStyle({
        background: "rgb(75, 126, 28) ",
        width: "16px",
        height: "150px",
        borderTopRightRadius: "var(--corner-size)",
        borderBottomRightRadius: "var(--corner-size)",
        position: "absolute",
        top: "400px",
        marginLeft: "-34px",
        
    })
    return (
        <div id="entrypoint">
            <shapes.ArrowHead color="rgb(75, 126, 28)" class="ml-3 my-8" />
        </div>
    )
}
