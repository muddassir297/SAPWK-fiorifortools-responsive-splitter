define("ace/ext/menu_tools/element_generator",["require","exports","module"],function(r,e,m){'use strict';m.exports.createOption=function createOption(o){var a;var b=document.createElement('option');for(a in o){if(o.hasOwnProperty(a)){if(a==='selected'){b.setAttribute(a,o[a]);}else{b[a]=o[a];}}}return b;};m.exports.createCheckbox=function createCheckbox(i,c,a){var b=document.createElement('input');b.setAttribute('type','checkbox');b.setAttribute('id',i);b.setAttribute('name',i);b.setAttribute('value',c);b.setAttribute('class',a);if(c){b.setAttribute('checked','checked');}return b;};m.exports.createInput=function createInput(i,v,c){var a=document.createElement('input');a.setAttribute('type','text');a.setAttribute('id',i);a.setAttribute('name',i);a.setAttribute('value',v);a.setAttribute('class',c);return a;};m.exports.createLabel=function createLabel(t,l){var a=document.createElement('label');a.setAttribute('for',l);a.textContent=t;return a;};m.exports.createSelection=function createSelection(i,v,c){var a=document.createElement('select');a.setAttribute('id',i);a.setAttribute('name',i);a.setAttribute('class',c);v.forEach(function(b){a.appendChild(m.exports.createOption(b));});return a;};});define("ace/ext/modelist",["require","exports","module"],function(r,e,m){"use strict";var c=[];function g(p){var l=d.text;var a=p.split(/[\/\\]/).pop();for(var i=0;i<c.length;i++){if(c[i].supportsFile(a)){l=c[i];break;}}return l;}var M=function(f,i,o){this.name=f;this.caption=i;this.mode="ace/mode/"+f;this.extensions=o;var p;if(/\^/.test(o)){p=o.replace(/\|(\^)?/g,function(a,b){return"$|"+(b?"^":"^.*\\.");})+"$";}else{p="^.*\\.("+o+")$";}this.extRe=new RegExp(p,"gi");};M.prototype.supportsFile=function(k){return k.match(this.extRe);};var s={ABAP:["abap"],ABC:["abc"],ActionScript:["as"],ADA:["ada|adb"],Apache_Conf:["^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd"],AsciiDoc:["asciidoc|adoc"],Assembly_x86:["asm|a"],AutoHotKey:["ahk"],BatchFile:["bat|cmd"],C_Cpp:["cpp|c|cc|cxx|h|hh|hpp|ino"],C9Search:["c9search_results"],Cirru:["cirru|cr"],Clojure:["clj|cljs"],Cobol:["CBL|COB"],coffee:["coffee|cf|cson|^Cakefile"],ColdFusion:["cfm"],CSharp:["cs"],CSS:["css"],Curly:["curly"],D:["d|di"],Dart:["dart"],Diff:["diff|patch"],Dockerfile:["^Dockerfile"],Dot:["dot"],Drools:["drl"],Dummy:["dummy"],DummySyntax:["dummy"],Eiffel:["e|ge"],EJS:["ejs"],Elixir:["ex|exs"],Elm:["elm"],Erlang:["erl|hrl"],Forth:["frt|fs|ldr|fth|4th"],Fortran:["f|f90"],FTL:["ftl"],Gcode:["gcode"],Gherkin:["feature"],Gitignore:["^.gitignore"],Glsl:["glsl|frag|vert"],Gobstones:["gbs"],golang:["go"],Groovy:["groovy"],HAML:["haml"],Handlebars:["hbs|handlebars|tpl|mustache"],Haskell:["hs"],Haskell_Cabal:["cabal"],haXe:["hx"],HTML:["html|htm|xhtml"],HTML_Elixir:["eex|html.eex"],HTML_Ruby:["erb|rhtml|html.erb"],INI:["ini|conf|cfg|prefs"],Io:["io"],Jack:["jack"],Jade:["jade"],Java:["java"],JavaScript:["js|jsm|jsx"],JSON:["json"],JSONiq:["jq"],JSP:["jsp"],JSX:["jsx"],Julia:["jl"],Kotlin:["kt|kts"],LaTeX:["tex|latex|ltx|bib"],LESS:["less"],Liquid:["liquid"],Lisp:["lisp"],LiveScript:["ls"],LogiQL:["logic|lql"],LSL:["lsl"],Lua:["lua"],LuaPage:["lp"],Lucene:["lucene"],Makefile:["^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make"],Markdown:["md|markdown"],Mask:["mask"],MATLAB:["matlab"],Maze:["mz"],MEL:["mel"],MUSHCode:["mc|mush"],MySQL:["mysql"],Nix:["nix"],NSIS:["nsi|nsh"],ObjectiveC:["m|mm"],OCaml:["ml|mli"],Pascal:["pas|p"],Perl:["pl|pm"],pgSQL:["pgsql"],PHP:["php|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module"],Powershell:["ps1"],Praat:["praat|praatscript|psc|proc"],Prolog:["plg|prolog"],Properties:["properties"],Protobuf:["proto"],Python:["py"],R:["r"],Razor:["cshtml|asp"],RDoc:["Rd"],RHTML:["Rhtml"],RST:["rst"],Ruby:["rb|ru|gemspec|rake|^Guardfile|^Rakefile|^Gemfile"],Rust:["rs"],SASS:["sass"],SCAD:["scad"],Scala:["scala"],Scheme:["scm|sm|rkt|oak|scheme"],SCSS:["scss"],SH:["sh|bash|^.bashrc"],SJS:["sjs"],Smarty:["smarty|tpl"],snippets:["snippets"],Soy_Template:["soy"],Space:["space"],SQL:["sql"],SQLServer:["sqlserver"],Stylus:["styl|stylus"],SVG:["svg"],Swift:["swift"],Tcl:["tcl"],Tex:["tex"],Text:["txt"],Textile:["textile"],Toml:["toml"],Twig:["twig|swig"],Typescript:["ts|typescript|str"],TSX:["tsx"],Vala:["vala"],VBScript:["vbs|vb"],Velocity:["vm"],Verilog:["v|vh|sv|svh"],VHDL:["vhd|vhdl"],Wollok:["wlk|wpgm|wtest"],XML:["xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml"],XQuery:["xq"],YAML:["yaml|yml"],Django:["html"]};var n={ObjectiveC:"Objective-C",CSharp:"C#",golang:"Go",C_Cpp:"C and C++",coffee:"CoffeeScript",HTML_Ruby:"HTML (Ruby)",HTML_Elixir:"HTML (Elixir)",FTL:"FreeMarker"};var d={};for(var f in s){var h=s[f];var j=(n[f]||f).replace(/_/g," ");var k=f.toLowerCase();var l=new M(k,j,h[0]);d[k]=l;c.push(l);}m.exports={getModeForPath:g,modes:c,modesByName:d};});define("ace/ext/themelist",["require","exports","module","ace/lib/fixoldbrowsers"],function(r,e,m){"use strict";r("ace/lib/fixoldbrowsers");var t=[["Chrome"],["Clouds"],["Crimson Editor"],["Dawn"],["Dreamweaver"],["Eclipse"],["GitHub"],["IPlastic"],["Solarized Light"],["TextMate"],["Tomorrow"],["XCode"],["Kuroir"],["KatzenMilch"],["SQL Server","sqlserver","light"],["Ambiance","ambiance","dark"],["Chaos","chaos","dark"],["Clouds Midnight","clouds_midnight","dark"],["Cobalt","cobalt","dark"],["Gruvbox","gruvbox","dark"],["idle Fingers","idle_fingers","dark"],["krTheme","kr_theme","dark"],["Merbivore","merbivore","dark"],["Merbivore Soft","merbivore_soft","dark"],["Mono Industrial","mono_industrial","dark"],["Monokai","monokai","dark"],["Pastel on dark","pastel_on_dark","dark"],["Solarized Dark","solarized_dark","dark"],["Terminal","terminal","dark"],["Tomorrow Night","tomorrow_night","dark"],["Tomorrow Night Blue","tomorrow_night_blue","dark"],["Tomorrow Night Bright","tomorrow_night_bright","dark"],["Tomorrow Night 80s","tomorrow_night_eighties","dark"],["Twilight","twilight","dark"],["Vibrant Ink","vibrant_ink","dark"]];e.themesByName={};e.themes=t.map(function(d){var n=d[1]||d[0].replace(/ /g,"_").toLowerCase();var a={caption:d[0],theme:"ace/theme/"+n,isDark:d[2]=="dark",name:n};e.themesByName[n]=a;return a;});});define("ace/ext/menu_tools/add_editor_menu_options",["require","exports","module","ace/ext/modelist","ace/ext/themelist"],function(r,e,m){'use strict';m.exports.addEditorMenuOptions=function addEditorMenuOptions(a){var b=r('../modelist');var t=r('../themelist');a.menuOptions={setNewLineMode:[{textContent:"unix",value:"unix"},{textContent:"windows",value:"windows"},{textContent:"auto",value:"auto"}],setTheme:[],setMode:[],setKeyboardHandler:[{textContent:"ace",value:""},{textContent:"vim",value:"ace/keyboard/vim"},{textContent:"emacs",value:"ace/keyboard/emacs"},{textContent:"textarea",value:"ace/keyboard/textarea"},{textContent:"sublime",value:"ace/keyboard/sublime"}]};a.menuOptions.setTheme=t.themes.map(function(c){return{textContent:c.caption,value:c.theme};});a.menuOptions.setMode=b.modes.map(function(c){return{textContent:c.name,value:c.mode};});};});define("ace/ext/menu_tools/get_set_functions",["require","exports","module"],function(r,e,m){'use strict';m.exports.getSetFunctions=function getSetFunctions(a){var o=[];var b={'editor':a,'session':a.session,'renderer':a.renderer};var c=[];var s=['setOption','setUndoManager','setDocument','setValue','setBreakpoints','setScrollTop','setScrollLeft','setSelectionStyle','setWrapLimitRange'];['renderer','session','editor'].forEach(function(d){var f=b[d];var g=d;for(var h in f){if(s.indexOf(h)===-1){if(/^set/.test(h)&&c.indexOf(h)===-1){c.push(h);o.push({'functionName':h,'parentObj':f,'parentName':g});}}}});return o;};});define("ace/ext/menu_tools/generate_settings_menu",["require","exports","module","ace/ext/menu_tools/element_generator","ace/ext/menu_tools/add_editor_menu_options","ace/ext/menu_tools/get_set_functions","ace/ace"],function(r,c,m){'use strict';var d=r('./element_generator');var f=r('./add_editor_menu_options').addEditorMenuOptions;var g=r('./get_set_functions').getSetFunctions;m.exports.generateSettingsMenu=function generateSettingsMenu(h){var i=[];function j(){i.sort(function(a,b){var x=a.getAttribute('contains');var y=b.getAttribute('contains');return x.localeCompare(y);});}function w(){var t=document.createElement('div');t.setAttribute('id','ace_settingsmenu');i.forEach(function(a){t.appendChild(a);});var e=t.appendChild(document.createElement('div'));var v=r("../../ace").version;e.style.padding="1em";e.textContent="Ace version "+v;return t;}function k(o,a,b,v){var p;var q=document.createElement('div');q.setAttribute('contains',b);q.setAttribute('class','ace_optionsMenuEntry');q.setAttribute('style','clear: both;');q.appendChild(d.createLabel(b.replace(/^set/,'').replace(/([A-Z])/g,' $1').trim(),b));if(Array.isArray(v)){p=d.createSelection(b,v,a);p.addEventListener('change',function(e){try{h.menuOptions[e.target.id].forEach(function(x){if(x.textContent!==e.target.textContent){delete x.selected;}});o[e.target.id](e.target.value);}catch(s){throw new Error(s);}});}else if(typeof v==='boolean'){p=d.createCheckbox(b,v,a);p.addEventListener('change',function(e){try{o[e.target.id](!!e.target.checked);}catch(s){throw new Error(s);}});}else{p=d.createInput(b,v,a);p.addEventListener('change',function(e){try{if(e.target.value==='true'){o[e.target.id](true);}else if(e.target.value==='false'){o[e.target.id](false);}else{o[e.target.id](e.target.value);}}catch(s){throw new Error(s);}});}p.style.cssText='float:right;';q.appendChild(p);return q;}function l(a,e,b,o){var v=h.menuOptions[a];var p=e[o]();if(typeof p=='object')p=p.$id;v.forEach(function(q){if(q.value===p)q.selected='selected';});return k(e,b,a,v);}function n(s){var a=s.functionName;var b=s.parentObj;var o=s.parentName;var v;var p=a.replace(/^set/,'get');if(h.menuOptions[a]!==undefined){i.push(l(a,b,o,p));}else if(typeof b[p]==='function'){try{v=b[p]();if(typeof v==='object'){v=v.$id;}i.push(k(b,o,a,v));}catch(e){}}}f(h);g(h).forEach(function(s){n(s);});j();return w();};});define("ace/ext/menu_tools/overlay_page",["require","exports","module","ace/lib/dom"],function(r,a,m){'use strict';var d=r("../../lib/dom");var c="#ace_settingsmenu, #kbshortcutmenu {background-color: #F7F7F7;color: black;box-shadow: -5px 4px 5px rgba(126, 126, 126, 0.55);padding: 1em 0.5em 2em 1em;overflow: auto;position: absolute;margin: 0;bottom: 0;right: 0;top: 0;z-index: 9991;cursor: default;}.ace_dark #ace_settingsmenu, .ace_dark #kbshortcutmenu {box-shadow: -20px 10px 25px rgba(126, 126, 126, 0.25);background-color: rgba(255, 255, 255, 0.6);color: black;}.ace_optionsMenuEntry:hover {background-color: rgba(100, 100, 100, 0.1);-webkit-transition: all 0.5s;transition: all 0.3s}.ace_closeButton {background: rgba(245, 146, 146, 0.5);border: 1px solid #F48A8A;border-radius: 50%;padding: 7px;position: absolute;right: -8px;top: -8px;z-index: 1000;}.ace_closeButton{background: rgba(245, 146, 146, 0.9);}.ace_optionsMenuKey {color: darkslateblue;font-weight: bold;}.ace_optionsMenuCommand {color: darkcyan;font-weight: normal;}";d.importCssString(c);m.exports.overlayPage=function overlayPage(b,f,t,g,h,l){t=t?'top: '+t+';':'';h=h?'bottom: '+h+';':'';g=g?'right: '+g+';':'';l=l?'left: '+l+';':'';var i=document.createElement('div');var j=document.createElement('div');function k(e){if(e.keyCode===27){i.click();}}i.style.cssText='margin: 0; padding: 0; '+'position: fixed; top:0; bottom:0; left:0; right:0;'+'z-index: 9990; '+'background-color: rgba(0, 0, 0, 0.3);';i.addEventListener('click',function(){document.removeEventListener('keydown',k);i.parentNode.removeChild(i);b.focus();i=null;});document.addEventListener('keydown',k);j.style.cssText=t+g+h+l;j.addEventListener('click',function(e){e.stopPropagation();});var w=d.createElement("div");w.style.position="relative";var n=d.createElement("div");n.className="ace_closeButton";n.addEventListener('click',function(){i.click();});w.appendChild(n);j.appendChild(w);j.appendChild(f);i.appendChild(j);document.body.appendChild(i);b.blur();};});define("ace/ext/settings_menu",["require","exports","module","ace/ext/menu_tools/generate_settings_menu","ace/ext/menu_tools/overlay_page","ace/editor"],function(r,e,m){"use strict";var g=r('./menu_tools/generate_settings_menu').generateSettingsMenu;var o=r('./menu_tools/overlay_page').overlayPage;function s(a){var b=document.getElementById('ace_settingsmenu');if(!b)o(a,g(a),'0','0','0');}m.exports.init=function(a){var E=r("ace/editor").Editor;E.prototype.showSettingsMenu=function(){s(this);};};});(function(){window.require(["ace/ext/settings_menu"],function(){});})();
