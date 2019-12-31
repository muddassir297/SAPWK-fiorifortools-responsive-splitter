/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// Provides control sap.rules.ui.ExpressionBasic.
sap.ui.define([
    "jquery.sap.global",
    "./library",
    "sap/rules/ui/ExpressionBasic",
    "sap/rules/ui/InstructionRenderer"
], function(jQuery, library, ExpressionBasic, InstructionRenderer) {
    "use strict";

    /**
     * Constructor for a new DecisionTableCellExpressionBasic sap.rules.ui.ExpressionBasic.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * Some class description goes here.
     * @extends  sap.rules.ui.ExpressionBasic
     *
     * @author SAP SE
     * @version 1.46.0
     *
     * @constructor
     * @private
     * @alias sap.rules.ui.DecisionTableCellExpressionBasic
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var DecisionTableCellExpressionBasic = ExpressionBasic.extend("sap.rules.ui.DecisionTableCellExpressionBasic", {
        metadata: {

            library: "sap.rules.ui",
            properties: {
                /**
                 * Defines the header value of the control.
                 */
                headerValue: {
                    type: "string",
                    defaultValue: "",
                    bindable: "bindable"
                },
                /**
                 * Defines the fixed operator value of the control.
                 */
                fixedOperator: {
                    type: "string",
                    defaultValue: "",
                    bindable: "bindable"
                },
                type: {
                    type: "sap.rules.ui.ExpressionType",
                    defaultValue: sap.rules.ui.ExpressionType.BooleanEnhanced,
                    bindable: "bindable"
                }
            }
        },
        _reload: function() {
            this.shouldReload = false;
            this.sHeaderValue = this.getHeaderValue();
            this.FixedOperatorValue = this.getFixedOperator();
            this.sCellValue = this.getValue();
            this.sValueFromSettings = (this.sHeaderValue + " " + this.FixedOperatorValue);
            this.sValue = (this.sValueFromSettings + this.sCellValue).trim();
            var expressionLanguage = sap.ui.getCore().byId(this.getExpressionLanguage());
            var suggestions;
            if (!this.sHeaderValue && !this.FixedOperatorValue) {
                this.setProperty("value", this.sValue);
                sap.rules.ui.ExpressionBasic.prototype._reload.apply(this, arguments);
                return;
            } else {
                //need only right part
                if (this.sHeaderValue && this.FixedOperatorValue) {
                    suggestions = expressionLanguage._getRightSuggestions(this.sHeaderValue, this.FixedOperatorValue, this.sCellValue, null, null);
                    //need only right + comp part
                } else if (this.sHeaderValue && !this.FixedOperatorValue) {
                    var oToken = expressionLanguage.validateExpression(this.sHeaderValue);
                    if (oToken.status === "Error") {
                        this.bReadOnly = true;
                        this.bFlagForChange = true;
                        suggestions = [expressionLanguage._getLeftSuggestions("", "")];
                    } else {
                        var aCellValue = this._getSubExpression(this.sCellValue);
                        var compValue = (aCellValue[1]) ? aCellValue[1].exp : "";
                        suggestions = [expressionLanguage._getCompSuggestions(this.sHeaderValue, compValue, null)];
                        // there is comp in cell
                        if (compValue) {
                            var rightSuggestions;
                            var rightValue = (aCellValue[2]) ? aCellValue[2].exp : "";
                            rightSuggestions = expressionLanguage._getRightSuggestions(this.sHeaderValue, compValue, rightValue, null, null);
                            suggestions.push.apply(suggestions, rightSuggestions);
                        }
                    }
                }
                this.instructions = this._createInstructions(suggestions);
                var instructionsRenderer = new InstructionRenderer({
                    instructions: this.instructions,
                    useIndent: false,
                    change: this._onChange.bind(this)
                });
                this.setAggregation("_instructionRenderer", instructionsRenderer, true);
            }

        },
        _calculateOffSet: function() {
            if (!this.sHeaderValue && !this.FixedOperatorValue) {
                this.offSet = 0;
            } else if (this.sHeaderValue && this.FixedOperatorValue) {
                this.offSet = 2;
            } else {
                this.offSet = 1;
            }
        },
        _onChangeByIndex: function(instructionIndex, sPrefix) {
            sap.rules.ui.ExpressionBasic.prototype._onChangeByIndex.apply(this, [this.offSet + instructionIndex, this.sHeaderValue + this.FixedOperatorValue, instructionIndex]);
        }
    });

    DecisionTableCellExpressionBasic.prototype.init = function() {

    };

    DecisionTableCellExpressionBasic.prototype.validateExpression = function() {

    };

    DecisionTableCellExpressionBasic.prototype.onAfterRendering = function() {
        sap.rules.ui.ExpressionBasic.prototype.onAfterRendering.apply(this, arguments);
        this._calculateOffSet();
    };

    DecisionTableCellExpressionBasic.prototype.onBeforeRendering = function() {
        sap.rules.ui.ExpressionBasic.prototype.onBeforeRendering.apply(this, arguments);
    };

    DecisionTableCellExpressionBasic.prototype._getSubExpression = function(expression) {
        var oExpressionLanguage = sap.ui.getCore().byId(this.getExpressionLanguage());
        return oExpressionLanguage._getSubExpressions(null, "dummy " + expression);
    };

    DecisionTableCellExpressionBasic.prototype._handleValidation = function() {
        var expressionValue = this.getHeaderValue() + " " + this.getFixedOperator() + " " + this.getValue();
        var expressionLanguage = sap.ui.getCore().byId(this.getExpressionLanguage());
        if (expressionValue) {
            var oResult = expressionLanguage.validateExpression(expressionValue);
            if (oResult.status === "Error") {
                this.setProperty("valueStateText", oResult.errorDetails);
            } else {
                this.setProperty("valueStateText", "");
            }
        }
    };

    return DecisionTableCellExpressionBasic;

}, /* bExport= */ true);