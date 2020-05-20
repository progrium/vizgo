import * as atom from "./atom.js";
import * as grid from "./grid.js";
import * as sidebar from "./sidebar.js";

import { session } from "../lib/mock.js";

var m = h;

export function Main({style}) {
    style.setStyle({
        position: "fixed",
        overflow: "auto",
        width: "500%",
        height: "100%",
        display: "flex",
    });
    return (
        <main>
            <sidebar.Sidebar package={session.Package} />
            <atom.Divider />
            <grid.Grid blocks={App.blocks} />
        </main>
    )
}