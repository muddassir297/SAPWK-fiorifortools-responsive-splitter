define("ace/ext/searchbox",["require","exports","module","ace/lib/dom","ace/lib/lang","ace/lib/event","ace/keyboard/hash_handler","ace/lib/keys"],function(r,a,m){"use strict";var d=r("../lib/dom");var l=r("../lib/lang");var b=r("../lib/event");var s=".ace_search {background-color: #ddd;border: 1px solid #cbcbcb;border-top: 0 none;max-width: 325px;overflow: hidden;margin: 0;padding: 4px;padding-right: 6px;padding-bottom: 0;position: absolute;top: 0px;z-index: 99;white-space: normal;}.ace_search.left {border-left: 0 none;border-radius: 0px 0px 5px 0px;left: 0;}.ace_search.right {border-radius: 0px 0px 0px 5px;border-right: 0 none;right: 0;}.ace_search_form, .ace_replace_form {border-radius: 3px;border: 1px solid #cbcbcb;float: left;margin-bottom: 4px;overflow: hidden;}.ace_search_form.ace_nomatch {outline: 1px solid red;}.ace_search_field {background-color: white;color: black;border-right: 1px solid #cbcbcb;border: 0 none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;float: left;height: 22px;outline: 0;padding: 0 7px;width: 214px;margin: 0;}.ace_searchbtn,.ace_replacebtn {background: #fff;border: 0 none;border-left: 1px solid #dcdcdc;cursor: pointer;float: left;height: 22px;margin: 0;position: relative;}.ace_searchbtn:last-child,.ace_replacebtn:last-child {border-top-right-radius: 3px;border-bottom-right-radius: 3px;}.ace_searchbtn:disabled {background: none;cursor: default;}.ace_searchbtn {background-position: 50% 50%;background-repeat: no-repeat;width: 27px;}.ace_searchbtn.prev {background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADFJREFUeNpiSU1NZUAC/6E0I0yACYskCpsJiySKIiY0SUZk40FyTEgCjGgKwTRAgAEAQJUIPCE+qfkAAAAASUVORK5CYII=);    }.ace_searchbtn.next {background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADRJREFUeNpiTE1NZQCC/0DMyIAKwGJMUAYDEo3M/s+EpvM/mkKwCQxYjIeLMaELoLMBAgwAU7UJObTKsvAAAAAASUVORK5CYII=);    }.ace_searchbtn_close {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAcCAYAAABRVo5BAAAAZ0lEQVR42u2SUQrAMAhDvazn8OjZBilCkYVVxiis8H4CT0VrAJb4WHT3C5xU2a2IQZXJjiQIRMdkEoJ5Q2yMqpfDIo+XY4k6h+YXOyKqTIj5REaxloNAd0xiKmAtsTHqW8sR2W5f7gCu5nWFUpVjZwAAAABJRU5ErkJggg==) no-repeat 50% 0;border-radius: 50%;border: 0 none;color: #656565;cursor: pointer;float: right;font: 16px/16px Arial;height: 14px;margin: 5px 1px 9px 5px;padding: 0;text-align: center;width: 14px;}.ace_searchbtn_close:hover {background-color: #656565;background-position: 50% 100%;color: white;}.ace_replacebtn.prev {width: 54px}.ace_replacebtn.next {width: 27px}.ace_button {margin-left: 2px;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-o-user-select: none;-ms-user-select: none;user-select: none;overflow: hidden;opacity: 0.7;border: 1px solid rgba(100,100,100,0.23);padding: 1px;-moz-box-sizing: border-box;box-sizing:    border-box;color: black;}.ace_button:hover {background-color: #eee;opacity:1;}.ace_button:active {background-color: #ddd;}.ace_button.checked {border-color: #3399ff;opacity:1;}.ace_search_options{margin-bottom: 3px;text-align: right;-webkit-user-select: none;-moz-user-select: none;-o-user-select: none;-ms-user-select: none;user-select: none;}";var H=r("../keyboard/hash_handler").HashHandler;var k=r("../lib/keys");d.importCssString(s,"ace_searchbox");var h='<div class="ace_search right">    <button type="button" action="hide" class="ace_searchbtn_close"></button>    <div class="ace_search_form">        <input class="ace_search_field" placeholder="Search for" spellcheck="false"></input>        <button type="button" action="findNext" class="ace_searchbtn next"></button>        <button type="button" action="findPrev" class="ace_searchbtn prev"></button>        <button type="button" action="findAll" class="ace_searchbtn" title="Alt-Enter">All</button>    </div>    <div class="ace_replace_form">        <input class="ace_search_field" placeholder="Replace with" spellcheck="false"></input>        <button type="button" action="replaceAndFindNext" class="ace_replacebtn">Replace</button>        <button type="button" action="replaceAll" class="ace_replacebtn">All</button>    </div>    <div class="ace_search_options">        <span action="toggleRegexpMode" class="ace_button" title="RegExp Search">.*</span>        <span action="toggleCaseSensitive" class="ace_button" title="CaseSensitive Search">Aa</span>        <span action="toggleWholeWords" class="ace_button" title="Whole Word Search">\\b</span>    </div></div>'.replace(/>\s+/g,">");var S=function(e,c,f){var g=d.createElement("div");g.innerHTML=h;this.element=g.firstChild;this.$init();this.setEditor(e);};(function(){this.setEditor=function(e){e.searchBox=this;e.container.appendChild(this.element);this.editor=e;};this.$initElements=function(c){this.searchBox=c.querySelector(".ace_search_form");this.replaceBox=c.querySelector(".ace_replace_form");this.searchOptions=c.querySelector(".ace_search_options");this.regExpOption=c.querySelector("[action=toggleRegexpMode]");this.caseSensitiveOption=c.querySelector("[action=toggleCaseSensitive]");this.wholeWordOption=c.querySelector("[action=toggleWholeWords]");this.searchInput=this.searchBox.querySelector(".ace_search_field");this.replaceInput=this.replaceBox.querySelector(".ace_search_field");};this.$init=function(){var c=this.element;this.$initElements(c);var _=this;b.addListener(c,"mousedown",function(e){setTimeout(function(){_.activeInput.focus();},0);b.stopPropagation(e);});b.addListener(c,"click",function(e){var t=e.target||e.srcElement;var f=t.getAttribute("action");if(f&&_[f])_[f]();else if(_.$searchBarKb.commands[f])_.$searchBarKb.commands[f].exec(_);b.stopPropagation(e);});b.addCommandKeyListener(c,function(e,f,g){var i=k.keyCodeToString(g);var j=_.$searchBarKb.findKeyCommand(f,i);if(j&&j.exec){j.exec(_);b.stopEvent(e);}});this.$onChange=l.delayedCall(function(){_.find(false,false);});b.addListener(this.searchInput,"input",function(){_.$onChange.schedule(20);});b.addListener(this.searchInput,"focus",function(){_.activeInput=_.searchInput;_.searchInput.value&&_.highlight();});b.addListener(this.replaceInput,"focus",function(){_.activeInput=_.replaceInput;_.searchInput.value&&_.highlight();});};this.$closeSearchBarKb=new H([{bindKey:"Esc",name:"closeSearchBar",exec:function(e){e.searchBox.hide();}}]);this.$searchBarKb=new H();this.$searchBarKb.bindKeys({"Ctrl-f|Command-f":function(c){var i=c.isReplace=!c.isReplace;c.replaceBox.style.display=i?"":"none";c.searchInput.focus();},"Ctrl-H|Command-Option-F":function(c){c.replaceBox.style.display="";c.replaceInput.focus();},"Ctrl-G|Command-G":function(c){c.findNext();},"Ctrl-Shift-G|Command-Shift-G":function(c){c.findPrev();},"esc":function(c){setTimeout(function(){c.hide();});},"Return":function(c){if(c.activeInput==c.replaceInput)c.replace();c.findNext();},"Shift-Return":function(c){if(c.activeInput==c.replaceInput)c.replace();c.findPrev();},"Alt-Return":function(c){if(c.activeInput==c.replaceInput)c.replaceAll();c.findAll();},"Tab":function(c){(c.activeInput==c.replaceInput?c.searchInput:c.replaceInput).focus();}});this.$searchBarKb.addCommands([{name:"toggleRegexpMode",bindKey:{win:"Alt-R|Alt-/",mac:"Ctrl-Alt-R|Ctrl-Alt-/"},exec:function(c){c.regExpOption.checked=!c.regExpOption.checked;c.$syncOptions();}},{name:"toggleCaseSensitive",bindKey:{win:"Alt-C|Alt-I",mac:"Ctrl-Alt-R|Ctrl-Alt-I"},exec:function(c){c.caseSensitiveOption.checked=!c.caseSensitiveOption.checked;c.$syncOptions();}},{name:"toggleWholeWords",bindKey:{win:"Alt-B|Alt-W",mac:"Ctrl-Alt-B|Ctrl-Alt-W"},exec:function(c){c.wholeWordOption.checked=!c.wholeWordOption.checked;c.$syncOptions();}}]);this.$syncOptions=function(){d.setCssClass(this.regExpOption,"checked",this.regExpOption.checked);d.setCssClass(this.wholeWordOption,"checked",this.wholeWordOption.checked);d.setCssClass(this.caseSensitiveOption,"checked",this.caseSensitiveOption.checked);this.find(false,false);};this.highlight=function(c){this.editor.session.highlight(c||this.editor.$search.$options.re);this.editor.renderer.updateBackMarkers()};this.find=function(c,e,p){var f=this.editor.find(this.searchInput.value,{skipCurrent:c,backwards:e,wrap:true,regExp:this.regExpOption.checked,caseSensitive:this.caseSensitiveOption.checked,wholeWord:this.wholeWordOption.checked,preventScroll:p});d.setCssClass(this.searchBox,"ace_nomatch",!f&&this.searchInput.value);this.highlight();};this.findNext=function(){this.find(true,false);};this.findPrev=function(){this.find(true,true);};this.findAll=function(){var c=this.editor.findAll(this.searchInput.value,{regExp:this.regExpOption.checked,caseSensitive:this.caseSensitiveOption.checked,wholeWord:this.wholeWordOption.checked});var n=!c&&this.searchInput.value;d.setCssClass(this.searchBox,"ace_nomatch",n);this.editor._emit("findSearchBox",{match:!n});this.highlight();this.hide();};this.replace=function(){if(!this.editor.getReadOnly())this.editor.replace(this.replaceInput.value);};this.replaceAndFindNext=function(){if(!this.editor.getReadOnly()){this.editor.replace(this.replaceInput.value);this.findNext()}};this.replaceAll=function(){if(!this.editor.getReadOnly())this.editor.replaceAll(this.replaceInput.value);};this.hide=function(){this.element.style.display="none";this.editor.keyBinding.removeKeyboardHandler(this.$closeSearchBarKb);this.editor.focus();};this.show=function(v,i){this.element.style.display="";this.replaceBox.style.display=i?"":"none";this.isReplace=i;if(v)this.searchInput.value=v;this.find(false,false,true);this.searchInput.focus();this.searchInput.select();this.editor.keyBinding.addKeyboardHandler(this.$closeSearchBarKb);};this.isFocused=function(){var e=document.activeElement;return e==this.searchInput||e==this.replaceInput;}}).call(S.prototype);a.SearchBox=S;a.Search=function(e,i){var c=e.searchBox||new S(e);c.show(e.session.getTextRange(),i);};});define("ace/ext/old_ie",["require","exports","module","ace/lib/useragent","ace/tokenizer","ace/ext/searchbox","ace/mode/text"],function(require,exports,module){"use strict";var MAX_TOKEN_COUNT=1000;var useragent=require("../lib/useragent");var TokenizerModule=require("../tokenizer");function patch(obj,name,regexp,replacement){eval("obj['"+name+"']="+obj[name].toString().replace(regexp,replacement));}if(useragent.isIE&&useragent.isIE<10&&window.top.document.compatMode==="BackCompat")useragent.isOldIE=true;if(typeof document!="undefined"&&!document.documentElement.querySelector){useragent.isOldIE=true;var qs=function(e,s){if(s.charAt(0)=="."){var c=s.slice(1);}else{var m=s.match(/(\w+)=(\w+)/);var a=m&&m[1];var b=m&&m[2];}for(var i=0;i<e.all.length;i++){var d=e.all[i];if(c){if(d.className.indexOf(c)!=-1)return d;}else if(a){if(d.getAttribute(a)==b)return d;}}};var sb=require("./searchbox").SearchBox.prototype;patch(sb,"$initElements",/([^\s=]*).querySelector\((".*?")\)/g,"qs($1, $2)");}var compliantExecNpcg=/()??/.exec("")[1]===undefined;if(compliantExecNpcg)return;var proto=TokenizerModule.Tokenizer.prototype;TokenizerModule.Tokenizer_orig=TokenizerModule.Tokenizer;proto.getLineTokens_orig=proto.getLineTokens;patch(TokenizerModule,"Tokenizer","ruleRegExps.push(adjustedregex);\n",function(m){return m+'        if (state[i].next && RegExp(adjustedregex).test(""))\n            rule._qre = RegExp(adjustedregex, "g");\n        ';});TokenizerModule.Tokenizer.prototype=proto;patch(proto,"getLineTokens",/if \(match\[i \+ 1\] === undefined\)\s*continue;/,"if (!match[i + 1]) {\n        if (value)continue;\n        var qre = state[mapping[i]]._qre;\n        if (!qre) continue;\n        qre.lastIndex = lastIndex;\n        if (!qre.exec(line) || qre.lastIndex != lastIndex)\n            continue;\n    }");patch(require("../mode/text").Mode.prototype,"getTokenizer",/Tokenizer/,"TokenizerModule.Tokenizer");useragent.isOldIE=true;});(function(){window.require(["ace/ext/old_ie"],function(){});})();
