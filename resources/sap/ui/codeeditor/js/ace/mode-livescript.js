define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(r,e,m){"use strict";var R=r("../range").Range;var M=function(){};(function(){this.checkOutdent=function(l,i){if(!/^\s+$/.test(l))return false;return/^\s*\}/.test(i);};this.autoOutdent=function(d,a){var l=d.getLine(a);var b=l.match(/^(\s*\})/);if(!b)return 0;var c=b[1].length;var o=d.findMatchingBracket({row:a,column:c});if(!o||o.row==a)return 0;var i=this.$getIndent(d.getLine(o.row));d.replace(new R(a,0,a,c-1),i);};this.$getIndent=function(l){return l.match(/^\s*/)[0];};}).call(M.prototype);e.MatchingBraceOutdent=M;});define("ace/mode/livescript",["require","exports","module","ace/tokenizer","ace/mode/matching_brace_outdent","ace/mode/text"],function(r,e,m){var i,L,k,s;i='(?![\\d\\s])[$\\w\\xAA-\\uFFDC](?:(?!\\s)[$\\w\\xAA-\\uFFDC]|-[A-Za-z])*';e.Mode=L=(function(c){var d,p=a((b(L,c).displayName='LiveScriptMode',L),c).prototype,f=L;function L(){var t;this.$tokenizer=new(r('../tokenizer')).Tokenizer(L.Rules);if(t=r('../mode/matching_brace_outdent')){this.$outdent=new t.MatchingBraceOutdent;}this.$id="ace/mode/livescript";}d=RegExp('(?:[({[=:]|[-~]>|\\b(?:e(?:lse|xport)|d(?:o|efault)|t(?:ry|hen)|finally|import(?:\\s*all)?|const|var|let|new|catch(?:\\s*'+i+')?))\\s*$');p.getNextLineIndent=function(g,l,t){var h,j;h=this.$getIndent(l);j=this.$tokenizer.getLineTokens(l,g).tokens;if(!(j.length&&j[j.length-1].type==='comment')){if(g==='start'&&d.test(l)){h+=t;}}return h;};p.lineCommentStart="#";p.blockComment={start:"###",end:"###"};p.checkOutdent=function(g,l,h){var j;return(j=this.$outdent)!=null?j.checkOutdent(l,h):void 8;};p.autoOutdent=function(g,h,j){var l;return(l=this.$outdent)!=null?l.autoOutdent(h,j):void 8;};return L;}(r('../mode/text').Mode));k='(?![$\\w]|-[A-Za-z]|\\s*:(?![:=]))';s={defaultToken:'string'};L.Rules={start:[{token:'keyword',regex:'(?:t(?:h(?:is|row|en)|ry|ypeof!?)|c(?:on(?:tinue|st)|a(?:se|tch)|lass)|i(?:n(?:stanceof)?|mp(?:ort(?:\\s+all)?|lements)|[fs])|d(?:e(?:fault|lete|bugger)|o)|f(?:or(?:\\s+own)?|inally|unction)|s(?:uper|witch)|e(?:lse|x(?:tends|port)|val)|a(?:nd|rguments)|n(?:ew|ot)|un(?:less|til)|w(?:hile|ith)|o[fr]|return|break|let|var|loop)'+k},{token:'constant.language',regex:'(?:true|false|yes|no|on|off|null|void|undefined)'+k},{token:'invalid.illegal',regex:'(?:p(?:ackage|r(?:ivate|otected)|ublic)|i(?:mplements|nterface)|enum|static|yield)'+k},{token:'language.support.class',regex:'(?:R(?:e(?:gExp|ferenceError)|angeError)|S(?:tring|yntaxError)|E(?:rror|valError)|Array|Boolean|Date|Function|Number|Object|TypeError|URIError)'+k},{token:'language.support.function',regex:'(?:is(?:NaN|Finite)|parse(?:Int|Float)|Math|JSON|(?:en|de)codeURI(?:Component)?)'+k},{token:'variable.language',regex:'(?:t(?:hat|il|o)|f(?:rom|allthrough)|it|by|e)'+k},{token:'identifier',regex:i+'\\s*:(?![:=])'},{token:'variable',regex:i},{token:'keyword.operator',regex:'(?:\\.{3}|\\s+\\?)'},{token:'keyword.variable',regex:'(?:@+|::|\\.\\.)',next:'key'},{token:'keyword.operator',regex:'\\.\\s*',next:'key'},{token:'string',regex:'\\\\\\S[^\\s,;)}\\]]*'},{token:'string.doc',regex:'\'\'\'',next:'qdoc'},{token:'string.doc',regex:'"""',next:'qqdoc'},{token:'string',regex:'\'',next:'qstring'},{token:'string',regex:'"',next:'qqstring'},{token:'string',regex:'`',next:'js'},{token:'string',regex:'<\\[',next:'words'},{token:'string.regex',regex:'//',next:'heregex'},{token:'comment.doc',regex:'/\\*',next:'comment'},{token:'comment',regex:'#.*'},{token:'string.regex',regex:'\\/(?:[^[\\/\\n\\\\]*(?:(?:\\\\.|\\[[^\\]\\n\\\\]*(?:\\\\.[^\\]\\n\\\\]*)*\\])[^[\\/\\n\\\\]*)*)\\/[gimy$]{0,4}',next:'key'},{token:'constant.numeric',regex:'(?:0x[\\da-fA-F][\\da-fA-F_]*|(?:[2-9]|[12]\\d|3[0-6])r[\\da-zA-Z][\\da-zA-Z_]*|(?:\\d[\\d_]*(?:\\.\\d[\\d_]*)?|\\.\\d[\\d_]*)(?:e[+-]?\\d[\\d_]*)?[\\w$]*)'},{token:'lparen',regex:'[({[]'},{token:'rparen',regex:'[)}\\]]',next:'key'},{token:'keyword.operator',regex:'[\\^!|&%+\\-]+'},{token:'text',regex:'\\s+'}],heregex:[{token:'string.regex',regex:'.*?//[gimy$?]{0,4}',next:'start'},{token:'string.regex',regex:'\\s*#{'},{token:'comment.regex',regex:'\\s+(?:#.*)?'},{defaultToken:'string.regex'}],key:[{token:'keyword.operator',regex:'[.?@!]+'},{token:'identifier',regex:i,next:'start'},{token:'text',regex:'',next:'start'}],comment:[{token:'comment.doc',regex:'.*?\\*/',next:'start'},{defaultToken:'comment.doc'}],qdoc:[{token:'string',regex:".*?'''",next:'key'},s],qqdoc:[{token:'string',regex:'.*?"""',next:'key'},s],qstring:[{token:'string',regex:'[^\\\\\']*(?:\\\\.[^\\\\\']*)*\'',next:'key'},s],qqstring:[{token:'string',regex:'[^\\\\"]*(?:\\\\.[^\\\\"]*)*"',next:'key'},s],js:[{token:'string',regex:'[^\\\\`]*(?:\\\\.[^\\\\`]*)*`',next:'key'},s],words:[{token:'string',regex:'.*?\\]>',next:'key'},s]};function a(c,d){function f(){}f.prototype=(c.superclass=d).prototype;(c.prototype=new f).constructor=c;if(typeof d.extended=='function')d.extended(c);return c;}function b(o,c){var d={}.hasOwnProperty;for(var f in c)if(d.call(c,f))o[f]=c[f];return o;}});
