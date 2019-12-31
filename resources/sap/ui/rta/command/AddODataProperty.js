/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/rta/command/FlexCommand',"sap/ui/fl/Utils","sap/ui/fl/changeHandler/BaseTreeModifier"],function(q,F,a,B){"use strict";var A=F.extend("sap.ui.rta.command.AddODataProperty",{metadata:{library:"sap.ui.rta",properties:{index:{type:"int"},newControlId:{type:"string"},label:{type:"string"},bindingString:{type:"string"}}}});A.prototype._getChangeSpecificData=function(){return{changeType:this.getChangeType(),index:this.getIndex(),newControlId:this.getNewControlId(),label:this.getLabel(),bindingPath:this.getBindingString()};};return A;},true);
