/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// Provides control sap.rules.ui.ExpressionAdvanced.
sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/rules/ui/Utils",
	"sap/rules/ui/ExpressionAdvanced"
],	function(jQuery, library, Utils, ExpressionAdvanced) {
		"use strict";

		/**
		 * Constructor for a new DecisionTableCellExpressionAdvanced sap.rules.ui.ExpressionAdvanced.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The <code>sap.rules.ui.DecisionTableCellExpressionAdvanced</code> control provides the ability to define expressions for complex rules in a decision table.
		 * @extends  sap.rules.ui.ExpressionAdvanced
		 *
		 * @author SAP SE
		 * @version 1.46.0
		 *
		 * @constructor
		 * @private
		 * @alias sap.rules.ui.DecisionTableCellExpressionAdvanced
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var DecisionTableCellExpressionAdvanced = ExpressionAdvanced.extend("sap.rules.ui.DecisionTableCellExpressionAdvanced", {
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
			}
		});

		DecisionTableCellExpressionAdvanced.prototype.validateExpression = function() {
			var expressionValue = this.codeMirror ? this.codeMirror.getValue() : this.getValue();
			if (expressionValue) {
				var sValue = this.getHeaderValue() + " " + this.getFixedOperator() + " " + expressionValue;
				sap.rules.ui.ExpressionAdvanced.prototype.validateExpression.apply(this, [sValue]);
			} else {
				this.setValueStateText("");
			}

		};
    
        DecisionTableCellExpressionAdvanced.prototype.init = function() {
			sap.rules.ui.ExpressionAdvanced.prototype.init.apply(this, arguments);
            this.bFlagForChangeBeforeBlur = false;          
		};

		DecisionTableCellExpressionAdvanced.prototype.onAfterRendering = function() {
			sap.rules.ui.ExpressionAdvanced.prototype.onAfterRendering.apply(this, arguments);
			this.codeMirror.options.fixedOperator = this.getFixedOperator();
			this.codeMirror.options.headerValue = this.getHeaderValue();
			this.codeMirror.options.filterOutStructuredCond = true;      //Structured conditions should not appear in decision table. (e.g "any of the following...")
			this.oDecisionTableCell = (this.getParent() && this.getParent().getParent()) ?  this.getParent().getParent() : null;
			this._handleValidation();
            if (jQuery.sap.byId(this.getId()).closest('td').next().width()) {
				this._showPopUp();
			} 
            
            this.createEventListeners();

		};
		
		DecisionTableCellExpressionAdvanced.prototype._handleValidation = function() {
			this.validateExpression();
			this._showErrorMessage();
			if (this.getProperty("valueStateText") && this.codeMirror) {
				this.codeMirror.options.expressionEditor._showPopUp();
			}
		};
		
		DecisionTableCellExpressionAdvanced.prototype._processValidationResult = function(result){
		sap.rules.ui.ExpressionAdvanced.prototype._processValidationResult.apply(this, arguments);
			if (this.oDecisionTableCell) {
				var oDisplayedControl = this.oDecisionTableCell.getAggregation("_displayedControl");
				if (oDisplayedControl && result.status === sap.rules.ui.ValidationStatus.Error) {
					oDisplayedControl.addStyleClass("sapMInputBaseErrorInner");
				} else if (oDisplayedControl) {
					oDisplayedControl.removeStyleClass("sapMInputBaseErrorInner");
			}
		}
	};
    
        DecisionTableCellExpressionAdvanced.prototype.exit = function() {
            this._handleValidation();
            this._closePopUp();
            this.pop = null;
        };

		DecisionTableCellExpressionAdvanced.prototype.getFormattingTokens = function (oExpressionLanguage) {
					var sExpression = this._liveValue;
					var sHeader = this.getHeaderValue();
					var sFixOperator = this.getFixedOperator();
					var sType = "All";
					var result = oExpressionLanguage.getDecisionTableCellTokens(sHeader, sFixOperator, sExpression, sType);
					var expressionTokens;
					if (result.tokens && result.tokens.cell) {
						expressionTokens = result.tokens.cell;
						this.setExpressionTokens(expressionTokens);
					}
		};
    
        DecisionTableCellExpressionAdvanced.prototype.createEventListeners = function() {
            //fix bug - after press backspace and choose autocomplete - popover will closed
            
            document.getElementById(this.getId()).addEventListener("keydown", function(oEvent){
                var key = oEvent.keyCode || oEvent.charCode;
                if ( key === 8 )
                    this.bFlagForChangeBeforeBlur = true;
            }.bind(this), true);
    
            //listener for fixing bugs in windows 10 and chrome (not damaged in other browsers and OS) bug RULES-4848
            document.getElementById(this.getId()).addEventListener("change", function(oEvent){
                this.bFlagForChangeBeforeBlur = true;
                this.codeMirror.focus();
            }.bind(this), true);
            
            document.getElementById(this.getId()).addEventListener("blur", function(oEvent){
                if (this.bFlagForChangeBeforeBlur) {
                    this.bFlagForChangeBeforeBlur = false;
                    oEvent.stopPropagation();
                    this.codeMirror.focus();
                }
            }.bind(this), true);
            
            // bug 4848 in chrome - touch screen laptops close popover after select autocomplete
            //check if hybrid device
            var click = ('ontouchstart' in document.documentElement)  ? 'touchstart' : 'mousedown'; 
            
            if (click === 'touchstart') { //if hybrid device
                document.addEventListener("mousedown", function(oEvent) {
                    if (oEvent.target.className.includes("CodeMirror-hint")) {//if click the auto complete
                        oEvent.stopPropagation();
                    }
                }.bind(this), true);
                document.addEventListener("touchstart", function(oEvent) {
                    if (oEvent.target.className.includes("CodeMirror-hint")) {//if tap the auto complete
                        oEvent.stopPropagation();
                    }
                }.bind(this), true);
            }
            
            if (!(window.ActiveXObject) && "ActiveXObject" in window) { //if browser IE
                
                //listener for fixing bugs in IE (code mirror blur called validate even popover open - not damaged in other browsers and OS) bug RULES-4810
                
                this.codeMirror.on("blur", function (cm, oEvent) {
                    this.bFlagForPreventBlurWhenPopOverOpen = true;
                }.bind(this));
                
                //listener for fixing bugs in IE (blur called twice - not damaged in other browsers and OS) bug RULES-2641
                
                document.getElementById(this.getId()).addEventListener("mousedown", function(oEvent){
                    this.bFlagForChangeBeforeBlur = true;
                }.bind(this), true);
            }   
            
            //fix for FF only after choose hints with mouse sometimes the popover will close
            if ((navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
                document.addEventListener("blur", function(oEvent){
                    if (!this.codeMirror || (this.codeMirror.state && this.codeMirror.state.completionActive) || (this.ValueHelpRequested === true)) {
                            oEvent.stopPropagation();
                        }
                }.bind(this), true);
            }
        };

		return DecisionTableCellExpressionAdvanced;

	}, /* bExport= */ true);