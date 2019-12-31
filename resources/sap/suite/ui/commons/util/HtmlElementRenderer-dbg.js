/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/Control"
], function (BaseObject, Control) {
	"use strict";

	var HtmlElement;
	/**
	 * Creates a renderer for HtmlElement.
	 *
	 * @class HtmlElementRenderer A renderer for HtmlElement.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @param {sap.suite.ui.commons.util.HtmlElement} oHtmlElement Html element to render.
	 *
	 * @constructor
	 * @alias sap.suite.ui.commons.util.HtmlElementRenderer
	 * @public
	 */
	var HtmlElementRenderer = BaseObject.extend("sap.suite.ui.commons.util.HtmlElementRenderer", {
		constructor: function (oHtmlElement) {
			BaseObject.apply(this, arguments);

			this._oHtmlElement = oHtmlElement;
		}
	});
	/**
	 * Renders HtmlElement to given render manager.
	 * @param {sap.ui.core.RenderManager} oRM RenderManager used for outputting content.
	 * @public
	 */
	HtmlElementRenderer.prototype.render = function (oRM) {
		oRM.write("<", this._oHtmlElement._sName);
		this._renderAttributes(oRM);
		if (this._oHtmlElement._aChildren.length > 0) {
			oRM.write(">");
			this._renderChildren(oRM);
			oRM.write("</", this._oHtmlElement._sName, ">");
		} else {
			oRM.write("/>");
		}
	};

	/**
	 * Renders all attributes of parent tag.
	 * @param {sap.ui.core.RenderManager} oRM RenderManager used for outputting content.
	 * @private
	 */
	HtmlElementRenderer.prototype._renderAttributes = function (oRM) {
		var attributes = this._oHtmlElement._mAttributes;
		for (var attrName in attributes) {
			if (!attributes.hasOwnProperty(attrName)) {
				continue;
			}
			var val = attributes[attrName];
			if (jQuery.isArray(val)) {
				var joiner = "";
				if (attrName === "class") {
					joiner = " ";
				} else if (attrName === "style") {
					joiner = ";";
				}
				val = val.join(joiner);
			}
			oRM.write(" ", attrName, "=\"", val, "\"");
		}
	};

	/**
	 * Renders children of given node.
	 * @param {sap.ui.core.RenderManager} oRM RenderManager used for outputting content.
	 * @private
	 */
	HtmlElementRenderer.prototype._renderChildren = function (oRM) {
		if (typeof HtmlElement === "undefined") {
			HtmlElement = sap.ui.require("sap/suite/ui/commons/util/HtmlElement");
		}
		this._oHtmlElement._aChildren.forEach(function (child) {
			if (typeof child === "string") {
				oRM.write(child);
			} else if (child instanceof HtmlElement) {
				child.getRenderer().render(oRM);
			} else if (child instanceof Control) {
				oRM.renderControl(child);
			} else {
				sap.log.error(typeof child + " cannot be a child of a HTML element. Skipping rendering for this child.");
			}
		});
	};

	return HtmlElementRenderer;
});