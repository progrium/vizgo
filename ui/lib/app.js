import * as hotweb from '/.hotweb/client.mjs'
import * as misc from './misc.js';
import * as main from '../com/main.js';
import * as conn from '../com/conn.js';

import { Session } from "./session.js";
import { Style } from "./style.js";
import { h } from "./h.js";


class App {
    static init() {
        misc.setupContextMenu();
        misc.setupDivider();
        misc.setupSortables();
        misc.setupDynamicEntrypointPositioning()
        misc.setupNewlinePrevention();


        jsPlumb.bind("ready", function () {
            hotweb.watchCSS();
            hotweb.watchHTML();
            hotweb.refresh(() => h.redraw());

            App.session = new Session(App.redraw, () => {
                
                h.mount(document.body, wrap(() => main.Main));

                if (App.selected()) {
                    App.select(App.selected());
                }
            
            });    
        });
        
    }

    static selected() {
        if (App.session.validState()) {
            return App.session.state.Selected;
        }
    }

    static select(path) {
        Session.select(path);
        App.redraw();
    }

    static redraw() {
        console.log("redraw");
        h.redraw();
        conn.redrawAll();
    }


    static checkPosition({ dom }) { // rewrite this to actually move all the blocks when the sidebar is moved
        if (`${dom.style.left.replace("px", "")}` <= $(".Sidebar").innerWidth()) {
            dom.style.left = $(".Sidebar").innerWidth() + 30 + "px"
        }
    }

    static calculateEndpointWidth (endpoints, fontSize) {
        let copy = [...endpoints]
        for (let i = 0; i < copy.length; i++) {
            copy[i] = ((Math.max(Math.ceil((copy[i].length * fontSize * 0.8) / 40), 2) * 30) / 0.97)
        };
        return Math.max(...copy)
    }

    static Block_onupdate({ attrs, dom }) {
        let block = App.session.blockById(attrs.id || "");

        let fontSize = Style.propInt("font-size", dom);
        let textWidth = block.label.length * fontSize * 0.8;

        let newWidth = (Math.max(Math.ceil(textWidth / 40), 2) * 30) + 30;

        let inputs = block.inputs ? App.calculateEndpointWidth(block.inputs, fontSize) : 0
        let outputs = block.outputs ? App.calculateEndpointWidth(block.outputs, fontSize) : 0

        if (inputs + outputs > newWidth) {
            newWidth = (Math.max(Math.ceil((inputs + outputs) / 30), 2) * 30)
        }

        dom.style.width = newWidth + "px";
    }

    static Block_oncreate(vnode) {
        let {attrs, dom} = vnode
        let size = Style.propInt("--grid-size");
        jsPlumb.draggable(dom, {
            grid: [size, size],
            containment: "parent",
            drag: function(event) {
                conn.redrawAll();
            },
            stop: function (event) {
                let x = event.pos[0]-$(".Sidebar").innerWidth();
                let y = event.pos[1];
                Session.move(`${App.selected()}/Blocks/${vnode.dom.dataset.idx}`, x, y);
            }
        });
        $(window).on('mousemove', null, null, (event) => {
            App.checkPosition({ dom })
        })
        App.Block_onupdate(vnode);
        // when creating a new empty expression block
        if (attrs.label === "") {
            dom.firstChild.firstChild.focus(); // consider re-writing this
        }
    }
}

function wrap(cb) {
    return { view: () => h(cb()) };
}

export { App }

window.App = App;

export const noHMR = true;
