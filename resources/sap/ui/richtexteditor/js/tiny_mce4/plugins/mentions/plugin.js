/* Ephox mentions plugin
 *
 * Copyright 2010-2016 Ephox Corporation.  All rights reserved.
 *
 * Version: 1.0.1-15
 */
!function(){var a={},b=function(b){for(var c=a[b],e=c.deps,f=c.defn,g=e.length,h=new Array(g),i=0;i<g;++i)h[i]=d(e[i]);var j=f.apply(null,h);if(void 0===j)throw"module ["+b+"] returned undefined";c.instance=j},c=function(b,c,d){if("string"!=typeof b)throw"module id must be a string";if(void 0===c)throw"no dependencies for "+b;if(void 0===d)throw"no definition function for "+b;a[b]={deps:c,defn:d,instance:void 0}},d=function(c){var d=a[c];if(void 0===d)throw"module ["+c+"] was undefined";return void 0===d.instance&&b(c),d.instance},e=function(a,b){for(var c=a.length,e=new Array(c),f=0;f<c;++f)e.push(d(a[f]));b.apply(null,b)},f={};f.bolt={module:{api:{define:c,require:e,demand:d}}};var g=c,h=function(a,b){g(a,[],function(){return b})};h("1",tinymce.PluginManager),h("2",tinymce.util.VK),h("3",tinymce.util.Delay),h("4",tinymce.util.Tools),h("5",document),g("6",[],function(){return"undefined"==typeof console&&(console={log:function(){}}),console}),h("c",tinymce.DOM),h("d",tinymce.geom.Rect),g("b",["c","4","d"],function(a,b,c){var d=function(a){return a=a.cloneRange(),a.setStart(a.startContainer,a.startOffset+1),a},e=function(b,d,e){var f,g;return f=a.getViewPort(),f.w-=30,f.h-=30,g=c.findBestRelativePosition(b,d,f,e),b=c.relativePosition(b,d,g)},f=function(a,b){return h(a,a.dom.getRect(b))},g=function(b,c,d,g){var h,i=f(b,d);h=a.getRect(c),h=e(h,i,g),a.setStyles(c,{position:"absolute",left:h.x,top:h.y})},h=function(b,c){var d;return b.inline||(d=a.getPos(b.getContentAreaContainer()),c.x+=d.x,c.y+=d.y),c};return{exludeFirstCharacter:d,positionRect:e,moveRelativeTo:g,getRectFromEditorElm:f,transposeRelativeToEditorArea:h}}),h("e",tinymce.ui.Menu),g("7",["b","c","e","4","d","5"],function(a,b,c,d,e,f){return function(g,h,i,j){var k,l,m=-1,n=function(c,d){var f,g;g=p(a.exludeFirstCharacter(c.rng)),f=a.positionRect(b.getRect(d.getEl()),e.inflate(g,0,2),["bl-tl","tl-bl","tl-br","bl-tr"]),d.moveTo(f.x,f.y)},o=function(c,d){var e;e=a.positionRect(b.getRect(c),b.getRect(d),["tr-tl","tl-tr","bl-br","br-bl"]),b.setStyles(c,{left:e.x,top:e.y})},p=function(b){var c;return c=b.getClientRects()[0],a.transposeRelativeToEditorArea(g,{x:c.left,y:c.top,w:c.width,h:c.height})},q=function(){l&&(b.remove(l),l=null)},r=function(){q(),k&&(k.remove(),k=null)},s=function(){q(),k&&k.hide()},t=function(a){return d.map(a,function(a){return{text:a.fullName,data:a,onclick:function(){z(this),C()},onmouseenter:function(){z(this)}}})},u=function(){return k?k:(k=new c({onhide:function(){q()},classes:"contextmenu"}).renderTo(),g.on("remove",r),k)},v=function(a){a.getEl().style.width="",a.getEl("body").style.width=""},w=function(a){h(function(b){return 0===b.length?void(k&&k.hide()):(k=u().show(),v(k),k.items().remove(),k.add(t(b)),k.renderNew(),n(a,k),m=-1,void z(k.items()[0]))})},x=function(a){return a.settings.data},y=function(a){j(x(a),function(c){a.getEl().parentNode&&0!==k.items().length&&k.visible()&&(b.setStyles(c,{position:"absolute",left:-65535,top:-65535}),b.add(f.body,c),o(c,a.getEl()),q(),l=c)})},z=function(a){q(),k.items().each(function(b,c){b===a&&m!==c&&(a.hover(),y(a),m=c)})},A=function(){z(k.items()[m-1])},B=function(){z(k.items()[m+1])},C=function(){var a;s(),a=k.items()[m],a&&i(a.settings.data)},D=function(){return k&&k.visible()};return{isVisible:D,selectNext:B,selectPrev:A,showAt:w,hide:s,complete:C}}}),g("8",[],function(){var a=/[\u00a0 \t\r\n]/,b=function(b,c){var d;for(d=c-1;d>=0;d--){if(a.test(b.charAt(d)))return null;if("@"===b.charAt(d))break}return d===-1||c-d<2?null:b.substring(d+1,c)};return{parse:b}}),g("9",["8"],function(a){var b=function(a){return a.collapsed&&3===a.startContainer.nodeType},c=function(c){var d,e,f;return b(c)?(d=c.startContainer,e=c.startOffset,f=a.parse(c.startContainer.data,e),null===f?null:(c=c.cloneRange(),c.setStart(d,e-f.length-1),c.setEnd(d,e),{text:f,rng:c})):null};return{getMentionFromRange:c}}),g("a",["4"],function(a){return function(b){var c=function(){},d=function(a,b){return"function"==typeof a?a:b},e=function(b,c){var e;return b=d(b,c),function(){var c,d;c=a.toArray(arguments),d={};var f=function(a){return function(){d===e&&a.apply(null,arguments)}};c=c.map(function(a){return"function"==typeof a&&(a=f(a)),a}),d=e={},b.apply(null,c)}},f=function(a,b){var c;return c=a.dom.create("span",{class:"mention"}),c.appendChild(a.dom.doc.createTextNode("@"+b.name)),c},g=function(a,b){b([])},h=e(b.mentions_menu_hover,c),i=e(b.mentions_fetch,g),j=d(b.mentions_menu_complete,f),k=d(b.mentions_menu_cancel,c),l=e(b.mentions_select,c);return{hover:h,fetch:i,complete:j,select:l,cancel:k}}}),g("0",["1","2","3","4","5","6","7","8","9","a","b"],function(a,b,c,d,e,f,g,h,i,j,k){var l=function(a){var h,l=new j(a.settings),m={},n="data-mce-mentions-id",o=function(a){f.error(a)},p=function(){return a.settings.mentions_selector||".mention"},q=function(){return i.getMentionFromRange(a.selection.getRng())},r=function(a){return a&&"string"==typeof a.id&&"string"==typeof a.name},s=function(a){r(a)||o("mentions_fetch didn't produce a valid list of users.")},t=function(a){x(a)||o("mentions_complete needs to produce a element that matches selector: "+p())},u=function(a){var b,c;b=q(),b&&(c={term:b.text},l.fetch(c,function(b){d.each(b,s),b=b.slice(0,10),a(d.grep(b,r))}))},v=function(){var b=[],c=d.map(a.dom.select("["+n+"]"),function(a){return a.getAttribute(n)});return d.each(m,function(a){d.inArray(c,a.id)!==-1&&b.push(a)}),b},w=function(b){var c,d;c=l.complete(a,b),t(c)||(d=i.getMentionFromRange(a.selection.getRng()),c.contentEditable=!1,c.setAttribute("data-mce-mentions-id",b.id),m[b.id]=b,a.selection.setRng(d.rng),a.insertContent(c.outerHTML))},x=function(b){return a.dom.is(b,p())},y=function(){h&&(h.parentNode.removeChild(h),h=null)},z=function(b){a.$(p(),b).prop("contentEditable",!1)},A=function(b,c){var d=a.$(p(),b);d.removeAttr("contenteditable"),c||d.removeAttr("data-mce-mentions-id")},B=function(){a.on("SetContent",function(){z(a.getBody(),!0)}),a.on("PreProcess",function(a){A(a.node,a.source_view)}),a.on("ResolveName",function(a){x(a.target)&&(a.name="mention")}),a.on("keypress",c.throttle(F,100)),a.on("keydown",H),a.on("keyup",I),a.on("nodechange",J),a.on("remove",y)},C=new g(a,u,w,l.hover),D=function(a){return a&&a.text.length>=2},E=function(){C.isVisible()&&l.cancel(),C.hide()},F=function(){if(!a.removed){var b=q();D(b)?C.showAt(b):E()}},G=function(a,b){a.preventDefault(),b()},H=function(a){if(!C.isVisible()||b.modifierPressed(a))return void E();switch(a.keyCode){case 27:G(a,E);break;case b.UP:G(a,C.selectPrev);break;case b.DOWN:G(a,C.selectNext);break;case 13:G(a,C.complete)}},I=function(a){a.keyCode===b.BACKSPACE&&F(),a.keyCode!==b.LEFT&&a.keyCode!==b.RIGHT||E()},J=function(b){var c=b.element;x(c)?l.select(c,function(b){y(),h=b,e.body.appendChild(b),k.moveRelativeTo(a,b,c,["bl-tl","tl-bl","tl-br","bl-tr"])}):y()};return B(),{getUsers:v}};return a.add("mentions",l),function(){}}),d("0")()}();
