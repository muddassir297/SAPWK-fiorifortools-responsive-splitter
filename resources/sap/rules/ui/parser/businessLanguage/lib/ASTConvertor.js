jQuery.sap.declare("sap.rules.ui.parser.businessLanguage.lib.ASTConvertor");jQuery.sap.require("sap.rules.ui.parser.businessLanguage.lib.constants");jQuery.sap.require("sap.rules.ui.parser.AST.lib.bundleAst");sap.rules.ui.parser.businessLanguage.lib.ASTConvertor=sap.rules.ui.parser.businessLanguage.lib.ASTConvertor||{};sap.rules.ui.parser.businessLanguage.lib.ASTConvertor.lib=(function(){var p=sap.rules.ui.parser.businessLanguage.lib.constants.lib;var b=RulesAPI_Ast;var a=b.astNodes;var A="all";var c="any";var E="exists in";var N="not exists in";var B="between";var d="not between";var L="(";var C=")";e.operatorsMap={'+':a.BinaryExprNode.operator.plus,'-':a.BinaryExprNode.operator.minus,'*':a.BinaryExprNode.operator.mult,'/':a.BinaryExprNode.operator.div,'and':a.LogicalExprNode.operator.and,'or':a.LogicalExprNode.operator.or,'=':a.RelationalExprNode.operator.isEqual,'is equal to':a.RelationalExprNode.operator.isEqual,'!=':a.RelationalExprNode.operator.isNotEqual,'is not equal to':a.RelationalExprNode.operator.isNotEqual,'>':a.RelationalExprNode.operator.isGreater,'is greater than':a.RelationalExprNode.operator.isGreater,'>=':a.RelationalExprNode.operator.isGreaterEqual,'is greater equal than':a.RelationalExprNode.operator.isGreaterEqual,'<':a.RelationalExprNode.operator.isLess,'is less than':a.RelationalExprNode.operator.isLess,'<=':a.RelationalExprNode.operator.isLessEqual,'is less equal than':a.RelationalExprNode.operator.isLessEqual,'average':a.AggFunctionNode.aggFunction.avg,'count':a.AggFunctionNode.aggFunction.count,'count distinct':a.AggFunctionNode.aggFunction.countDistinct,'max':a.AggFunctionNode.aggFunction.max,'min':a.AggFunctionNode.aggFunction.min,'sum':a.AggFunctionNode.aggFunction.sum,'contains':a.FunctionNode.functionName.contains,'not contains':a.FunctionNode.functionName.notContains,'ends':a.FunctionNode.functionName.endsWith,'not ends':a.FunctionNode.functionName.notEndsWith,'exists in':a.FunctionNode.functionName.existsIn,'not exists in':a.FunctionNode.functionName.notExistsIn,'between':a.FunctionNode.functionName.isBetween,'not between':a.FunctionNode.functionName.isNotBetween,'is in the last':a.FunctionNode.functionName.isInTheLast,'is not in the last':a.FunctionNode.functionName.isNotInTheLast,'is in the next':a.FunctionNode.functionName.isInTheNext,'is not in the next':a.FunctionNode.functionName.isNotInTheNext,'is like':a.FunctionNode.functionName.isLike,'is not like':a.FunctionNode.functionName.isNotLike,'starts':a.FunctionNode.functionName.startsWith,'not starts':a.FunctionNode.functionName.notStartsWith,'concatenate':a.FunctionNode.functionName.concatenate};function e(o){var h;var f;var g;var j;var k;var l;var m;var n;this.newAST={};this.lastAggrNode=null;function q(i,R,S){if(S){return new a.UOMLiteralNode(S.value,i,S.constant);}return new a.LiteralNode(R,i);}function r(i){var R=null;if(i.hasOwnProperty("getCompoundValue")){R=i.getCompoundValue();}return R;}function s(i){var R=i.getValue();var S=i.getValueType();var T=r(i);return q.call(this,S,R,T);}function t(i){var R={};R.businessType=i.getAttributeType();R.isCollection=i.getIsCollection();R.rootObject=i.getRootObject();R.attribute=i.getAttribute();R.associations=i.getAssociationsArray();R.modifiers=i.getModifiers();return R;}function u(i){var R=null;var S=t(i);R=new a.IdentifierNode(S);return R;}function v(R,S){var i;var T=[];var U;var V=null;T.push(S);for(i=0;i<R.valuesArray.length;i++){U=R.valuesArray[i];V=j.call(this,U);T.push(V);}return T;}function w(i,R,S){var T=null;if(S&&S.value){switch(S.value){case N:case E:case B:case d:T=v.call(this,i,R);break;}}return T;}function x(i,R,S){var T=null;var U=i.getType();if(U===p.objectNamesEnum.setOfValues){T=w.call(this,i,R,S);}return T;}function y(i){var R;var S=false;R=i.getType();if(R===p.objectNamesEnum.setOfValues){S=true;}return S;}function z(i){var R=null;if(i.hasOwnProperty("getQuantity")===true&&i.getQuantity()!==null){R=s.call(this,i.getQuantity());}return R;}function D(R){var i;var S=null;var T=[];if(R.hasOwnProperty("getGroupByArray")&&R.getGroupByArray()!==null){S=new a.GroupClauseNode();T=R.getGroupByArray();for(i=0;i<T.length;i++){S.addChild(u.call(this,T[i]));}}return S;}function F(i){var R=null;var S=null;if(i.hasOwnProperty("getOrderBy")===true&&i.getOrderBy()!==null){S=u.call(this,i.getOrderBy());}if(S){if(i.hasOwnProperty("getOperator")&&i.getOperator()!==null){R=new a.OrderClauseNode(i.getOperator().getOriginalValue());}else{R=new a.OrderClauseNode(null);}R.addChild(S);}return R;}function G(i,R){var S=null;var T=null;var U=null;var V=null;var W=null;S=u.call(this,i.getNavigationPredicateDetails());this.lastAggrNode.addChild(S);if(i.hasOwnProperty("getFilterClause")){T=new a.FilterClauseNode();T.addChild(f.call(this,i.getFilterClause()));S.addChild(T);}if(R!==null){U=D.call(this,R);if(U){this.lastAggrNode.addChild(U);}W=F.call(this,R);if(W){S.addChild(W);}V=z.call(this,R);if(V){S.addChild(V);}}return this.lastAggrNode;}function H(i){var R;var S=null;if(i!==null){R=i.getType();if(i.hasOwnProperty("getOriginalValue")){S=i.getOriginalValue().toLowerCase();}else{if(R===p.objectNamesEnum.collectionOperatorOption){S="collect";}else if(i.getAggregationOperator().getValue()!==A){S=i.getAggregationOperator().getValue().toLowerCase();}}}return S;}l=function(i){var R=null;var S=null;var T=null;var U=null;var V=null;var W=null;var X=null;var Y;if(i.hasOwnProperty("getAggregationOption")){X=i.getAggregationOption();W=H(X);if(W!==null){U=new a.AggFunctionNode(e.operatorsMap[W]);this.lastAggrNode=U;}}if((W===null||W==="collect")&&(i.hasOwnProperty("getSelection")&&i.getSelection()!==null)){Y=i.getSelection();}else{if(i.hasOwnProperty("getCompoundSelection")&&i.getCompoundSelection()!==null){R=l.call(this,i.getCompoundSelection());if(U&&!(R instanceof a.AggFunctionNode)){U.addChild(R);return U;}return R;}Y=i.getSelection();}if(Y.hasOwnProperty("getFilterClause")||(X!==null&&X.hasOwnProperty("getGroupByArray")&&X.getGroupByArray()!==null)){return G.call(this,Y,X);}V=u.call(this,Y.getNavigationPredicateDetails());if(U){U.addChild(V);}if(X!==null&&V){T=F.call(this,X);S=z.call(this,X);if(T){V.addChild(T);}if(S){V.addChild(S);}}if(U){return U;}return V;};k=function(i){var R=i.getType();var S=null;switch(R){case p.objectNamesEnum.simpleSelection:S=s.call(this,i);break;case p.objectNamesEnum.compoundSelection:S=l.call(this,i,null);break;}return S;};var I=function(i,R,S){var T={};var U;var V;var W="";var X=true;T.expression="";T.index=R;while(T.index<S&&X){U=i[T.index];V=U.getType();if(U.hasOwnProperty('getValue')&&U.getValue()!==null){W=U.getValue().trim();}else{W="";}if(V===p.objectNamesEnum.arithmeticOperator&&(W===L||W===C)){T.expression+=W;T.index++;}else{X=false;}}return T;};j=function(R){var S=0;var T=null;var U;var V;var i=0;var W;if(Array.isArray(R.selectionsArray)){S=R.selectionsArray.length;W=R.selectionsArray[i].getType();if(W===p.objectNamesEnum.selectionClause){U=j.call(this,R.selectionsArray[i]);i++;}else{U=k.call(this,R.selectionsArray[i]);i++;}while(i<S){T={};T.value=R.selectionsArray[i].getValue().trim();T.type=R.selectionsArray[i].getType();i++;W=R.selectionsArray[i].getType();if(W===p.objectNamesEnum.selectionClause){V=j.call(this,R.selectionsArray[i]);i++;}else{V=k.call(this,R.selectionsArray[i]);i++;}U=m.call(this,U,V,T);}return U;}return null;};var J=function J(i){return(i==='>'||i==='<'||i==='='||i==='!='||i==='>='||i==='<=');};m=function m(R,S,T){var U;var i;if(T&&T.type&&T.value){if(T.type===p.objectNamesEnum.arithmeticOperator){if(R!==null&&S!==null){U=new a.BinaryExprNode(e.operatorsMap[T.value]);}else{if(R===null&&S!==null){U=new a.UnaryExprNode(e.operatorsMap[T.value]);}}}else if(T.type===p.objectNamesEnum.operatorOption){if(J(T.value)){U=new a.RelationalExprNode(e.operatorsMap[T.value]);}else{U=new a.FunctionNode(e.operatorsMap[T.value]);}}else{U=new a.LogicalExprNode(e.operatorsMap[T.value]);}}if(R!==null){if(U){if(Array.isArray(R)){for(i=0;i<R.length;i++){U.addChild(R[i]);}}else{U.addChild(R);}}else{return R;}}if(S!==null){if(U){if(Array.isArray(S)){for(i=0;i<S.length;i++){U.addChild(S[i]);}}else{U.addChild(S);}}else{return S;}}return U;};g=function g(i){var R=null,S=null;var T=null,U=null;var V=null;if(i.hasOwnProperty("getSelectionOperator")){V={};V.value=i.getSelectionOperator().getValue().trim();V.type=i.getSelectionOperator().getType();}S=i.getLeftSelectionClause();U=j.call(this,S);if(i.hasOwnProperty("getRightSelectionClause")){R=i.getRightSelectionClause();if(R.getType()===p.objectNamesEnum.complexStatement){T=new a.BracketsExprNode();T.addChild(f.call(this,R.getModel()));}else if(y(R)){U=x.call(this,R,U,V);}else{T=j.call(this,R);}}return m.call(this,U,T,V);};var K=function K(i){return(i&&(i===p.complexCategoryEnum.structAll||i===p.complexCategoryEnum.structAny||i===p.complexCategoryEnum.structNewLine));};var M=function M(i,R){var S=null;var T=null;if(R){if(R===p.complexCategoryEnum.structAll){S=A;T=new a.StructNode(S);}else if(R===p.complexCategoryEnum.structAny){S=c;T=new a.StructNode(S);}}return T;};h=function h(i){var R=i.getType();var S=null;var T=null;var U=null;switch(R){case p.objectNamesEnum.simpleStatement:S=g.call(this,i);break;case p.objectNamesEnum.complexStatement:T=n.call(this,i.getModel().statementsArray,U);S=new a.BracketsExprNode();S.addChild(T);break;}return S;};var O=function handleLogicalStatements(R,S){var i;var T=[];var U=null;var V=null;var W=null;var X=[];for(i=1;i<S.length;i=i+2){V=U?U.value:null;U={};U.value=S[i].getValue().trim();U.type=S[i].getType();W=h.call(this,S[i+1]);if(U.value===p.STATEMENT_OPERATOR.OR.string){T.push(R);R=W;}else if(U.value===p.STATEMENT_OPERATOR.AND.string){if(V===null||U.value!==V){X=[];X.push(R);X.push(W);R=X;}else{R.push(W);}}}if(T.length===0&&Array.isArray(R)&&R.length>0){T.push(R);}return T;};var P=function P(i){var R=new a.LogicalExprNode(e.operatorsMap[p.STATEMENT_OPERATOR.AND.string]);var S;for(S=0;S<i.length;S++){R.addChild(i[S]);}return R;};var Q=function Q(i){var R;var S;var T=i.length;var U=null;if(T>1){U=new a.LogicalExprNode(e.operatorsMap[p.STATEMENT_OPERATOR.OR.string]);for(R=0;R<T;R++){if(Array.isArray(i[R])){S=P.call(this,i[R]);U.addChild(S);}else{U.addChild(i[R]);}}}else{if(Array.isArray(i[0])){S=P.call(this,i[0]);U=S;}}return U;};n=function n(i,R){var S=0;var T=null;var U=[];if(Array.isArray(i)){S=i.length;T=h.call(this,i[0]);if(S>1){U=O.call(this,T,i);T=Q.call(this,U);}}return T;};f=function f(i){return n.call(this,i.statementsArray,null);};this.newAST=o?f.call(this,o):null;}e.prototype.getSerializeAST=function getSerializeAST(){var s;s=this.newAST?this.newAST.serialize():"";return s;};e.prototype.getAST=function getAST(){return this.newAST;};return{ASTConvertor:e};}());