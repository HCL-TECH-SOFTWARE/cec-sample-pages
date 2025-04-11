/* ======================================================================== *
 * Copyright 2025 HCL America Inc.                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 * http://www.apache.org/licenses/LICENSE-2.0                               *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 * ======================================================================== */

/* ************************************************************************ */
/* HCL XCC Namespace                                                        */
/* ************************************************************************ */
((X) => {
    X.HCL = X.HCL || {};
    X.HCL.CONNECT = X.HCL.CONNECT || {};
})(XCC);
/* ************************************************************************ */
/* END HCL XCC Namespace                                                    */
/* ************************************************************************ */


/* ************************************************************************ */
/* HCL Connect Base                                                         */
/* ************************************************************************ */
(() => {
    const createNode = (tagName, attrs = {}) => {
        const node = document.createElement(tagName);
        Object.keys(attrs).forEach((attrName) => {
            node.setAttribute(attrName, attrs[attrName]);
        });
        return node;
    };

    const createMarkup = () => {
        const container = createNode("div", {"id": "hclc-top"});
        container.style.display = "none";

        const tn = createNode("div", {"id": "hclc-tn", "class": "hclc-tn"});
        container.appendChild(tn);

        const qn = createNode("div", {"id": "hclc-qn", "class": "hclc-tn"});
        container.appendChild(qn);

        const btn = createNode("button", {"class": "hclc-quick-nav-entry hclc-qn-btn"});
        btn.innerText = "Quick Nav for everything else...";
        qn.appendChild(btn);
 
        const qnMenu = createNode("div", {"class": "hclc-qn-menu"});
        qn.appendChild(qnMenu);
 
        return container;
    };

    // inject required HTML
    document.getElementById("xccMain").appendChild(createMarkup());
})();
/* ************************************************************************ */
/* END HCL Connect Base                                                     */
/* ************************************************************************ */


/* ************************************************************************ */
/* HCL Connect Quick Nav                                                    */
/* ************************************************************************ */
((X) => {
    const container$ = $("#hclc-qn");
    const btn$ = container$.find(".hclc-qn-btn");
    const menu$ = container$.find(".hclc-qn-menu");

    const getMenuJson = (() => {
        let menuJSON;
        
        const getter = async () => {
            if (!menuJSON) {
                const response = await fetch("/xcc/rest/files/custom/quicknav.json", {
                    method: 'GET',
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    redirect: 'follow', // manual, *follow, error
                    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                });
                menuJSON = await response.json();
            }
            return menuJSON;
        };

        return getter;
    })();

    const renderMenu = (entries = [], level = 0) => {

        const createEntry = (entry = {}) => {
            const css = {
                "color": "#000000 !important"
            };
    
            if (entry.bg) {
                css["background-color"] = entry.bg;
            }
            const li$ = $("<li/>");
            const a$ = $("<a/>", {
                    "title": entry.title,
                    "class": "hclc-quick-nav-entry" + (entry.bg ? " hclc-quick-nav-entry-bold" : "")
                }).html(entry.title)
                //.css(css)
                .addClass(entry.class);
            if (entry.link) {
                a$.attr({
                    "href": entry.link,
                    "target": entry.target
                });
            } else {
                a$.on("click", toggleQuickNav);
            }
            li$.append(a$);
            
            if (entry.entries && entry.entries.length) {
                const subMenu$ = renderMenu(entry.entries, level + 1).hide();
                li$.on("click", (e) => {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const state = subMenu$.attr("data-open");
                    if ("true" === state) {
                        subMenu$.slideUp(400, () => {
                            subMenu$.attr("data-open", "false");
                            a$.removeClass("open");
                        });
                    } else if (!state || "false" === state) {
                        subMenu$.slideDown(400, () => {
                            subMenu$.attr("data-open", "true");
                            a$.addClass("open");
                        });
                    }
                });
                li$.append(subMenu$);
            }
            return li$;
        };

        const ul$ = $("<ul/>", {
            "class": `hclc-qn-list hclc-qn-list-level-${("0" + level).substring(-2)}`
        });

        return ul$.append(entries.map(createEntry));
    };
    
    const toggleQuickNav = async (e) => {
        if (e.currentTarget !== btn$[0]) {
            return;
        }
        btn$.prop('disabled', true);
        const state = menu$.attr("data-open");
        if ("true" === state) {
            menu$.children().first().slideUp(400, () => {
                menu$.attr("data-open", "false");
                menu$.hide().empty();
                btn$.prop('disabled', false)
                    .removeClass("open");
            });
        } else if (!state || "false" === state) {
            const data = await getMenuJson();
            menu$.hide()
                .css({
                    maxWidth: btn$.outerWidth() + "px",
                    width: btn$.outerWidth() + "px",
                    minWidth: btn$.outerWidth() + "px"
                }).empty();
            const list$ = renderMenu(data.entries);
            menu$.append(list$.hide()).show();
            list$.slideDown(400, () => {
                menu$.attr("data-open", "true");
                btn$.prop('disabled', false)
                    .addClass("open");
            });
        } // ignore otherwise as operation is in progress
    };
    
    btn$.on("click", toggleQuickNav);

    X.HCL = X.HCL || {};
    X.HCL.CONNECT = X.HCL.CONNECT || {};
    X.HCL.CONNECT.QuickNav = X.HCL.CONNECT.QuickNav || {};
})(XCC);
/* ************************************************************************ */
/* END HCL Connect Quick Nav                                                */
/* ************************************************************************ */


/* ************************************************************************ */
/* HCL Connect Top Nav                                                      */
/* ************************************************************************ */
((X) => {
    const container$ = $("#hclc-tn");

    const getMenuJson = (() => {
        let menuJSON;
        
        const getter = async () => {
            if (!menuJSON) {
                const response = await fetch("/xcc/rest/files/custom/topnav.json", {
                    method: 'GET',
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    redirect: 'follow', // manual, *follow, error
                    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                });
                menuJSON = await response.json();
            }
            return menuJSON;
        };

        return getter;
    })();

    const getNum = numLike => (+numLike || 0);

    const getHexColorCode = (code = "", defColor = "000000") => {
        return (code.match(/((?:[a-eA-E0-9]{3}){1,2})/) || [] )[0] || defColor;
    };

    const createGradient = (top = "#C00D0D", bottom = "#CA5001", rotation = 0) => {
        return `linear-gradient(${getNum(rotation)}deg, #${getHexColorCode(top)}, #${getHexColorCode(bottom)})`;
    };

    const createEntry = (entry = {}) => {
        const css = {
            "background-image": createGradient(entry.start, entry.end, entry.rotation)
        };

        let ret = $("<a/>", {
            "class": "entry",
            "title": entry.title,
            "href": entry.link || "#",
            "target": entry.target || "_self"
        });

        ret.append([
            $("<span/>", {"class": "sep"}).css(css),
            $("<span/>", {
                "class": "label",
            }).text(entry.title)
        ]);

        return ret;
    };
    
    getMenuJson().then(data => {
        const menu$ = container$.hide().empty();
        menu$.append($("<span/>", {
            "class": "logo"
        }));

        const entries$ = $("<span/>", {
                "class": "links"
            }).append(data.entries.map(createEntry));
        const menuToggle$ = $("<a/>", {
            "href": "javascript:void(0);",
            "class": "icon"
        }).on("click", () => {
            entries$.toggleClass("open");
            menu$.toggleClass("open");
        }).append($("<span/>").addClass("fa fa-bars"));
        entries$.append(menuToggle$);

        menu$.append(entries$).fadeIn();
    });

    X.HCL = X.HCL || {};
    X.HCL.CONNECT = X.HCL.CONNECT || {};
    X.HCL.CONNECT.TopNav = X.HCL.CONNECT.TopNav || {};
    X.HCL.CONNECT.TopNav["createEntry"] = createEntry;
    X.HCL.CONNECT.TopNav["getMenuJson"] = getMenuJson;
})(XCC);
/* ************************************************************************ */
/* END HCL Connect Top Nav                                                  */
/* ************************************************************************ */


/* ************************************************************************ */
/* HCL Connect TopRow                                                       */
/* ************************************************************************ */
((X) => {
    // $("[role=banner]").hide();
	
    const container$ = $("#hclc-top");
    // the query targets the top navigation in regular cec pages and the tabbed navigation in community pages
    // const query = ".lotusFrame .lotusTitleBar2 .lotusInner .lotusHeading, .lotusFrame .tabNavBar";
    const query = ".lotusFrame .lotusMain";

    $(query).first().before(container$);

    X.HCL = X.HCL || {};
    X.HCL.CONNECT = X.HCL.CONNECT || {};
    X.HCL.CONNECT.TopRow = X.HCL.CONNECT.TopRow || {};
})(XCC);
/* ************************************************************************ */
/* END HCL Connect TopRow                                                   */
/* ************************************************************************ */


/* ************************************************************************ */
/* Inject SourceLinks to NewsOverview                                       */
/* ************************************************************************ */
((X) => {
    const getMenuEntryForHandle = async (handle) => {
        data = await X.HCL.CONNECT.TopNav.getMenuJson();
        return $.grep(data.entries, (entry) => entry.handle === handle)[0] || {
				end: "333333",
				handle: handle,
				link: "/communities/service/html/communityoverview?communityUuid=" + handle,
				start: "222222",
				target: "_blank",
				title: "Blog"
			};
    };

    const handleClick = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
    };

    const injectCategoryLink = (node, handle) => {
        const node$ = $(node);
        const entries$ = node$.find(">.entry")
        if (!entries$.length) {
            getMenuEntryForHandle(handle).then((menuEntry) => {
                node$
                    .addClass("hclc-tn")
                    .append(X.HCL.CONNECT.TopNav
                        .createEntry(menuEntry)
                        .on("click", handleClick)
                    );
            });
        }
    };

    const newsOverviewLoadedHandler = (ignore, container) => {
        const container$ = $(container);

        container$.find("> div").each((ignore, postNode) => {
            const postNode$ = $(postNode);
            const handleMatch = postNode$.data("anchor").match(/(?:\/)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/)/i);
            const handle = handleMatch ? handleMatch[1] : null;
            injectCategoryLink(postNode$.find(".xccEntry"), handle);
        });

		const loadHandler = function() {
			this.style.opacity = 1;
			$(this).addClass("loaded");
		};

        container$.find("img").unveil(200, function() {
            $(this).load(loadHandler);
        });
        container$.find("img").one("load", loadHandler);
        container$.find("img").trigger("unveil");
    };

    const topNewsLoadedHandler = (ignore, container) => {
        const container$ = $(container);

        container$.find("> div").each((ignore, postNode) => {
            const postNode$ = $(postNode);
            const handleMatch = postNode$.data("anchor").match(/(?:\/)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/)/i);
            const handle = handleMatch ? handleMatch[1] : null;
            injectCategoryLink(postNode$.find(".topNewsContent"), handle);
        });

		const loadHandler = function() {
			this.style.opacity = 1;
			$(this).addClass("loaded");
		};

        container$.find("img").unveil(200, function() {
            $(this).load(loadHandler);
        });
        container$.find("img").one("load", loadHandler);
        container$.find("img").trigger("unveil");

	};

    X.M.subscribe('xcc.widget.xccNewsOverview', newsOverviewLoadedHandler);
    X.M.subscribe('xcc.widget.xccTopNews', topNewsLoadedHandler);
})(XCC);
/* ************************************************************************ */
/* END Inject SourceLinks to NewsOverview                                   */
/* ************************************************************************ */
