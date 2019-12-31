// @copyright@
/*global jQuery, sap*/

sap.ui.define(['sap/ushell/resources','./TileContainerRenderer'],
	function(resources, TileContainerRenderer) {
	"use strict";

    /**
     * @class CatalogTileContainer renderer.
     * @static
     *
     * @private
     */
    var CatalogTileContainerRenderer = {};

    var CatalogTileContainerRenderer = sap.ui.core.Renderer.extend(TileContainerRenderer);



	return CatalogTileContainerRenderer;

}, /* bExport= */ true);
