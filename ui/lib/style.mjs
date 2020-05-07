
class Style {
    static from(style) {
        let s = new Style();
        switch (style.constructor.name) {
            case "Style":
                s._classes = Array.from(style._classes);
                s._linked = Array.from(style._linked);
                break;
            default:
                s = Object.assign(s, style);
        }
        return s;
    }

    constructor(name) {
        this._classes = [];
        this._linked = [];

        if (name) {
            switch (name.constructor.name) {
                case "String":
                    break;
                case "Function":
                    name = name.name;
                    break;
                default:
                    name = name.constructor.name;
            }
            this.add(name);
        }
    }

    _filter(arr) {
        return arr.
            filter(el => el[1]()).
            map(el => el[0]);
    }

    add(cls, condition = () => true) {
        this._classes.push([cls, condition]);
    }

    link(style, condition = () => true) {
        this._linked.push([style, condition]);
    }

    style() {
        let style = {};
        let styles = Array.from(
            this._filter(this._linked).concat([this]));
        styles.reverse();
        styles.forEach(s => {
            style = Object.assign(style, s);
        })
        return style;
    }

    class() {
        let classes = this._classes.concat(
            this._linked
                .map(s => s._classes)
                .flat());
        return this._filter(classes).join(' ');
    }
}

export { Style }