
class Style {
    static propInt(prop, el=document.documentElement) {
        return parseInt(Style.prop(prop, el), 10);
    }
    
    static prop(prop, el=document.documentElement) {
        return getComputedStyle(el).getPropertyValue(prop);
    }

    static from(...styling) {
        let s = new Style();
        s.add(...styling);
        return s;
    }

    constructor() {
        this._styling = new Set();
    }

    add(...styling) {
        let condition = () => true;
        if (styling.length > 1 && isFunction(last(styling))) {
            condition = styling.pop();
        }
        for (let s of styling) {
            if (s === undefined) {
                continue;
            }
            if (isFunction(s)) {
                s = s.name;
            }
            this._styling.add([s, condition]);
        }
    }

    style() {
        let style = {};
        let styling = filterByConditions(this._styling);
        for (let s of styling) {
            if (isObject(s)) {
                style = Object.assign(style, s);
                continue;
            }
            if (isStyle(s)) {
                style = Object.assign(style, s.style());
            }
        }
        return style;
    }

    class() {
        let classes = new Set();
        let styling = filterByConditions(this._styling);
        for (let s of styling) {
            if (isString(s)) {
                classes.add(s);
                continue;
            }
            if (isStyle(s)) {
                for (let c of s.class().split(' ')) {
                    classes.add(c);
                }
            }
        } 
        return [...classes].join(' ');
    }

    attrs(attrs = {}) {
        return Object.assign(attrs, {
            class: this.class(),
            style: this.style(),
        });
    }
}

function filterByConditions(v) {
    return [...v].filter(el => el[1]()).map(el => el[0]);
}

function isString(v) {
    return v.constructor.name === "String";
}

function isObject(v) {
    return v.constructor.name === "Object";
}

function isStyle(v) {
    return v.constructor.name === "Style" && v._styling;
}

function isFunction(v) {
    return v.constructor.name === "Function";
}

function last(v) {
    return v[v.length-1]
}

export { Style }