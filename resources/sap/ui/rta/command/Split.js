/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand'],function(F){"use strict";var S=F.extend("sap.ui.rta.command.Split",{metadata:{library:"sap.ui.rta",properties:{newElementIds:{type:"string[]"},source:{type:"any"},parentElement:{type:"any"}},associations:{},events:{}}});S.prototype._getChangeSpecificData=function(){var s={newElementIds:this.getNewElementIds(),sourceControlId:this.getSource().getId(),changeType:this.getChangeType(),parentId:this.getParentElement().getId()};return s;};return S;},true);
