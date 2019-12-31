"no use strict";;(function(w){if(typeof w.window!="undefined"&&w.document)return;if(w.require&&w.define)return;if(!w.console){w.console=function(){var a=Array.prototype.slice.call(arguments,0);postMessage({type:"log",data:a});};w.console.error=w.console.warn=w.console.log=w.console.trace=w.console;}w.window=w;w.ace=w;w.onerror=function(a,f,l,c,e){postMessage({type:"error",data:{message:a,data:e.data,file:f,line:l,col:c,stack:e.stack}});};w.normalizeModule=function(p,a){if(a.indexOf("!")!==-1){var c=a.split("!");return w.normalizeModule(p,c[0])+"!"+w.normalizeModule(p,c[1]);}if(a.charAt(0)=="."){var b=p.split("/").slice(0,-1).join("/");a=(b?b+"/":"")+a;while(a.indexOf(".")!==-1&&d!=a){var d=a;a=a.replace(/^\.\//,"").replace(/\/\.\//,"/").replace(/[^\/]+\/\.\.\//,"");}}return a;};w.require=function require(p,i){if(!i){i=p;p=null;}if(!i.charAt)throw new Error("worker.js require() accepts only (parentId, id) as arguments");i=w.normalizeModule(p,i);var a=w.require.modules[i];if(a){if(!a.initialized){a.initialized=true;a.exports=a.factory().exports;}return a.exports;}if(!w.require.tlns)return console.log("unable to load "+i);var b=r(i,w.require.tlns);if(b.slice(-3)!=".js")b+=".js";w.require.id=i;w.require.modules[i]={};importScripts(b);return w.require(p,i);};function r(a,p){var t=a,b="";while(t){var c=p[t];if(typeof c=="string"){return c+b;}else if(c){return c.location.replace(/\/*$/,"/")+(b||c.main||c.name);}else if(c===false){return"";}var i=t.lastIndexOf("/");if(i===-1)break;b=t.substr(i)+b;t=t.slice(0,i);}return a;}w.require.modules={};w.require.tlns={};w.define=function(i,d,f){if(arguments.length==2){f=d;if(typeof i!="string"){d=i;i=w.require.id;}}else if(arguments.length==1){f=i;d=[];i=w.require.id;}if(typeof f!="function"){w.require.modules[i]={exports:f,initialized:true};return;}if(!d.length)d=["require","exports","module"];var a=function(c){return w.require(i,c);};w.require.modules[i]={exports:{},factory:function(){var b=this;var c=f.apply(this,d.map(function(e){switch(e){case"require":return a;case"exports":return b.exports;case"module":return b;default:return a(e);}}));if(c)b.exports=c;return b;}};};w.define.amd={};require.tlns={};w.initBaseUrls=function initBaseUrls(t){for(var i in t)require.tlns[i]=t[i];};w.initSender=function initSender(){var E=w.require("ace/lib/event_emitter").EventEmitter;var o=w.require("ace/lib/oop");var S=function(){};(function(){o.implement(this,E);this.callback=function(d,c){postMessage({type:"call",id:c,data:d});};this.emit=function(n,d){postMessage({type:"event",name:n,data:d});};}).call(S.prototype);return new S();};var m=w.main=null;var s=w.sender=null;w.onmessage=function(e){var a=e.data;if(a.event&&s){s._signal(a.event,a.data);}else if(a.command){if(m[a.command])m[a.command].apply(m,a.args);else if(w[a.command])w[a.command].apply(w,a.args);else throw new Error("Unknown command:"+a.command);}else if(a.init){w.initBaseUrls(a.tlns);require("ace/lib/es5-shim");s=w.sender=w.initSender();var c=require(a.module)[a.classname];m=w.main=new c(s);}};})(this);define("ace/lib/oop",["require","exports","module"],function(r,e,m){"use strict";e.inherits=function(c,s){c.super_=s;c.prototype=Object.create(s.prototype,{constructor:{value:c,enumerable:false,writable:true,configurable:true}});};e.mixin=function(o,a){for(var k in a){o[k]=a[k];}return o;};e.implement=function(p,a){e.mixin(p,a);};});define("ace/range",["require","exports","module"],function(r,e,m){"use strict";var c=function(p,a){return p.row-a.row||p.column-a.column;};var R=function(s,a,b,d){this.start={row:s,column:a};this.end={row:b,column:d};};(function(){this.isEqual=function(a){return this.start.row===a.start.row&&this.end.row===a.end.row&&this.start.column===a.start.column&&this.end.column===a.end.column;};this.toString=function(){return("Range: ["+this.start.row+"/"+this.start.column+"] -> ["+this.end.row+"/"+this.end.column+"]");};this.contains=function(a,b){return this.compare(a,b)==0;};this.compareRange=function(a){var b,d=a.end,s=a.start;b=this.compare(d.row,d.column);if(b==1){b=this.compare(s.row,s.column);if(b==1){return 2;}else if(b==0){return 1;}else{return 0;}}else if(b==-1){return-2;}else{b=this.compare(s.row,s.column);if(b==-1){return-1;}else if(b==1){return 42;}else{return 0;}}};this.comparePoint=function(p){return this.compare(p.row,p.column);};this.containsRange=function(a){return this.comparePoint(a.start)==0&&this.comparePoint(a.end)==0;};this.intersects=function(a){var b=this.compareRange(a);return(b==-1||b==0||b==1);};this.isEnd=function(a,b){return this.end.row==a&&this.end.column==b;};this.isStart=function(a,b){return this.start.row==a&&this.start.column==b;};this.setStart=function(a,b){if(typeof a=="object"){this.start.column=a.column;this.start.row=a.row;}else{this.start.row=a;this.start.column=b;}};this.setEnd=function(a,b){if(typeof a=="object"){this.end.column=a.column;this.end.row=a.row;}else{this.end.row=a;this.end.column=b;}};this.inside=function(a,b){if(this.compare(a,b)==0){if(this.isEnd(a,b)||this.isStart(a,b)){return false;}else{return true;}}return false;};this.insideStart=function(a,b){if(this.compare(a,b)==0){if(this.isEnd(a,b)){return false;}else{return true;}}return false;};this.insideEnd=function(a,b){if(this.compare(a,b)==0){if(this.isStart(a,b)){return false;}else{return true;}}return false;};this.compare=function(a,b){if(!this.isMultiLine()){if(a===this.start.row){return b<this.start.column?-1:(b>this.end.column?1:0);}}if(a<this.start.row)return-1;if(a>this.end.row)return 1;if(this.start.row===a)return b>=this.start.column?0:-1;if(this.end.row===a)return b<=this.end.column?0:1;return 0;};this.compareStart=function(a,b){if(this.start.row==a&&this.start.column==b){return-1;}else{return this.compare(a,b);}};this.compareEnd=function(a,b){if(this.end.row==a&&this.end.column==b){return 1;}else{return this.compare(a,b);}};this.compareInside=function(a,b){if(this.end.row==a&&this.end.column==b){return 1;}else if(this.start.row==a&&this.start.column==b){return-1;}else{return this.compare(a,b);}};this.clipRows=function(f,l){if(this.end.row>l)var a={row:l+1,column:0};else if(this.end.row<f)var a={row:f,column:0};if(this.start.row>l)var s={row:l+1,column:0};else if(this.start.row<f)var s={row:f,column:0};return R.fromPoints(s||this.start,a||this.end);};this.extend=function(a,b){var d=this.compare(a,b);if(d==0)return this;else if(d==-1)var s={row:a,column:b};else var f={row:a,column:b};return R.fromPoints(s||this.start,f||this.end);};this.isEmpty=function(){return(this.start.row===this.end.row&&this.start.column===this.end.column);};this.isMultiLine=function(){return(this.start.row!==this.end.row);};this.clone=function(){return R.fromPoints(this.start,this.end);};this.collapseRows=function(){if(this.end.column==0)return new R(this.start.row,0,Math.max(this.start.row,this.end.row-1),0);else return new R(this.start.row,0,this.end.row,0)};this.toScreenRange=function(s){var a=s.documentToScreenPosition(this.start);var b=s.documentToScreenPosition(this.end);return new R(a.row,a.column,b.row,b.column);};this.moveBy=function(a,b){this.start.row+=a;this.start.column+=b;this.end.row+=a;this.end.column+=b;};}).call(R.prototype);R.fromPoints=function(s,a){return new R(s.row,s.column,a.row,a.column);};R.comparePoints=c;R.comparePoints=function(p,a){return p.row-a.row||p.column-a.column;};e.Range=R;});define("ace/apply_delta",["require","exports","module"],function(r,e,m){"use strict";function t(d,a){console.log("Invalid Delta:",d);throw"Invalid Delta: "+a;}function p(d,a){return a.row>=0&&a.row<d.length&&a.column>=0&&a.column<=d[a.row].length;}function v(d,a){if(a.action!="insert"&&a.action!="remove")t(a,"delta.action must be 'insert' or 'remove'");if(!(a.lines instanceof Array))t(a,"delta.lines must be an Array");if(!a.start||!a.end)t(a,"delta.start/end must be an present");var s=a.start;if(!p(d,a.start))t(a,"delta.start must be contained in document");var b=a.end;if(a.action=="remove"&&!p(d,b))t(a,"delta.end must contained in document for 'remove' actions");var n=b.row-s.row;var c=(b.column-(n==0?s.column:0));if(n!=a.lines.length-1||a.lines[n].length!=c)t(a,"delta.range must match delta lines");}e.applyDelta=function(d,a,b){var c=a.start.row;var s=a.start.column;var l=d[c]||"";switch(a.action){case"insert":var f=a.lines;if(f.length===1){d[c]=l.substring(0,s)+a.lines[0]+l.substring(s);}else{var g=[c,1].concat(a.lines);d.splice.apply(d,g);d[c]=l.substring(0,s)+d[c];d[c+a.lines.length-1]+=l.substring(s);}break;case"remove":var h=a.end.column;var i=a.end.row;if(c===i){d[c]=l.substring(0,s)+l.substring(h);}else{d.splice(c,i-c+1,l.substring(0,s)+d[i].substring(h));}break;}}});define("ace/lib/event_emitter",["require","exports","module"],function(r,a,m){"use strict";var E={};var s=function(){this.propagationStopped=true;};var p=function(){this.defaultPrevented=true;};E._emit=E._dispatchEvent=function(b,e){this._eventRegistry||(this._eventRegistry={});this._defaultHandlers||(this._defaultHandlers={});var l=this._eventRegistry[b]||[];var d=this._defaultHandlers[b];if(!l.length&&!d)return;if(typeof e!="object"||!e)e={};if(!e.type)e.type=b;if(!e.stopPropagation)e.stopPropagation=s;if(!e.preventDefault)e.preventDefault=p;l=l.slice();for(var i=0;i<l.length;i++){l[i](e,this);if(e.propagationStopped)break;}if(d&&!e.defaultPrevented)return d(e,this);};E._signal=function(b,e){var l=(this._eventRegistry||{})[b];if(!l)return;l=l.slice();for(var i=0;i<l.length;i++)l[i](e,this);};E.once=function(e,c){var _=this;c&&this.addEventListener(e,function newCallback(){_.removeEventListener(e,newCallback);c.apply(null,arguments);});};E.setDefaultHandler=function(e,c){var h=this._defaultHandlers;if(!h)h=this._defaultHandlers={_disabled_:{}};if(h[e]){var o=h[e];var d=h._disabled_[e];if(!d)h._disabled_[e]=d=[];d.push(o);var i=d.indexOf(c);if(i!=-1)d.splice(i,1);}h[e]=c;};E.removeDefaultHandler=function(e,c){var h=this._defaultHandlers;if(!h)return;var d=h._disabled_[e];if(h[e]==c){var o=h[e];if(d)this.setDefaultHandler(e,d.pop());}else if(d){var i=d.indexOf(c);if(i!=-1)d.splice(i,1);}};E.on=E.addEventListener=function(e,c,b){this._eventRegistry=this._eventRegistry||{};var l=this._eventRegistry[e];if(!l)l=this._eventRegistry[e]=[];if(l.indexOf(c)==-1)l[b?"unshift":"push"](c);return c;};E.off=E.removeListener=E.removeEventListener=function(e,c){this._eventRegistry=this._eventRegistry||{};var l=this._eventRegistry[e];if(!l)return;var i=l.indexOf(c);if(i!==-1)l.splice(i,1);};E.removeAllListeners=function(e){if(this._eventRegistry)this._eventRegistry[e]=[];};a.EventEmitter=E;});define("ace/anchor",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(r,e,m){"use strict";var o=r("./lib/oop");var E=r("./lib/event_emitter").EventEmitter;var A=e.Anchor=function(d,a,c){this.$onChange=this.onChange.bind(this);this.attach(d);if(typeof c=="undefined")this.setPosition(a.row,a.column);else this.setPosition(a,c);};(function(){o.implement(this,E);this.getPosition=function(){return this.$clipPositionToDocument(this.row,this.column);};this.getDocument=function(){return this.document;};this.$insertRight=false;this.onChange=function(d){if(d.start.row==d.end.row&&d.start.row!=this.row)return;if(d.start.row>this.row)return;var p=a(d,{row:this.row,column:this.column},this.$insertRight);this.setPosition(p.row,p.column,true);};function $(p,b,c){var C=c?p.column<=b.column:p.column<b.column;return(p.row<b.row)||(p.row==b.row&&C);}function a(d,p,b){var c=d.action=="insert";var f=(c?1:-1)*(d.end.row-d.start.row);var g=(c?1:-1)*(d.end.column-d.start.column);var h=d.start;var i=c?h:d.end;if($(p,h,b)){return{row:p.row,column:p.column};}if($(i,p,!b)){return{row:p.row+f,column:p.column+(p.row==i.row?g:0)};}return{row:h.row,column:h.column};}this.setPosition=function(b,c,n){var p;if(n){p={row:b,column:c};}else{p=this.$clipPositionToDocument(b,c);}if(this.row==p.row&&this.column==p.column)return;var d={row:this.row,column:this.column};this.row=p.row;this.column=p.column;this._signal("change",{old:d,value:p});};this.detach=function(){this.document.removeEventListener("change",this.$onChange);};this.attach=function(d){this.document=d||this.document;this.document.on("change",this.$onChange);};this.$clipPositionToDocument=function(b,c){var p={};if(b>=this.document.getLength()){p.row=Math.max(0,this.document.getLength()-1);p.column=this.document.getLine(p.row).length;}else if(b<0){p.row=0;p.column=0;}else{p.row=b;p.column=Math.min(this.document.getLine(p.row).length,Math.max(0,c));}if(c<0)p.column=0;return p;};}).call(A.prototype);});define("ace/document",["require","exports","module","ace/lib/oop","ace/apply_delta","ace/lib/event_emitter","ace/range","ace/anchor"],function(r,e,m){"use strict";var o=r("./lib/oop");var a=r("./apply_delta").applyDelta;var E=r("./lib/event_emitter").EventEmitter;var R=r("./range").Range;var A=r("./anchor").Anchor;var D=function(t){this.$lines=[""];if(t.length===0){this.$lines=[""];}else if(Array.isArray(t)){this.insertMergedLines({row:0,column:0},t);}else{this.insert({row:0,column:0},t);}};(function(){o.implement(this,E);this.setValue=function(t){var l=this.getLength()-1;this.remove(new R(0,0,l,this.getLine(l).length));this.insert({row:0,column:0},t);};this.getValue=function(){return this.getAllLines().join(this.getNewLineCharacter());};this.createAnchor=function(b,c){return new A(this,b,c);};if("aaa".split(/a/).length===0){this.$split=function(t){return t.replace(/\r\n|\r/g,"\n").split("\n");};}else{this.$split=function(t){return t.split(/\r\n|\r|\n/);};}this.$detectNewLine=function(t){var b=t.match(/^.*?(\r\n|\r|\n)/m);this.$autoNewLine=b?b[1]:"\n";this._signal("changeNewLineMode");};this.getNewLineCharacter=function(){switch(this.$newLineMode){case"windows":return"\r\n";case"unix":return"\n";default:return this.$autoNewLine||"\n";}};this.$autoNewLine="";this.$newLineMode="auto";this.setNewLineMode=function(n){if(this.$newLineMode===n)return;this.$newLineMode=n;this._signal("changeNewLineMode");};this.getNewLineMode=function(){return this.$newLineMode;};this.isNewLine=function(t){return(t=="\r\n"||t=="\r"||t=="\n");};this.getLine=function(b){return this.$lines[b]||"";};this.getLines=function(f,l){return this.$lines.slice(f,l+1);};this.getAllLines=function(){return this.getLines(0,this.getLength());};this.getLength=function(){return this.$lines.length;};this.getTextRange=function(b){return this.getLinesForRange(b).join(this.getNewLineCharacter());};this.getLinesForRange=function(b){var c;if(b.start.row===b.end.row){c=[this.getLine(b.start.row).substring(b.start.column,b.end.column)];}else{c=this.getLines(b.start.row,b.end.row);c[0]=(c[0]||"").substring(b.start.column);var l=c.length-1;if(b.end.row-b.start.row==l)c[l]=c[l].substring(0,b.end.column);}return c;};this.insertLines=function(b,l){console.warn("Use of document.insertLines is deprecated. Use the insertFullLines method instead.");return this.insertFullLines(b,l);};this.removeLines=function(f,l){console.warn("Use of document.removeLines is deprecated. Use the removeFullLines method instead.");return this.removeFullLines(f,l);};this.insertNewLine=function(p){console.warn("Use of document.insertNewLine is deprecated. Use insertMergedLines(position, ['', '']) instead.");return this.insertMergedLines(p,["",""]);};this.insert=function(p,t){if(this.getLength()<=1)this.$detectNewLine(t);return this.insertMergedLines(p,this.$split(t));};this.insertInLine=function(p,t){var s=this.clippedPos(p.row,p.column);var b=this.pos(p.row,p.column+t.length);this.applyDelta({start:s,end:b,action:"insert",lines:[t]},true);return this.clonePos(b);};this.clippedPos=function(b,c){var l=this.getLength();if(b===undefined){b=l;}else if(b<0){b=0;}else if(b>=l){b=l-1;c=undefined;}var d=this.getLine(b);if(c==undefined)c=d.length;c=Math.min(Math.max(c,0),d.length);return{row:b,column:c};};this.clonePos=function(p){return{row:p.row,column:p.column};};this.pos=function(b,c){return{row:b,column:c};};this.$clipPosition=function(p){var l=this.getLength();if(p.row>=l){p.row=Math.max(0,l-1);p.column=this.getLine(l-1).length;}else{p.row=Math.max(0,p.row);p.column=Math.min(Math.max(p.column,0),this.getLine(p.row).length);}return p;};this.insertFullLines=function(b,l){b=Math.min(Math.max(b,0),this.getLength());var c=0;if(b<this.getLength()){l=l.concat([""]);c=0;}else{l=[""].concat(l);b--;c=this.$lines[b].length;}this.insertMergedLines({row:b,column:c},l);};this.insertMergedLines=function(p,l){var s=this.clippedPos(p.row,p.column);var b={row:s.row+l.length-1,column:(l.length==1?s.column:0)+l[l.length-1].length};this.applyDelta({start:s,end:b,action:"insert",lines:l});return this.clonePos(b);};this.remove=function(b){var s=this.clippedPos(b.start.row,b.start.column);var c=this.clippedPos(b.end.row,b.end.column);this.applyDelta({start:s,end:c,action:"remove",lines:this.getLinesForRange({start:s,end:c})});return this.clonePos(s);};this.removeInLine=function(b,s,c){var d=this.clippedPos(b,s);var f=this.clippedPos(b,c);this.applyDelta({start:d,end:f,action:"remove",lines:this.getLinesForRange({start:d,end:f})},true);return this.clonePos(d);};this.removeFullLines=function(f,l){f=Math.min(Math.max(0,f),this.getLength()-1);l=Math.min(Math.max(0,l),this.getLength()-1);var d=l==this.getLength()-1&&f>0;var b=l<this.getLength()-1;var s=(d?f-1:f);var c=(d?this.getLine(s).length:0);var g=(b?l+1:l);var h=(b?0:this.getLine(g).length);var i=new R(s,c,g,h);var j=this.$lines.slice(f,l+1);this.applyDelta({start:i.start,end:i.end,action:"remove",lines:this.getLinesForRange(i)});return j;};this.removeNewLine=function(b){if(b<this.getLength()-1&&b>=0){this.applyDelta({start:this.pos(b,this.getLine(b).length),end:this.pos(b+1,0),action:"remove",lines:["",""]});}};this.replace=function(b,t){if(!(b instanceof R))b=R.fromPoints(b.start,b.end);if(t.length===0&&b.isEmpty())return b.start;if(t==this.getTextRange(b))return b.end;this.remove(b);var c;if(t){c=this.insert(b.start,t);}else{c=b.start;}return c;};this.applyDeltas=function(d){for(var i=0;i<d.length;i++){this.applyDelta(d[i]);}};this.revertDeltas=function(d){for(var i=d.length-1;i>=0;i--){this.revertDelta(d[i]);}};this.applyDelta=function(d,b){var i=d.action=="insert";if(i?d.lines.length<=1&&!d.lines[0]:!R.comparePoints(d.start,d.end)){return;}if(i&&d.lines.length>20000)this.$splitAndapplyLargeDelta(d,20000);a(this.$lines,d,b);this._signal("change",d);};this.$splitAndapplyLargeDelta=function(d,M){var b=d.lines;var l=b.length;var c=d.start.row;var f=d.start.column;var g=0,t=0;do{g=t;t+=M-1;var h=b.slice(g,t);if(t>l){d.lines=h;d.start.row=c+g;d.start.column=f;break;}h.push("");this.applyDelta({start:this.pos(c+g,f),end:this.pos(c+t,f=0),action:d.action,lines:h},true);}while(true);};this.revertDelta=function(d){this.applyDelta({start:this.clonePos(d.start),end:this.clonePos(d.end),action:(d.action=="insert"?"remove":"insert"),lines:d.lines.slice()});};this.indexToPosition=function(b,s){var c=this.$lines||this.getAllLines();var n=this.getNewLineCharacter().length;for(var i=s||0,l=c.length;i<l;i++){b-=c[i].length+n;if(b<0)return{row:i,column:b+c[i].length+n};}return{row:l-1,column:c[l-1].length};};this.positionToIndex=function(p,s){var l=this.$lines||this.getAllLines();var n=this.getNewLineCharacter().length;var b=0;var c=Math.min(p.row,l.length);for(var i=s||0;i<c;++i)b+=l[i].length+n;return b+p.column;};}).call(D.prototype);e.Document=D;});define("ace/lib/lang",["require","exports","module"],function(r,e,m){"use strict";e.last=function(a){return a[a.length-1];};e.stringReverse=function(s){return s.split("").reverse().join("");};e.stringRepeat=function(s,c){var a='';while(c>0){if(c&1)a+=s;if(c>>=1)s+=s;}return a;};var t=/^\s\s*/;var b=/\s\s*$/;e.stringTrimLeft=function(s){return s.replace(t,'');};e.stringTrimRight=function(s){return s.replace(b,'');};e.copyObject=function(o){var c={};for(var k in o){c[k]=o[k];}return c;};e.copyArray=function(a){var c=[];for(var i=0,l=a.length;i<l;i++){if(a[i]&&typeof a[i]=="object")c[i]=this.copyObject(a[i]);else c[i]=a[i];}return c;};e.deepCopy=function deepCopy(o){if(typeof o!=="object"||!o)return o;var c;if(Array.isArray(o)){c=[];for(var k=0;k<o.length;k++){c[k]=deepCopy(o[k]);}return c;}if(Object.prototype.toString.call(o)!=="[object Object]")return o;c={};for(var k in o)c[k]=deepCopy(o[k]);return c;};e.arrayToMap=function(a){var c={};for(var i=0;i<a.length;i++){c[a[i]]=1;}return c;};e.createMap=function(p){var a=Object.create(null);for(var i in p){a[i]=p[i];}return a;};e.arrayRemove=function(a,v){for(var i=0;i<=a.length;i++){if(v===a[i]){a.splice(i,1);}}};e.escapeRegExp=function(s){return s.replace(/([.*+?^${}()|[\]\/\\])/g,'\\$1');};e.escapeHTML=function(s){return s.replace(/&/g,"&#38;").replace(/"/g,"&#34;").replace(/'/g,"&#39;").replace(/</g,"&#60;");};e.getMatchOffsets=function(s,a){var c=[];s.replace(a,function(d){c.push({offset:arguments[arguments.length-2],length:d.length});});return c;};e.deferredCall=function(f){var a=null;var c=function(){a=null;f();};var d=function(g){d.cancel();a=setTimeout(c,g||0);return d;};d.schedule=d;d.call=function(){this.cancel();f();return d;};d.cancel=function(){clearTimeout(a);a=null;return d;};d.isPending=function(){return a;};return d;};e.delayedCall=function(f,d){var a=null;var c=function(){a=null;f();};var _=function(g){if(a==null)a=setTimeout(c,g||d);};_.delay=function(g){a&&clearTimeout(a);a=setTimeout(c,g||d);};_.schedule=_;_.call=function(){this.cancel();f();};_.cancel=function(){a&&clearTimeout(a);a=null;};_.isPending=function(){return a;};return _;};});define("ace/worker/mirror",["require","exports","module","ace/range","ace/document","ace/lib/lang"],function(r,a,m){"use strict";var R=r("../range").Range;var D=r("../document").Document;var l=r("../lib/lang");var M=a.Mirror=function(s){this.sender=s;var b=this.doc=new D("");var c=this.deferredUpdate=l.delayedCall(this.onUpdate.bind(this));var _=this;s.on("change",function(e){var f=e.data;if(f[0].start){b.applyDeltas(f);}else{for(var i=0;i<f.length;i+=2){if(Array.isArray(f[i+1])){var d={action:"insert",start:f[i],lines:f[i+1]};}else{var d={action:"remove",start:f[i],end:f[i+1]};}b.applyDelta(d,true);}}if(_.$timeout)return c.schedule(_.$timeout);_.onUpdate();});};(function(){this.$timeout=500;this.setTimeout=function(t){this.$timeout=t;};this.setValue=function(v){this.doc.setValue(v);this.deferredUpdate.schedule(this.$timeout);};this.getValue=function(c){this.sender.callback(this.doc.getValue(),c);};this.onUpdate=function(){};this.isPending=function(){return this.deferredUpdate.isPending();};}).call(M.prototype);});define("ace/mode/json/json_parse",["require","exports","module"],function(r,e,a){"use strict";var b,d,f={'"':'"','\\':'\\','/':'/',b:'\b',f:'\f',n:'\n',r:'\r',t:'\t'},t,g=function(m){throw{name:'SyntaxError',message:m,at:b,text:t};},n=function(c){if(c&&c!==d){g("Expected '"+c+"' instead of '"+d+"'");}d=t.charAt(b);b+=1;return d;},h=function(){var h,s='';if(d==='-'){s='-';n('-');}while(d>='0'&&d<='9'){s+=d;n();}if(d==='.'){s+='.';while(n()&&d>='0'&&d<='9'){s+=d;}}if(d==='e'||d==='E'){s+=d;n();if(d==='-'||d==='+'){s+=d;n();}while(d>='0'&&d<='9'){s+=d;n();}}h=+s;if(isNaN(h)){g("Bad number");}else{return h;}},s=function(){var c,i,s='',u;if(d==='"'){while(n()){if(d==='"'){n();return s;}else if(d==='\\'){n();if(d==='u'){u=0;for(i=0;i<4;i+=1){c=parseInt(n(),16);if(!isFinite(c)){break;}u=u*16+c;}s+=String.fromCharCode(u);}else if(typeof f[d]==='string'){s+=f[d];}else{break;}}else{s+=d;}}}g("Bad string");},w=function(){while(d&&d<=' '){n();}},j=function(){switch(d){case't':n('t');n('r');n('u');n('e');return true;case'f':n('f');n('a');n('l');n('s');n('e');return false;case'n':n('n');n('u');n('l');n('l');return null;}g("Unexpected '"+d+"'");},l,o=function(){var o=[];if(d==='['){n('[');w();if(d===']'){n(']');return o;}while(d){o.push(l());w();if(d===']'){n(']');return o;}n(',');w();}}g("Bad array");},p=function(){var k,p={};if(d==='{'){n('{');w();if(d==='}'){n('}');return p;}while(d){k=s();w();n(':');if(Object.hasOwnProperty.call(p,k)){g('Duplicate key "'+k+'"');}p[k]=l();w();if(d==='}'){n('}');return p;}n(',');w();}}g("Bad object");};l=function(){w();switch(d){case'{':return p();case'[':return o();case'"':return s();case'-':return h();default:return d>='0'&&d<='9'?h():j();}};return function(c,i){var m;t=c;b=0;d=' ';m=l();w();if(d){g("Syntax error");}return typeof i==='function'?function walk(q,u){var k,v,l=q[u];if(l&&typeof l==='object'){for(k in l){if(Object.hasOwnProperty.call(l,k)){v=walk(l,k);if(v!==undefined){l[k]=v;}else{delete l[k];}}}}return i.call(q,u,l);}({'':m},''):m;};});define("ace/mode/json_worker",["require","exports","module","ace/lib/oop","ace/worker/mirror","ace/mode/json/json_parse"],function(r,a,m){"use strict";var o=r("../lib/oop");var M=r("../worker/mirror").Mirror;var p=r("./json/json_parse");var J=a.JsonWorker=function(s){M.call(this,s);this.setTimeout(200);};o.inherits(J,M);(function(){this.onUpdate=function(){var v=this.doc.getValue();var b=[];try{if(v)p(v);}catch(e){var c=this.doc.indexToPosition(e.at-1);b.push({row:c.row,column:c.column,text:e.message,type:"error"});}this.sender.emit("annotate",b);};}).call(J.prototype);});define("ace/lib/es5-shim",["require","exports","module"],function(r,e,m){function E(){}if(!Function.prototype.bind){Function.prototype.bind=function bind(a){var i=this;if(typeof i!="function"){throw new TypeError("Function.prototype.bind called on incompatible "+i);}var l=s.call(arguments,1);var n=function(){if(this instanceof n){var o=i.apply(this,l.concat(s.call(arguments)));if(Object(o)===o){return o;}return this;}else{return i.apply(a,l.concat(s.call(arguments)));}};if(i.prototype){E.prototype=i.prototype;n.prototype=new E();E.prototype=null;}return n;};}var c=Function.prototype.call;var p=Array.prototype;var b=Object.prototype;var s=p.slice;var _=c.bind(b.toString);var d=c.bind(b.hasOwnProperty);var f;var g;var h;var j;var k;if((k=d(b,"__defineGetter__"))){f=c.bind(b.__defineGetter__);g=c.bind(b.__defineSetter__);h=c.bind(b.__lookupGetter__);j=c.bind(b.__lookupSetter__);}if([1,2].splice(0).length!=2){if(function(){function i(l){var a=new Array(l+2);a[0]=a[1]=0;return a;}var n=[],o;n.splice.apply(n,i(20));n.splice.apply(n,i(26));o=n.length;n.splice(5,0,"XXX");o+1==n.length;if(o+1==n.length){return true;}}()){var q=Array.prototype.splice;Array.prototype.splice=function(a,i){if(!arguments.length){return[];}else{return q.apply(this,[a===void 0?0:a,i===void 0?(this.length-a):i].concat(s.call(arguments,2)))}};}else{Array.prototype.splice=function(a,l){var n=this.length;if(a>0){if(a>n)a=n;}else if(a==void 0){a=0;}else if(a<0){a=Math.max(n+a,0);}if(!(a+l<n))l=n-a;var o=this.slice(a,a+l);var R=s.call(arguments,2);var S=R.length;if(a===n){if(S){this.push.apply(this,R);}}else{var T=Math.min(l,n-a);var U=a+T;var V=U+S-T;var W=n-U;var X=n-T;if(V<U){for(var i=0;i<W;++i){this[V+i]=this[U+i];}}else if(V>U){for(i=W;i--;){this[V+i]=this[U+i];}}if(S&&a===X){this.length=X;this.push.apply(this,R);}else{this.length=X+S;for(i=0;i<S;++i){this[a+i]=R[i];}}}return o;};}}if(!Array.isArray){Array.isArray=function isArray(o){return _(o)=="[object Array]";};}var t=Object("a"),u=t[0]!="a"||!(0 in t);if(!Array.prototype.forEach){Array.prototype.forEach=function forEach(a){var o=Q(this),l=u&&_(this)=="[object String]"?this.split(""):o,n=arguments[1],i=-1,R=l.length>>>0;if(_(a)!="[object Function]"){throw new TypeError();}while(++i<R){if(i in l){a.call(n,l[i],i,o);}}};}if(!Array.prototype.map){Array.prototype.map=function map(a){var o=Q(this),l=u&&_(this)=="[object String]"?this.split(""):o,n=l.length>>>0,R=Array(n),S=arguments[1];if(_(a)!="[object Function]"){throw new TypeError(a+" is not a function");}for(var i=0;i<n;i++){if(i in l)R[i]=a.call(S,l[i],i,o);}return R;};}if(!Array.prototype.filter){Array.prototype.filter=function filter(a){var o=Q(this),l=u&&_(this)=="[object String]"?this.split(""):o,n=l.length>>>0,R=[],S,T=arguments[1];if(_(a)!="[object Function]"){throw new TypeError(a+" is not a function");}for(var i=0;i<n;i++){if(i in l){S=l[i];if(a.call(T,S,i,o)){R.push(S);}}}return R;};}if(!Array.prototype.every){Array.prototype.every=function every(a){var o=Q(this),l=u&&_(this)=="[object String]"?this.split(""):o,n=l.length>>>0,R=arguments[1];if(_(a)!="[object Function]"){throw new TypeError(a+" is not a function");}for(var i=0;i<n;i++){if(i in l&&!a.call(R,l[i],i,o)){return false;}}return true;};}if(!Array.prototype.some){Array.prototype.some=function some(a){var o=Q(this),l=u&&_(this)=="[object String]"?this.split(""):o,n=l.length>>>0,R=arguments[1];if(_(a)!="[object Function]"){throw new TypeError(a+" is not a function");}for(var i=0;i<n;i++){if(i in l&&a.call(R,l[i],i,o)){return true;}}return false;};}if(!Array.prototype.reduce){Array.prototype.reduce=function reduce(a){var o=Q(this),l=u&&_(this)=="[object String]"?this.split(""):o,n=l.length>>>0;if(_(a)!="[object Function]"){throw new TypeError(a+" is not a function");}if(!n&&arguments.length==1){throw new TypeError("reduce of empty array with no initial value");}var i=0;var R;if(arguments.length>=2){R=arguments[1];}else{do{if(i in l){R=l[i++];break;}if(++i>=n){throw new TypeError("reduce of empty array with no initial value");}}while(true);}for(;i<n;i++){if(i in l){R=a.call(void 0,R,l[i],i,o);}}return R;};}if(!Array.prototype.reduceRight){Array.prototype.reduceRight=function reduceRight(a){var o=Q(this),l=u&&_(this)=="[object String]"?this.split(""):o,n=l.length>>>0;if(_(a)!="[object Function]"){throw new TypeError(a+" is not a function");}if(!n&&arguments.length==1){throw new TypeError("reduceRight of empty array with no initial value");}var R,i=n-1;if(arguments.length>=2){R=arguments[1];}else{do{if(i in l){R=l[i--];break;}if(--i<0){throw new TypeError("reduceRight of empty array with no initial value");}}while(true);}do{if(i in this){R=a.call(void 0,R,l[i],i,o);}}while(i--);return R;};}if(!Array.prototype.indexOf||([0,1].indexOf(1,2)!=-1)){Array.prototype.indexOf=function indexOf(a){var l=u&&_(this)=="[object String]"?this.split(""):Q(this),n=l.length>>>0;if(!n){return-1;}var i=0;if(arguments.length>1){i=N(arguments[1]);}i=i>=0?i:Math.max(0,n+i);for(;i<n;i++){if(i in l&&l[i]===a){return i;}}return-1;};}if(!Array.prototype.lastIndexOf||([0,1].lastIndexOf(0,-3)!=-1)){Array.prototype.lastIndexOf=function lastIndexOf(a){var l=u&&_(this)=="[object String]"?this.split(""):Q(this),n=l.length>>>0;if(!n){return-1;}var i=n-1;if(arguments.length>1){i=Math.min(i,N(arguments[1]));}i=i>=0?i:n-Math.abs(i);for(;i>=0;i--){if(i in l&&a===l[i]){return i;}}return-1;};}if(!Object.getPrototypeOf){Object.getPrototypeOf=function getPrototypeOf(o){return o.__proto__||(o.constructor?o.constructor.prototype:b);};}if(!Object.getOwnPropertyDescriptor){var v="Object.getOwnPropertyDescriptor called on a "+"non-object: ";Object.getOwnPropertyDescriptor=function getOwnPropertyDescriptor(o,a){if((typeof o!="object"&&typeof o!="function")||o===null)throw new TypeError(v+o);if(!d(o,a))return;var i,l,n;i={enumerable:true,configurable:true};if(k){var R=o.__proto__;o.__proto__=b;var l=h(o,a);var n=j(o,a);o.__proto__=R;if(l||n){if(l)i.get=l;if(n)i.set=n;return i;}}i.value=o[a];return i;};}if(!Object.getOwnPropertyNames){Object.getOwnPropertyNames=function getOwnPropertyNames(o){return Object.keys(o);};}if(!Object.create){var w;if(Object.prototype.__proto__===null){w=function(){return{"__proto__":null};};}else{w=function(){var a={};for(var i in a)a[i]=null;a.constructor=a.hasOwnProperty=a.propertyIsEnumerable=a.isPrototypeOf=a.toLocaleString=a.toString=a.valueOf=a.__proto__=null;return a;}}Object.create=function create(a,i){var o;if(a===null){o=w();}else{if(typeof a!="object")throw new TypeError("typeof prototype["+(typeof a)+"] != 'object'");var T=function(){};T.prototype=a;o=new T();o.__proto__=a;}if(i!==void 0)Object.defineProperties(o,i);return o;};}function x(o){try{Object.defineProperty(o,"sentinel",{});return"sentinel"in o;}catch(F){}}if(Object.defineProperty){var y=x({});var z=typeof document=="undefined"||x(document.createElement("div"));if(!y||!z){var A=Object.defineProperty;}}if(!Object.defineProperty||A){var B="Property description must be an object: ";var C="Object.defineProperty called on non-object: ";var D="getters & setters can not be defined "+"on this javascript engine";Object.defineProperty=function defineProperty(o,a,i){if((typeof o!="object"&&typeof o!="function")||o===null)throw new TypeError(C+o);if((typeof i!="object"&&typeof i!="function")||i===null)throw new TypeError(B+i);if(A){try{return A.call(Object,o,a,i);}catch(F){}}if(d(i,"value")){if(k&&(h(o,a)||j(o,a))){var l=o.__proto__;o.__proto__=b;delete o[a];o[a]=i.value;o.__proto__=l;}else{o[a]=i.value;}}else{if(!k)throw new TypeError(D);if(d(i,"get"))f(o,a,i.get);if(d(i,"set"))g(o,a,i.set);}return o;};}if(!Object.defineProperties){Object.defineProperties=function defineProperties(o,a){for(var i in a){if(d(a,i))Object.defineProperty(o,i,a[i]);}return o;};}if(!Object.seal){Object.seal=function seal(o){return o;};}if(!Object.freeze){Object.freeze=function freeze(o){return o;};}try{Object.freeze(function(){});}catch(F){Object.freeze=(function freeze(a){return function freeze(o){if(typeof o=="function"){return o;}else{return a(o);}};})(Object.freeze);}if(!Object.preventExtensions){Object.preventExtensions=function preventExtensions(o){return o;};}if(!Object.isSealed){Object.isSealed=function isSealed(o){return false;};}if(!Object.isFrozen){Object.isFrozen=function isFrozen(o){return false;};}if(!Object.isExtensible){Object.isExtensible=function isExtensible(o){if(Object(o)===o){throw new TypeError();}var n='';while(d(o,n)){n+='?';}o[n]=true;var a=d(o,n);delete o[n];return a;};}if(!Object.keys){var G=true,H=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],I=H.length;for(var J in{"toString":null}){G=false;}Object.keys=function keys(o){if((typeof o!="object"&&typeof o!="function")||o===null){throw new TypeError("Object.keys called on a non-object");}var a=[];for(var n in o){if(d(o,n)){a.push(n);}}if(G){for(var i=0,l=I;i<l;i++){var R=H[i];if(d(o,R)){a.push(R);}}}return a;};}if(!Date.now){Date.now=function now(){return new Date().getTime();};}var K="\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003"+"\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028"+"\u2029\uFEFF";if(!String.prototype.trim||K.trim()){K="["+K+"]";var L=new RegExp("^"+K+K+"*"),M=new RegExp(K+K+"*$");String.prototype.trim=function trim(){return String(this).replace(L,"").replace(M,"");};}function N(n){n=+n;if(n!==n){n=0;}else if(n!==0&&n!==(1/0)&&n!==-(1/0)){n=(n>0||-1)*Math.floor(Math.abs(n));}return n;}function O(i){var a=typeof i;return(i===null||a==="undefined"||a==="boolean"||a==="number"||a==="string");}function P(i){var a,l,n;if(O(i)){return i;}l=i.valueOf;if(typeof l==="function"){a=l.call(i);if(O(a)){return a;}}n=i.toString;if(typeof n==="function"){a=n.call(i);if(O(a)){return a;}}throw new TypeError();}var Q=function(o){if(o==null){throw new TypeError("can't convert "+o+" to object");}return Object(o);};});
