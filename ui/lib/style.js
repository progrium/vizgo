
class Style {
    static propInt(prop, el=document.documentElement) {
        return parseInt(Style.prop(prop, el), 10);
    }
    
    static prop(prop, el=document.documentElement) {
        return getComputedStyle(el).getPropertyValue(prop);
    }


    static defineClass(name, style, extend) {
        // perhaps rename to declare? you can
        // define more than classes with this...

        style = Style.from(style);
        if (extend) {
            style.extendStyle(extend);
        }

        var el = document.createElement('style');
        el.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(el);

        let rules = [];
        for (let [key, value] of Object.entries(style.style())) {
            rules.push(`${cssName(key)}: ${value};`)
        }

        el.sheet.insertRule(`.${name} { ${rules.join("\n")} }`, 0);
        return style;
    }

    static from(style) {
        let s = new Style();
        switch (style.constructor.name) {
            case "Style":
                return Object.assign(s, style);
            default:
                return Object.assign(s, extractStyle(style));
        }
    }

    constructor(name, style, extend) {
        this._classes = [];
        this._extends = [];

        if (name) {
            this.addClass(name);
        }

        if (style) {
            this.setStyle(style);
        }

        if (extend) {
            this.extendStyle(extend);
        }
    }


    addClass(cls, condition = () => true) {
        if (cls === undefined) {
            return;
        }
        switch (cls.constructor.name) {
            case "String":
                break;
            case "Function":
                cls = cls.name;
                break;
            default:
                cls = cls.constructor.name;
        }
        this._classes.forEach((c) => {
            if (c == cls) {
                return;
            }
        })
        this._classes.push([cls, condition]);
        return this;
    }

    extendStyle(style, condition = () => true) {
        if (style === undefined) {
            return;
        }
        this._extends.push([Style.from(style), condition]);
        return this;
    }

    setStyle(style, condition = () => true) {
        if (style === undefined) {
            return;
        }
        if (condition()) {
            Object.assign(this, extractStyle(style));
        }
        return this;
    }

    style() {
        let style = {};
        let styles = Array.from(
            [this].concat(condFilter(this._extends)));
        styles.reverse();
        styles.forEach(s => {
            style = Object.assign(style, extractStyle(s));
        })
        return style;
    }

    class() {
        let classes = this._classes.concat(
            this._extends
                .map(s => s._classes)
                .flat());
        return [...new Set(condFilter(classes).join(' ').split(' '))].join(' ');
    }

    attrs(attrs = {}) {
        return Object.assign(attrs, {
            class: this.class(),
            style: extractStyle(this.style())
        });
    }
}

function condFilter(arr) {
    return arr.
        filter(el => el !== undefined).
        filter(el => el[1]()).
        map(el => el[0]);
}


function extractStyle(style) {
    let o = {};
    for (let [key, value] of Object.entries(style)) {
        if (key.startsWith("_")) {
            continue;
        }
        o[key] = value;
    }
    return o;
}

function cssName(name) {
    return name.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}

export { Style }