import { Style } from "./style.js";

function wrap(v) {
    return {
        view: function(input) {
            let style = new Style(v);
            
            input.hooks = {};
            input.style = style;

            let output = v(input);
            
            applyAttrs(style, input.attrs);
            applyHooks(output, input.hooks);
            applyStyle(output, style)
            
            return output;
        }
    }  
}

function applyAttrs(style, attrs) {
    if (attrs.class) {
        style.addClass(attrs.class);
    }
    if (attrs.style) {
        style.setStyle(attrs.style);
    }
}

function applyStyle(vnode, style) {
    if (vnode.attrs.class === undefined) {
        vnode.attrs.class = style.class();
    }
    if (vnode.attrs.style === undefined) {
        vnode.attrs.style = style.style();
    }
}

function applyHooks(vnode, hooks) {
    vnode.attrs = Object.assign(vnode.attrs||{}, hooks);
}

function isClass(obj) {
    return obj.prototype.constructor.toString().includes("class ");
}

var _h = {};
export function h(tag, attrs, children) {
    if (typeof tag === "function" && !isClass(tag) && _h[tag] == undefined) {
        _h[tag] = wrap(tag)
    }
    if (_h[tag]) {
        tag = _h[tag];
    }
    return m(tag, attrs, children);
}
h.redraw = m.redraw;
h.mount = m.mount;
