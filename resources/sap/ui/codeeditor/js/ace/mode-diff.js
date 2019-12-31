define("ace/mode/diff_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(r,e,m){"use strict";var o=r("../lib/oop");var T=r("./text_highlight_rules").TextHighlightRules;var D=function(){this.$rules={"start":[{regex:"^(?:\\*{15}|={67}|-{3}|\\+{3})$",token:"punctuation.definition.separator.diff","name":"keyword"},{regex:"^(@@)(\\s*.+?\\s*)(@@)(.*)$",token:["constant","constant.numeric","constant","comment.doc.tag"]},{regex:"^(\\d+)([,\\d]+)(a|d|c)(\\d+)([,\\d]+)(.*)$",token:["constant.numeric","punctuation.definition.range.diff","constant.function","constant.numeric","punctuation.definition.range.diff","invalid"],"name":"meta."},{regex:"^(\\-{3}|\\+{3}|\\*{3})( .+)$",token:["constant.numeric","meta.tag"]},{regex:"^([!+>])(.*?)(\\s*)$",token:["support.constant","text","invalid"]},{regex:"^([<\\-])(.*?)(\\s*)$",token:["support.function","string","invalid"]},{regex:"^(diff)(\\s+--\\w+)?(.+?)( .+)?$",token:["variable","variable","keyword","variable"]},{regex:"^Index.+$",token:"variable"},{regex:"^\\s+$",token:"text"},{regex:"\\s*$",token:"invalid"},{defaultToken:"invisible",caseInsensitive:true}]};};o.inherits(D,T);e.DiffHighlightRules=D;});define("ace/mode/folding/diff",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"],function(r,e,m){"use strict";var o=r("../../lib/oop");var B=r("./fold_mode").FoldMode;var R=r("../../range").Range;var F=e.FoldMode=function(l,f){this.regExpList=l;this.flag=f;this.foldingStartMarker=RegExp("^("+l.join("|")+")",this.flag);};o.inherits(F,B);(function(){this.getFoldWidgetRange=function(s,f,a){var b=s.getLine(a);var c={row:a,column:b.length};var d=this.regExpList;for(var i=1;i<=d.length;i++){var g=RegExp("^("+d.slice(0,i).join("|")+")",this.flag);if(g.test(b))break;}for(var l=s.getLength();++a<l;){b=s.getLine(a);if(g.test(b))break;}if(a==c.row+1)return;return R.fromPoints(c,{row:a-1,column:b.length});};}).call(F.prototype);});define("ace/mode/diff",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/diff_highlight_rules","ace/mode/folding/diff"],function(r,e,m){"use strict";var o=r("../lib/oop");var T=r("./text").Mode;var H=r("./diff_highlight_rules").DiffHighlightRules;var F=r("./folding/diff").FoldMode;var M=function(){this.HighlightRules=H;this.foldingRules=new F(["diff","index","\\+{3}","@@|\\*{5}"],"i");};o.inherits(M,T);(function(){this.$id="ace/mode/diff";}).call(M.prototype);e.Mode=M;});
