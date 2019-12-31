sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/ace/ace",
	"sap/ui/thirdparty/ace/mode-javascript",
	"sap/ui/thirdparty/ace/mode-json"
], function(jQuery, Control) {
	"use strict";

	var CodeEditor = Control.extend("sap.ui.core.support.tools.ui.CodeEditor", {
		metadata: {
			library: "sap.ui.core",
			properties: {
				value: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},
				type: {
					type: "string",
					group: "Appearance",
					defaultValue: "javascript"
				},
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Appearance",
					defaultValue: "400px"
				},
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Appearance",
					defaultValue: "400px"
				},
				editable: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				showLineNumbers: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				}
			},
			events: {
				liveChange: {},
				change: {}
			},
			defaultProperty: "content"
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("height", oControl.getHeight());
			oRm.writeStyles();
			oRm.write(">");
			oRm.write("</div>");
		}
	});

	CodeEditor.prototype.init = function() {
		var oDomRef = document.createElement("div");
		var that = this;

		this._oEditorDomRef = oDomRef;
		this._oEditorDomRef.style.height = "100%";
		this._oEditorDomRef.style.width = "100%";
		this._oEditor = window.ace.edit(oDomRef);
		this._oEditor.setValue("");
		this._oEditor.getSession().setUseWrapMode(true);
		this._oEditor.getSession().setMode("ace/mode/javascript");
		this._oEditor.renderer.setShowGutter(true);

		this._oEditor.addEventListener("change", function(oEvent) {
			var sValue = that.getCurrentValue();
			that.fireLiveChange({
				value: sValue,
				editorEvent: oEvent
			});
		});

		this._oEditor.addEventListener("blur", function(oEvent) {
			var sValue = that.getCurrentValue(),
				sCurrentValue = that.getValue();
			that.setProperty("value", sValue, true);
			if (sValue != sCurrentValue) {
				that.fireChange({
					value: sValue,
					oldValue: sCurrentValue
				});
			}
		});
	};

	CodeEditor.prototype.invalidate = function() {
		//no invalidation needed.
	};

	CodeEditor.prototype.setEditable = function(bValue) {
		this.setProperty("editable", bValue, true);
		this._oEditor.setReadOnly(!this.getEditable());

		return this;
	};

	CodeEditor.prototype.focus = function() {
		this._oEditor.focus();
	};

	CodeEditor.prototype.setType = function(sType) {
		this.setProperty("type", sType, true);
		this._oEditor.getSession().setMode("ace/mode/" + this.getType());

		return this;
	};

	CodeEditor.prototype.setValue = function(sValue) {
		this.setProperty("value", sValue, true);
		this._oEditor.setValue(this.getProperty("value"));

		return this;
	};

	CodeEditor.prototype.getCurrentValue = function () {
		return this._oEditor.getValue();
	};

	CodeEditor.prototype.showLineNumbers = function(bValue) {
		this.setProperty("showLineNumbers", bValue, true);
		this._oEditor.renderer.setShowGutter(this.getShowLineNumbers());

		return this;
	};

	CodeEditor.prototype.onAfterRendering = function() {
		this.getDomRef().appendChild(this._oEditorDomRef);
	};

	return CodeEditor;
}, /* bExport= */true);
