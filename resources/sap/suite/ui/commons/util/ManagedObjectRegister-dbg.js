/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/base/ManagedObject"
], function (BaseObject, ManagedObject) {
	"use strict";

	/**
	 * Creates an object registry for storing references to managed objects.
	 *
	 * @class A registry which keeps a set of managed objects and allows you to lazy load them and destroy them at once.
	 * A lot of controls keep those object as private properties and destroies them one by one.
	 * Instead you can just use:
	 * <pre><code>
	 * this._objectRegister = new ManagedObjectRegister();
	 * this._objectRegister.register("Button", function() {
	 *  return new Button(...);
     * });
	 *
	 * this._objectRegister.getButton()...
	 *
	 * this._objectRegister.destroyAll();
	 * </code></pre>
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @constructor
	 * @alias sap.suite.ui.commons.util.ManagedObjectRegister
	 * @public
	 */
	var ManaedObjectRegister = BaseObject.extend("sap.suite.ui.commons.util.ManagedObjectRegister", {
		constructor: function () {
			BaseObject.apply(this, arguments);
			this._mRegister = {};
		}
	});

	/**
	 * Registers an object. Registry will automatically create a getter for the object.
	 * @param {string} sKey Key of the object. Should start with capital letter.
	 * @param {function|sap.ui.base.ManagedObject} oFactoryFunction A managed object to register or a factory function which can build the object.
	 * Factory function can be used for lazy loading of the object. Register will pass sKey to the function, so it can be shared for more objects.
	 * @public
	 */
	ManaedObjectRegister.prototype.register = function (sKey, oFactoryFunction) {
		jQuery.sap.assert(typeof sKey === "string", "Key must be a string.");

		sKey = sKey[0].toUpperCase() + sKey.substr(1);
		var getter = "get" + sKey;

		if (typeof this._mRegister[sKey] !== "undefined") {
			this.destroyObject(sKey);
		}
		if (typeof oFactoryFunction === "function") {
			this._mRegister[sKey] = {
				fFactory: oFactoryFunction,
				oValue: undefined
			};
		} else if (oFactoryFunction instanceof ManagedObject) {
			this._mRegister[sKey] = {
				fFactory: undefined,
				oValue: oFactoryFunction
			};
		} else {
			jQuery.sap.log.error("oFactoryFunction must be either a factory function or a managed object.");
			return;
		}
		//Register new getter
		if (getter !== "getObject") {
			this[getter] = function () {
				return this.getObject(sKey);
			};
		}
	};

	/**
	 * Returns a stored object. If called without parameters it will return object registered with key "Object".
	 * @param {string} [sKey="Object"] Key of the object.
	 * @returns {sap.ui.base.ManagedObject} An object from the register. If the object doesn't exist it will get created by it's factory function.
	 * @public
	 */
	ManaedObjectRegister.prototype.getObject = function(sKey) {
		sKey = sKey || "Object";
		jQuery.sap.assert(typeof this._mRegister[sKey] === "object", "Object must be registered.");
		var register = this._mRegister[sKey];
		if (typeof register.oValue === "undefined") {
			register.oValue = register.fFactory(sKey);
			jQuery.sap.assert(register.oValue instanceof ManagedObject, "Factory class must return a managed object.");
		}
		return register.oValue;
	};

	/**
	 * Destroys an object and removes it from the registry.
	 * @param {string} sKey Key of the object.
	 * @public
	 */
	ManaedObjectRegister.prototype.destroyObject = function(sKey) {
		jQuery.sap.assert(typeof sKey === "string", "Key must be a string.");
		jQuery.sap.assert(typeof this._mRegister[sKey] === "object", "Object must be registered.");
		var register = this._mRegister[sKey];
		if (register.oValue) {
			register.oValue.destroy();
		}
		if (sKey !== "Object") {
			delete this["get" + sKey];
		}
		delete this._mRegister[sKey];
	};

	/**
	 * Destroys all objects in the registry and removes it's definition.
	 * @public
	 */
	ManaedObjectRegister.prototype.destroyAll = function() {
		var key,
			register;
		for (key in this._mRegister) {
			register = this._mRegister[key];
			if (register.oValue) {
				register.oValue.destroy();
			}
			if (key !== "Object") {
				delete this["get" + key];
			}
		}
		this._mRegister = {};
	};

	return ManaedObjectRegister;
});