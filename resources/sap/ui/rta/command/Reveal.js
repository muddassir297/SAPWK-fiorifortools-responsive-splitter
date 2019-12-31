/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand'],function(F){"use strict";var R=F.extend("sap.ui.rta.command.Reveal",{metadata:{library:"sap.ui.rta",properties:{revealedElementId:{type:"string"},hiddenParent:"object"}}});R.prototype._getChangeSpecificData=function(){var s={changeType:this.getChangeType()};if(this.getRevealedElementId()){s.revealedElementId=this.getRevealedElementId();}return s;};return R;},true);
