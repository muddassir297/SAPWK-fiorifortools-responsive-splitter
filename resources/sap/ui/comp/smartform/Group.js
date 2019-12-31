/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/comp/library','sap/ui/core/Element','sap/ui/layout/ResponsiveFlowLayoutData','sap/ui/layout/form/FormContainer','./GroupElement'],function(q,l,E,R,F,G){"use strict";var a=F.extend("sap.ui.comp.smartform.Group",{metadata:{library:"sap.ui.comp",designTime:true,properties:{useHorizontalLayout:{type:"boolean",group:"Misc",defaultValue:null},horizontalLayoutGroupElementMinWidth:{type:"int",group:"Misc",defaultValue:null},label:{type:"string",group:"Misc",defaultValue:null}},defaultAggregation:"groupElements",aggregations:{groupElements:{type:"sap.ui.comp.smartform.GroupElement",multiple:true,singularName:"groupElement"},layout:{type:"sap.ui.layout.GridData",multiple:false}},_visibilityDerived:false}});a.prototype.init=function(){F.prototype.init.apply(this,arguments);var r=new R({"linebreak":true,"linebreakable":true});this.setLayoutData(r);this._updateFormContainerLabel();};a.prototype.setUseHorizontalLayout=function(v){this.setProperty("useHorizontalLayout",v);var g=this.getGroupElements();if(g){g.forEach(function(o){o.setUseHorizontalLayout(v);});}};a.prototype.setHorizontalLayoutGroupElementMinWidth=function(n){this.setProperty("horizontalLayoutGroupElementMinWidth",n);var g=this.getGroupElements();if(g){g.forEach(function(o){o.setHorizontalLayoutGroupElementMinWidth(n);});}};a.prototype.setEditMode=function(e){var g=this.getGroupElements();if(g){g.forEach(function(o){o.setEditMode(e);});}return this;};a.prototype._updateFormContainerLabel=function(){var t=this.getTitle();if(!t&&this.getLabel()){t=new sap.ui.core.Title(this.getId()+"--Title");this.setTitle(t);}if(t&&t.setText&&this.getLabel()){t.setText(this.getLabel());}};a.prototype._delegateEditModeFromParent=function(g){var p=null;var e=false;if(g){p=this.getParent();if(p&&p.getEditable){e=p.getEditable();g.setEditMode(e);}}};a.prototype._updateLineBreaks=function(){if(!this.getUseHorizontalLayout()){return;}var s=this.getParent();while(!s._getCurrentSpan&&s.getParent){s=s.getParent();}if(!s._getCurrentSpan){return;}var c=s._getCurrentSpan();if(!c){return;}var e=this.getGroupElements();e=e.filter(function(o){return o.getVisible();});var C=0;e.forEach(function(o){C=C+1;var L=o.getFields()[0].getLayoutData();if(L){if(c*C>12){if(L instanceof sap.ui.core.VariantLayoutData){L.getMultipleLayoutData().forEach(function(L){if(L.setLinebreak){L.setLinebreak(true);}});}else{L.setLinebreak(true);}C=1;}else{if(L instanceof sap.ui.core.VariantLayoutData){L.getMultipleLayoutData().forEach(function(L){if(L.setLinebreak){L.setLinebreak(false);}});}else{L.setLinebreak(false);}}}});};a.prototype._updateFormContainerVisibility=function(){var A=this.getVisible();if(A===false&&this._visibilityDerived===false){return;}var g=this.getGroupElements();var v=false;v=g.some(function(o){return o.getVisible();});if(A!==v){this._visibilityDerived=true;F.prototype.setProperty.apply(this,["visible",v]);}};a.prototype.setProperty=function(p,v){F.prototype.setProperty.apply(this,arguments);if(p==='label'){this._updateFormContainerLabel();}if(p==='visible'){this._visibilityDerived=false;}};a.prototype.setVisible=function(v){this._visibilityDerived=false;F.prototype.setProperty.apply(this,['visible',v]);};a.prototype.addAggregation=function(A,o){var i=A;var t=this;if(A==="groupElements"){i="formElements";this._delegateEditModeFromParent(o);o.setHorizontalLayoutGroupElementMinWidth(this.getHorizontalLayoutGroupElementMinWidth());o.setUseHorizontalLayout(this.getUseHorizontalLayout());o.attachVisibleChanged(function(e){t._updateFormContainerVisibility(e);});}F.prototype.addAggregation.apply(this,[i,o]);};a.prototype.addGroupElement=function(g){this.addAggregation("groupElements",g);};a.prototype.getGroupElements=function(){return this.getFormElements();};a.prototype.setAggregation=function(A,o){var i=A;if(A==="layout"){i="layoutData";}F.prototype.setAggregation.apply(this,[i,o]);};a.prototype.addCustomData=function(c){F.prototype.addCustomData.apply(this,arguments);var g=this.getGroupElements();if(g){g.forEach(function(o){o.addCustomData(c.clone());});}return this;};a.prototype.insertGroupElement=function(g,i){var f=this.getParent();if(f&&f.getEditable){g.setEditMode(f.getEditable());}return this.insertFormElement(g,i);};a.prototype.removeGroupElement=function(g){var o=null;var b=[];var i=0;if(g instanceof G){o=g;}else{b=this.getGroupElements();if(b){if(typeof g==="number"){o=b[g];}else if(typeof g==="string"){for(i;i<b.length;i++){if(b[i].sId===g){o=b[i];break;}}}}}if(o){return this.removeFormElement(o);}else{return null;}};a.prototype.removeAllGroupElements=function(){return this.removeAllFormElements();};a.prototype.removeAggregation=function(A,o){if(A==="groupElements"){return this.removeGroupElement(o);}else{return E.prototype.removeAggregation.apply(this,arguments);}};a.prototype.removeAllAggregation=function(A){if(A==="groupElements"){return this.removeAllGroupElements();}else{return E.prototype.removeAllAggregation.apply(this,arguments);}};a.prototype.destroyGroupElements=function(){return this.destroyFormElements();};return a;},true);
