sap.ui.define([
		"sap/m/Button", "sap/m/ButtonType", "sap/m/Label", "sap/m/Dialog", "sap/m/Bar", "sap/m/SearchField",
		"sap/m/Toolbar", "sap/m/ToolbarSpacer", "sap/m/Title", "sap/m/VBox", "sap/m/HBox", "sap/m/CheckBox",
		"sap/m/Link", "sap/m/List", "sap/m/TextArea","sap/m/Text", "sap/m/StandardListItem", "sap/m/ListSeparators", "sap/m/Popover",
		"sap/ui/layout/form/SimpleForm", "sap/ui/layout/GridData",
		"sap/ui/core/mvc/Controller", "sap/suite/ui/generic/template/AnalyticalListPage/util/FilterUtil",
		"sap/m/SegmentedButton","sap/m/SegmentedButtonItem"
	], function(Button, ButtonType, Label, Dialog, Bar, SearchField, Toolbar, ToolbarSpacer, Title,
			VBox, HBox, CheckBox, Link, List, TextArea, Text, StandardListItem, ListSeparators, Popover, SimpleForm,
			GridData, Controller, FilterUtil, SegmentedButton, SegmentedButtonItem) {
	"use strict";

	var BASIC_GROUP = "_BASIC";
	var oClearButton, oRestoreButton, oGoButton, oCancelButton;

	// Chart Default Settings
	var chartWidth = "100%";
	var labelWidthPercent = 0.33;
	var labelWidthPercentDonut = 0.5; //Donut should cover half the area

	var vfdController = Controller.extend("sap.suite.ui.generic.template.AnalyticalListPage.controller.VisualFilterDialogController", {
		/**
		 * Initialize the control
		 *
		 * @public
		 * @param {oState} oState - state of the application
		 */
		init: function(oState) {
			this.oState = oState;
			this.oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");
		},

		/**
		 * Launches the Graphical Filter Dialog
		 *
		 * @public
		 */
		launchDialog: function () {
			var that = this;
			this.oConfig = this.oState.alr_visualFilterBar.getConfig();
			this._filterModified = false;
			this.filterCompList = [];
			this.filterChartList = [];
			this._buildFiltersFromConfig();
			this.oVFDialog = new sap.m.Dialog({
				title: this.oRb.getText("FILTER_BAR_ADV_FILTERS_DIALOG"),
				afterClose: function() {
					that.oVFDialog.destroy();
				}
			});
			this.oVFDialog.setModel(this.oState.oController.getView().getModel("_templPriv"), "_templPriv");
			this.oVFDialog.setModel(this.oState.oController.getView().getModel());
			this.oVFDialog.setModel(this.oState.oController.getView().getModel("i18n"), "i18n");
			this.oVFDialog.setVerticalScrolling(true);
			this._addDialogButtons();

			this.oVFDialog.addStyleClass("sapUiPopupWithPadding");
			this.oVFDialog.addStyleClass("sapUiSizeCompact");
			this.oVFDialog.addStyleClass("sapUiCompFilterBarDialog");

			// Search Field
			var oSubHeader = new Bar();
			var oFiltersSearchField = new SearchField({
				placeholder: this.oRb.getText("FILTER_BAR_SEARCH")
			});
			oFiltersSearchField.attachLiveChange(function(oEvent) {
				if (that.oVFDialog) {
					that._triggerSearchInFilterDialog(oEvent);
				}
			});

			oSubHeader.addContentRight(oFiltersSearchField);
			this.oVFDialog.setSubHeader(oSubHeader);
			this.oVerticalBox = new VBox();
			//this.oVerticalBox.addStyleClass("sapUiCompFilterBarDialogForm");
			this.oVerticalBox.addStyleClass("sapUiNoContentPadding");
			this.oVFDialog.addContent(this.oVerticalBox);
			this._addFilterSwitch();
			this._addGroupsAndFilters();
			this.oVFDialog.open();
		},

		_addFilterSwitch: function() {
			var filterSwitchItems = [
				new sap.m.SegmentedButtonItem({icon:"sap-icon://filter-fields", width:"inherit", key:"compact", tooltip:"{i18n>FILTER_COMPACT}"}),
				new sap.m.SegmentedButtonItem({icon:"sap-icon://filter-analytics", width:"inherit", key:"visual", tooltip:"{i18n>FILTER_VISUAL}"})
			];

			var filterSwitch = new SegmentedButton({
				width:"inherit",
				selectedKey:"visual",
				items: filterSwitchItems
			});

			filterSwitch.attachSelect(function(){
				//Save the changes of VFD and close.
				this.oState.alr_visualFilterBar._setVariantModified();
				this.oState.alr_visualFilterBar.setConfig(this._rebuildConfig(), true);
				this.oState.filterBarController.onGoFilter();
				this.oVFDialog.close();
				//Open SmartFilter Dialog
				this.oState.oSmartFilterbar.showFilterDialog();
			}.bind(this));

			var oToolbar = new sap.m.OverflowToolbar({
				design: sap.m.ToolbarDesign.Transparent,
				content: [
					new sap.m.ToolbarSpacer(),
					filterSwitch
				]
			}).addStyleClass("alpFilterDialogToolbar");

			this.oVerticalBox.addItem(oToolbar);
		},

		_addDialogButtons: function () {
			var that = this;
			oGoButton = new Button({
				text: this.oRb.getText("FILTER_BAR_GO"),
				type: ButtonType.Emphasized,
				press: function(oEvent) {
					that.oState.alr_visualFilterBar._setVariantModified();
					//firing filter search to apply changes
					that.oState.alr_visualFilterBar.setConfig(that._rebuildConfig(), true);
					that.oState.filterBarController.onGoFilter();
					that.oVFDialog.close();
				}
			});

			// clear button
			oClearButton = new Button({
				text: this.oRb.getText("FILTER_BAR_CLEAR"),
				press: function(oEvent) {
					that._clearFilters();
				}
			});

			// restore button
			oRestoreButton = new Button({
				text: this.oRb.getText("FILTER_BAR_RESTORE"),
				press: function(oEvent) {
					that.oState.alr_visualFilterBar.fireFilterChange({
						bRestoreCompactFilter: true
					});
					that._buildFiltersFromConfig();
					that.oVerticalBox.removeAllItems();
					//Restoring SegmentedButtons
					that._addFilterSwitch();
					that._addGroupsAndFilters();
				}
			});

			// cancel button
			oCancelButton = new Button({
				text: this.oRb.getText("FILTER_BAR_CANCEL"),
				press: function(oEvent) {
					that.oState.alr_visualFilterBar.fireFilterChange({
						bRestoreCompactFilter: true
					});
					// only close, no need to do any other processing since dialog has to close
					that.oVFDialog.close();
				}
			});

			this.oVFDialog.addButton(oGoButton);
			this.oVFDialog.addButton(oClearButton);
			this.oVFDialog.addButton(oRestoreButton);
			this.oVFDialog.addButton(oCancelButton);
			this.oVFDialog.attachAfterClose(function() {
				that.oVFDialog.destroy();
				that.oVFDialog = null;
			});
		},
		_buildFiltersFromConfig: function() {
			var i;
			this.filterCompList = [];
			this.filterChartList = [];
			for (i = 0; i < this.oConfig.filterCompList.length; i++) {
				this.filterCompList.push({
					obj: {
						shownInFilterBar: this.oConfig.filterCompList[i].shownInFilterBar,
						shownInFilterDialog: this.oConfig.filterCompList[i].shownInFilterDialog,
						cellHeight: this.oConfig.filterCompList[i].cellHeight,
						component: {
							type: this.oConfig.filterCompList[i].component.type,
							cellHeight: this.oConfig.filterCompList[i].component.cellHeight
						},
						group: {
							label: this.oConfig.filterCompList[i].group.label,
							name: this.oConfig.filterCompList[i].group.name
						}
					},
					searchVisible: true,
					toolbar: this._addChartCustomToolbar(this.oConfig.filterCompList[i], i)
				});
				this.filterChartList.push(
					this._addChart(this.oConfig.filterCompList[i].component.type, this.oConfig.filterCompList[i].component.properties, i)
				);
			}

			this._applyFilterSelections();
		},

		_rebuildConfig: function() {
			var i;
			var config = {
					filterCompList: []
				};
			for (i = 0; i < this.filterCompList.length; i++) {
				config.filterCompList.push({
					shownInFilterBar: this.filterCompList[i].obj.shownInFilterBar && this.filterCompList[i].obj.shownInFilterDialog,
					shownInFilterDialog: this.filterCompList[i].obj.shownInFilterDialog,
					cellHeight: this.filterCompList[i].obj.cellHeight,
					group: {
						label: this.filterCompList[i].obj.group.label,
						name: this.filterCompList[i].obj.group.name
					},
					component: {
						type: this.filterCompList[i].obj.component.type,
						cellHeight: this.filterCompList[i].obj.component.cellHeight,
						properties: {
							scaleFactor: this.filterChartList[i].getScaleFactor(),
							sortOrder: this.filterChartList[i].getSortOrder(),
							filterRestriction: this.oConfig.filterCompList[i].component.properties.filterRestriction,
							entitySet: this.filterChartList[i].getEntitySet(),
							width: this.oConfig.filterCompList[i].component.properties.width,
							height: this.oConfig.filterCompList[i].component.properties.height,
							dimensionField: this.filterChartList[i].getDimensionField(),
							dimensionFieldDisplay: this.filterChartList[i].getDimensionFieldDisplay(),
							dimensionFieldIsDateTime: this.filterChartList[i].getDimensionFieldIsDateTime(),
							dimensionFilter: this.filterChartList[i].getDimensionFilter(),
							unitField: this.filterChartList[i].getUnitField(),
							isCurrency: this.filterChartList[i].getIsCurrency(),
							isMandatory: this.oConfig.filterCompList[i].component.properties.isMandatory,
							measureField: this.filterChartList[i].getMeasureField(),
							measureSortDescending: this.filterChartList[i].getMeasureSortDescending(),
							outParameter: this.oConfig.filterCompList[i].component.properties.outParameter,
							inParameters: this.oConfig.filterCompList[i].component.properties.inParameters,
							parentProperty: this.oConfig.filterCompList[i].component.properties.parentProperty
						}
					}
				});
			}
			return config;
		},
	
		/*
		* @private
		* adds group containers and filters based on visual filters and hidden filters that exists
		*/
		_addGroupsAndFilters: function() {
			var i;
			var groupName;
			var groupContainer;
			var filtersGroupCount = 0;
			//this._mergeFilters();
			for (i = 0; i < this.filterCompList.length; i++) {
				if (!Array.isArray(this.filterCompList[i])) {
					if (this.filterCompList[i].searchVisible === false) {
						continue;
					}
					//get the group name of the filter and add it to appropriate group container
					if (!groupName || (groupName != this.filterCompList[i].obj.group.name)) {
						if (groupContainer) {
							this.oVerticalBox.addItem(groupContainer);
						}
						groupName = this.filterCompList[i].obj.group.name;
						groupContainer = new VBox();
						groupContainer.setWidth("100%");
						groupContainer.setLayoutData(new GridData({
							span: "L12 M12 S12"
						}));
						filtersGroupCount++;
						this._addGroupToolbar(groupContainer,  this.filterCompList[i].obj.group.label, this.filterCompList[i].obj.group.name);
					}
					if (this.filterCompList[i].obj.shownInFilterDialog) {
						var chartBox = new VBox();
						chartBox.addStyleClass("alp_graphicalFilterDialogChartViewContainer");
						chartBox.addStyleClass("sapSuiteVisualFilterBar");
						chartBox.addItem(this.filterCompList[i].toolbar);
						//(i-count) -> this is used to get apt index of the chart after the induction of hidden filters in the same array
						//as that of compact filters
						chartBox.addItem(this.filterChartList[i]);
						this._updateFilterCount(i);
						groupContainer.addItem(chartBox);
					}
				}
				//add to dialog
				if (groupContainer) {
					this.oVerticalBox.addItem(groupContainer);
				}
			}
			if (filtersGroupCount <= 1){
				FilterUtil.executeFunction(groupContainer, "mAggregations.items.0.setVisible", [false]);
			}
		},
		/*
		* @private
		* adds a group container for the group to which visual filter belongs
		* @param {object} groupContainer - box containing all visual filters under a group
		* @param {string} groupTitle - title for the groupContainer
		* @param {string} groupName - name of the group
		*/
		_addGroupToolbar: function(groupContainer, groupTitle, groupName) {
			var groupToolbar = new Toolbar({
				content: [
					new Title({text: groupTitle}),
					new ToolbarSpacer()
				]
			});
			if (groupName != BASIC_GROUP) {
				groupToolbar.addContent(this._createMoreFiltersLink(groupName));
			}
			groupContainer.addItem(groupToolbar);
		},
		_addChartCustomToolbar: function(obj, idx) {
			var that = this;
			//This var would be needed to distinguish option button on line chart
			//var isItLineChart = (obj.component.type === "Line");
			var sortDescending = obj.component.properties.sortOrder[0].Descending.Boolean; //Inorder to consider the sort Order of only the first property
			var chartTypeIcon = this._getChartTypeIconLink(obj.component.type);
			var customToolbar = new HBox({
				items: [
					new CheckBox({
						text: "",
						selected: obj.shownInFilterBar,
						select: function(oEvent) {
							var idx = oEvent.getSource().data("idx");
							that.filterCompList[idx].obj.shownInFilterBar = this.getSelected();
						}
					}).data("idx", idx)
				]
			});
			var iconBox = new HBox({
				items: [
					new Button({
						type: "Transparent",
						text: "",
						enabled: "{= !${_templPriv>/alp/visualFilter/" + obj.component.properties.parentProperty + "/hasMultiUnit} }",
						press: function(oEvent) {
							sap.suite.ui.generic.template.AnalyticalListPage.controller.VisualFilterDialogController.launchAllFiltersPopup(oEvent.getSource(), that.filterChartList[oEvent.getSource().data("idx")], oEvent.getSource().getModel('i18n'));
						}
					}).data("idx", idx),
					new Button({
						type: "Transparent",
						icon: "sap-icon://line-chart-time-axis",
						visible: false, //isItLineChart To drop support for this button in Wave 15
						press: function(oEvent) {
							that._showLineChartTimeAxisPopup(oEvent);
						}
					}).data("idx", idx),
					new Button({
						type: "Transparent",
						icon: (sortDescending ? "sap-icon://sort-descending" : "sap-icon://sort-ascending"),
						visible: true,//!isItLineChart,
						tooltip:"{i18n>VISUAL_FILTER_SORT_ORDER}",
						press: function(oEvent) {
							that._showChartSortPopup(oEvent);
						}
					}).data("idx", idx),
					new Button({
						type: "Transparent",
						icon: chartTypeIcon,
						tooltip:"{i18n>VISUAL_FILTER_CHART_TYPE}",
						press: function(oEvent) {
							that._showChartTypesPopup(oEvent);
						}
					}).data("idx", idx),
					new Button({
						type: "Transparent",
						icon: "sap-icon://measure",
						tooltip:"{i18n>VISUAL_FILTER_MEASURE}",
						press: function(oEvent) {
							that._showChartMeasuresPopup(oEvent);
						}
					}).data("idx", idx)
				]
			});

			iconBox.setWidth("100%");
			iconBox.setJustifyContent(sap.m.FlexJustifyContent.End);
			customToolbar.setWidth("100%");
			customToolbar.addItem(iconBox);

			return customToolbar;
		},
		_addChart: function (chartType, prop, idx) {
			var chart;
			var that = this;

			var oProp = {
					scaleFactor : prop.scaleFactor,
					sortOrder: prop.sortOrder,
					filterRestriction: prop.filterRestriction,
					width: chartWidth,
					height: prop.height,
					labelWidthPercent: labelWidthPercent,
					entitySet: prop.entitySet,
					dimensionField: prop.dimensionField,
					dimensionFieldDisplay: prop.dimensionFieldDisplay,
					dimensionFieldIsDateTime: prop.dimensionFieldIsDateTime,
					unitField: prop.unitField,
					isCurrency: prop.isCurrency,
					isMandatory: prop.isMandatory,
					measureField: prop.measureField,
					dimensionFilter: prop.dimensionFilter,
					measureSortDescending: prop.measureSortDescending,
					outParameter: prop.outParameter,
					inParameters: prop.inParameters,
					parentProperty: prop.parentProperty
			};

			if (chartType === "Donut") {
				oProp.labelWidthPercent = labelWidthPercentDonut;
			}
			var chart = this.oState.alr_visualFilterBar._createFilterItemOfType(chartType, oProp);
			chart.data("idx", idx);

			//chart click handler
			chart.attachFilterChange(function(oEvent) {
				var idx = oEvent.getSource().data("idx");
				that._filterModified = true;
				that._updateFilterCount(idx);

				// fire visual filter change event to get compact filter data for in params
				// so that other visual filter items can react
				that.oState.alr_visualFilterBar.fireFilterChange({
					filterList: oEvent.getParameter('filterList'),
					property: oEvent.getParameter('property'),
					filterRestriction: oEvent.getParameter('filterRestriction')
				});
				that._applyFilterSelections();
			});

			chart.attachTitleChange(function(oEvent) {
				var idx = oEvent.getSource().data("idx");
				// If Mandatory property then add an (*)
				if (oProp.isMandatory) {
					that.filterCompList[idx].toolbar.getItems()[0]._oLabel.addStyleClass("sapMLabelRequired");
				}
				that.filterCompList[idx].toolbar.getItems()[0].setText(that._getChartTitle(that.filterCompList[idx].obj, idx));
			});

			return chart;
		},
		_createMoreFiltersLink: function(groupName) {
			var that = this;
			var count = 0;
			var i;
			var oLink = new Link();

			for (i = 0; i < this.filterCompList.length; i++) {
				if (this.filterCompList[i].searchVisible &&
						this.filterCompList[i].obj.group.name === groupName &&
						!this.filterCompList[i].obj.shownInFilterDialog) {
					count++;
				}
			}
			if (count > 0) {
				oLink.setText(this.oRb.getText("FILTER_BAR_SHOW_MORE_FILTERS", [count]));
			} else {
				oLink.setText(this.oRb.getText("FILTER_BAR_SHOW_CHANGE_FILTERS"));
			}

			oLink.attachPress(function(evnt) {
				that._createAddRemoveFiltersDialog(groupName, oLink);
			});

			return oLink;
		},
		_showChartMeasuresPopup: function(oEvent) {
			var that = this;
			var idx = oEvent.getSource().data("idx");
			var collectionPath = this.filterChartList[idx].getProperty("entitySet");
			var oDialog = sap.suite.ui.generic.template.AnalyticalListPage.controller.VisualFilterDialogController._createPopoverDialog(oEvent.getSource().getModel('i18n'), "VISUAL_FILTER_MEASURES");
			var oList = new List({
				mode: sap.m.ListMode.SingleSelectLeft
			});
			oList.data("idx", idx);
			oDialog.addContent(oList);
			var measures = this.oState.alr_visualFilterBar._getMeasureMap()[collectionPath];
			oList.addStyleClass("sapUiSizeCompact");
			//measures will be undefined if collectionPath does not exist in measures.
			if (measures) {
				for (var item in measures) {
					var oListItem = new StandardListItem({
						title: measures[item].label
					}).data("measureName", measures[item].name);
					oList.addItem(oListItem);
					if (this.filterChartList[idx].getMeasureField() === measures[item].name) {
						oList.setSelectedItem(oListItem);
					}
				}
			}

			oList.attachSelectionChange(function (oEvent) {
				var idx = oEvent.getSource().data("idx");
				that.filterChartList[idx].setMeasureField(oEvent.getSource().getSelectedItem().data("measureName"));
				that.filterCompList[idx].toolbar.getItems()[0].setText(that._getChartTitle(that.filterCompList[idx].obj, idx));
				oDialog.close();
			});

			oDialog.attachAfterClose(function() {
				oDialog.destroy();
				oDialog = null;
			});

			oDialog.openBy(oEvent.getSource());

		},

		_showChartTypesPopup: function(oEvent) {
			var that = this;
			var button = oEvent.getSource();
			var oDialog = sap.suite.ui.generic.template.AnalyticalListPage.controller.VisualFilterDialogController._createPopoverDialog(oEvent.getSource().getModel('i18n'), "VISUAL_FILTER_CHART_TYPES");
			var compList = this.oState.alr_visualFilterBar._getSupportedFilterItemList();
			var listItems = [];
			for (var i = 0; i < compList.length; i++) {
				var comp = compList[i];
				var listItem = new StandardListItem({
						title: "{i18n>" + comp.textKey + "}",
						icon: comp.iconLink,
						selected: button.getIcon() === comp.iconLink
					}).data("type", comp.type);
				listItems.push(listItem);
			}
			var oList = new List({
				mode: sap.m.ListMode.SingleSelectMaster,
				items: listItems
			});
			oList.data("button", button);
			oList.addStyleClass("sapUiSizeCompact");
			oDialog.addContent(oList);

			oList.attachSelectionChange(function (oEvent) {
				var idx = oEvent.getSource().data("button").data("idx");
				var chartType = oEvent.getSource().getSelectedItem().data("type");
				var prop = that.filterChartList[idx].getP13NConfig();
				that.filterCompList[idx].obj.component.type = chartType;
				oEvent.getSource().data("button").setIcon(that._getChartTypeIconLink(chartType));
				that.filterChartList[idx] = that._addChart(chartType, prop, idx);
				//Commenting out adjustment of toolbar button in Wave 15 till we support proper sorting in Line Chart
				//that._adjustToolbarIcons(idx);
				that._applyFilterSelections();
				oDialog.close();
			});
			oDialog.attachBeforeClose(function() {
				that.oVerticalBox.removeAllItems();
				that._addFilterSwitch();
				that._addGroupsAndFilters();
			});
			oDialog.attachAfterClose(function() {
				oDialog.destroy();
				oDialog = null;
			});

			oDialog.openBy(oEvent.getSource());
		},
		_showLineChartTimeAxisPopup: function(oEvent) {
			var idx = oEvent.getSource().data("idx");
			var button = oEvent.getSource();
			var oDialog = sap.suite.ui.generic.template.AnalyticalListPage.controller.VisualFilterDialogController._createPopoverDialog(oEvent.getSource().getModel('i18n'), "VISUAL_FILTER_LINE_CHART_TIME_LINE");
			var oList = new List({
				mode: sap.m.ListMode.SingleSelectLeft,
				items: [
					new StandardListItem({
						title: "{i18n>VISUAL_FILTER_LINE_CHART_TIME_LINE_DAYS}"
					}).data("idx", idx),
					new StandardListItem({
						title: "{i18n>VISUAL_FILTER_LINE_CHART_TIME_LINE_MONTH}"
					}).data("idx", idx),
					new StandardListItem({
						title: "{i18n>VISUAL_FILTER_LINE_CHART_TIME_LINE_QUARTERS}"
					}).data("idx", idx),
					new StandardListItem({
						title: "{i18n>VISUAL_FILTER_LINE_CHART_TIME_LINE_YEARS}"
					}).data("idx", idx)
				]
			});
			oList.data("button", button);
			oList.addStyleClass("sapUiSizeCompact");
			oDialog.addContent(oList);

			oList.attachSelectionChange(function (oEvent) {
				// add logic
				oDialog.close();
			});

			oDialog.attachAfterClose(function() {
				oDialog.destroy();
				oDialog = null;
			});

			oDialog.openBy(oEvent.getSource());
		},
		_showChartSortPopup: function(oEvent) {
			var that = this;
			var idx = oEvent.getSource().data("idx");
			var button = oEvent.getSource();
			var i18n = oEvent.getSource().getModel('i18n');
			var oDialog = sap.suite.ui.generic.template.AnalyticalListPage.controller.VisualFilterDialogController._createPopoverDialog(i18n, "VISUAL_FILTER_SORTING");
			var oList = new List({
				mode: sap.m.ListMode.SingleSelectLeft,
				items: [
					new StandardListItem({
						title: i18n.getResourceBundle().getText("VISUAL_FILTER_SORTING_ASCENDING")
					}).data("idx", idx),
					new StandardListItem({
						title: i18n.getResourceBundle().getText("VISUAL_FILTER_SORTING_DESCENDING")
					}).data("idx", idx)
				]
			});
			oList.data("button", button);
			oList.addStyleClass("sapUiSizeCompact");
			if (this.filterChartList[idx].getSortOrder()[0].Descending.Boolean) {
				oList.setSelectedItem(oList.getItems()[1], true);
			} else {
				oList.setSelectedItem(oList.getItems()[0], true);
			}
			oDialog.addContent(oList);

			oList.attachSelectionChange(function (oEvent) {
				var button = oEvent.getSource().data("button");
				var idx = button.data("idx");
				var aSortProperty = jQuery.extend(true, [], that.filterChartList[idx].getSortOrder());
				//We consider only first sortProperty, hence 0 index is used
				aSortProperty[0].Descending.Boolean = oEvent.getSource().getItems()[1].isSelected();
				that.filterChartList[idx].setSortOrder(aSortProperty);
				if (that.filterChartList[idx].getSortOrder()[0].Descending.Boolean) {
					button.setIcon("sap-icon://sort-descending");
				} else {
					button.setIcon("sap-icon://sort-ascending");
				}
				oDialog.close();
			});
			oDialog.attachAfterClose(function() {
				oDialog.destroy();
				oDialog = null;
			});

			oDialog.openBy(oEvent.getSource());
		},
		/**
		 * Creates the 'Add/Remove Filters' - dialog.
		 *
		 * @private
		 * @param {string} groupName filter group name
		 * @param {sap.m.Link} oLink more/clear filters link
		 */

		_createAddRemoveFiltersDialog: function(groupName, oLink) {
			var i; //, oDialog,
			var that = this;

			var oDialog = new sap.m.Dialog();
			oDialog.setTitle(this.oRb.getText("SELECT_FILTER_FIELDS"));
			oDialog.addStyleClass("sapUiPopupWithPadding");
			oDialog.addStyleClass("sapUiCompAddRemoveFilterDialog");
			oDialog.addStyleClass("sapUiSizeCompact");
			oDialog.setVerticalScrolling(true);

			var oSubHeader = new Bar();
			var oSearchField = new SearchField({
				placeholder: this.oRb.getText("FILTER_BAR_SEARCH")
			});

			this._oSearchField = oSearchField;
			oSearchField.attachLiveChange(function(oEvent) {
				that._onAddRemoveFiltersSearch(oEvent);
			});

			oSubHeader.addContentRight(oSearchField);
			oDialog.setSubHeader(oSubHeader);

			this.addRemoveList = new List({
				mode: sap.m.ListMode.MultiSelect
			});
			this.addRemoveList.setShowSeparators(ListSeparators.None);
			oDialog.addContent(this.addRemoveList);

			for (i = 0; i < this.filterCompList.length; i++) {
				if (this.filterCompList[i].obj.group.name === groupName && this.filterCompList[i].searchVisible) {
					var oListItem = new StandardListItem({
						title: this._getChartTitle(this.filterCompList[i].obj, i, true)
					}).data("idx", i);
					this.addRemoveList.addItem(oListItem);
					if (this.filterCompList[i].obj.shownInFilterDialog) {
						this.addRemoveList.setSelectedItem(oListItem, true);
					}
				}
			}

			// OK button
			var oOKButton = new Button({
				text: this.oRb.getText("FORM_PERS_DIALOG_OK")
			});
			oOKButton.attachPress(function() {
				var i;
				var items = that.addRemoveList.getItems();
				for (i = 0; i < items.length; i++) {
					var idx = items[i].data("idx");
					that.filterCompList[idx].obj.shownInFilterDialog = items[i].isSelected();
				}
				that.oVerticalBox.removeAllItems();
				//Restore SegmentedButtons
				that._addFilterSwitch();
				that._addGroupsAndFilters();
				oDialog.close();
			});
			oDialog.addAggregation("buttons", oOKButton);
			oDialog.setInitialFocus(this._oSearchField);
			oDialog.setContentHeight("23.25rem"); // 30.25 - 2*2.5rem - 2rem

			// Cancel button
			var oCancelButton = new Button({
				text: this.oRb.getText("FORM_PERS_DIALOG_CANCEL"),
				press: function() {
					oDialog.close();
				}
			});
			oDialog.addAggregation("buttons", oCancelButton);

			oDialog.attachAfterClose(function() {
				oDialog.destroy();
				oDialog = null;
			});

			oDialog.open();
		},
		_onAddRemoveFiltersSearch : function (oEvent) {
			var i;

			if (!oEvent) {
				return;
			}

			var parameters = oEvent.getParameters();
			if (!parameters) {
				return;
			}

			var sValue = (parameters.newValue ? parameters.newValue : "").toLowerCase();
			var items = this.addRemoveList.getItems();
			for (i = 0; i < items.length; i++) {
				var sText = (items[i].getTitle()).toLowerCase();
				items[i].setVisible(sText.indexOf(sValue) >= 0);
			}
		},
		_getChartTypeIconLink: function(icon) {
			var compMap = this.oState.alr_visualFilterBar._getSupportedFilterItemMap();
			var comp = compMap[icon];
			return !comp ? "" : comp.iconLink;
		},
		_getChartTitle: function (obj, idx, useConfig) {
			var title = "";
			if (this.filterChartList[idx]) {
				if (useConfig) {
					obj.component.properties = this.filterChartList[idx].getP13NConfig();
					title = this.oState.alr_visualFilterBar.getTitleByFilterItemConfig(obj);
				} else {
					title = this.filterChartList[idx].getTitle();
				}
			} else {
				title = this.oState.alr_visualFilterBar.getTitleByFilterItemConfig(obj);
			}
			return title;
		},
		_adjustToolbarIcons: function(idx) {
			if (this.filterCompList[idx].obj.component.type === "Line") {
				this.filterCompList[idx].toolbar.getItems()[1].getItems()[1].setVisible(true);
				this.filterCompList[idx].toolbar.getItems()[1].getItems()[2].setVisible(false);
			} else {
				this.filterCompList[idx].toolbar.getItems()[1].getItems()[1].setVisible(false);
				this.filterCompList[idx].toolbar.getItems()[1].getItems()[2].setVisible(true);
			}
		},
		_applyFilterSelections: function() {
			this.oState.alr_visualFilterBar._updateFilterItemList(this.filterChartList);
		},

		_clearFilters: function() {
			for (var i = 0; i < this.filterCompList.length; i++) {
				this.filterChartList[i].setDimensionFilter([]);
				this.filterChartList[i].setDimensionFilterExternal([]);
				this._updateFilterCount(i);
			}

			this.oState.alr_visualFilterBar.fireFilterChange({
				filterItemList: this.filterChartList
			});
			this._applyFilterSelections();
		},
		_updateFilterCount: function(idx) {
			if (this.filterChartList[idx].getDimensionFilter() && this.filterChartList[idx].getDimensionFilter().length > 0) {
				var sText = this.oRb.getText("VALUEHELPDLG_SELECTEDITEMS_SHORT", [this.filterChartList[idx].getDimensionFilter().length]);
				this.filterCompList[idx].toolbar.getItems()[1].getItems()[0].setVisible(true);
				this.filterCompList[idx].toolbar.getItems()[1].getItems()[0].setText(sText);
			} else {
				this.filterCompList[idx].toolbar.getItems()[1].getItems()[0].setVisible(false);
			}
		},
		/**
		 * Reacts to search from 'Filters'- dialog.
		 *
		 * @private
		 * @param {object} oEvent containing the search string
		 */
		_triggerSearchInFilterDialog: function (oEvent) {
			var i;

			if (!oEvent) {
				return;
			}

			var parameters = oEvent.getParameters();
			if (!parameters) {
				return;
			}

			var sValue = (parameters.newValue ? parameters.newValue : "").toLowerCase();
			for (i = 0; i < this.filterCompList.length; i++) {
				var sText = (this.filterCompList[i].toolbar.getItems()[0].getText()).toLowerCase();
				this.filterCompList[i].searchVisible = sText.indexOf(sValue) >= 0;
			}
			this.oVerticalBox.removeAllItems();
			//Restore SegmentedButtons
			this._addFilterSwitch();
			this._addGroupsAndFilters();
		}
	});

	/**
	 * @private
	 * [_createPopoverDialog description]
	 * @param  {object} i18n object
	 * @param  {object} title string to display in dialog
	 * @return {object} oDialog object
	 */
	sap.suite.ui.generic.template.AnalyticalListPage.controller.VisualFilterDialogController._createPopoverDialog = function(i18n, title) {
		var oDialog = new sap.m.Popover();
		oDialog.setTitle(i18n.getResourceBundle().getText(title));
		oDialog.setPlacement(sap.m.PlacementType.PreferredBottomOrFlip);
		oDialog.addStyleClass("sapUiPopupWithPadding");
		return oDialog;
	};

	/**
	 * Launches the All Filters Popup
	 *
	 * @public
	 * @param {Control}  oControl the control requesting the popup
	 * @param {Chart}    oChart the selected chart
	 */
	sap.suite.ui.generic.template.AnalyticalListPage.controller.VisualFilterDialogController.launchAllFiltersPopup = function(oControl, oChart, i18n) {
		var i;
		var filters = oChart.getDimensionFilter();
		var filterRestriction = oChart.getFilterRestriction();
		var oDialog = sap.suite.ui.generic.template.AnalyticalListPage.controller.VisualFilterDialogController._createPopoverDialog(i18n, "VISUAL_FILTER_ALL_SELECTED_FILTERS");
		var oList = new List({
			mode: sap.m.ListMode.Delete
		});
		oList.data("chart", oChart);
		oDialog.addContent(oList);
		oDialog.addStyleClass("sapUiSizeCompact");
		oDialog.addStyleClass("alpSelectedLinkDialog");
		//Adding a footer bar with a clear all button
		var oFooter = new sap.m.Bar();
		var oClearButton = new Button({
			text: i18n.getResourceBundle().getText("CLEAR_FILTERS_ALL"),
			press: function(oEvent) {
				var chart = oList.data("chart");
				filters.length = 0;
				oDialog.removeContent(oList);
				chart.setDimensionFilter(filters);
				chart.fireFilterChange({
					filterList: filters,
					property: chart.getParentProperty(),
					filterRestriction: chart.getFilterRestriction()
				});

				// setting the focus to dialog keeps the dialog open
				oDialog.close();
			}
		});
		oFooter.addContentRight(oClearButton);
		oDialog.setFooter(oFooter);

		if (filterRestriction !== "single") {
			for (i = 0; i < filters.length; i++) {
				var oListItem = new StandardListItem({
					title: FilterUtil.createTitle(filters[i].dimValueDisplay, filters[i].dimValue)
				});
				oList.addItem(oListItem);
			}
		} else {
			oList.addItem( new StandardListItem({ title: filters[0].dimValue }));
		}

		oList.attachDelete(function (oEvent) {
			var oItem = oEvent.getParameter("listItem");
			var chart = oList.data("chart");
			var idx = oList.indexOfItem(oItem);
			filters.splice(idx, 1);
			oList.removeItem(oItem);
			chart.setDimensionFilter(filters);
			chart.fireFilterChange({
				filterList: filters,
				property: chart.getParentProperty(),
				filterRestriction: chart.getFilterRestriction()
			});

			// setting the focus to dialog keeps the dialog open
			oDialog.focus();
		});

		oDialog.attachAfterClose(function() {
			oDialog.destroy();
			oDialog = null;
		});

		oDialog.openBy(oControl);
	};

	return vfdController;
});
