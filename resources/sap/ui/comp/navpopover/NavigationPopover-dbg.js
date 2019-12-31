/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.navpopover.NavigationPopover.
sap.ui.define([
	'jquery.sap.global', 'sap/m/Link', 'sap/m/ResponsivePopover', 'sap/m/Title', 'sap/m/Image', 'sap/m/Text', 'sap/ui/layout/form/SimpleForm', 'sap/m/VBox', 'sap/m/ResponsivePopoverRenderer', './Factory', './LinkData', 'sap/ui/model/json/JSONModel', './Util', 'sap/ui/core/TitleLevel', 'sap/ui/layout/HorizontalLayout', 'sap/ui/layout/VerticalLayout', 'sap/ui/layout/form/SimpleFormLayout', 'sap/ui/comp/personalization/Util', './FlexHandler'
], function(jQuery, Link, ResponsivePopover, Title, Image, Text, SimpleForm, VBox, ResponsivePopoverRenderer, Factory, LinkData, JSONModel, Util, CoreTitleLevel, HorizontalLayout, VerticalLayout, SimpleFormLayout, PersonalizationUtil, FlexHandler) {
	"use strict";

	/**
	 * Constructor for a new navpopover/NavigationPopover.
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The NavigationPopover control is used to present information in a specific format. <b>Note</b>: This control is used by the
	 *        {@link sap.ui.comp.navpopover.NavigationPopoverHandler NavigationPopoverHandler} and must not be used manually.
	 * @extends sap.m.ResponsivePopover
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.navpopover.NavigationPopover
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NavigationPopover = ResponsivePopover.extend("sap.ui.comp.navpopover.NavigationPopover", /** @lends sap.ui.comp.navpopover.NavigationPopover.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			properties: {

				/**
				 * The name of the semantic object.
				 * 
				 * @deprecated Since 1.40.0. The property <code>semanticObjectName</code> is obsolete as target determination is no longer done by
				 *             NavigationPopover. Instead the NavigationPopoverHandler is responsible for target determination.
				 * @since 1.28.0
				 */
				semanticObjectName: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Describes the semantic attributes. The attribute has to be a map.
				 * 
				 * @deprecated Since 1.40.0. The property <code>semanticAttributes</code> is obsolete as target determination is no longer done by
				 *             NavigationPopover. Instead the NavigationPopoverHandler is responsible for target determination.
				 * @since 1.28.0
				 */
				semanticAttributes: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The application state key passed to retrieve the navigation targets.
				 * 
				 * @deprecated Since 1.40.0. The property <code>appStateKey</code> is obsolete as target determination is no longer done by
				 *             NavigationPopover. Instead the NavigationPopoverHandler is responsible for target determination.
				 * @since 1.28.0
				 */
				appStateKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Sets the description of the main navigation link. If <code>mainNavigation</code> also contains href description then
				 * <code>mainNavigationId</code> is displayed.
				 * 
				 * @since 1.28.0
				 */
				mainNavigationId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Determines the text of personalization link. If this property is set to some string, choosing the personalization link will trigger
				 * the <code>availableActionsPersonalizationPress</code> event. If this property is not set, the personalization link is not shown.
				 * 
				 * @since 1.44.0
				 */
				availableActionsPersonalizationText: {
					type: "string",
					group: "Misc",
					defaultValue: undefined
				}
			},
			aggregations: {

				/**
				 * A list of available actions shown as links.
				 * 
				 * @since 1.28.0
				 */
				availableActions: {
					type: "sap.ui.comp.navpopover.LinkData",
					multiple: true,
					singularName: "availableAction"
				},

				/**
				 * The main navigation link. If <code>mainNavigationId</code> is not set then <code>text</code> of <code>mainNavigation</code>
				 * is displayed. Otherwise the <code>mainNavigationId</code> is displayed.
				 * 
				 * @since 1.28.0
				 */
				mainNavigation: {
					type: "sap.ui.comp.navpopover.LinkData",
					multiple: false
				},

				/**
				 * The navigation taking the user back to the source application.
				 * 
				 * @deprecated Since 1.40.0. The property <code>ownNavigation</code> is obsolete as target determination is no longer done by
				 *             NavigationPopover. Instead the NavigationPopoverHandler is responsible for target determination.
				 * @since 1.28.0
				 */
				ownNavigation: {
					type: "sap.ui.comp.navpopover.LinkData",
					multiple: false
				},

				/**
				 * Handler for communication with layered repository (LRep).
				 * 
				 * @since 1.46.0
				 */
				flexHandler: {
					type: "sap.ui.comp.navpopover.FlexHandler",
					visibility: "hidden",
					multiple: false

				}
			},
			associations: {

				/**
				 * Source control for which the popover is displayed.
				 * 
				 * @since 1.28.0
				 */
				source: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * In addition to main navigation link and available links some additional content can be displayed in the popover.
				 * 
				 * @since 1.28.0
				 */
				extraContent: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * The parent component.
				 */
				component: {
					type: "sap.ui.core.Element",
					multiple: false
				}
			},
			events: {

				/**
				 * The navigation targets that are shown.
				 * 
				 * @deprecated Since 1.40.0. The event <code>navigationTargetsObtained</code> is obsolete as target determination is no longer done
				 *             by NavigationPopover. Instead the NavigationPopoverHandler is responsible for target determination. The event
				 *             <code>navigationTargetsObtained</code> is fired from NavigationPopoverHandler after navigation targets are
				 *             determined.
				 * @since 1.28.0
				 */
				targetsObtained: {},

				/**
				 * This event is fired when a link is chosen.
				 * 
				 * @since 1.28.0
				 */
				navigate: {},

				/**
				 * This event is fired when personalization of <code>availableActions</code> is chosen.
				 * 
				 * @since 1.44.0
				 */
				availableActionsPersonalizationPress: {}
			}
		},
		renderer: ResponsivePopoverRenderer.render
	});

	NavigationPopover.prototype.init = function() {
		ResponsivePopover.prototype.init.call(this);

		var oModel = new JSONModel({
			mainNavigationLink: {
				title: undefined,
				subtitle: undefined,
				href: undefined,
				target: undefined
			},
			ownNavigation: undefined,
			availableActions: [],
			availableActionsPressMap: {},
			availableActionsPersonalizationText: undefined,
			extraContent: undefined
		});
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapuicompNavigationPopover");

		this._createContent();
		this.setAggregation("flexHandler", new FlexHandler());
	};

	// ----------------------- Public Methods --------------------------

	/**
	 * Determines the potential navigation targets for the semantical object and visualize the popover.
	 * 
	 * @param {string} sSemanticObject name of the semantical object
	 * @public
	 * @deprecated Since 1.42.0. Target determination is no longer done by NavigationPopover. Instead the NavigationPopoverHandler is responsible for
	 *             target determination.
	 */
	NavigationPopover.prototype.retrieveNavTargets = function() {

		var oXApplNavigation = Factory.getService("CrossApplicationNavigation");
		var oURLParsing = Factory.getService("URLParsing");
		if (!oXApplNavigation || !oURLParsing) {
			jQuery.sap.log.error("Service 'CrossApplicationNavigation' could not be obtained");
			// still fire targetsObtained event: easier for testing and the eventhandlers still could provide static links
			this.fireTargetsObtained();
			return;
		}

		var that = this;

		this.setMainNavigation(null);
		this.setOwnNavigation(null);
		this.removeAllAvailableActions();

		var oPromise = oXApplNavigation.getLinks({
			semanticObject: this.getSemanticObjectName(),
			params: this.getSemanticAttributes(),
			appStateKey: this.getAppStateKey(),
			ui5Component: this._getComponent(),
			sortResultOnTexts: true
		// ignoreFormFactor: false
		});
		oPromise.done(function(aLinks) {
			if (!aLinks || !aLinks.length) {
				this.fireTargetsObtained();
				return;
			}

			var sCurrentHash = oXApplNavigation.hrefForExternal();
			if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
				// sCurrentHash can contain query string, cut it off!
				sCurrentHash = sCurrentHash.split("?")[0];
			}

			aLinks.forEach(function(oLink) {
				if (oLink.intent.indexOf(sCurrentHash) === 0) {
					// Prevent current app from being listed
					// NOTE: If the navigation target exists in
					// multiple contexts (~XXXX in hash) they will all be skipped
					that.setOwnNavigation(new LinkData({
						href: oLink.intent,
						text: oLink.text
					}));
					return;
				}
				// Check if a FactSheet exists for this SemanticObject (to skip the first one found)
				var oShellHash = oURLParsing.parseShellHash(oLink.intent);
				if (oShellHash.action && (oShellHash.action === 'displayFactSheet')) {
					// Prevent FactSheet from being listed in 'Related Apps' section. Requirement: Link with action 'displayFactSheet' should
					// be shown in the 'Main Link' Section
					that.setMainNavigation(new LinkData({
						href: oLink.intent,
						text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_FACTSHEET")
					}));
					return;
				}

				that.addAvailableAction(new LinkData({
					href: oLink.intent,
					text: oLink.text
				}));
			});

			that.fireTargetsObtained();
		});
		oPromise.fail(function(oError) {
			// Reset actions
			jQuery.sap.log.error("'retrieveNavTargets' failed");
			return;
		});
	};

	/**
	 * Displays the popover. This method should be called, once all navigation targets are adapted by the application.
	 * 
	 * @public
	 */
	NavigationPopover.prototype.show = function() {
		if (!this._hasNavigationTargets()) {
			jQuery.sap.log.error("no navigation targets assigned");
			return;
		}
		var oControl = this._getControl();
		if (!oControl) {
			jQuery.sap.log.error("no source assigned");
			return;
		}

		this.openBy(oControl);
	};

	/**
	 * Returns link for direct navigation if the NavigationPopover has only <code>mainNavigation</code> or one <code>availableAction</code> and no
	 * <code>extraContent</code>.
	 * 
	 * @returns {sap.m.Link | null}
	 * @public
	 */
	NavigationPopover.prototype.getDirectLink = function() {
		var oModel = this.getModel("$sapuicompNavigationPopover");

		// Extra content should be shown always, no direct navigation possible
		if (oModel.getProperty('/extraContent')) {
			return null;
		}

		// If only main navigation link exists, direct navigation is possible
		if (oModel.getProperty('/mainNavigationLink/href') && !oModel.getProperty('/availableActions').length) {
			return this._oHeaderForm.getContent()[0];
		}

		// If only one availabel action exists (independent whether it is visible or not), direct navigation is possible
		if (oModel.getProperty('/availableActions').length === 1 && !oModel.getProperty('/mainNavigationLink/href')) {
			return this._oActionBox.getItems()[0].getItems()[0];
		}
		return null;
	};

	/**
	 * @private
	 */
	NavigationPopover.prototype.hasContent = function() {
		var oModel = this.getModel("$sapuicompNavigationPopover");
		return !!oModel.getProperty("/mainNavigationLink/href") || !!oModel.getProperty("/availableActions").length || !!oModel.getProperty('/extraContent');
	};

	// ----------------------- Overwrite Property Methods --------------------------

	NavigationPopover.prototype.setExtraContent = function(oControl) {
		var oModel = this.getModel("$sapuicompNavigationPopover");
		if (oModel.getProperty("/extraContent")) {
			this._getContentContainer().removeItem(1);
		}
		// Note: 'extraContent' is an association of an control which is created by application in 'navigationTargetsObtained' event. Now we have to
		// add this control to the popover content aggregation. Doing so the NavigationPopover is responsible for life cycle of this control which
		// will be destroyed together with NavigationPopover.
		if (typeof oControl === "string") {
			oControl = sap.ui.getCore().byId(oControl);
		}

		this._getContentContainer().insertItem(oControl, 1);

		this.setAssociation("extraContent", oControl);
		oModel.setProperty("/extraContent", oControl);
		return this;
	};

	NavigationPopover.prototype.setMainNavigationId = function(sMainNavigationId) {
		this.setProperty("mainNavigationId", sMainNavigationId, true);
		var oModel = this.getModel("$sapuicompNavigationPopover");
		if (typeof sMainNavigationId === "string") {
			oModel.setProperty("/mainNavigationLink/title", sMainNavigationId);
		}
		return this;
	};

	NavigationPopover.prototype.setMainNavigation = function(oLinkData) {
		this.setAggregation("mainNavigation", oLinkData, true);
		if (!oLinkData) {
			return this;
		}
		var oModel = this.getModel("$sapuicompNavigationPopover");
		if (oLinkData.getHref()) {
			oModel.setProperty("/mainNavigationLink/href", this._convertToExternal(oLinkData.getHref()));
			oModel.setProperty("/mainNavigationLink/target", oLinkData.getTarget());
			this._oHeaderForm.removeStyleClass("navpopoversmallheader");
		} else {
			// oModel.setProperty("/mainNavigationLink/href", null);
			// oModel.setProperty("/mainNavigationLink/target", null);
			this._oHeaderForm.addStyleClass("navpopoversmallheader");
		}
		// Priority for 'title':
		// 1. 'mainNavigationId' 2. oLinkData.getText()
		if (!oModel.getProperty("/mainNavigationLink/title")) {
			oModel.setProperty("/mainNavigationLink/title", oLinkData.getText());
		}
		oModel.setProperty("/mainNavigationLink/subtitle", oLinkData.getDescription());
		return this;
	};

	NavigationPopover.prototype.setAvailableActionsPersonalizationText = function(sAvailableActionsPersonalizationText) {
		this.setProperty("availableActionsPersonalizationText", sAvailableActionsPersonalizationText, true);
		var oModel = this.getModel("$sapuicompNavigationPopover");
		oModel.setProperty("/availableActionsPersonalizationText", sAvailableActionsPersonalizationText);
		return this;
	};

	NavigationPopover.prototype.addAvailableAction = function(oLinkData) {
		oLinkData.setHref(this._convertToExternal(oLinkData.getHref()));
		oLinkData.setPress(jQuery.proxy(this._onLinkPress, this));

		this.addAggregation("availableActions", oLinkData);
		if (!oLinkData) {
			return this;
		}
		var oModel = this.getModel("$sapuicompNavigationPopover");
		var iIndex = oModel.getProperty("/availableActions").length;
		oModel.getData().availableActions.splice(iIndex, 0, oLinkData.getJson());
		// TODO ändern auf oModel.setProperty("/availableActions", sAvailableActions;
		oModel.getData().availableActionsPressMap[oLinkData.getText() + "---" + oLinkData.getHref()] = jQuery.proxy(this._onLinkPress, this);
		oModel.refresh(true);
		return this;
	};

	NavigationPopover.prototype.insertAvailableAction = function(oLinkData, iIndex) {
		oLinkData.setHref(this._convertToExternal(oLinkData.getHref()));
		oLinkData.setPress(jQuery.proxy(this._onLinkPress, this));

		this.insertAggregation("availableActions", oLinkData, iIndex);
		if (!oLinkData) {
			return this;
		}
		var oModel = this.getModel("$sapuicompNavigationPopover");
		oModel.getData().availableActions.splice(iIndex, 0, oLinkData.getJson());
		// TODO ändern auf oModel.setProperty("/availableActions", sAvailableActions;
		oModel.getData().availableActionsPressMap[oLinkData.getText() + "---" + oLinkData.getHref()] = jQuery.proxy(this._onLinkPress, this);
		oModel.refresh(true);
		return this;
	};

	NavigationPopover.prototype.removeAvailableAction = function(oLinkData) {
		var iIndex = this.indexOfAvailableAction(oLinkData);
		if (iIndex > -1) {
			// Remove item data from model
			var oModel = this.getModel("$sapuicompNavigationPopover");
			oModel.getData().availableActions.splice(iIndex, 1);
			oModel.refresh(true);
		}
		oLinkData = this.removeAggregation("availableActions", oLinkData);
		return oLinkData;
	};

	NavigationPopover.prototype.removeAllAvailableActions = function() {
		var aAvailableActions = this.removeAllAggregation("availableActions");
		// Remove items data from model
		var oModel = this.getModel("$sapuicompNavigationPopover");
		oModel.setProperty("/availableActions", []);
		oModel.refresh(true);
		return aAvailableActions;
	};

	NavigationPopover.prototype.exit = function(oControl) {
		// destroy model and its data
		if (this.getModel("$sapuicompNavigationPopover")) {
			this.getModel("$sapuicompNavigationPopover").destroy();
		}
		ResponsivePopover.prototype.exit.apply(this, arguments);
	};

	NavigationPopover.prototype.onAfterRenderingActionForm = function() {
		var oModel = this.getModel("$sapuicompNavigationPopover");
		var $ContentContainer = oModel.getProperty("/extraContent") ? oModel.getProperty("/extraContent").$()[0] : undefined;

		if ($ContentContainer && $ContentContainer.scrollHeight > $ContentContainer.clientHeight) {
			// Change the default behavior for the case that all three sections can not fit the height of phone (e.g. the additionalContentSection is
			// larger then the spared place
			this._getContentContainer().setFitContainer(false).setJustifyContent(sap.m.FlexJustifyContent.Start);
		}
	};

	// -------------------------- Private Methods ------------------------------------

	/**
	 * @private
	 */
	NavigationPopover.prototype._createContent = function() {
		var that = this;

		this.addStyleClass("navigationPopover");
		this.setContentWidth("380px");
		this.setHorizontalScrolling(false);
		this.setShowHeader(!!sap.ui.Device.system.phone);
		this.setPlacement(sap.m.PlacementType.Auto);

		var oTitle = new Link({
			href: {
				path: '/mainNavigationLink/href'
			},
			text: {
				path: '/mainNavigationLink/title'
			},
			target: {
				path: '/mainNavigationLink/target'
			},
			visible: {
				path: '/mainNavigationLink/title',
				formatter: function(oTitle_) {
					return !!oTitle_;
				}
			},
			enabled: {
				path: '/mainNavigationLink/href',
				formatter: function(oValue) {
					return !!oValue;
				}
			},
			press: jQuery.proxy(this._onLinkPress, this)
		});
		oTitle.addStyleClass("navigationPopoverTitle");

		this._oHeaderForm = new SimpleForm({
			maxContainerCols: 1,
			layout: SimpleFormLayout.ResponsiveGridLayout,
			visible: {
				parts: [
					{
						path: '/mainNavigationLink/title'
					}, {
						path: '/mainNavigationLink/subtitle'
					}
				],
				formatter: function(oTitle_, oSubTitle) {
					return !!oTitle_ || !!oSubTitle;
				}
			},
			content: [
				oTitle, new Text({
					text: {
						path: '/mainNavigationLink/subtitle'
					},
					visible: {
						path: '/mainNavigationLink/subtitle',
						formatter: function(oValue) {
							return !!oValue;
						}
					}
				})
			]
		});
		this._oHeaderForm.addStyleClass("navigationPopoverTitleH1");
		this._oHeaderForm.setModel(this.getModel("$sapuicompNavigationPopover"));

		this._oActionBox = new VBox({
			visible: {
				parts: [
					{
						path: '/availableActions'
					}, {
						path: '/availableActionsPersonalizationText'
					}
				],
				formatter: function(aMAvailableActions, sAvailableActionsPersonalizationText) {
					var aMVisibleAvailableActions = aMAvailableActions.filter(function(oMAvailableAction) {
						return oMAvailableAction.visible === true;
					});
					return aMVisibleAvailableActions.length > 0 || !!sAvailableActionsPersonalizationText;
				}
			},
			items: [
				new VBox({
					items: {
						path: '/availableActions',
						template: new Link({
							text: "{text}",
							href: "{href}",
							target: "{target}",
							press: function(oEvent) {
								var fOnPress = this.getModel("$sapuicompNavigationPopover").getProperty("/availableActionsPressMap")[this.getText() + "---" + this.getHref()];
								if (fOnPress) {
									fOnPress(oEvent);
								}
							},
							visible: "{visible}"
						})
					}
				}), new Link({
					width: "100%",
					textAlign: sap.ui.core.TextAlign.End,
					text: {
						path: '/availableActionsPersonalizationText'
					},
					visible: {
						parts: [
							{
								path: '/availableActions'
							}, {
								path: '/availableActionsPersonalizationText'
							}
						],
						formatter: function(aMAvailableActions, sAvailableActionsPersonalizationText) {
							return aMAvailableActions.length > 0 && !!sAvailableActionsPersonalizationText;
						}
					},
					press: function() {
						that.fireAvailableActionsPersonalizationPress();
					}
				})
			]
		});
		this._oActionBox.addEventDelegate({
			onAfterRendering: jQuery.proxy(this.onAfterRenderingActionForm, this)
		});
		this._oActionBox.addStyleClass("navigationPopoverAvailableLinks");
		this._oActionBox.setModel(this.getModel("$sapuicompNavigationPopover"));

		this.addContent(new VBox({
			// Default behavior for the case that all three sections can fit the height of phone (e.g. only mainNavigationSection and
			// relatedAppsSection w/o additionalContentSection or mainNavigationSection, relatedAppsSection and small additionalContentSection)
			fitContainer: true,
			justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
			items: [
				this._oHeaderForm, this._oActionBox
			]
		}));
	};

	/**
	 * Returns the container (currently VBox) which contains the mainNavigationSection, additionalContentSection and relatedAppsSection.
	 */
	NavigationPopover.prototype._getContentContainer = function() {
		return this.getContent()[0];
	};

	/**
	 * EventHandler for all link press on this popover
	 * 
	 * @param {object} oEvent - the event parameters
	 * @private
	 */
	NavigationPopover.prototype._onLinkPress = function(oEvent) {
		this.fireNavigate({
			text: oEvent.getSource().getText(),
			href: oEvent.getSource().getHref()
		});
	};

	/**
	 * When no fact sheet exists and no actions and no content, then do not show popover.
	 * 
	 * @private
	 */
	NavigationPopover.prototype._hasNavigationTargets = function() {
		var oModel = this.getModel("$sapuicompNavigationPopover");
		if (!oModel.getProperty("/mainNavigationLink/href") && !oModel.getProperty("/availableActions").length && !oModel.getProperty('/extraContent')) {
			jQuery.sap.require("sap.m.MessageBox");
			var MessageBox = sap.ui.require("sap/m/MessageBox");
			MessageBox.show(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_DETAILS_NAV_NOT_POSSIBLE"), {
				icon: MessageBox.Icon.ERROR,
				title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_MSG_NAV_NOT_POSSIBLE"),
				actions: [
					sap.m.MessageBox.Action.CLOSE
				],
				styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : ""
			});
			return false;
		}
		return true;
	};

	/**
	 * @private
	 */
	NavigationPopover.prototype._convertToExternal = function(sHref) {
		var oXApplNavigation = Factory.getService("CrossApplicationNavigation");
		if (!oXApplNavigation) {
			return sHref;
		}
		return oXApplNavigation.hrefForExternal({
			target: {
				shellHash: sHref
			}
		}, this._getComponent());
	};

	/**
	 * Returns the control instance for which the popover should be displayed.
	 * 
	 * @returns { sap.ui.core.Control}
	 * @private
	 */
	NavigationPopover.prototype._getControl = function() {
		var oControl = this.getAssociation("source");
		if (typeof oControl === "string") {
			oControl = sap.ui.getCore().byId(oControl);
		}
		return oControl;
	};

	/**
	 * Returns the component object.
	 * 
	 * @returns {object} the component
	 * @private
	 */
	NavigationPopover.prototype._getComponent = function() {
		var oComponent = this.getComponent();
		if (typeof oComponent === "string") {
			oComponent = sap.ui.getCore().getComponent(oComponent);
		}
		return oComponent;
	};

	/**
	 * @private
	 */
	NavigationPopover.prototype._getFlexHandler = function() {
		return this.getAggregation("flexHandler");
	};

	/**
	 * @private
	 */
	NavigationPopover.prototype._updateAvailableAction = function(oLinkData, sLayer) {
		this._getFlexHandler().updateAvailableActionOfSnapshot(oLinkData, sLayer);
		this._syncAvailableActions();
	};

	/**
	 * @private
	 */
	NavigationPopover.prototype._discardAvailableActions = function(sLayer) {
		this._getFlexHandler().discardAvailableActionsOfSnapshot(sLayer);
		this._syncAvailableActions();
	};

	/**
	 * @private
	 */
	NavigationPopover.prototype._syncAvailableActions = function() {
		var oSnapshot = this._getFlexHandler().determineSnapshotOfAvailableActions();
		var oModel = this.getModel("$sapuicompNavigationPopover");

		// Update the value of '/availableActions' model
		oModel.getProperty("/availableActions").forEach(function(oMAvailableAction, iIndex) {
			if (oSnapshot[oMAvailableAction.key] !== undefined) {
				oModel.setProperty("/availableActions/" + iIndex + "/visible", oSnapshot[oMAvailableAction.key].visible);
			}
		});
	};

	return NavigationPopover;

}, /* bExport= */true);
