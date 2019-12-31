// @copyright@
/**
 * @fileOverview The Unified Shell's personalization service, which provides
 *               generic read and write access to the currently logged on user's
 *               personalization settings for the app currently executed in the
 *               shell.
 *
 * @version
 * @version@
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/_Personalization/utils",
    "sap/ushell/services/_Personalization/constants.private",
    "sap/ushell/services/_Personalization/constants",
    "sap/ushell/services/_Personalization/ContextContainer",
    "sap/ushell/services/_Personalization/WindowAdapter",
    "sap/ushell/services/_Personalization/TransientPersonalizer", // private
    "sap/ushell/services/_Personalization/PersonalizationContainer", // private
    "sap/ushell/services/_Personalization/Personalizer",          // private
    "sap/ushell/services/_Personalization/VariantSetAdapter",
    "sap/ushell/services/_Personalization/Variant",
    "sap/ushell/services/_Personalization/VariantSet",
    "sap/ushell/services/_Personalization/WindowAdapterContainer",
    "sap/ui/core/format/DateFormat"
], function (
    utils,
    personalizationUtils,
    privateConstants,
    publicConstants,
    ContextContainer,
    WindowAdapter,
    TransientPersonalizer,
    PersonalizationContainer,
    Personalizer,
    VariantSetAdapter,
    Variant,
    VariantSet,
    WindowAdapterContainer,
    DateFormat
) {

    "use strict";
    /*jslint nomen: true, bitwise: false */
    /*jshint bitwise: false */
    /*global jQuery, sap, setTimeout, clearTimeout, window */

    // TODO conditional loading


    /*
     * Implementation note:
     *
     * ITEM#<itemkey>
     * VARIANTSET#<variantset>
     * sap-ushell-container-scope : {   }
     * sap-ushell-container-
     */

    /**
     * This method MUST be called by the Unified Shell's container only, others
     * MUST call <code>sap.ushell.Container.getService("Personalization")</code>.
     * Constructs a new instance of the personalization service.
     *
     * @name sap.ushell.services.Personalization
     *
     * @param {object} oAdapter
     *            the service adapter for the personalization service,
     *            as already provided by the container
     *
     * @class The Unified Shell's personalization service, which provides a
     *        personalizer object that handles all personalization operations.
     *
     * @public
     * @constructor
     * @see sap.ushell.services.Container#getService
     *
     * @since 1.15.0
     */
    function Personalization (oAdapter, oContainerInterface, sParameter, oConfig) {
        this._oConfig = oConfig;
        this._sSeed = jQuery.sap.getObject("config.seed", undefined, oConfig) || "ABC";
        this._oAdapterWithBackendAdapter = new WindowAdapter(this, oAdapter);
        this._oAdapterWindowOnly =  new WindowAdapter(this, undefined);
        this._supportsGetWithoutSubsequentLoad = (oAdapter && oAdapter.supportsGetWithoutSubsequentLoad === true);
        this._oContainerMap = new utils.Map();
        // map: sPrefixedContainerKey -> promise object of getPersonalizationContainer
        this._oPendingOperationsMap = new utils.Map();
        // map: sContainerKey -> pending operation (deferred object, potentially extended with _sapTimeoutId, _sapFnSave)
    };

    Personalization.prototype.SAVE_DEFERRED_DROPPED = "Deferred save dropped (OK) - Data superseeded by subsequent save";
    //constants for scope of personalization service
    Personalization.prototype.constants = publicConstants;

    /**
     * Returns a generated key
     *
     * @returns {string}
     *            40 character string consisting of A-Z and 0-9 which can be used as a generated key for personalization
     *            container. Every invocation returns a new key.
     *            NOTE: Don't use substrings of this key as random keys
     *
     * @public
     * @alias sap.ushell.services.Personalization#getGeneratedKey
     * @since 1.28.0
     */
    Personalization.prototype.getGeneratedKey = function () {
        var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            sDate = new Date().getTime().toString(),
            sResult = "",
            sConcatResult,
            nHash = 0,
            i;
        // assure _sSeed is longer than 40 characters
        while (this._sSeed.length < 40) {
            this._sSeed = this._sSeed + Math.random().toString().substring(2);
        }
        // use the random seed for the first 3 characters
        for (i = 0; i < 3; i = i + 1) {
            nHash = this._sSeed.charCodeAt(i) + 31 * nHash;
            nHash = nHash & nHash; // Convert to 32bit integer
            sResult = sResult + CHARS[Math.abs(nHash % 36)];
        }
        //to make sure there are at least 40 characters
        sConcatResult = Math.random().toString().substring(2) + sDate + Math.random().toString().substring(2) + sDate + "1234523413542345698772";
        for (i = 0; i < 37; i = i + 1) {
            nHash = this._sSeed.charCodeAt(i) + parseInt(sConcatResult[i], 10) + 31 * nHash;
            nHash = nHash & nHash; // Convert to 32bit integer
            sResult = sResult + CHARS[Math.abs(nHash % 36)];
        }
        return sResult.substring(0, 40);
    };

    /**
     * Returns a personalizer object which handles personalization by
     * asynchronous operations storing the personalization data immediately via
     * the connected adapter. For each operation a round trip is executed.
     *
     * Do not mix the usage of a personalizer and a personalization container
     * for one containerKey.
     *
     * @param {object} oPersId
     *            JSON object consisting of the following parts:
     *            container - Identifies the set of personalization data that is
     *            loaded/saved as one bundle from the front-end server. item - The
     *            name of the object the personalization is applied to.
     * @param {object} oScope - scope object<br/>
     *            currently the validity property of the scope object is relevant:
     *            oScope.validity : validity of the container persistence in minutes<br/>
     *            oScope.keyCategory : Type or category of key<br/>
     *            oScope.writeFrequency : Expected frequency how often users will use this container to store data inside<br/>
     *            oScope.clientStorageAllowed : Defines if storage on client side should be allowed or not<br/>
     *            E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.
     * @param {sap.ui.component} oComponent
     *           Since 1.27.0.
     *           SAPUI5 component which uses the personalizer. This allows to associate the stored
     *           data with the application.
     *
     * @returns {object}
     *            {@link sap.ushell.services.Personalizer} which provides generic read and
     *            write access to the currently logged on user's personalization
     *            settings.
     *
     * @public
     * @alias sap.ushell.services.Personalization#getPersonalizer
     * @since 1.15.0
     */
    Personalization.prototype.getPersonalizer = function (oPersId, oScope, oComponent) {
        return new Personalizer(this, this._oAdapterWithBackendAdapter, oPersId, oScope, oComponent);
    };

    /**
     * Returns a transient personalizer object which handles personalization by
     * asynchronous operations storing the personalization data transiently as
     * an object property. Primary usage of the transient personalizer is a
     * personalization scenario with variants where the transient personalizer
     * is used as a buffer for table personalization data.
     *
     * @returns {object}
     *            {@link sap.ushell.services.TransientPersonalizer} which
     *            provides asynchronous read and write access to a transient personalization data storage.
     *
     * @public
     * @alias sap.ushell.services.Personalization#getTransientPersonalizer
     * @since 1.18.0
     */
    Personalization.prototype.getTransientPersonalizer = function () {
        return new TransientPersonalizer();
    };


    /**
     * Factory method to obtain a Data Context object,
     * which is a local copy of the persistence layer data.
     * The Container data is asynchronously read on creation if present,
     * otherwise an initial object is created.
     * The Container data can then be *synchronously* modified (getItemValue, setItemValue).
     * Only on invoking  the save()/saveDeferred() method the data is transferred to the persistence.
     * This allows the application to perform multiple local modifications and
     * delay the save operation.
     *
     * Every getContainer operation returns a new local copy, containing the full data at the point of creation.
     *
     * Executing load() on the container reloads the data from the persistence, discarding local changes.
     *
     * Note that the container allows the application to
     * control the round trips to the front-end server persistence. The factory method
     * getContainer is asynchronous and loads the container via
     * the connected adapter from the front-end server. All operations (but for the
     * save operation) are executed synchronously, operating on the local data.
     * This allows the application to control the round trips to the front-end server
     * persistence.
     *
     * A container can contain a set of items, identified by a key.
     *
     * You can wrap a container in a VariantSetAdapter to read and write
     * a more complex structure (with multiple keys (variantSet,variant,item)).
     *
     * Do not mix up the usage of a personalizer and a container
     * for one containerKey.
     * Do not use a PersonalizationContainer and a Container for the same key except for migration scenarios.
     *
     * scope / validity parameter (@since 1.22.0):
     *   An unspecified (undefined validity) or infinite (Infinity) validity indicates that data is persisted in the
     *   Personalization data of the front-end server. A round trip is executed on an initial get and at least every save operation.
     *   Data is stored per user and retained indefinitely at the front-end server.
     *
     *   The validity parameter allows a designated storage validity for the created container.
     *   A 0 validity indicates the data is only persisted within the Fiori Launchpad window.
     *   No round trips to the front-end server are executed. Data is lost if the Fiori Launchpad window state is lost
     *   (e.g. by navigating to a different page, pressing F5 (reload page) or duplicating the window).
     *
     *   For versions > 1.24 it may happen that for cross-app navigation a reload of the Fiori Launchpad is triggered.
     *   In this case a storage of the personalization data in the Fiori lauchpad window would lead to data loss.
     *   To overcome this a validity 0 is automatically changed to a validity 1440 (24h; storage on the front-end server).
     *   This is only done if a relaod of the Fiori Launchpad is triggered for a cross-app navigation.
     *
     * Security: It is the responsibility of the application to not persist information relevant to auditing or security
     * using the PersonalizationService with inappropriate validity models. No mechanisms exist
     * to destroy or selectively destroy application-specific data in the front-end server persistence (especially for validity Infinity).
     *
     * For non-zero validity scopes, data will be transmitted and persisted in the front-end server system.
     *
     * For limited validity, actual deletion of data on the front-end server is subject to explicit cleanup execution of front-end server jobs
     * and not guaranteed. The data may still be persisted and retrievable. The interface only assures that expired data is no longer
     * exposed to the application code in the Fiori Launchpad.
     *
     * The ContainerKey uniquely defines the Container, validity is not part of the key (there are no separate
     * namespaces per validity).
     *
     * In general, mixing different validity models for a given container key is not supported.
     * Fast chaining of different methods may source arbitrary persistence layers.
     * The validity of the resulting object in the done function of a promise is the last get validity.
     *
     * The validity associated with the last getContainer or createEmptyContainer determines
     * the current validity of the container and the validity used during the next save operation.
     *
     * Naturally, if a delete or get with validity 0 is issued, it will *not* delete or retrieve a front-end server persistent
     * storage
     * Thus a sequence  delete( [validity 0])/wait for promise, getContainer(sKey,{ validity : Infinity}) may return a valid dataset.
     *
     * @param {string}
     *            sContainerKey - identifies the container
     *            The string length is restricted to 40 characters
     * @param {Object} oScope - scope object<br/>
     *            currently the validity property of the scope object is relevant:
     *            E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.<br/>
     *            oScope.validity : validity of the container persistence in minutes<br/>
     *              valid values include 0 ( per FLP Window), <br/>
     *                           Infinity, undefined  (front-end server persistence per user ) [Default] <br/>
     *                           nn Minutes (front-end server persistence per user, ignored if older than nn minutes)
     * @param {sap.ui.component} oComponent
     *           Since 1.27.0.
     *           SAPUI5 component which uses the container. This allows to associate the stored
     *           data with the application.
     *
     * @returns {object} Promise object whose done function returns a
     *            {@link sap.ushell.services.Personalization.ContextContainer} object
     *            as parameter. The container provides setItemValue / getItemValue methods
     *            to synchronously operate on personalization data.
     *            By wrapping it in a VariantSetAdapter, an alternate interface to maintain variants can be obtained.
     *
     * @public
     * @alias sap.ushell.services.Personalization#getContainer
     * @since 1.22.0
     */
    Personalization.prototype.getContainer = function (sContainerKey, oScope, oComponent) {
        return this._createContainer(sContainerKey, oScope, false, oComponent);
    };

    /**
    * Factory method to obtain an empty Data Context object.
    * When data present in a prior context is not relevant
    * (e.g. when using a "uniquely" generated key and planning to
    * overwrite any colliding front-end server data).
    *
    * The call always returns an cleared container().
    *
    * Note that an existing container at the front-end server is not actually deleted or overwritten
    * unless a save operation is executed.
    *
    *
    * An initial object is returned.
    * @param {string}
    *            sContainerKey - identifies the container
     *            The string length is restricted to 40 characters
    * @param {Object} oScope - scope object
    *            currently the validity property of the scope object is relevant:
    *            E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.<br/>
    *            oScope.validity : validity of the container persistence in minutes
    *              valid values include 0 ( per FLP Window),
    *                           Infinity, undefined  ( Backend persistence per user ) [Default]
    *                           nn Minutes ( Backend persistence per user, ignored if older than nn minutes)
    * @param {sap.ui.component} oComponent
    *           Since 1.27.0.
    *           SAPUI5 component which uses the container. This allows to associate the stored
    *           data with the application.
    *
    * @returns {object} Promise object whose done function returns a
    *            {@link sap.ushell.services.Personalization.ContextContainer} object
    *            as parameter. The personalization container provides two different
    *            interfaces to synchronously operate on personalization data.
    *            In the item mode the container contains items as name value pairs for
    *            personalization data.
    *            In the variant mode the container contains variant sets which contain
    *            variants containing items.
    * @public
    * @alias sap.ushell.services.Personalization#createEmptyContainer
    * @since 1.22.0
    */
    Personalization.prototype.createEmptyContainer = function (sContainerKey, oScope, oComponent) {
        return this._createContainer(sContainerKey, oScope, true, oComponent);
    };

    Personalization.prototype._createContainer = function (sContainerKey, oScope, bCreateEmpty, oComponent) {
        var oDeferred = new jQuery.Deferred(),
            res,
            oLoadPromise,
            oContainer;
        res = this._adjustScopePickAdapter(sContainerKey, oScope, this._oAdapterWithBackendAdapter,
            this._oAdapterWindowOnly);
        oContainer = new ContextContainer(this,
            res.oAdapterForScope, res.sPrefixedContainerKey, res.oScope, oComponent);
        // historically, a sequence getContainer / load was always called
        // if an adapter supports returning an initialized container without
        // requiring an subsequent load,
        // he can set the flag supportsGetWithoutSubsequentLoad and the load call will be omitted if
        // an empty container is required
        if (bCreateEmpty && this._supportsGetWithoutSubsequentLoad) {
            oLoadPromise = new jQuery.Deferred();
            oLoadPromise.resolve(oContainer);
        } else {
            oLoadPromise = oContainer.load();
        }
        // TODO force asynchronous response
        // requires unit test adaptation which relies on synchronous reponse
        //setTimeout(function () {
            // must do load and clear ...
        oLoadPromise.fail(function () {
            oDeferred.reject();
        }).done(function () {
            if (bCreateEmpty || oContainer._isExpired()) {
                oContainer.clear();
            }
            oDeferred.resolve(oContainer);
        });
        //}, 0);
        return oDeferred.promise();
    };


    /**
     * Asynchronously starts a deletion request for the given container identified by
     * sContainerKey. Can be called without having ever called getContainer with the corresponding key
     *
     * Note: After invoking this operation, the state of other Containers
     * obtained for the same key is undefined!
     * If you want to use the container after deletion, it is strongly recommended to obtain
     * a new instance of a container for the given key *after* the promise has returned.
     *
     * Note: Invoking this operation while another save or load operation is under way may result in failure.
     *
     * @param {string} sContainerKey
     *           identifies the container
     *
     * @returns {object}
     *          promise for the deletion operation
     *
     * @public
     * @alias sap.ushell.services.Personalization#delContainer
     * @since 1.22.0
     */
    Personalization.prototype.delContainer = function (sContainerKey, oScope) {
        // delete the bag, the adapter container & the container
        var oDeferred = {},
            oPrior,
            sPrefixedContainerKey = "",
            that = this;
        oScope = that._adjustScope(oScope);
        sPrefixedContainerKey = personalizationUtils.addContainerPrefix(sContainerKey);
        oDeferred = new jQuery.Deferred();

        oPrior = that._pendingContainerOperations_cancelAddNext(sContainerKey, null);
        oPrior.always(function () {
            that.getContainer(sContainerKey, oScope)  // delays to oPrior! registers a new op!
                .fail(function () {
                    that._pendingContainerOperations_cancelAddNext(sContainerKey, oDeferred); // reinstall oPrior (!)
                    oDeferred.reject();
                })
                .done(function (oContainer) {
                    var oAdapter;
                    // install the "latest" deferred
                    that._pendingContainerOperations_cancelAddNext(sContainerKey, oDeferred); // the getContainer above executed a load --> no flush required
                    if (oScope.validity === 0) {
                        oAdapter = that._oAdapterWindowOnly;
                    } else {
                        oAdapter = that._oAdapterWithBackendAdapter;
                    }
                    oAdapter.delAdapterContainer(sPrefixedContainerKey, oScope)
                        .fail(function () {
                            oDeferred.reject();
                        })
                        .done(function () {
                            oDeferred.resolve();
                        });
                });
        });
        return oDeferred.promise();
    };


    // return old promise,
    // add oDeferred as new, if null , retain old!
    Personalization.prototype._pendingContainerOperations_flushAddNext = function (sContainerKey, oDeferred) {
        var oPendingOpDeferred,
            fnSave;
        oPendingOpDeferred = this._oPendingOperationsMap.get(sContainerKey);
        if (!oPendingOpDeferred) {
            oPendingOpDeferred = new jQuery.Deferred();
            oPendingOpDeferred.resolve();
        }
        if (oDeferred !== null) {
            this._oPendingOperationsMap.put(sContainerKey, oDeferred);
        }
        if (!oPendingOpDeferred || oPendingOpDeferred.state() !== "pending") {
            return oPendingOpDeferred;
        }
        clearTimeout(oPendingOpDeferred._sapTimeoutId); //system function!
        oPendingOpDeferred._sapTimeoutId = undefined;
        if (typeof oPendingOpDeferred._sapFnSave === "function") {
            fnSave = oPendingOpDeferred._sapFnSave;
            oPendingOpDeferred._sapFnSave = undefined; // function can only be triggered at most one time
            fnSave();
        }
        return oPendingOpDeferred;
    };


    Personalization.prototype._pendingContainerOperations_cancelAddNext = function (sContainerKey, oDeferred) {
        var oPendingOpDeferred;
        oPendingOpDeferred = this._oPendingOperationsMap.get(sContainerKey);
        if (!oPendingOpDeferred) {
            oPendingOpDeferred = new jQuery.Deferred();
            oPendingOpDeferred.resolve();
        }
        if (oDeferred !== null) {
            this._oPendingOperationsMap.put(sContainerKey, oDeferred);
        }
        if (!oPendingOpDeferred || oPendingOpDeferred.state() !== "pending") {
            return oPendingOpDeferred;
        }
        if (oPendingOpDeferred._sapTimeoutId) {
            clearTimeout(oPendingOpDeferred._sapTimeoutId);
            oPendingOpDeferred._sapTimeoutId = undefined;
            oPendingOpDeferred.resolve(Personalization.prototype.SAVE_DEFERRED_DROPPED);
        }
        return oPendingOpDeferred;
    };

    /**
     * This interface is deprecated since 1.22,
     * please use getContainer / delContainer.
     *
     * Note: the underlying storage model for Objects stored with getContainer / getPersonalizationContainer
     * is identical.<br/>
     * Thus you can safely migrate your client implementation from the deprecated getContainer to
     * getPersonalizationContainer without loss of data.
     * One may even run mixed set of applications on the same container keys.
     * The sole differences are w.r.t. client side handling of the Context data within one session.
     *
     * If you want to use the variant interface, use the following pattern
     * <code>
     *  getContainer(sContainerKey).done(function(oContainer) {
     *     var variantSetAdapter = new Personalization.VariantSetAdapter(oContainer);
     * }
     * </code>
     *
     *
     * Factory method to obtain a personalization container
     * object which is a client-local buffer for personalization data.
     * The Container data is asynchronously read on creation (if present,
     * otherwise an initial object is created).
     * The Container data can then be *synchronously* modified (read/write/delete).
     * Only on invoking  the save() method the data is persisted at the front-end server.
     * This allows the application to perform multiple local modifications and
     * delay the save operation.
     * Note that the personalization container allows the application to
     * control the round trips to the front-end server persistence. The factory method
     * getPersonalizationContainer is asynchronous and loads the container via
     * the connected adapter from the front-end server. All operations (but for the
     * save operation) are executed synchronously, operating on the local data.
     * This allows the application to control the round trips to the front-end server
     * persistence.
     *
     * A personalization container can contain items as well as variant sets.
     * Variant sets have the following structure:
     * variantSet.variant.item
     * A variant set is enclosing several variants of the same data.
     *
     * Example: An application has two types of variants.
     * Variant type 1 contains filter values for a query, which are stored in item 1 of
     * the variant, and personalization data for a table, which are stored in item 2
     * of the variant.
     * Variant type 2 contains a setting (item 3) that is independent of
     * the filtering and the table settings. It might be used for a different
     * screen than the variants of type 1.
     * In this example you would have 2 variant sets, one for each variant type.
     *
     * Do not mix up the usage of a personalizer and a personalization container
     * for one containerKey.
     *
     * @param {string}
     *            sContainerKey - identifies the container
     *
     * @returns {object} Promise object whose done function returns a
     *            {@link sap.ushell.services.PersonalizationContainer} object
     *            as parameter. The personalization container provides two different
     *            interfaces to synchronously operate on personalization data.
     *            In the item mode the container contains items as name-value pairs for
     *            personalization data.
     *            In the variant mode the container contains variant sets which contain
     *            variants containing items.
     *
     * @deprecated use getContainer()
     * @public
     * @alias sap.ushell.services.Personalization#getPersonalizationContainer
     * @since 1.18.0
     */
    Personalization.prototype.getPersonalizationContainer = function (sContainerKey) {
        var sPrefixedContainerKey = "",
            oPromiseContainer = {},
            oDeferred = {};

        if (typeof sContainerKey !== "string") {
            throw new utils.Error("sContainerKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        sPrefixedContainerKey = personalizationUtils.addContainerPrefix(sContainerKey);
        if (this._oContainerMap.containsKey(sPrefixedContainerKey)) {
            return this._oContainerMap.get(sPrefixedContainerKey).promise();
        }
        oDeferred = new jQuery.Deferred();
        oPromiseContainer = new PersonalizationContainer(this._oAdapterWithBackendAdapter, sPrefixedContainerKey);
        oPromiseContainer
            .done(function (oContainer) {
                oDeferred.resolve(oContainer);
            })
            .fail(function (oContainer) {
                oDeferred.reject(oContainer);
            });
        this._oContainerMap.put(sPrefixedContainerKey, oDeferred);
        return oDeferred.promise();
    };

    /**
     * @deprecated Please use getContainer / delContainer
     * Asynchronously starts a deletion request for the given container identified by
     * sContainerKey. Can be called without having ever created a personalization container.
     *
     * Note: After invoking this operation, the state of other PersonalizationContainers
     * obtained for the same key is undefined!
     * If you want to use the container after deletion, it is strongly recommended to obtain
     * a new instance of PersonalizationContainer for the given key *after* the promise has returned.
     *
     * Note: Invoking this operation while another save or load operation is under way may result in failure.
     *
     * @param {string} sContainerKey
     *           identifies the container
     *
     * @returns {object}
     *          promise for the deletion operation
     *
     * @deprecated
     * @public
     * @alias sap.ushell.services.Personalization#delPersonalizationContainer
     * @since 1.18.0
     */
    Personalization.prototype.delPersonalizationContainer = function (sContainerKey) {
        // delete the bag, the adapter container & the container
        var oDeferred = {},
            sPrefixedContainerKey = "",
            that = this;

        sPrefixedContainerKey = personalizationUtils.addContainerPrefix(sContainerKey);
        oDeferred = new jQuery.Deferred();
        this.getPersonalizationContainer(sContainerKey)
            .fail(function () {
                oDeferred.reject();
            })
            .done(function (oContainer) {
                that._oAdapterWithBackendAdapter.delAdapterContainer(sPrefixedContainerKey)
                    .fail(function () {
                        oDeferred.reject();
                    })
                    .done(function () {
                        that._oContainerMap.remove(sPrefixedContainerKey);
                        oDeferred.resolve();
                    });
            });
        return oDeferred.promise();
    };

    Personalization.prototype._adjustScope = personalizationUtils.adjustScope;
    Personalization.prototype._adjustScopePickAdapter = personalizationUtils.adjustScopePickAdapter;

    Personalization.hasNoAdapter = false;

    Personalization.ContextContainer = ContextContainer;
    Personalization.Variant = Variant;
    Personalization.VariantSet = VariantSet;
    Personalization.VariantSetAdapter = VariantSetAdapter;
    Personalization.WindowAdapter = WindowAdapter;
    Personalization.WindowAdapterContainer = WindowAdapterContainer;

    return Personalization;

}, true /* bExport */);
