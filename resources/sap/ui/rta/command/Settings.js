/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand'],function(F){"use strict";var S=F.extend("sap.ui.rta.command.Settings",{metadata:{library:"sap.ui.rta",properties:{content:{type:"any"}},associations:{},events:{}}});S.prototype._getChangeSpecificData=function(f){var s={changeType:this.getChangeType(),content:this.getContent()};return s;};S.prototype.execute=function(){if(this.getElement()){F.prototype.execute.apply(this,arguments);}};S.prototype.undo=function(){if(this.getElement()){F.prototype.undo.apply(this,arguments);}};return S;},true);
