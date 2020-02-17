
// TODO: top level component wrapper so we don't have to
//      remount when the top level component is reloaded

let listeners = {};
let refreshers = [];
let ws = undefined;
 
(function connect() {
    ws = new WebSocket(import.meta.url.replace("http", "ws"));
    ws.onopen = () => console.log("hmr websocket open");
    ws.onclose = () => console.log("hmr websocket closed");
    ws.onerror = (err) => console.log("hmr websocket error: ", err);
    ws.onmessage = async (event) => {
        let msg = JSON.parse(event.data);
        let paths = Object.keys(listeners);
        paths.sort((a, b) => b.length - a.length);
        for (const idx in paths) {
            let path = paths[idx];
            if (msg.path.startsWith(path)) {
                for (const i in listeners[path]) {
                    await listeners[path][i]((new Date()).getTime(), msg.path);
                }
            }
        }
        // wtf why aren't refreshers consistently 
        // run after listeners are called.
        // setTimeout workaround seems ok for now
        setTimeout(() => refreshers.forEach((cb) => cb()), 20);
    }; 
})();  

export function accept(path, cb) {
    if (listeners[path] === undefined) {
        listeners[path] = [];
    }
    listeners[path].push(cb);
}

export function refresh(cb) {
    refreshers.push(cb);
    cb();
}

export function watchCSS() {
    accept("", (ts, path) => {
        if (path.endsWith(".css")) {
            let link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', path+'?'+(new Date()).getTime());
            document.getElementsByTagName('head')[0].appendChild(link);
            let styles = document.getElementsByTagName("link");
            for (let i=0; i<styles.length; i++) {
                if (i < styles.length-1 && styles[i].getAttribute("href").startsWith(path)) {
                    styles[i].remove();
                }
            }
        }
    })
}

export function wrap(cb) {
    return {view: () => m(cb())};
}