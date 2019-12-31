/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/fl/changeHandler/BaseRename',"sap/ui/fl/Utils"],function(q,B,U){"use strict";var P="label";var C="fieldLabel";var T="XFLD";var R=B.createRenameChangeHandler({changePropertyName:C,translationTextType:T});R.applyChange=function(c,o,p){var m=p.modifier;var a=c.getDefinition();var t=a.texts[C];var v=t.value;if(a.texts&&t&&typeof(v)==="string"){var e;var s;var E=m.getAggregation(o,"elements");var i=m.getProperty(o,"elementForLabel")||0;if(E&&E[i]){e=E[i];s="textLabel";}else{e=o;s=P;}var l=m.getProperty(o,"label");if(U.isBinding(v)){m.setPropertyBinding(e,s,v);if(typeof l!=="string"){m.setPropertyBinding(l,"text",v);}else{m.setPropertyBinding(o,s,v);}}else{m.setProperty(e,s,v);if(typeof l!=="string"){m.setProperty(l,"text",v);}else{m.setProperty(o,s,v);}}return true;}else{U.log.error("Change does not contain sufficient information to be applied: ["+a.layer+"]"+a.namespace+"/"+a.fileName+"."+a.fileType);}};return R;},true);
