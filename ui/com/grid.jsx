import * as block from "./block.js";
import * as conn from "./conn.js";
import * as shapes from "./shapes.js";
import * as misc from "../lib/misc.js";
import { App } from "../lib/app.js";


export function Grid({attrs,style,hooks,vnode}) {
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
    });

    return (
        <div>
            <div id="draw-cursor" class="hidden" style={{position: "absolute"}}>
                <shapes.ArrowHead color="white" style={{marginTop: "-14px", marginLeft: "-7px"}} />
                <shapes.Circle color="gray" size={16} style={{marginTop: "-12px", marginLeft: "-10px"}} />
            </div>
            <conn.Connectors blocks={blocks} entry={entry} />
            <Preview source={source} />
            {blocks.map((attrs, idx) => {
                attrs["key"] = attrs["id"];
                attrs["idx"] = idx;
                return <block.Block data-idx={idx} {...attrs} />
            })}
            {(App.selected() !== undefined) && <Entrypoint connect={(entry)?`${entry}-in`:undefined} />}
        </div>
    )
}


function Preview({attrs,style,hooks,vnode}) {
    let source = Prism.highlight(misc.htmlDecode(attrs.source), Prism.languages.go, 'go');

    style.add({
        width: "300px",
        height: "500px",
        fontSize: "smaller",
        marginLeft: "900px", //can be changed to left:"1230px" to make its position fixed
        backgroundColor: "transparent",
        border: "0",
        boxShadow: "none",
    })
    return (
        <pre><code class="language-go">{h.trust(source)}</code></pre>
    )
}

function Entrypoint({attrs,style,hooks,state}) {
    var connect = attrs.connect || undefined;

    style.add({
        background: "var(--sidebar-color)", //rgb(75, 126, 28)
        width: "22px",
        height: "150px",
        borderTopRightRadius: "var(--corner-size)",
        borderBottomRightRadius: "var(--corner-size)",
        position: "absolute",
        top: "400px",
        marginLeft: "-34px",
        zIndex: "11",
        
    })
    style.add("invisible", () => !App.selected());

    return (
        <div id="entrypoint">
            <conn.Anchor type="flow" src="entrypoint-out" dst={connect} class="ml-3 my-8" />
            <shapes.ArrowHead id="entrypoint-out" color="var(--sidebar-color)" class="ml-5 my-8" />
        </div>
    )
}
