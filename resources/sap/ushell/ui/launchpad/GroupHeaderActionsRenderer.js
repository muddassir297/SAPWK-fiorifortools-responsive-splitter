// @copyright@
sap.ui.define(function(){"use strict";var G={};G.render=function(r,c){var i=c.getIsOverflow(),a=c.getTileActionModeActive();r.write("<div");r.writeControlData(c);r.writeClasses();r.write(">");var C=c.getContent();if(a){if(i){jQuery.each(c._getActionOverflowControll(),function(){r.renderControl(this);});}else{jQuery.each(C,function(){r.renderControl(this);});}}r.write("</div>");};return G;},true);