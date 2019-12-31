/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/base/ManagedObject'],function(M){"use strict";var B=M.extend("sap.ui.rta.command.BaseCommand",{metadata:{library:"sap.ui.rta",properties:{name:{type:"string"}},associations:{element:{type:"sap.ui.core.Element"}},events:{}}});B.prototype.getElement=function(){var i=this.getAssociation("element");return sap.ui.getCore().byId(i);};B.prototype.prepare=function(){};B.prototype.execute=function(){};B.prototype.undo=function(){};B.prototype.isEnabled=function(){return true;};return B;},true);
