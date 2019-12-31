/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/base/ManagedObject','sap/ui/rta/command/Stack','sap/ui/fl/FlexControllerFactory'],function(M,C,F){"use strict";var L=M.extend("sap.ui.rta.command.LREPSerializer",{metadata:{library:"sap.ui.rta",associations:{"rootControl":{type:"sap.ui.core.Control"}},properties:{"commandStack":{type:"object"}},aggregations:{}}});L.prototype.saveCommands=function(){var c=this.getCommandStack();var r=sap.ui.getCore().byId(this.getRootControl());if(!r){throw new Error("Can't save commands without root control instance!");}var f=F.createForControl(r);var a=c.getAllExecutedCommands();a.forEach(function(o){var e=o.getElement();f.addPreparedChange(o.getPreparedChange(),e);});return f.saveAll().then(function(){jQuery.sap.log.info("UI adaptation successfully transfered changes to layered repository");this.getCommandStack().removeAllCommands();}.bind(this));};return L;},true);
