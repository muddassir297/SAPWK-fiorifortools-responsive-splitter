define("ace/mode/perl_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(r,e,m){"use strict";var o=r("../lib/oop");var T=r("./text_highlight_rules").TextHighlightRules;var P=function(){var k=("base|constant|continue|else|elsif|for|foreach|format|goto|if|last|local|my|next|"+"no|package|parent|redo|require|scalar|sub|unless|until|while|use|vars");var b=("ARGV|ENV|INC|SIG");var a=("getprotobynumber|getprotobyname|getservbyname|gethostbyaddr|"+"gethostbyname|getservbyport|getnetbyaddr|getnetbyname|getsockname|"+"getpeername|setpriority|getprotoent|setprotoent|getpriority|"+"endprotoent|getservent|setservent|endservent|sethostent|socketpair|"+"getsockopt|gethostent|endhostent|setsockopt|setnetent|quotemeta|"+"localtime|prototype|getnetent|endnetent|rewinddir|wantarray|getpwuid|"+"closedir|getlogin|readlink|endgrent|getgrgid|getgrnam|shmwrite|"+"shutdown|readline|endpwent|setgrent|readpipe|formline|truncate|"+"dbmclose|syswrite|setpwent|getpwnam|getgrent|getpwent|ucfirst|sysread|"+"setpgrp|shmread|sysseek|sysopen|telldir|defined|opendir|connect|"+"lcfirst|getppid|binmode|syscall|sprintf|getpgrp|readdir|seekdir|"+"waitpid|reverse|unshift|symlink|dbmopen|semget|msgrcv|rename|listen|"+"chroot|msgsnd|shmctl|accept|unpack|exists|fileno|shmget|system|"+"unlink|printf|gmtime|msgctl|semctl|values|rindex|substr|splice|"+"length|msgget|select|socket|return|caller|delete|alarm|ioctl|index|"+"undef|lstat|times|srand|chown|fcntl|close|write|umask|rmdir|study|"+"sleep|chomp|untie|print|utime|mkdir|atan2|split|crypt|flock|chmod|"+"BEGIN|bless|chdir|semop|shift|reset|link|stat|chop|grep|fork|dump|"+"join|open|tell|pipe|exit|glob|warn|each|bind|sort|pack|eval|push|"+"keys|getc|kill|seek|sqrt|send|wait|rand|tied|read|time|exec|recv|"+"eof|chr|int|ord|exp|pos|pop|sin|log|abs|oct|hex|tie|cos|vec|END|ref|"+"map|die|uc|lc|do");var c=this.createKeywordMapper({"keyword":k,"constant.language":b,"support.function":a},"identifier");this.$rules={"start":[{token:"comment.doc",regex:"^=(?:begin|item)\\b",next:"block_comment"},{token:"string.regexp",regex:"[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/]\\w*\\s*(?=[).,;]|$)"},{token:"string",regex:'["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'},{token:"string",regex:'["].*\\\\$',next:"qqstring"},{token:"string",regex:"['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"},{token:"string",regex:"['].*\\\\$",next:"qstring"},{token:"constant.numeric",regex:"0x[0-9a-fA-F]+\\b"},{token:"constant.numeric",regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},{token:c,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"keyword.operator",regex:"%#|\\$#|\\.\\.\\.|\\|\\|=|>>=|<<=|<=>|&&=|=>|!~|\\^=|&=|\\|=|\\.=|x=|%=|\\/=|\\*=|\\-=|\\+=|=~|\\*\\*|\\-\\-|\\.\\.|\\|\\||&&|\\+\\+|\\->|!=|==|>=|<=|>>|<<|,|=|\\?\\:|\\^|\\||x|%|\\/|\\*|<|&|\\\\|~|!|>|\\.|\\-|\\+|\\-C|\\-b|\\-S|\\-u|\\-t|\\-p|\\-l|\\-d|\\-f|\\-g|\\-s|\\-z|\\-k|\\-e|\\-O|\\-T|\\-B|\\-M|\\-A|\\-X|\\-W|\\-c|\\-R|\\-o|\\-x|\\-w|\\-r|\\b(?:and|cmp|eq|ge|gt|le|lt|ne|not|or|xor)"},{token:"comment",regex:"#.*$"},{token:"lparen",regex:"[[({]"},{token:"rparen",regex:"[\\])}]"},{token:"text",regex:"\\s+"}],"qqstring":[{token:"string",regex:'(?:(?:\\\\.)|(?:[^"\\\\]))*?"',next:"start"},{token:"string",regex:'.+'}],"qstring":[{token:"string",regex:"(?:(?:\\\\.)|(?:[^'\\\\]))*?'",next:"start"},{token:"string",regex:'.+'}],"block_comment":[{token:"comment.doc",regex:"^=cut\\b",next:"start"},{defaultToken:"comment.doc"}]};};o.inherits(P,T);e.PerlHighlightRules=P;});define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(r,e,m){"use strict";var R=r("../range").Range;var M=function(){};(function(){this.checkOutdent=function(l,i){if(!/^\s+$/.test(l))return false;return/^\s*\}/.test(i);};this.autoOutdent=function(d,a){var l=d.getLine(a);var b=l.match(/^(\s*\})/);if(!b)return 0;var c=b[1].length;var o=d.findMatchingBracket({row:a,column:c});if(!o||o.row==a)return 0;var i=this.$getIndent(d.getLine(o.row));d.replace(new R(a,0,a,c-1),i);};this.$getIndent=function(l){return l.match(/^\s*/)[0];};}).call(M.prototype);e.MatchingBraceOutdent=M;});define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(r,e,a){"use strict";var o=r("../../lib/oop");var R=r("../../range").Range;var B=r("./fold_mode").FoldMode;var F=e.FoldMode=function(c){if(c){this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+c.start));this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+c.end));}};o.inherits(F,B);(function(){this.foldingStartMarker=/(\{|\[)[^\}\]]*$|^\s*(\/\*)/;this.foldingStopMarker=/^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/;this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/;this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/;this._getFoldWidgetBase=this.getFoldWidget;this.getFoldWidget=function(s,f,b){var l=s.getLine(b);if(this.singleLineBlockCommentRe.test(l)){if(!this.startRegionRe.test(l)&&!this.tripleStarBlockCommentRe.test(l))return"";}var c=this._getFoldWidgetBase(s,f,b);if(!c&&this.startRegionRe.test(l))return"start";return c;};this.getFoldWidgetRange=function(s,f,b,c){var l=s.getLine(b);if(this.startRegionRe.test(l))return this.getCommentRegionBlock(s,l,b);var m=l.match(this.foldingStartMarker);if(m){var i=m.index;if(m[1])return this.openingBracketBlock(s,m[1],b,i);var d=s.getCommentFoldRange(b,i+m[0].length,1);if(d&&!d.isMultiLine()){if(c){d=this.getSectionRange(s,b);}else if(f!="all")d=null;}return d;}if(f==="markbegin")return;var m=l.match(this.foldingStopMarker);if(m){var i=m.index+m[0].length;if(m[1])return this.closingBracketBlock(s,m[1],b,i);return s.getCommentFoldRange(b,i,-1);}};this.getSectionRange=function(s,b){var l=s.getLine(b);var c=l.search(/\S/);var d=b;var f=l.length;b=b+1;var g=b;var m=s.getLength();while(++b<m){l=s.getLine(b);var i=l.search(/\S/);if(i===-1)continue;if(c>i)break;var h=this.getFoldWidgetRange(s,"all",b);if(h){if(h.start.row<=d){break;}else if(h.isMultiLine()){b=h.end.row;}else if(c==i){break;}}g=b;}return new R(d,f,g,s.getLine(g).length);};this.getCommentRegionBlock=function(s,l,b){var c=l.search(/\s*$/);var d=s.getLength();var f=b;var g=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;var h=1;while(++b<d){l=s.getLine(b);var m=g.exec(l);if(!m)continue;if(m[1])h--;else h++;if(!h)break;}var i=b;if(i>f){return new R(f,c,i,l.length);}};}).call(F.prototype);});define("ace/mode/perl",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/perl_highlight_rules","ace/mode/matching_brace_outdent","ace/range","ace/mode/folding/cstyle"],function(r,e,m){"use strict";var o=r("../lib/oop");var T=r("./text").Mode;var P=r("./perl_highlight_rules").PerlHighlightRules;var M=r("./matching_brace_outdent").MatchingBraceOutdent;var R=r("../range").Range;var C=r("./folding/cstyle").FoldMode;var a=function(){this.HighlightRules=P;this.$outdent=new M();this.foldingRules=new C({start:"^=(begin|item)\\b",end:"^=(cut)\\b"});};o.inherits(a,T);(function(){this.lineCommentStart="#";this.blockComment=[{start:"=begin",end:"=cut",lineStartOnly:true},{start:"=item",end:"=cut",lineStartOnly:true}];this.getNextLineIndent=function(s,l,t){var i=this.$getIndent(l);var b=this.getTokenizer().getLineTokens(l,s);var c=b.tokens;if(c.length&&c[c.length-1].type=="comment"){return i;}if(s=="start"){var d=l.match(/^.*[\{\(\[:]\s*$/);if(d){i+=t;}}return i;};this.checkOutdent=function(s,l,i){return this.$outdent.checkOutdent(l,i);};this.autoOutdent=function(s,d,b){this.$outdent.autoOutdent(d,b);};this.$id="ace/mode/perl";}).call(a.prototype);e.Mode=a;});
