sap.ui.define([
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/SegmentedButton",
    "sap/m/SegmentedButtonItem"
], function(SmartFilterBar, SegmentedButton, SegmentedButtonItem) {
    "use strict";

	var FILTER_MODE_COMPACT = "compact";

	// Need to integrate with the existing smart filter bar integration with the SmartChart and SmartTable.
	// Since we have no control over changing the SmartFilterBar, SmartTable and SmartChart, and we need the
	//   SmartVisualFilterBar to integrate with the SmartChart and SmartTable, it makes sense to extend the SmartFilterBar to act as a fascade.
	//   This fascade will return the correct set of filters when in either Visual Filter mode or the standard Compact filter mode.
	var SmartFilterBarExt = SmartFilterBar.extend("sap.suite.ui.generic.template.AnalyticalListPage.control.SmartFilterBarExt", {
		metadata: {
			properties: {
				mode: { type: "string", group: "Misc", defaultValue: FILTER_MODE_COMPACT },
				smartVisualFilterBarId: { type: "string", group: "Misc", defaultValue: null },
				hideVisualFilter: { type: "boolean", group: "Misc", defaultValue: null }
			},
			events: {
				switchToVisualFilter: {}
			}
		},
		renderer: {}
	});
	/**
	 * set currently active filter mode for the application Visual/Compact
	 * @param {mode} mode Visual/Compact
	 * @return {void}
	 */
	SmartFilterBarExt.prototype.setMode = function(mode) {
		this.setProperty("mode", mode);
	};

	SmartFilterBarExt.prototype.getFilterCount = function() {
		var filters = SmartFilterBar.prototype.retrieveFiltersWithValues.apply(this, arguments);
		return filters ? filters.length : 0;
	};
	
	SmartFilterBarExt.prototype._getView = function() {
		if (this._view)
			return this._view;

		var p = this.getParent();
		while (p) {
			if (p instanceof sap.ui.core.mvc.View) {
				this._view = p;
				break;
			}
			p = p.getParent();
		}

		return this._view;
	};

	SmartFilterBarExt.prototype._createFilters = function() {
		var oForm = SmartFilterBar.prototype._createFilters.apply(this, arguments);
		//Segment Button added only after checking if VF is to be shown
		if (this.getHideVisualFilter() === false) {
			var filterSwitchItems = [
				new sap.m.SegmentedButtonItem({icon:"sap-icon://filter-fields", width:"inherit", key:"compact", tooltip:"{i18n>FILTER_COMPACT}"}),
				new sap.m.SegmentedButtonItem({icon:"sap-icon://filter-analytics", width:"inherit", key:"visual", tooltip:"{i18n>FILTER_VISUAL}"})
			];
			var filterSwitch = new SegmentedButton({
				width:"inherit",
				selectedKey:"compact",
				items: filterSwitchItems
			});
			filterSwitch.attachSelect(function(){
				//Save changes done at SmartFilter dialog and close it.
				this._bOKFiltersDialogTriggered = true;
				this._searchRequested(oForm);
				//Switch to VFD only after successful form validation of SmartFilter dialog
				if (this._validateState() && this._validateMandatoryFields()) {
					this.fireSwitchToVisualFilter();
				}
				//If form validation fails switch back to SmartFilter dialog
				else {
					filterSwitch.setSelectedKey("compact");
				}
			}.bind(this));

			var oToolbar = new sap.m.OverflowToolbar({
				design: sap.m.ToolbarDesign.Transparent,
				content: [
					new sap.m.ToolbarSpacer(),
					filterSwitch
				]
			}).addStyleClass("alpFilterDialogToolbar");
			oForm.setToolbar(oToolbar);
		}
		return oForm;
	};
});
