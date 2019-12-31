/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

sap.ui.define([
    "jquery.sap.global",
    "./library",
    "sap/ui/core/Control",
    "sap/rules/ui/InstructionRenderer",
    "sap/rules/ui/ExpressionBase"
], function(jQuery, library, Control, InstructionRenderer, ExpressionBase) {
    "use strict";

    /**
     * Constructor for a new ExpressionBasic.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * The <code>sap.rules.ui.ExpressionBasic</code> control provides the ability to define simplified expressions for rules in a decision table
     * @extends  Control
     *
     * @author SAP SE
     * @version 1.46.0
     *
     * @constructor
     * @private
     * @alias sap.rules.ui.ExpressionBasic
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var ExpressionBasic = ExpressionBase.extend("sap.rules.ui.ExpressionBasic", {
        metadata: {

            properties: {
                value: {
                    type: "string",
                    defaultValue: "",
                    bindable: "bindable"
                }
            },
            aggregations: {
                _instructionRenderer: {
                    type: "sap.rules.ui.InstructionRenderer",
                    multiple: false
                }
            }
        },
        init: function() {
            this.shouldReload = true;

        },
        _removeFurtherInstructions: function(instructionIndex) {
            var numOfInstrucitons = this.instructions.length;
            var numOfItemsToRemove = numOfInstrucitons - instructionIndex - 1;
            this.instructions.splice(instructionIndex + 1, numOfItemsToRemove);
        },
        _onChange: function(oEvent) {
            var instructionIndex = oEvent.getParameter("instructionNum");
            this._onChangeByIndex(instructionIndex);
        },

        _onChangeByIndex: function(instructionIndex, sPrefix, iOriginalIndex) {
            sPrefix = sPrefix || "";
            iOriginalIndex = (iOriginalIndex === undefined || iOriginalIndex === null) ? instructionIndex : iOriginalIndex;
            var oInstructionsRenderer = this.getAggregation("_instructionRenderer");
            var updatedExpression = oInstructionsRenderer.getExpression();
            if (instructionIndex > 1) {
                //If the change is at the right part, we'll change nothing, but the value
                this.setProperty("value", updatedExpression);
                return;
            }
            this._removeFurtherInstructions(iOriginalIndex);
            updatedExpression = oInstructionsRenderer.getExpression();
            var expressionLanguage = sap.ui.getCore().byId(this.getExpressionLanguage());
            var suggestionsPart = sap.rules.ui.SuggestionsPart;
            var suggestions;
            var updatedInstruction;

            if (instructionIndex == 0) {
                //we'll update only the comparison part instruction
                suggestions = expressionLanguage._getBasicSuggestions(updatedExpression, suggestionsPart.compPart);
            }
            if (instructionIndex == 1) {
                //we'll update only the right part, might be 2 instructions at "in_between" or duration
                suggestions = expressionLanguage._getBasicSuggestions(sPrefix + " " + updatedExpression, suggestionsPart.rightPart);
            }
            updatedInstruction = this._createInstructions(suggestions);
            this.instructions = this.instructions.concat(updatedInstruction);
            oInstructionsRenderer.setInstructions(this.instructions);
            this.setProperty("value", updatedExpression);
        },

        _callbackForActionControl: function(instrIndex, suggArray) {

            var instr = this._createInstructions(suggArray);

            this.instructions.splice.apply(this.instructions, [instrIndex, 0].concat(instr));

            var oInstructionsRenderer = this.getAggregation("_instructionRenderer");

            oInstructionsRenderer.setInstructions(this.instructions);
        },

        _createInstructions: function(suggestions) {

            var instructions = [];
            var suggestion;
            var instruction;
            var suggArray;

            for (var i = 0; i < suggestions.length; i++) {

                instruction = {};

                suggestion = suggestions[i];

                //Action control (for repetitive controls)
                if (Array.isArray(suggestion)) {

                    instruction.type = "action";
                    instruction.callback = this._callbackForActionControl.bind(this, i, suggestion);
                    instruction.editable = true;

                    //Regular control
                } else {

                    suggArray = suggestion.sugg;

                    if (suggArray && suggArray.length !== 0) {

                        instruction.valueOptions = {};
                        instruction.valueOptions.type = "Set";
                        instruction.valueOptions.values = [];

                        var valuesArray = instruction.valueOptions.values;

                        for (var j = 0; j < suggArray.length; j++) {

                            valuesArray.push({
                                "token": suggArray[j],
                                "text": suggArray[j]
                            });
                        }
                    }

                    instruction.text = suggestion.currentValue;
                    instruction.token = suggestion.currentValue;

                    if (suggestion.BDT) {

                        instruction.businessDataType = suggestion.BDT;
                    }

                    instruction.editable = true;
                }

                instruction.visible = true;

                // in case of "to", ")", "(", shouldn't be editable
                if (suggestion.tokenCategory === "reservedword.undefined" ||
                    suggestion.tokenCategory === "reservedword.null") {

                    instruction.editable = false;

                } else {

                    instruction.editable = true;
                }

                instructions.push(instruction);
            }

            return instructions;
        },
        setValue: function(value) {
            this.shouldReload = true;
            this.setProperty("value", value);
        },
        _reload: function() {
            this.shouldReload = false;
            var suggestions = sap.ui.getCore().byId(this.getExpressionLanguage())._getBasicSuggestions(this.getValue());
            this.instructions = this._createInstructions(suggestions);
            var instructionsRenderer = new InstructionRenderer({
                instructions: this.instructions,
                useIndent: false,
                change: this._onChange.bind(this)
            });
            this.setAggregation("_instructionRenderer", instructionsRenderer, true);
        },
        onBeforeRendering: function() {
            if (this.shouldReload == true) {
                this._reload();
            }
        },

        onAfterRendering: function() {
            if (this.shouldReload == true) {
                this._reload();
            }

            var oInstructionsRenderer = this.getAggregation("_instructionRenderer");

            var controlArray = oInstructionsRenderer.getAggregation("_content");

            controlArray[controlArray.length - 1].focus();

            jQuery.sap.byId(this.getId()).on("change", null, function(event) {

                this.focus();

            }.bind(this));
        }
    });

    return ExpressionBasic;

}, /* bExport= */ true);