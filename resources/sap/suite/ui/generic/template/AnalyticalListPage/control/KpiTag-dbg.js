sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Label",
	"sap/m/NumericContent",
	"sap/ui/model/json/JSONModel",
	"sap/suite/ui/generic/template/AnalyticalListPage/controller/KpiTagController",
	"sap/suite/ui/generic/template/AnalyticalListPage/util/KpiUtil",
	"sap/suite/ui/generic/template/AnalyticalListPage/util/KpiAnnotationHelper"

], function(Control, Label, NumericContent, JSONModel, KpiTagController, KpiUtil, KpiAnnotationHelper) {
	"use strict";
	/**
	* oCriticalityChecker is dictionary of functions to extend the Criticality Calculation usablility
	* it can be used to call specific function to calculate Criticality with respect to annotations; ie Maximize,Minimize and Target
	* Internal functions are named according to defined annotations values.
	*/
	var oCriticalityChecker = {
		toleranceLow:null,
		toleranceHigh:null,
		deviationLow:null,
		deviationHigh:null,
		_value:null,
		state:sap.m.ValueColor.Neutral,
		/**
		* This function set values for all the keys
		* @param  {number} vToleranceLow toleranceLow value from annotations
		* @param  {number} vToleranceHigh deviationLow value from annotations
		* @param  {number} vDeviationLow toleranceHigh value from annotations
		* @param  {number} vDeviationHigh toleranceHigh value from annotations
		* @param {number} vValue Value for comparison
		*/
		setVals : function(vToleranceLow, vToleranceHigh, vDeviationLow, vDeviationHigh, vValue) {
			this.toleranceLow = vToleranceLow;
			this.toleranceHigh = vToleranceHigh;
			this.deviationLow = vDeviationLow;
			this.deviationHigh = vDeviationHigh;
			this._value = vValue;
			this.state = sap.m.ValueColor.Neutral;
		},
		/**
		* This calculate the Criticality color for Maximizing KPI
		* @return {state} returns the state for Criticality color indicator
		*/
		Maximize : function() {
			if (this.toleranceLow || this.deviationLow) {
				if (this._value >= this.toleranceLow) {
					this.state = sap.m.ValueColor.Good;
				} else if (this._value < this.deviationLow) {
					this.state = sap.m.ValueColor.Error;
				} else {
					this.state = sap.m.ValueColor.Critical;
				}
			}
			return this.state;
		},
		Maximizing : function(){
			this.Maximize();
		},
		/**
		* This function calculate the the criticality color for Minimizing KPI
		* @return {state} returns the state for Criticality color indicator
		*/
		Minimize: function(){
			if (this.toleranceHigh || this.deviationHigh) {
				if (this._value <= this.toleranceHigh) {
					this.state = sap.m.ValueColor.Good;
				} else if (this._value > this.deviationHigh) {
					this.state = sap.m.ValueColor.Error;
				} else {
					this.state = sap.m.ValueColor.Critical;
				}
			}
			return this.state;
		},
		Minimizing: function(){
			this.Minimize();
		},
		/**
		* This function calculate the Criticality color for Target KPI
		* @return {state} returns the state for Criticality color indicator
		*/
		Target :function(){
			if (this.toleranceLow && this.toleranceHigh) {
				if (this._value >= this.toleranceLow && this._value <= this.toleranceHigh) {
					this.state = sap.m.ValueColor.Good;
				} else if (this._value < this.deviationLow || this._value > this.deviationHigh) {
					this.state = sap.m.ValueColor.Error;
				} else {
					this.state = sap.m.ValueColor.Critical;
				}
			}
			return this.state;
		}
	};

	var oCriticalitySet = {
		Critical: sap.m.ValueColor.Critical,
		Negative:sap.m.ValueColor.Error,
		Positive:sap.m.ValueColor.Good
	};

	return Control.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.KpiTag", {
		metadata: {
			properties: {
				value: {
					type: "string",
					defaultValue: "",
					bindable: true
				},
				name: {
					type: "string",
					defaultValue: "",
					bindable: true
				},
				scale: {
					type: "string",
					defaultValue: undefined,
					bindable: true
				},
				indicator: {
					type: "sap.m.ValueColor",
					defaultValue: "Neutral"
				},
				entitySet: {
					type: "string",
					defaultValue: "",
					bindable: false
				},
				qualifier: {
					type: "string",
					defaultValue: "",
					bindable: false
				},
				modelName: {
					type: "string",
					defaultValue: undefined,
					bindable: false
				}
			},
			aggregations: {
				_name: {
					type: "sap.m.Label",
					multiple: false,
					visibility: "visible"
				},
				_value: {
					type: "sap.m.Label",
					multiple: false,
					visibility: "visible"
				},
				_content: {
					type: "sap.m.NumericContent",
					multiple: false,
					visibility: "visible"
				}
			},
			events: {
				press: {}
			}
		},
		_firstTime: true,
		_dataModel: undefined,
		_controller: undefined,
		_isRelative: false,
		_isPercent: false,
		_sUnitofMeasure: "",
		_relativeToProperties: [],
		_getDataModel: function() {
			if (!this._dataModel) {
				this._dataModel = new JSONModel();
			}
			return this._dataModel;
		},
		_getController: function() {
			if (!this._controller) {
				this._controller = new KpiTagController();
			}
			return this._controller;
		},
		onBeforeRendering: function() {
			if (this._firstTime) {
				this.setBusy(true);
				this._firstTime = false;
				var oModel = this.getModel(this.getModelName());
				oModel.getMetaModel().loaded().then(function() {
					var oMetaModel = oModel.getMetaModel();
					var oEntitySet = oMetaModel.getODataEntitySet(this.getEntitySet());
					var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);

					var selectionPresentationVariantPath = "com.sap.vocabularies.UI.v1.SelectionPresentationVariant#" + this.getQualifier();
					var oSelectionPresentationVariant = oEntityType[selectionPresentationVariantPath];
					if (!oSelectionPresentationVariant) {
						return;
					}

					// CDS Annotation gives Path instead of AnnotationPath
					var oSelectionVariantPath = oSelectionPresentationVariant.SelectionVariant && (oSelectionPresentationVariant.SelectionVariant.AnnotationPath || oSelectionPresentationVariant.SelectionVariant.Path);
					if (!oSelectionVariantPath) {
						return;
					}
					if (/^@/.test(oSelectionVariantPath)) {
						oSelectionVariantPath = oSelectionVariantPath.slice(1);
					}
					var oSelectionVariant = oEntityType[oSelectionVariantPath];
					var aFilters = [];
					var aSelectOptions = oSelectionVariant && oSelectionVariant.SelectOptions;
					var oSelectOption, sPropertyPath, oRange;

					if (aSelectOptions) {
						for (var i = 0; i < aSelectOptions.length; i++) {
							oSelectOption = aSelectOptions[i];
							sPropertyPath = oSelectOption.PropertyName.PropertyPath;
							for (var j = 0; j < oSelectOption[sPropertyPath].length; j++) {
								oRange = oSelectOption[sPropertyPath][j];
								if (oRange.Sign.EnumMember === "com.sap.vocabularies.UI.v1.SelectionRangeSignType/I") {
									var oFilter = {
										path: sPropertyPath,
										operator: oRange.Option.EnumMember.split("/")[1],
										value1: oRange.Low.String,
										value2: oRange.High ? oRange.High.String : ""
									};
									aFilters.push(new sap.ui.model.Filter(oFilter));
								}
							}
						}
					}

					// CDS Annotation gives Path instead of AnnotationPath
					var oPresentationVariantPath = oSelectionPresentationVariant.PresentationVariant && (oSelectionPresentationVariant.PresentationVariant.AnnotationPath || oSelectionPresentationVariant.PresentationVariant.Path);
					if (!oPresentationVariantPath) {
						return;
					}
					if (/^@/.test(oPresentationVariantPath)) {
						oPresentationVariantPath = oPresentationVariantPath.slice(1);
					}

					var datapointPath = "com.sap.vocabularies.UI.v1.DataPoint#" + this.getQualifier();
					var oDatapoint = oEntityType[datapointPath];

					this.dataPointAnnotation = oDatapoint;
					var oEntityTypeProperty = oMetaModel.getODataProperty(oEntityType, oDatapoint.Value.Path);

					this._checkForPercent(oModel, oEntityTypeProperty);
					//this._checkIfRelative(oDatapoint);
					this._getCriticalityRefProperties(oDatapoint);

					this.setModel(this._getDataModel());

					var sPath = KpiAnnotationHelper.resolveParameterizedEntitySet(oModel, oEntitySet, oSelectionVariant);

					if (oDatapoint.Value) {
						if (oDatapoint.Value.Path) {
							//TODO:Understand why binding path is set like "/0/<properties>" ?
							this.bindValue("/0/" + oDatapoint.Value.Path);
						} else {
							this.setProperty("value", oDatapoint.Value.String);
						}
					}

					oModel.read(sPath ,{
						async: true,
						filters: aFilters,
						urlParameters: {
							"$select": [oDatapoint.Value.Path].concat(this._relativeToProperties).join(","),
							"$top": 1
						},
						success: function(data, response) {
							this._getDataModel().setData(data.results);
							this._calculateKPICriticality(this.dataPointAnnotation);
							this._setNameInformation(this.dataPointAnnotation);
							this._setScaleInformation(this.dataPointAnnotation);
							this.setBusy(false);
						}.bind(this),
						error: function(error) {
							jQuery.sap.log.error("Error reading URL:" + error);
						}
					});

				}.bind(this));
			}
		},
		init: function() {
			if (Control.prototype.init) {
				Control.prototype.init.call(this);
			}
		},
		_onMouseClick: function(oEvent) {
			KpiTagController.openKpiCard(oEvent);
		},


		/**
		 * @private 
		 * this Methods checks if the returned unit of Measure is a percent
		 * @param  oModel              [model from the annotation]
		 * @param  oEntityTypeProperty [Entity property which has the UoM]
		 * @return                     [returns true/false ]
		 */
		_checkForPercent: function(oModel, oEntityTypeProperty)
		{
			this._sUnitofMeasure = KpiUtil.getUnitofMeasure(oModel, oEntityTypeProperty);
			if (this._sUnitofMeasure == "%") // this hardcoded checks needs to be relooked.
				this._isPercent = true;

		},
		
		_checkIfRelative: function(oDataPoint) {

			var trendCalc = oDataPoint.TrendCalculation;
			this._isRelative = KpiUtil.isRelative(oDataPoint);
			if (this._isRelative) {
				if (trendCalc.ReferenceValue.Path) {
					this._relativeToProperties.push(trendCalc.ReferenceValue.Path);
				}
			}
		},
		_setNameInformation: function(oDataPoint) {
			var titlePath = oDataPoint.Title;
			//var nameFromPath = this._getPathOrPrimitive(titlePath);
			//var nameFromPath = KpiUtil.getPathOrPrimitiveValue(this._getDataModel(),titlePath);
			var nameFromPath = KpiUtil.getPathOrPrimitiveValue(titlePath);
			//Handle cases where DataPoint.title may not be present
			if ( nameFromPath === undefined ) {
				nameFromPath = "";
			}
			this.setProperty("name", this._getNameFromHeuristic(nameFromPath), false);
			this.setTooltip(nameFromPath);
		},
		_setScaleInformation: function(oDataPoint) {
			if ( oDataPoint.ValueFormat ) {
				if ( oDataPoint.ValueFormat.ScaleFactor ) {
					this.setProperty("scale", KpiUtil.getPathOrPrimitiveValue(oDataPoint.ValueFormat.ScaleFactor));
				}
			}
		},
		_getCriticalityRefProperties: function(oDataPoint) {
			var cCalc = oDataPoint.CriticalityCalculation;
			var crit = oDataPoint.Criticality;
			if (cCalc.DeviationRangeLowValue && cCalc.DeviationRangeLowValue.Path) {
				this._relativeToProperties.push(cCalc.DeviationRangeLowValue.Path);
			}
			if (cCalc.DeviationRangeHighValue && cCalc.DeviationRangeHighValue.Path) {
				this._relativeToProperties.push(cCalc.DeviationRangeHighValue.Path);
			}
			if (cCalc.ToleranceRangeLowValue && cCalc.ToleranceRangeLowValue.Path) {
				this._relativeToProperties.push(cCalc.ToleranceRangeLowValue.Path);
			}
			if (cCalc.ToleranceRangeHighValue && cCalc.ToleranceRangeHighValue.Path) {
				this._relativeToProperties.push(cCalc.ToleranceRangeHighValue.Path);
			}
			if (crit && crit.Path) {
				this._relativeToProperties.push(crit.Path);
			}
		},
		_getTitleRefProperty: function(oDataPoint) {
			var titlePath = oDataPoint.Title;
			if (titlePath && titlePath.Path) {
				this._relativeToProperties.push(titlePath.Path);
			}
		},
		_getNameFromHeuristic: function(sentence) {
			var parts = sentence.split(/\s/);
			return parts.length === 1 ? this._getNameFromSingleWordHeuristic(sentence) : this._getNameFromMultiWordHeuristic(parts);
		},
		/**
		* [_getNameFromSingleWordHeuristic Extract logic for single word]
		* @param  {String} word which needs to be changed to short title
		* @return {String} KPI Short title
		*/
		_getNameFromSingleWordHeuristic: function(word) {
			return word.substr(0,3).toUpperCase();
		},
		_getNameFromMultiWordHeuristic: function(words) {
			var parts = [];
			parts.push(words[0].charAt(0));
			parts.push(words[1].charAt(0));
			if (words.length >= 3) {
				parts.push(words[2].charAt(0));
			}
			return parts.join("").toUpperCase();
		},
		_calculateKPICriticality: function(oDataPoint) {
			var sImproveDirection = oDataPoint.CriticalityCalculation && oDataPoint.CriticalityCalculation.ImprovementDirection ? KpiUtil.getPathOrPrimitiveValue(oDataPoint.CriticalityCalculation.ImprovementDirection) : undefined;
			var criticality = oDataPoint.Criticality ? KpiUtil.getPathOrPrimitiveValue(oDataPoint.Criticality) : undefined;
			var state = sap.m.ValueColor.Neutral;

			if (criticality) {
				state = oCriticalitySet[criticality];
				if (!state) {
					state = sap.m.ValueColor.Neutral;
				}
				this.setIndicator(state);
				return;
			}



			var deviationLow = oDataPoint.CriticalityCalculation.DeviationRangeLowValue ? KpiUtil.getPathOrPrimitiveValue(oDataPoint.CriticalityCalculation.DeviationRangeLowValue) : undefined;
			var deviationHigh = oDataPoint.CriticalityCalculation.DeviationRangeHighValue ? KpiUtil.getPathOrPrimitiveValue(oDataPoint.CriticalityCalculation.DeviationRangeHighValue) : undefined;
			var toleranceLow = oDataPoint.CriticalityCalculation.ToleranceRangeLowValue ? KpiUtil.getPathOrPrimitiveValue(oDataPoint.CriticalityCalculation.ToleranceRangeLowValue) : undefined;
			var toleranceHigh = oDataPoint.CriticalityCalculation.ToleranceRangeHighValue ? KpiUtil.getPathOrPrimitiveValue(oDataPoint.CriticalityCalculation.ToleranceRangeHighValue) : undefined;


			var value = Number(this.getValue());
			oCriticalityChecker.setVals(toleranceLow, toleranceHigh, deviationLow, deviationHigh, value);
			this.setIndicator(oCriticalityChecker[sImproveDirection]());
		},
		renderer: function(oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("alrKpiTag sapUiSmallMarginEnd");
			oControl._addColorClasses(oRM);
			oRM.writeClasses();
			oRM.writeAttributeEscaped("title", oControl.getTooltip());
			oRM.write(">");
			oRM.write("<div");
			oRM.addClass("alrKpiTagName");
			oRM.writeClasses();
			oRM.write(">");
			oRM.writeEscaped(oControl.getName());
			oRM.write("</div>");
			oRM.write("<div");
			oRM.addClass("alrKpiTagValue");
			oRM.writeClasses();
			oRM.write(">");
			oRM.writeEscaped(oControl._isPercent ? KpiUtil.formatNumberForPresentation(oControl.getValue(), true, 1, oControl.getProperty("scale")) + oControl._sUnitofMeasure : KpiUtil.formatNumberForPresentation(oControl.getValue(), true, 0, oControl.getProperty("scale")));
			oRM.write("</div>");
			oRM.write("</div>");
		},
		_addColorClasses: function(rm) {
			switch (this.getIndicator()) {
				case sap.m.ValueColor.Neutral:
				rm.addClass("alrKPINeutral");
				break;
				case sap.m.ValueColor.Error:
				rm.addClass("alrKPINegative");
				break;
				case sap.m.ValueColor.Good:
				rm.addClass("alrKPIPositive");
				break;
				case sap.m.ValueColor.Critical:
				rm.addClass("alrKPICritical");
				break;
				default:
				break;
			}
		},

		onAfterRendering: function() {
			setTimeout(function() {
				//this.$().off("click").on("click", this._onMouseClick);
				this.detachBrowserEvent("click", this._onMouseClick).attachBrowserEvent("click", this._onMouseClick);
			}.bind(this), 1);
		},

		handleClick: function(oEvent) {
			this.fireEvent("press", {});
		},

		exit: function() {
			this._relativeToProperties = [];
		}
	});
}, true);