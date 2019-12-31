// @copyright@
/*global jQuery, sap*/
/**
 * @class AnchorItem renderer.
 * @static
 *
 * @private
 */

sap.ui.define(['sap/ui/core/Control','sap/ushell/resources'],
	function(Control, resources) {
	"use strict";

    var AnchorItemRenderer = sap.ui.core.Renderer.extend(Control);
    AnchorItemRenderer.render = function (rm, oAnchorItem) {
        var oAnchorNavigationBar = oAnchorItem.getParent(),
            oAnchorItems = oAnchorNavigationBar.getGroups(),
            oAnchorVisibleItems = oAnchorItems.filter(function (oGroup) {
                return oGroup.getVisible();
            }),
            iCurrentItemIndex = oAnchorVisibleItems.indexOf(oAnchorItem) > -1 ? oAnchorVisibleItems.indexOf(oAnchorItem) + 1 : "";

        rm.write("<li");
        rm.writeControlData(oAnchorItem);
        rm.addClass("sapUshellAnchorItem");
        rm.writeAccessibilityState(oAnchorItem, {role: "option", posinset : iCurrentItemIndex, setsize : oAnchorVisibleItems.length});
        rm.writeAttribute("tabindex", "-1");
        if (!oAnchorItem.getVisible()) {
            rm.addClass("sapUshellShellHidden");
        }
        rm.writeClasses();
        rm.write(">");
        rm.write("<div");
        rm.addClass("sapUshellAnchorItemInner");
        rm.writeClasses();
        rm.write(">");
        rm.writeEscaped(oAnchorItem.getTitle());
        rm.write("</div>");
        rm.write("</li>");

    };


	return AnchorItemRenderer;

}, /* bExport= */ true);
