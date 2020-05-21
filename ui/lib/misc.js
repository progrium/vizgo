
export function initApp() {
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
    });

    $(window).on('mousemove', null, null, (event) => {
        if (resizeData.tracking) {
            const cursorScreenXDelta = event.screenX - resizeData.startCursorScreenX;
            const snappedCursorScreenXDelta = cursorScreenXDelta - (cursorScreenXDelta % 30);
            const newWidth = resizeData.startWidth + snappedCursorScreenXDelta;
            $(resizeData.resizeTarget).outerWidth(newWidth);
            jsPlumb.repaintEverything();
        }
    });

    $(window).on('mouseup', null, null, (event) => {
        if (resizeData.tracking) {
            resizeData.tracking = false;
        }
    });

    $(document).ready(function () {
        // sidebar declarations sorting
        $(".Stack.flex.flex-col").sortable({
            items: "> div",
            revert: 150,
            tolerance: "intersect",
            handle: ".Dots.mb-1",
            containment: "parent",
            axis: "y",
        });
        $(".Stack.flex.flex-col.pl-1.mt-2").sortable({
            items: "> div",
            revert: 150,
            tolerance: "pointer",
            handle: ".Dots.Grip.mr-1.mt-1.mb-1",
            containment: "parent",
            axis: "y",
        });
    })
}
export function contextMenu() {
    $.contextMenu({
        selector: '.grid',
        build: function ($trigger, e) {
            let mocksubitems = {
                "fold1-key1": { "name": "Foo bar" },
                "fold2": {
                    "name": "Sub group 2",
                    "items": {
                        "fold2-key1": { "name": "alpha" },
                        "fold2-key2": { "name": "bravo" },
                        "fold2-key3": { "name": "charlie" }
                    }
                },
                "fold1-key3": { "name": "delta" }
            };
            return {
                callback: function (key, options) {
                    App.createBlock(BlockTemplates[key]);
                },
                items: {
                    "expr": { name: "Expression" },
                    "locals": { name: "Locals", items: mocksubitems },
                    "imports": { name: "Imports", items: mocksubitems },
                    "builtins": { name: "Builtins", items: mocksubitems },
                    "operators": { name: "Operators", items: mocksubitems },
                    "return": { name: "Return" },
                    "loop": { name: "Loop" },
                    "condition": { name: "Condition" },
                    "assign": { name: "Assign" }
                }
            };
        }
    });
}


export function findFn(sess, fn) {
    let decls = sess.Package.Declarations;
    for (let decl of decls) {
        if (fn.includes("-")) {
            let [cls, name] = fn.split("-");
            if (decl[0] == "type" && decl[1].Name == cls) {
                for (let m of decl[1].Methods) {
                    if (m.Name == name) {
                        return m;
                    }        
                }
            }
        } else {
            if (decl[0] == "function" && decl[1].Name == fn) {
                return decl[1];
            }
        }
    }
    console.warn(fn, "not found");
}