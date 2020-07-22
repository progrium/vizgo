import * as conn from '../com/conn.js';
import { Session } from "./session.js";
import { App } from "./app.js";


export function htmlDecode(input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

export function setupDivider() {
    const selectTarget = (fromElement, selector) => {
        if (!(fromElement instanceof HTMLElement)) {
            return null;
        }
        return fromElement.querySelector(selector);
    };

    const resizeData = {
        tracking: false,
        startWidth: null,
        startCursorScreenX: null,
        handleWidth: 10,
        resizeTarget: null,
        parentElement: null,
        maxWidth: null,
    };

    $(document.body).on('mousedown', '.Divider', null, (event) => {
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const handleElement = event.currentTarget;
        if (!handleElement.parentElement) {
            console.error(new Error("Parent element not found."));
            return;
        }

        // Use the target selector on the handle to get the resize target.
        const targetSelector = handleElement.getAttribute('data-target');
        const targetElement = selectTarget(handleElement.parentElement, targetSelector);
        if (!targetElement) {
            console.error(new Error("Resize target element not found."));
            return;
        }

        resizeData.startWidth = $(targetElement).outerWidth();
        resizeData.startCursorScreenX = event.screenX;
        resizeData.resizeTarget = targetElement;
        resizeData.parentElement = handleElement.parentElement;
        resizeData.maxWidth = $(handleElement.parentElement).innerWidth() - resizeData.handleWidth;
        resizeData.tracking = true;
        resizeData.snappedCursorScreenXDelta = 0
    });

    $(window).on('mousemove', null, null, (event) => {
        if (resizeData.tracking) {
            const cursorScreenXDelta = event.screenX - resizeData.startCursorScreenX;
            const snappedCursorScreenXDelta = cursorScreenXDelta - (cursorScreenXDelta % 30);
            resizeData.snappedCursorScreenXDelta = snappedCursorScreenXDelta
            const newWidth = resizeData.startWidth + snappedCursorScreenXDelta;
            $(resizeData.resizeTarget).outerWidth(newWidth);
            $("#entrypoint")[0].style["margin-left"] = -34 + $(resizeData.resizeTarget).outerWidth()/30/30 + "px";
            conn.redrawAll();
        }
    });

    $(window).on('mouseup', null, null, (event) => {
        if (resizeData.tracking) {
            resizeData.tracking = false;
            App.session.blocks().map(b => {
                if (b) {
                    $("#" + b.id).css("left", parseInt($("#" + b.id).css("left").replace("px","")) + resizeData.snappedCursorScreenXDelta + "px")
                }
            });
            conn.redrawAll();
        }
    });
}


export function setupNewlinePrevention() {
    $(document).ready(function() {

        $('.Block').keydown(function (event) {
            if (event.keyCode === 10 || event.keyCode === 13) {
                // event.preventDefault();
            }
        });
        $('.Textbox').keydown(function (event) {
            if (event.keyCode === 10 || event.keyCode === 13) {
                // event.preventDefault();
            }
        });    
    })
}

export function setupDynamicEntrypointPositioning() {
    $(document).ready(function() {
        $(".Sidebar").scroll(function() {
            $("#entrypoint")[0].style['top'] = $(".selected").position()['top'] + "px";
            conn.redrawAll();
        })
    })
}

export function setupSortables() {
    $(document).ready(function () {
        // sidebar declarations sorting
        $(".Stack.flex.flex-col").sortable({
            start: function(event, ui) {
                ui.item.startPos = ui.item.index();
                console.log(`Old position for ${ui.item}: ` + ui.item.index());
            },
            stop: function(event, ui) {
                console.log(`New position for ${ui.item}: ` + ui.item.index());
                $("#entrypoint")[0].style['top'] = $(".selected").position()['top'] + "px";
                conn.redrawAll();
                //Session.set("package/declarations/1/sidebar_position_index", ui.item.index())
            },
            items: "> div",
            revert: 150,
            tolerance: "intersect",
            handle: ".Dots.mb-1",
            containment: "parent",
            axis: "y",
        });
    })
}

export function setupContextMenu() {

    $.contextMenu({
        selector: '.Block',
        trigger: "right",
        build: function ($dom, e) {
            return {
                callback: function (key, options) {
                    //console.log(key, options, e.target);
                    switch (key) {
                    case "edit":
                        e.target.dispatchEvent(new Event(key));
                        break;
                    }
                },
                items: {
                    "edit": { name: "Edit" },
                    "delete": { name: "Delete" },
                }
            };
        }
    });

    $.contextMenu({
        selector: '#add-decl',
        trigger: "left",
        build: function ($trigger, e) {
            return {
                callback: function (key, options) {
                    let decl = {"Kind": key}
                    switch (key) {
                    case "function":
                        Session.createFn();
                        return;
                    case "type":
                        decl["Type"] = {
                            Name: "_",
                            Type: "struct",
                            Fields: [],
                            Methods: [],
                        };
                        break;
                    case "variables":
                        decl["Variables"] = [{
                            Name: "_",
                        }]
                        break;
                    case "constants":
                        decl["Constants"] = [{
                            Name: "_",
                        }]
                        break;
                    }
                    Session.append("/Package/Declarations", decl);  
                },
                items: {
                    "function": { name: "Function" },
                    "type": { name: "Type" },
                    "variables": { name: "Variable" },
                    "constants": { name: "Constant" },
                }
            };
        }
    });

    $.contextMenu({
        selector: '.Grid',
        build: function ($trigger, e) {
            
            let importMenu = {};
            let imports = App.session.importIDs();
            for (const key in imports) {
                importMenu[key] = {
                    name: key,
                    items: {},
                };
                for (const idx in imports[key]) {
                    let id = imports[key][idx];
                    importMenu[key].items[id] = {
                        name: id,
                        callback: function (_, options) {
                            Session.create("imported", `${key}.${id}()`, e.originalEvent.offsetX, e.originalEvent.offsetY);
                        },
                    };
                }
            }

            let localsMenu = {};
            let locals = App.session.locals();
            for (const idx in locals) {
                let local = locals[idx];
                localsMenu[local] = {
                    name: local,
                    callback: function (key, options) {
                        Session.create("expr", local, e.originalEvent.offsetX, e.originalEvent.offsetY);
                    },
                };
            }

            let pkgMenu = {};
            let pkg = App.session.package();
            for (const idx in pkg.Declarations) {
                let decl = pkg.Declarations[idx];
                switch (decl.Kind) {
                case "function":
                    let fn = decl.Function;
                    pkgMenu[fn.Name] = {
                        name: fn.Name,
                        callback: function (key, options) {
                            Session.create("pkgcall", fn.Name+"()", e.originalEvent.offsetX, e.originalEvent.offsetY);
                        },
                    };
                    break;
                case "type":
                    // TODO
                    break;
                case "constants":
                    decl.Constants.forEach((c) => {
                        pkgMenu[c.Name] = {
                            name: c.Name,
                            callback: function (key, options) {
                                Session.create("expr", c.Name, e.originalEvent.offsetX, e.originalEvent.offsetY);
                            },
                        };
                    });
                    break;
                case "variables":
                    decl.Variables.forEach((v) => {
                        pkgMenu[v.Name] = {
                            name: v.Name,
                            callback: function (key, options) {
                                Session.create("expr", v.Name, e.originalEvent.offsetX, e.originalEvent.offsetY);
                            },
                        };
                    });
                    break;
                }
            }

            let menu = {
                "package": { name: "Package", items: pkgMenu },
                "imports": { name: "Imports", items: importMenu },
                "locals": { name: "Locals", items: localsMenu },
                "expr": { name: "Empty Expression" },
                "assign": { name: "Assign" },
                "loop": { name: "Loop" },
                "condition": { name: "Condition" },
                "return": { name: "Return" },
            };
            if (Object.keys(pkgMenu).length == 0) delete menu["package"];
            if (Object.keys(importMenu).length == 0) delete menu["imports"];
            if (Object.keys(localsMenu).length == 0) delete menu["locals"];
            return {
                callback: function (key, options) {
                    Session.create(key, "expr", e.originalEvent.offsetX, e.originalEvent.offsetY);
                },
                items: menu
            };
        }
    });
}
