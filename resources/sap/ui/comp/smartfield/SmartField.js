/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/ui/comp/library","./JSONControlFactory","./ODataControlFactory","./BindingUtil","./SideEffectUtil","./ODataHelper","sap/ui/core/Control","sap/ui/model/ParseException","sap/ui/model/ValidateException"],function(q,l,J,O,B,S,a,C,P,V){"use strict";var b=C.extend("sap.ui.comp.smartfield.SmartField",{metadata:{library:"sap.ui.comp",designTime:true,properties:{value:{type:"any",group:"Misc",defaultValue:null},enabled:{type:"boolean",group:"Misc",defaultValue:true},entitySet:{type:"string",group:"Misc",defaultValue:""},editable:{type:"boolean",group:"Misc",defaultValue:true},contextEditable:{type:"boolean",group:"Misc",defaultValue:true},width:{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:""},textAlign:{type:"sap.ui.core.TextAlign",group:"Misc",defaultValue:sap.ui.core.TextAlign.Initial},placeholder:{type:"string",group:"Misc",defaultValue:""},name:{type:"string",group:"Misc",defaultValue:null},valueState:{type:"sap.ui.core.ValueState",group:"Appearance",defaultValue:sap.ui.core.ValueState.None},valueStateText:{type:"string",group:"Appearance",defaultValue:""},showValueStateMessage:{type:"boolean",group:"Appearance",defaultValue:true},jsontype:{type:"sap.ui.comp.smartfield.JSONType",group:"Misc",defaultValue:null},mandatory:{type:"boolean",group:"Misc",defaultValue:false},maxLength:{type:"int",group:"Misc",defaultValue:0},showSuggestion:{type:"boolean",group:"Misc",defaultValue:true},showValueHelp:{type:"boolean",group:"Misc",defaultValue:true},showLabel:{type:"boolean",group:"Appearance",defaultValue:true},textLabel:{type:"string",group:"Misc",defaultValue:null},tooltipLabel:{type:"string",group:"Misc",defaultValue:null},uomVisible:{type:"boolean",group:"Misc",defaultValue:true},uomEditable:{type:"boolean",group:"Misc",defaultValue:true},uomEnabled:{type:"boolean",group:"Misc",defaultValue:true},url:{type:"string",group:"Misc",defaultValue:null},uomEditState:{type:"int",group:"Misc",defaultValue:-1},controlContext:{type:"sap.ui.comp.smartfield.ControlContextType",group:"Misc",defaultValue:sap.ui.comp.smartfield.ControlContextType.None},proposedControl:{type:"sap.ui.comp.smartfield.ControlProposalType",group:"Misc",defaultValue:sap.ui.comp.smartfield.ControlProposalType.None},wrapping:{type:"boolean",group:"Misc",defaultValue:true},clientSideMandatoryCheck:{type:"boolean",group:"Misc",defaultValue:true},fetchValueListReadOnly:{type:"boolean",group:"Misc",defaultValue:true}},aggregations:{_content:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},configuration:{type:"sap.ui.comp.smartfield.Configuration",multiple:false},controlProposal:{type:"sap.ui.comp.smartfield.ControlProposal",multiple:false},_ariaLabelInvisibleText:{type:"sap.ui.core.InvisibleText",multiple:true,visibility:"hidden"}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{entitySetFound:{},change:{},initialise:{},visibleChanged:{},editableChanged:{},contextEditableChanged:{},innerControlsCreated:{},valueListChanged:{},press:{}}},renderer:function(r,c){r.write("<div ");r.writeControlData(c);r.addClass("sapUiCompSmartField");r.writeClasses();r.write(">");r.renderControl(c.getAggregation("_content"));if(c.getAggregation("_ariaLabelInvisibleText")){c.getAggregation("_ariaLabelInvisibleText").forEach(function(i){r.renderControl(i);});}r.write("</div>");}});b.prototype.init=function(){this._bInDestroy=false;this._oSideEffects=new S(this);this._oFactory=null;this._oControl={display:null,edit:null,current:null};this._oValue={display:null,edit:null,uom:null,uomset:null};this._oError={bComplex:false,bFirst:false,bSecond:false};this._sBindingContextPath="";this._oValueBind=null;this._oUtil=new B();this._bSuppressToggleControl=false;};b.prototype.setVisible=function(v,s){C.prototype.setVisible.apply(this,arguments);this.fireVisibleChanged({visible:v});return this;};b.prototype.setEditable=function(v){this.setProperty("editable",v,true);this._bPendingEditableState=false;this._toggleControl();this.fireEditableChanged({editable:v});return this;};b.prototype.setContextEditable=function(v){this.setProperty("contextEditable",v,true);this._bPendingEditableState=false;this._toggleControl();this.fireContextEditableChanged({editable:v});return this;};b.prototype.setWidth=function(w){this.setProperty("width",w,true);this._setOnInnerControl();return this;};b.prototype.setWrapping=function(w){this.setProperty("wrapping",w,true);this._setOnInnerControl();return this;};b.prototype.setTextAlign=function(t){this.setProperty("textAlign",t,true);this._setOnInnerControl();return this;};b.prototype.setPlaceholder=function(p){this.setProperty("placeholder",p,true);this._setOnInnerControl();return this;};b.prototype.setName=function(n){this.setProperty("name",n,true);this._setOnInnerControl();return this;};b.prototype.setMaxLength=function(m){this.setProperty("maxLength",m,true);this._setOnInnerControl();return this;};b.prototype.setShowValueHelp=function(s){var c;this.setProperty("showValueHelp",s,true);if(s&&this._oFactory){this._oFactory._addValueHelp();}else{c=this.getAggregation("_content");if(c&&c.setShowValueHelp){c.setShowValueHelp(false);}}return this;};b.prototype.setShowSuggestion=function(s){var c;this.setProperty("showSuggestion",s,true);if(s&&this._oFactory){this._oFactory._addValueHelp();}else{c=this.getAggregation("_content");if(c&&c.setShowSuggestion){c.setShowSuggestion(false);}}return this;};b.prototype._setOnInnerControl=function(){var c,w;c=this.getAggregation("_content");if(c){if(c.setWidth){w=this.getWidth();if(w){c.setWidth(w);}}if(c.setWrapping){c.setWrapping(this._getWrappingForInnerControl(c));}if(c.setName){c.setName(this.getName());}if(c.setPlaceholder){c.setPlaceholder(this.getPlaceholder());}if(c.setTextAlign){c.setTextAlign(this.getTextAlign());}if(c.setMaxLength&&this._oFactory&&this._oFactory._getMaxLength){c.setMaxLength(this._oFactory._getMaxLength());}}return this;};b.prototype._getWrappingForInnerControl=function(c){var w=this.getWrapping(),p;c=c||this.getAggregation("_content");if(c){p=c.getMetadata().getProperty("wrapping");}if(p){switch(p.type){case"boolean":return w;case"sap.ui.core.Wrapping":var W=sap.ui.core.Wrapping;if(w){return W.Soft;}return W.None;}}return w;};b.prototype.setUrl=function(v){this.setProperty("url",v,true);return this;};b.prototype.setEntitySet=function(v){this.setProperty("entitySet",v,true);this.fireEntitySetFound({entitySet:v});return this;};b.prototype._setPendingEditState=function(d){this.data("pendingEditableState",!d);};b.prototype.applySettings=function(s){if(s&&s.customData){for(var i=0;i<s.customData.length;i++){var c=s.customData[i];if(c&&c.mProperties&&c.mProperties.key==="pendingEditableState"){this._bPendingEditableState=c.mProperties.value;}}}return C.prototype.applySettings.apply(this,arguments);};b.prototype.setEnabled=function(v){this.setProperty("enabled",v,true);this._toggleControl();return this;};b.prototype.getValue=function(){var p,f;p=this._getMode();f=this._oValue[p];if(f){return f();}return this.getProperty("value");};b.prototype.getValueState=function(){var c,i;c=this.getInnerControls();i=this._getMaxSeverity(c);if(i>-1){return c[i].getValueState();}return sap.ui.core.ValueState.None;};b.prototype.setValueState=function(v){var c,o,m="setSimpleClientError";c=this.getInnerControls();if(c&&c.length){o=c[0];if(c.length>1){m="setComplexClientErrorFirstOperand";}}if(o&&o.setValueState){o.setValueState(v);this[m](v===sap.ui.core.ValueState.Error);}return this;};b.prototype.getValueStateText=function(){var c,i;c=this.getInnerControls();i=this._getMaxSeverity(c);if(i>-1){return c[i].getValueStateText();}return this.getProperty("valueStateText");};b.prototype.setValueStateText=function(t){var c,o;c=this.getInnerControls();if(c&&c.length){o=c[0];}if(o&&o.setValueStateText){o.setValueStateText(t);}return this;};b.prototype._getMaxSeverity=function(c){var s,o,i,d,e=0,I=-1,m={"Error":3,"Warning":2,"Success":1,"None":0};d=c.length;for(i=0;i<d;i++){o=c[i];if(o.getValueState){s=o.getValueState();if(s&&m[s]>e){e=m[s];I=i;}}}return I;};b.prototype.getFocusDomRef=function(){var c,o,d;c=this.getInnerControls();d=c.length;if(d>0){o=c[0];}if(o&&o.getFocusDomRef){return o.getFocusDomRef();}return C.prototype.getFocusDomRef.apply(this,arguments);};b.prototype.updateBindingContext=function(s,m,u){if(this._bInDestroy){return;}this._init(m);if(this._oFactory){if(this.getBindingContext()){this._sBindingContextPath=this.getBindingContext().getPath();}if(this._oFactory.bind){this._oFactory.bind();this._checkFieldGroups();}else{this._toggleControl();}}C.prototype.updateBindingContext.apply(this,arguments);};b.prototype._getMode=function(){var e=this.getEditable(),E=this.getEnabled(),c=this.getContextEditable();if(this.getControlContext()==="responsiveTable"&&this.data("suppressUnit")!=="true"){if(!e||!c||!E||(this.getUomEditState()===0)){return"display_uom";}}if(c&&this.data("configdata")&&this.data("configdata").configdata.isUOM&&this.data("configdata").configdata.isInnerControl&&this.data("configdata").configdata.getContextEditable){c=this.data("configdata").configdata.getContextEditable();}return e&&E&&c?"edit":"display";};b.prototype._toggleControl=function(){var m,v,c,d=true;if(this._bPendingEditableState||this._bSuppressToggleControl){return;}if(!this._oFactory||this._oFactory.bPending){return;}m=this._getMode();if(m==="edit"||m==="display_uom"){this._createControl(m);}else{v=this.getValue();c=this.data("configdata");if(c&&c.configdata&&!c.configdata.isUOM){if(v===null||v===""){d=false;}}if(d){this._createControl(m);}else{this.setAggregation("_content",null);this._oControl.current="display";}}this._setOnInnerControl();};b.prototype.setValue=function(v){this.setProperty("value",v,true);if(this._oFactory&&!this._oFactory.bPending){this._toggleControl();}return this;};b.prototype._createControl=function(m){var c;if(this._oFactory){if(m!==this._oControl.current||!this._oControl[m]){if(!this._oControl[m]){c=this._oFactory.createControl();if(c){this._oControl[m]=c.control;this._placeCallBacks(c,m);}}this._oControl.current=m;this.setAggregation("_content",this._oControl[m]);this.fireInnerControlsCreated(this.getInnerControls());}else{if(!this.getAggregation("_content")){this.setAggregation("_content",this._oControl[m]);}}}};b.prototype._placeCallBacks=function(c,m){if(c.params&&c.params.getValue){this._oValue[m]=c.params.getValue;}if(c.params&&c.params.uom){this._oValue.uom=c.params.uom;}if(c.params&&c.params.uomset){this._oValue.uomset=c.params.uomset;}};b.prototype._init=function(m){var M,o,c;if(this._oFactory&&this._sBindingContextPath&&this.getBindingContext()&&this._sBindingContextPath!=this.getBindingContext().getPath()){this._destroyFactory();}if(!this._oFactory){c=this.data("configdata");if(!c){M=this.getModel(m);}o=this._getBindingInfo(m,"value");if(o){if(c||M){this._oFactory=this._createFactory(m,M,o,c);}}else if(M&&!(M instanceof sap.ui.model.json.JSONModel)){if(this.getBindingInfo("url")||this.getUrl()){if(c||M){this._oFactory=this._createFactory(m,M,o,c);}}}}};b.prototype._destroyFactory=function(){this._bSuppressToggleControl=true;this._bSideEffects=false;this._oFactory.destroy();this._oFactory=null;this._bSuppressToggleControl=false;if(this._oControl["display"]){this._oControl["display"].destroy();this._oControl["display"]=null;}if(this._oControl["edit"]){this._oControl["edit"].destroy();this._oControl["edit"]=null;}this._oControl["current"]=null;this._oValue={display:null,edit:null,uom:null,uomset:null};this.destroyAggregation("_content");};b.prototype._createFactory=function(m,M,o,c){var e,p;if(M&&M instanceof sap.ui.model.json.JSONModel){return new J(M,this,{model:m,path:o.path});}if(!c){e=this._getEntitySet(m);}if(e||c){if(c){p=c.configdata;}else{p={entitySet:e,model:m,path:(o&&o.path)?o.path:""};}return new O(M,this,p);}return null;};b.prototype._getEntitySet=function(m){var o,e;e=this.getEntitySet();if(e&&!m){return e;}o=this.getBindingContext(m);if(o){if(!o.sPath||(o.sPath&&o.sPath==="/undefined")){return null;}e=this._oUtil.correctPath(o.sPath);this.fireEntitySetFound({entitySet:e});return e;}return null;};b.prototype._getBindingInfo=function(m,n){if(!this._oValueBind){this._oValueBind=this.getBindingInfo(n);try{this._oValueBind=this._oValueBind.parts[0];}catch(e){}}if(this._oValueBind){if(!this._oValueBind.model&&!m){return this._oValueBind;}if(this._oValueBind.model===m){return this._oValueBind;}}return null;};b.prototype.getDataType=function(){var p;if(this._oFactory){if(this._oFactory.getDataProperty){p=this._oFactory.getDataProperty();if(p){return p.property.type;}}return this.getJsonType();}return null;};b.prototype.getDataProperty=function(){if(this._oFactory){if(this._oFactory.getDataProperty){return this._oFactory.getDataProperty();}return null;}return null;};b.prototype.getUnitOfMeasure=function(){if(this._oValue.uom){return this._oValue.uom();}return null;};b.prototype.setUnitOfMeasure=function(u){if(u&&this._oValue.uomset){this._oValue.uomset(u);}};b.prototype.setSimpleClientError=function(e){this._oError.bFirst=e;};b.prototype.setComplexClientErrorFirstOperand=function(e){this._oError.bComplex=true;this._oError.bFirst=e;};b.prototype.setComplexClientErrorSecondOperand=function(e){this._oError.bComplex=true;this._oError.bSecond=e;};b.prototype.setComplexClientErrorSecondOperandNested=function(e){var p=this.getParent().getParent();p.setComplexClientErrorSecondOperand(e);};b.prototype._hasClientError=function(){if(this._oError.bComplex){return this._oError.bFirst||this._oError.bSecond;}return this._oError.bFirst;};b.prototype.checkClientError=function(){var c,d,i;if(this._getMode()==="display"){return false;}if(this._hasClientError()){return true;}c=this.getInnerControls();d=c.length;for(i=0;i<d;i++){this._checkClientError(c[i]);}return this._hasClientError();};b.prototype._checkClientError=function(c){var v=null,t=null,p=null;var o,m,s,d={"sap.m.Input":"value","sap.m.DatePicker":"value","sap.m.ComboBox":"selectedKey","sap.m.TextArea":"value"};if(c){s=d[c.getMetadata()._sClassName];}if(s){o=c.getBinding(s);}if(o){try{m="get"+s.substring(0,1).toUpperCase()+s.substring(1);v=c[m]();t=o.getType();if(o.sInternalType){p=t.parseValue(v,o.sInternalType);t.validateValue(p);}}catch(e){if(e instanceof P){c.fireParseError({exception:e});}if(e instanceof V){c.fireValidationError({exception:e});}}}};b.prototype.isContextTable=function(){return(this.getControlContext()==="responsiveTable"||this.getControlContext()==="table");};b.prototype.getInnerControls=function(){var c,f,m={"sap.m.HBox":function(o){var d,i,e=0;i=o.getItems();if(i){e=i.length;}if(e===0){return[];}if(e===1){return[i[0]];}d=i[1].getAggregation("_content");if(d){return[i[0],d];}return[i[0]];},"sap.ui.comp.navpopover.SmartLink":function(o){var i=o.getAggregation("innerControl");if(i){return[i];}return[o];}};c=this.getAggregation("_content");if(c){f=m[c.getMetadata()._sClassName];}if(f){return f(c);}if(c){return[c];}return[];};b.prototype._getEmbeddedSmartField=function(){var c=this.getAggregation("_content");if(c){if(c instanceof sap.m.HBox){var h=c.getItems();if(h){for(var j=0;j<h.length;j++){if(h[j]instanceof b){return h[j];}}}}}return null;};b.prototype.onAfterRendering=function(){if(C.prototype.onAfterRendering){C.prototype.onAfterRendering.apply(this);}this._checkFieldGroups();};b.prototype.onBeforeRendering=function(){var f=this.getInnerControls();var t=this;if(this.getAriaLabelledBy().length>0){f.forEach(function(F){if(F.addAriaLabelledBy&&F.getAriaLabelledBy){if(F.getAriaLabelledBy().length===0){F.addAriaLabelledBy(t.getAriaLabelledBy()[0]);}}});}};b.prototype._checkFieldGroups=function(){var v,m,M=this._getMode();if(this.getBindingContext()&&this._oFactory&&this._oFactory.getMetaData&&M==="edit"&&!this._bSideEffects){m=this._oFactory.getMetaData();if(m&&!m.property||(m.property&&!m.property.property)){return;}v=this._getView();if(v&&m){this._setFieldGroup(m,v);}}};b.prototype._setFieldGroup=function(m,v){var c,i=this._oSideEffects.getFieldGroupIDs(m,v);if(i){c=this.getInnerControls();if(c.length){this._bSideEffects=true;c[0].setFieldGroupIds(i);}}};b.prototype._getView=function(){var o=this.getParent();while(o){if(o instanceof sap.ui.core.mvc.View){return o;}o=o.getParent();}return null;};b.prototype.refreshDataState=function(n,d){var o,c;if(n==="value"){if(d.isLaundering()){if(this.getEditable()){o=this.getBindingContext();if(o&&o.getObject){c=o.getObject();if(c&&c.__metadata&&c.__metadata.created){this._checkCreated=true;return;}}}}if(this._checkCreated&&!d.isLaundering()&&!d.isDirty()){this._oFactory.rebindOnCreated();delete this._checkCreated;}}};b.prototype.exit=function(){this._bInDestroy=true;var i=null;if(this._oSideEffects){this._oSideEffects.destroy();}if(this._oUtil){this._oUtil.destroy();}if(this._oFactory){this._oFactory.destroy();}if(this._oControl){if(this._oControl.current==="edit"){i=this._oControl["display"];}else{i=this._oControl["edit"];}if(this._oControl[this._oControl.current]&&!this._oControl[this._oControl.current].getParent()){this._oControl[this._oControl.current].destroy();}}if(i&&i.destroy){i.destroy();}this._oUtil=null;this._oError=null;this._oValue=null;this._oFactory=null;this._oControl=null;this._oValueBind=null;this._oSideEffects=null;this._sBindingContextPath="";};b.getSupportedAnnotationPaths=function(m,e,v,n){var c,u,r=[],M;if(m&&e&&v){M={entitySet:e,entityType:m.getODataEntityType(e.entityType),path:v};c={helper:new a(null,null,m)};if(n){c.navigationPathOnly=n;}c.helper.getProperty(M);b._getFromEntitySet(r,M,c);b._getFromProperty(r,M,c);u=c.helper.getUnitOfMeasure2(M);if(u){b._getFromProperty(r,u,c);}c.helper.destroy();}return r;};b._getFromEntitySet=function(r,m,c){var p;if(m.entitySet){p=c.helper.oAnnotation.getUpdateEntitySetPath(m.entitySet);b._push(p,r,m,c);}};b._push=function(p,r,m,c){var d,s,e,o,R={};if(p){if(c.navigationPathOnly){d=p.split("/");e=d.length;R.entityType=m.entityType;while(e--){s=d.shift();if(s===""){continue;}R=c.helper.getNavigationProperty(R.entityType,s);if(!R.entitySet){break;}if(o){o=o+"/"+s;}else{o=s;}}}else{o=p;}}if(o){if(m.navigationPath){r.push(m.navigationPath+"/"+o);}else{r.push(o);}}};b._getFromProperty=function(r,m,c){var p;if(m.property.property){p=c.helper.oAnnotation.getText(m.property.property);b._push(p,r,m,c);p=c.helper.oAnnotation.getUnit(m.property.property);b._push(p,r,m,c);p=c.helper.oAnnotation.getFieldControlPath(m.property.property);b._push(p,r,m,c);}};b.prototype.addAssociation=function(A,i,s){if(A==="ariaLabelledBy"){this.getInnerControls().forEach(function(c){if(c.addAriaLabelledBy){c.addAriaLabelledBy(i);}});}return C.prototype.addAssociation.apply(this,arguments);};b.prototype.removeAssociation=function(A,o,s){var i=C.prototype.removeAssociation.apply(this,arguments);if(A==="ariaLabelledBy"&&i){this.getInnerControls().forEach(function(c){if(c.removeAriaLabelledBy){c.removeAriaLabelledBy(i);}});}return i;};b.prototype.getAccessibilityInfo=function(){var c=this.getAggregation("_content");return c&&c.getAccessibilityInfo?c.getAccessibilityInfo():null;};return b;},true);
