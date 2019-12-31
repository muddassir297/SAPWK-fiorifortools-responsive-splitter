define("ace/mode/elm_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(r,e,m){"use strict";var o=r("../lib/oop");var T=r("./text_highlight_rules").TextHighlightRules;var E=function(){var k=this.createKeywordMapper({"keyword":"as|case|class|data|default|deriving|do|else|export|foreign|"+"hiding|jsevent|if|import|in|infix|infixl|infixr|instance|let|"+"module|newtype|of|open|then|type|where|_|port|\u03BB"},"identifier");var a=/\\(\d+|['"\\&trnbvf])/;var s=/[a-z_]/.source;var l=/[A-Z]/.source;var i=/[a-z_A-Z0-9']/.source;this.$rules={start:[{token:"string.start",regex:'"',next:"string"},{token:"string.character",regex:"'(?:"+a.source+"|.)'?"},{regex:/0(?:[xX][0-9A-Fa-f]+|[oO][0-7]+)|\d+(\.\d+)?([eE][-+]?\d*)?/,token:"constant.numeric"},{token:"comment",regex:"--.*"},{token:"keyword",regex:/\.\.|\||:|=|\\|"|->|<-|\u2192/},{token:"keyword.operator",regex:/[-!#$%&*+.\/<=>?@\\^|~:\u03BB\u2192]+/},{token:"operator.punctuation",regex:/[,;`]/},{regex:l+i+"+\\.?",token:function(v){if(v[v.length-1]==".")return"entity.name.function";return"constant.language";}},{regex:"^"+s+i+"+",token:function(v){return"constant.language";}},{token:k,regex:"[\\w\\xff-\\u218e\\u2455-\\uffff]+\\b"},{regex:"{-#?",token:"comment.start",onMatch:function(v,c,b){this.next=v.length==2?"blockComment":"docComment";return this.token;}},{token:"variable.language",regex:/\[markdown\|/,next:"markdown"},{token:"paren.lparen",regex:/[\[({]/},{token:"paren.rparen",regex:/[\])}]/}],markdown:[{regex:/\|\]/,next:"start"},{defaultToken:"string"}],blockComment:[{regex:"{-",token:"comment.start",push:"blockComment"},{regex:"-}",token:"comment.end",next:"pop"},{defaultToken:"comment"}],docComment:[{regex:"{-",token:"comment.start",push:"docComment"},{regex:"-}",token:"comment.end",next:"pop"},{defaultToken:"doc.comment"}],string:[{token:"constant.language.escape",regex:a},{token:"text",regex:/\\(\s|$)/,next:"stringGap"},{token:"string.end",regex:'"',next:"start"},{defaultToken:"string"}],stringGap:[{token:"text",regex:/\\/,next:"string"},{token:"error",regex:"",next:"start"}]};this.normalizeRules();};o.inherits(E,T);e.ElmHighlightRules=E;});define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(r,e,a){"use strict";var o=r("../../lib/oop");var R=r("../../range").Range;var B=r("./fold_mode").FoldMode;var F=e.FoldMode=function(c){if(c){this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+c.start));this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+c.end));}};o.inherits(F,B);(function(){this.foldingStartMarker=/(\{|\[)[^\}\]]*$|^\s*(\/\*)/;this.foldingStopMarker=/^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/;this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/;this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/;this._getFoldWidgetBase=this.getFoldWidget;this.getFoldWidget=function(s,f,b){var l=s.getLine(b);if(this.singleLineBlockCommentRe.test(l)){if(!this.startRegionRe.test(l)&&!this.tripleStarBlockCommentRe.test(l))return"";}var c=this._getFoldWidgetBase(s,f,b);if(!c&&this.startRegionRe.test(l))return"start";return c;};this.getFoldWidgetRange=function(s,f,b,c){var l=s.getLine(b);if(this.startRegionRe.test(l))return this.getCommentRegionBlock(s,l,b);var m=l.match(this.foldingStartMarker);if(m){var i=m.index;if(m[1])return this.openingBracketBlock(s,m[1],b,i);var d=s.getCommentFoldRange(b,i+m[0].length,1);if(d&&!d.isMultiLine()){if(c){d=this.getSectionRange(s,b);}else if(f!="all")d=null;}return d;}if(f==="markbegin")return;var m=l.match(this.foldingStopMarker);if(m){var i=m.index+m[0].length;if(m[1])return this.closingBracketBlock(s,m[1],b,i);return s.getCommentFoldRange(b,i,-1);}};this.getSectionRange=function(s,b){var l=s.getLine(b);var c=l.search(/\S/);var d=b;var f=l.length;b=b+1;var g=b;var m=s.getLength();while(++b<m){l=s.getLine(b);var i=l.search(/\S/);if(i===-1)continue;if(c>i)break;var h=this.getFoldWidgetRange(s,"all",b);if(h){if(h.start.row<=d){break;}else if(h.isMultiLine()){b=h.end.row;}else if(c==i){break;}}g=b;}return new R(d,f,g,s.getLine(g).length);};this.getCommentRegionBlock=function(s,l,b){var c=l.search(/\s*$/);var d=s.getLength();var f=b;var g=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;var h=1;while(++b<d){l=s.getLine(b);var m=g.exec(l);if(!m)continue;if(m[1])h--;else h++;if(!h)break;}var i=b;if(i>f){return new R(f,c,i,l.length);}};}).call(F.prototype);});define("ace/mode/elm",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/elm_highlight_rules","ace/mode/folding/cstyle"],function(r,e,m){"use strict";var o=r("../lib/oop");var T=r("./text").Mode;var H=r("./elm_highlight_rules").ElmHighlightRules;var F=r("./folding/cstyle").FoldMode;var M=function(){this.HighlightRules=H;this.foldingRules=new F();};o.inherits(M,T);(function(){this.lineCommentStart="--";this.blockComment={start:"{-",end:"-}",nestable:true};this.$id="ace/mode/elm";}).call(M.prototype);e.Mode=M;});