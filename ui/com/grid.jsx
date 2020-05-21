import * as block from "./block.js";
import * as shapes from "./shapes.js";
import { App } from "../lib/app.js";

var m = h;

export function Grid({attrs,style,hooks,vnode}) {
    hooks.oncreate = () => {
        jsPlumb.setContainer(vnode.dom);
    }

    var blocks = attrs.blocks || [];
    var entry = attrs.entry || "";

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
            <Entrypoint connect={entry} />    
            {blocks.map((attrs) => {
                attrs["key"] = attrs["id"];
                return <block.Block {...attrs} />
            })}
        </div>
    )
}

function Entrypoint({attrs,style,hooks,vnode}) {
    const update = () => App.updateFlow(attrs, "entrypoint-out");
    hooks.oncreate = update;
    hooks.onupdate = update;
    style.setStyle({
        background: "var(--sidebar-color)", //rgb(75, 126, 28)
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
            <shapes.ArrowHead id="entrypoint-out" color="var(--sidebar-color)" class="ml-3 my-8" />
        </div>
    )
}
