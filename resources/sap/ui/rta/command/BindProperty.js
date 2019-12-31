/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand',"sap/ui/fl/changeHandler/PropertyBindingChange","sap/ui/rta/Utils"],function(F,P,U){"use strict";var B=F.extend("sap.ui.rta.command.BindProperty",{metadata:{library:"sap.ui.rta",properties:{propertyName:{type:"string"},newBinding:{type:"string",bindable:false},changeType:{type:"string",defaultValue:"propertyBindingChange"}},associations:{},events:{}}});B.prototype.init=function(){this.setChangeHandler(P);};B.prototype.bindProperty=function(n,b){if(n==="newBinding"){return this.setNewBinding(b.bindingString);}return F.prototype.bindProperty.apply(this,arguments);};B.prototype._getChangeSpecificData=function(){var e=this.getElement();var s={changeType:this.getChangeType(),selector:{id:e.getId(),type:e.getMetadata().getName()},content:{property:this.getPropertyName(),newBinding:this.getNewBinding()}};return s;};return B;},true);
