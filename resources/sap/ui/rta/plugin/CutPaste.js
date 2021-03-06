/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/dt/plugin/CutPaste','sap/ui/dt/OverlayUtil','sap/ui/rta/plugin/Plugin','sap/ui/rta/plugin/RTAElementMover'],function(q,C,O,P,R){"use strict";var a=C.extend("sap.ui.rta.plugin.CutPaste",{metadata:{library:"sap.ui.rta",properties:{commandFactory:{type:"object",multiple:false}},events:{dragStarted:{},elementModified:{command:{type:"sap.ui.rta.command.BaseCommand"}}}}});a.prototype.init=function(){C.prototype.init.apply(this,arguments);this.setElementMover(new R());};a.prototype.registerElementOverlay=function(o){C.prototype.registerElementOverlay.apply(this,arguments);if(o.isMovable()){P.prototype.addToPluginsList.apply(this,arguments);}};a.prototype.deregisterElementOverlay=function(o){C.prototype.deregisterElementOverlay.apply(this,arguments);P.prototype.removeFromPluginsList.apply(this,arguments);};a.prototype.paste=function(t){this._executePaste(t);this.fireElementModified({"command":this.getElementMover().buildMoveCommand()});this.stopCutAndPaste();};return a;},true);
