export function style(obj) {
    return function(key, attrs) {
        // default attrs value
        if (!attrs) {
            attrs = {};
        }
        // style is key of input obj
        let style = {};
        if (typeof key === 'object') {
            if (Array.isArray(key)) {
                // if key is array, merge multiple keys
                key.forEach((el) => {
                    style = Object.assign(style, obj[el]);
                });
            } else {
                // if key is object, no key -- use obj
                attrs = key;
                style = Object.assign(style, obj);
            }
        } else {
            style = Object.assign(style, obj[key]);
        }
        // pull class and id out of input obj
        attrs['class'] = style['class'];
        attrs['id'] = style['id'];
        delete style['class'];
        delete style['id'];
        // put the rest on style
        attrs['style'] = style;
        // return copy to be safe
        return Object.assign({}, attrs);
    }
}
