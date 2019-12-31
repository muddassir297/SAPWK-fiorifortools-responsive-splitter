define("ace/mode/vhdl_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(r,e,m){"use strict";var o=r("../lib/oop");var T=r("./text_highlight_rules").TextHighlightRules;var V=function(){var k="access|after|ailas|all|architecture|assert|attribute|"+"begin|block|buffer|bus|case|component|configuration|"+"disconnect|downto|else|elsif|end|entity|file|for|function|"+"generate|generic|guarded|if|impure|in|inertial|inout|is|"+"label|linkage|literal|loop|mapnew|next|of|on|open|"+"others|out|port|process|pure|range|record|reject|"+"report|return|select|shared|subtype|then|to|transport|"+"type|unaffected|united|until|wait|when|while|with";var s="bit|bit_vector|boolean|character|integer|line|natural|"+"positive|real|register|severity|signal|signed|"+"std_logic|std_logic_vector|string||text|time|unsigned|"+"variable";var a="array|constant";var b="abs|and|mod|nand|nor|not|rem|rol|ror|sla|sll|sra"+"srl|xnor|xor";var c=("true|false|null");var d=this.createKeywordMapper({"keyword.operator":b,"keyword":k,"constant.language":c,"storage.modifier":a,"storage.type":s},"identifier",true);this.$rules={"start":[{token:"comment",regex:"--.*$"},{token:"string",regex:'".*?"'},{token:"string",regex:"'.*?'"},{token:"constant.numeric",regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},{token:"keyword",regex:"\\s*(?:library|package|use)\\b"},{token:d,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"keyword.operator",regex:"&|\\*|\\+|\\-|\\/|<|=|>|\\||=>|\\*\\*|:=|\\/=|>=|<=|<>"},{token:"punctuation.operator",regex:"\\'|\\:|\\,|\\;|\\."},{token:"paren.lparen",regex:"[[(]"},{token:"paren.rparen",regex:"[\\])]"},{token:"text",regex:"\\s+"}]};};o.inherits(V,T);e.VHDLHighlightRules=V;});define("ace/mode/vhdl",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/vhdl_highlight_rules","ace/range"],function(r,e,m){"use strict";var o=r("../lib/oop");var T=r("./text").Mode;var V=r("./vhdl_highlight_rules").VHDLHighlightRules;var R=r("../range").Range;var M=function(){this.HighlightRules=V;};o.inherits(M,T);(function(){this.lineCommentStart="--";this.$id="ace/mode/vhdl";}).call(M.prototype);e.Mode=M;});
