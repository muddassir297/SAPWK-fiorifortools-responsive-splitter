/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/BaseCommand', "sap/ui/fl/FlexControllerFactory",
		"sap/ui/rta/ControlTreeModifier", "sap/ui/fl/Utils"], function(BaseCommand, FlexControllerFactory,
		RtaControlTreeModifier, Utils) {
	"use strict";

	/**
	 * Basic implementation for the flexibility commands, that use a flex change handler.
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 *
	 * @author SAP SE
	 * @version 1.46.2
	 *
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.FlexCommand
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var FlexCommand = BaseCommand.extend("sap.ui.rta.command.FlexCommand", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				changeHandler : {
					type : "any"
				},
				changeType : {
					type : "string"
				},
				/**
				 * getState and restoreState are used for retrieving custom undo/redo implementations from design time metadata
				 */
				fnGetState : {
					type : "any"
				},
				state : {
					type : "any"
				},
				fnRestoreState : {
					type : "any"
				},
				/**
				 * selector object containing id, appComponent and controlType to create a command for an element, which is not instantiated
				 */
				selector : {
					type : "object"
				}
			},
			associations : {},
			events : {}
		}
	});

	/**
	 * Retrives id of element or selector
	 * @public
	 */
	FlexCommand.prototype.getElementId = function() {
		var oElement = this.getElement();
		return oElement ? oElement.getId() : this.getSelector().id;
	};

	/**
	 * Retrives app component of element or selector
	 * @private
	 */
	FlexCommand.prototype.getAppComponent = function() {
		var oElement = this.getElement();
		return oElement ? Utils.getAppComponentForControl(oElement) : this.getSelector().appComponent;
	};

	/**
	 * Prepares and stores change to be applied later
	 * (in some cases element of a command is unstable, so change needs to be created and stored upfront)
	 * @override
	 */
	FlexCommand.prototype.prepare = function() {
		this._oPreparedChange = this._createChange();
	};

	/**
	 * Returns a prepared change
	 * @public
	 */
	FlexCommand.prototype.getPreparedChange = function() {
		if (!this._oPreparedChange) {
			this.prepare();
		}
		return this._oPreparedChange;
	};

	/**
	 * @override
	 */
	FlexCommand.prototype.execute = function() {
		var vChange = this.getPreparedChange();
		this._applyChange(vChange);
	};

	/**
	 * This method converts command constructor parameters into change specific data
	 * Default implementation of this method below is for commands, which do not have specific constructor parameters
	 * @return {object} SpecificChangeInfo for ChangeHandler
	 * @protected
	 */
	FlexCommand.prototype._getChangeSpecificData = function() {
		return {
			changeType : this.getChangeType(),
			selector : {
				id : this.getElementId()
			}
		};
	};

	/**
	 * @private
	 */
	FlexCommand.prototype._createChange = function() {
		return this._createChangeFromData(this._getChangeSpecificData());
	};

	/**
	 * Create a Flex change from a given Change Specific Data
	 * (This method can be reused to retrieve an Undo Change)
	 * @private
	 */
	FlexCommand.prototype._createChangeFromData = function(mChangeSpecificData) {
		var oFlexController = FlexControllerFactory.createForControl(this.getAppComponent());
		return oFlexController.createChange(mChangeSpecificData, this.getElement() || this.getSelector());
	};

	/**
	 * @override
	 */
	FlexCommand.prototype.undo = function() {
		//If the command has a "restoreState" implementation, use that to perform the undo
		if (this.getFnRestoreState()){
			this.getFnRestoreState()((this.getElement() || this.getSelector()), this.getState());
		} else if (this._aRecordedUndo) {
			RtaControlTreeModifier.performUndo(this._aRecordedUndo);
		} else {
			jQuery.sap.log.warning("Undo is not available for " + this.getElement() || this.getSelector());
		}

	};

	/**
	 * @private
	 */
	FlexCommand.prototype._applyChange = function(vChange) {
		//TODO: remove the following compatibility code when concept is implemented
		var oChange = vChange.change || vChange;

		var oAppComponent = this.getAppComponent();
		var oSelectorElement = RtaControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);

		//If the command has a "getState" implementation, use that instead of recording the undo
		if (this.getFnGetState()){
			this.setState.call(this, (this.getFnGetState()(this.getElement() || this.getSelector())));
		} else {
			RtaControlTreeModifier.startRecordingUndo();
		}

		this.getChangeHandler().applyChange(oChange, oSelectorElement, {
			modifier: RtaControlTreeModifier,
			appComponent : oAppComponent
		});

		if (!this.getFnGetState()){
			this._aRecordedUndo = RtaControlTreeModifier.stopRecordingUndo();
		}
	};

	return FlexCommand;

}, /* bExport= */true);
