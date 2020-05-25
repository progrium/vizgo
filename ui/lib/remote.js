
import { findFn, nextBlockID } from './misc.js';

export class Remote {
    static select(fn) {
        App.session.Selected = fn;
    }

    static create(type, x, y) {
        let fn = findFn(App.session, App.selected());
        if (fn) {
            let id = nextBlockID(fn, App.selected());
            fn.Blocks.push({
                type: type,
                id: id,
                position: [Math.floor(x/30), Math.floor(y/30)],
            });
            App.reloadGrid();
        }
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

        let decl = findFn(App.session, App.selected());
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

        let decl = findFn(App.session, App.session.Selected);
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

