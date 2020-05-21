
import { findFn } from './misc.js';

export class Remote {
    static select(fn) {
        App.session.Selected = fn;
    }

    static connect(src, dst) {
        let decl = findFn(App.session, App.session.Selected);
        if (decl) {
            if (src == "entrypoint") {
                decl.Entry = dst;
                App.entry = dst;
            } else {
                for (let b of decl.Blocks) {
                    if (b.id==src) {
                        b.connect = dst;
                        break;
                    }
                }
            }
            setTimeout(() => App.reloadGrid(), 20);
        }
    }

    static disconnect(src, dst) {
        let decl = findFn(App.session, App.session.Selected);
        if (decl) {
            if (src == "entrypoint") {
                decl.Entry = "";
                App.entry = "";
            } else {
                for (let b of decl.Blocks) {
                    if (b.id==src && b.connect==dst) {
                        b.connect = "";
                        break;
                    }
                }
            }
            setTimeout(() => App.reloadGrid(), 20);
        }
        
    }
}

