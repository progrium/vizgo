import "/vnd/mithril-2.0.4.min.js?0";
import "/vnd/jquery-3.5.1.min.js?0";
import "/vnd/jquery-ui-1.12.1.min.js?0";
import "/vnd/jquery-ui-position.min.js?0";
import "/vnd/jquery-contextmenu-2.9.0.min.js?0";
import "/vnd/jsPlumb-2.11.2.min.js?0";

import "/lib/h.js";

import * as hotweb from '/.hotweb/client.mjs'
import * as app from '/lib/app.js';

function wrap(cb) {
    return { view: () => h(cb()) };
}

jsPlumb.ready(function () {
    hotweb.watchCSS();
    hotweb.watchHTML();
    hotweb.refresh(() => h.redraw())
    h.mount(document.body, wrap(() => app.App));
})
