import * as atom from "./atom.js";
import * as grid from "./grid.js";
import * as sidebar from "./sidebar.js";
import { App } from "../lib/app.js";


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
            <sidebar.Sidebar package={App.session.Package} />
            <atom.Divider />
            <grid.Grid blocks={App.blocks} entry={App.entry} />
        </main>
    )
}