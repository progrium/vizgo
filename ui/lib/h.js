import { Style } from "./style.js";

var _h = {};
export function h(tag, attrs, ...children) {
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
h.trust = m.trust;
window.h = h;

function wrap(v) {
    return {
        view: function(input) {
            let style = new Style(v);
            
            input.hooks = {};
            input.style = style;
            input.vnode = input;

            let output = v(input);
            
            applyAttrs(style, input.attrs);
            applyHooks(output, input.hooks);
            applyStyle(output, style);
            applyEvents(output, input.attrs);
            applyId(output, input.attrs);
            applyData(output, input.attrs);
            
            return output;
        }
    }  
}

function applyData(vnode, attrs) {
    for (let attr in attrs) {
        if (attr.startsWith("data-")) {
            vnode.attrs[attr] = attrs[attr];
        }
    }
}

function applyId(vnode, attrs) {
    if (attrs.id) {
        vnode.attrs.id = attrs.id;
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

function applyEvents(vnode, attrs) {
    for (let attr in attrs) {
        if (attr.startsWith("on")) {
            vnode.attrs[attr] = attrs[attr];
        }
    }
}

function isClass(obj) {
    return obj.prototype.constructor.toString().includes("class ");
}


