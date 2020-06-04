
export class Session {

    constructor(redraw, onready) {
        this.state = {};
        this.redraw = redraw;

        sess_state().then((state) => {
            console.log("INITIAL STATE", state);
            this.state = state;
            if (onready) {
                onready();
            }
        });    

    }

    blocks() {
        return this.selected().Blocks.map((b) => {
            return Object.assign(clone(BlockTypes[b.type]), b);
        });
    }

    blockById(id) {
        for (let block of this.blocks()) {
            if (block.id === id) {
                return block
            }
        }
        console.log(`Block with id "${id}" doesn't exist!`)
    }

    entry() {
        return this.selected().Entry;
    }

    package() {
        return this.state.Package;
    }

    source() {
        return this.state.Source;
    }

    selected() {
        return this._select(this.state.Selected);
    }

    _select(path) {
        if (!path) {
            return;
        }
        let parts = path.split("/");
        let target = this.state;
        while(parts.length > 0) {
            let part = parts.shift();
            if (!part) {
                continue;
            }
            target = target[part];
        }
        return target;
    }

    update(state) {
        this.state = state;
        this.redraw();
    }

    // remote operations

    static select(fn) {
        sess_select(fn);
    }

    static set(path, value) {
        sess_set(path, value);
    }

    static changeBlockLabel(path, value){
        sess_set(path+"/label", value)
    }

    static move(path, x, y) {
        x = Math.floor(x/30);
        y = Math.floor(y/30);
        sess_set(path+"/Position/0", x);
        sess_set(path+"/Position/1", y);
    }

    static create(type, x, y) {
        x = Math.floor(x/30);
        y = Math.floor(y/30);
        sess_block_create(type, x, y);
    }

    static connect(src, dst) {
        sess_block_connect(src, dst);
    }

    static disconnect(src, dst) {
        sess_block_disconnect(src, dst);
    }
}



function clone(obj) {
    return $.extend(true, {}, obj);
}

const BlockTypes = {
    expr: { 
        flow: false, 
        label: "" 
    },
    call: { 
        label: "()" 
    },
    assign: { 
        label: "Assign", 
        inputs: [""], 
        outputs: ["name?"] 
    },
    return: { 
        out: false, 
        label: "Return" 
    },
    defer: { 
        label: "Defer", 
        outputs: ["defer>"] 
    },
    for: { 
        label: "For     ", 
        inputs: ["exp"], 
        outputs: ["loop>"] 
    },
    send: { 
        label: "Send", 
        inputs: ["ch", "send"] 
    },
    range: { 
        label: "For-Range  ", 
        inputs: ["range"], 
        outputs: ["loop>", "idx", "val"] 
    },
    condition: { 
        label: "Conditional", 
        inputs: [""], 
        outputs: ["if>", "else>"] 
    },
};
