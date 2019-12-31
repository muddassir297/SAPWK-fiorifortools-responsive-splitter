/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand',"sap/ui/fl/changeHandler/PropertyChange","sap/ui/rta/Utils"],function(F,P,U){"use strict";var a=F.extend("sap.ui.rta.command.Property",{metadata:{library:"sap.ui.rta",properties:{propertyName:{type:"string"},newValue:{type:"any"},semanticMeaning:{type:"string"},changeType:{type:"string",defaultValue:"propertyChange"}},associations:{},events:{}}});a.prototype.init=function(){this.setChangeHandler(P);};a.prototype._getChangeSpecificData=function(){var e=this.getElement();return{changeType:this.getChangeType(),selector:{id:e.getId(),type:e.getMetadata().getName()},content:{property:this.getPropertyName(),newValue:this.getNewValue(),semantic:this.getSemanticMeaning()}};};return a;},true);
