import * as block from "./block.js";
import * as shapes from "./shapes.js";
import { App } from "../lib/app.js";

export function Grid({attrs,style,hooks,vnode}) {
    hooks.oncreate = () => {
        jsPlumb.setContainer(vnode.dom);
    }

    var source = attrs.source || "";
    var blocks = attrs.blocks || [];
    var entry = attrs.entry || "";

    style.add({
        userSelect: "none",
        MozUserSelect: "none",
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
            <Entrypoint connect={(entry)?`${entry}-in`:undefined} />
            <Preview source={source} />
            {blocks.map((attrs, idx) => {
                attrs["key"] = attrs["id"];
                return <block.Block data-idx={idx} {...attrs} />
            })}
        </div>
    )
}

function Preview({attrs,style}) {
    style.add({
        width: "300px",
        height: "500px",
        fontSize: "smaller",
        marginLeft: "800px",
    })
    return (
        <pre>{h.trust(attrs.source)}</pre>
    )
}

function Entrypoint({attrs,style,hooks,vnode}) {
    const update = () => App.Outflow_onupdate(attrs, "entrypoint-out");
    hooks.oncreate = update;
    hooks.onupdate = update;
    style.add({
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
