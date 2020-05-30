
import { selectPath } from './misc.js';

export class Remote {
    static select(fn) {
        sess_select(fn);
    }

    static move(position, blockId) {
        console.log(position, blockId)
    }

    static set(path, value) {
        sess_set(path, value);
    }

    static create(type, x, y) {
        x = Math.floor(x/30);
        y = Math.floor(y/30);
        sess_block_create(type, x, y).then(() => App.reloadGrid());
    }

    static connect(src, dst) {
        var srcPort, dstPort;
        if (src.includes("-")) {
            [src, srcPort] = src.split("-");
        }
        if (dst.includes("-")) {
            [dst, dstPort] = dst.split("-");
            dst = `${dst}-in-${dstPort}`
        }

        let decl = selectPath(App.session, App.selected());
        if (decl) {
            // console.log("DECL", decl);
            if (src == "entrypoint") {
                decl.Entry = dst;
                App.entry = dst;
            } else {
                for (let b of decl.Blocks) {
                    if (b.id==src) {
                        if (!srcPort) {
                            b.connect = dst+"-in";
                        } else {
                            if (srcPort === "expr") {
                                b.connect = dst;
                            } else {
                                b.connects = b.connects || {};
                                b.connects[srcPort] = dst;
                            }
                        }
                        break;
                    }
                }
            }
            setTimeout(() => App.reloadGrid(), 20);
        }
    }

    static disconnect(src, dst) {
        var srcPort, dstPort;
        if (src.includes("-") && dst.includes("-")) {
            [src, srcPort] = src.split("-");
            // [dst, dstPort] = dst.split("-");
        }

        let decl = selectPath(App.session, App.session.Selected);
        if (decl) {
            if (src == "entrypoint") {
                decl.Entry = "";
                App.entry = "";
            } else {
                for (let b of decl.Blocks) {
                    if (b.id==src) {
                        if (!srcPort) {
                            b.connect = "";
                        } else {
                            if (srcPort == "expr") {
                                b.connect = "";
                            } else {
                                if (b.connects) {
                                    delete b.connects[srcPort];
                                }
                            }
                            
                        }
                        break;
                    }
                }
            }
            setTimeout(() => App.reloadGrid(), 20);
        }
        
    }
}

