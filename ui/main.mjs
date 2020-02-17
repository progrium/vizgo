import "/vnd/mithril-2.0.4.min.js";
import "/vnd/jquery-3.4.1.min.js";
import "/vnd/jquery-ui-1.12.1.min.js";
import "/vnd/jquery-ui-position.min.js";
import "/vnd/jquery-contextmenu-2.9.0.min.js";
import "/vnd/jsPlumb-2.11.2.min.js";

import * as hmr from '/lib/_hmr.mjs';
import * as app from '/lib/app.mjs';

jsPlumb.ready(function() {
    hmr.watchCSS();
    hmr.refresh(() => m.redraw())
    m.mount(document.body, hmr.wrap(() => app.App));
})

