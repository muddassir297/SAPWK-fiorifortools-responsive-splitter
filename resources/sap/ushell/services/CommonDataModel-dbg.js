// @copyright@
/**
 * @fileOverview
 *
 * <p>This module exposes a CommonDataModel based site document in a platform neutral format
 * to it's clients
 * </p>
 *
 *
 * @version
 * @version@
 */
sap.ui.define([
    "sap/ushell/services/_CommonDataModel/PersonalizationProcessor",
    "sap/ushell/services/ClientSideTargetResolution" // overcome loading issues in firefox
], function (PersonalizationProcessor, ClientSideTargetResolution) {
    "use strict";
    /*global jQuery, sap */

    /**
     * @param {object} oAdapter
     *   Adapter, provides an array of Inbounds
     * @param {object} oContainerInterface
     *   Not in use
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oServiceConfiguration
     *   The service configuration not in use
     *
     * @constructor
     * @class
     * @see {@link sap.ushell.services.Container#getService}
     * @since 1.40.0
     */
    function CommonDataModel (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {

        var that = this,
            oSiteDeferred = new jQuery.Deferred();

        function failure(sMessage) {
            oSiteDeferred.reject(sMessage);
        }

        this._oAdapter = oAdapter;
        this._oPersonalizationProcessor = new PersonalizationProcessor();
        this._oSitePromise = oSiteDeferred.promise();

        // load site and personalization as early as possible
        /*eslint-disable max-nested-callbacks*/
        oAdapter.getSite()
            .done(function (oSite) {
                that._oOriginalSite = jQuery.extend(true, {}, oSite);
                oAdapter.getPersonalization()
                    .done(function(oPers) {
                        that._oPersonalizationProcessor.mixinPersonalization(oSite, oPers)
                            .done(function (oPersonalizedSite) {
                                that._oPersonalizedSite = oPersonalizedSite;
                                oSiteDeferred.resolve(that._oPersonalizedSite);
                            })
                            .fail(failure); // mixinPersonalization
                        })
                    .fail(failure); // getPersonalizations
                })
            .fail(failure); //getSite
        /*eslint-enable max-nested-callbacks*/
    }

    /**
     * TODO to be removed
     * @private
     */
    CommonDataModel.prototype.getHomepageGroups = function () {
        var oDeferred = new jQuery.Deferred();

        this._oSitePromise.then(function(oSite) {
            // the group order was not available in the very first ABAP CDM RT Site
            var aGroupsOrder = (oSite && oSite.site && oSite.site.payload && oSite.site.payload.groupsOrder)
                ? oSite.site.payload.groupsOrder : [];

            oDeferred.resolve(aGroupsOrder);
        });
        return oDeferred.promise();
    };

    /**
     * TODO to be removed
     * @private
     */
    CommonDataModel.prototype.getGroups = function () {

        var oDeferred = new jQuery.Deferred();

        this._oSitePromise.then(function(oSite) {
            var aGroups = [];
            Object.keys(oSite.groups).forEach(function (sKey) {
                aGroups.push(oSite.groups[sKey]);
            });
            oDeferred.resolve(aGroups);
        });
        return oDeferred.promise();
    };

    /**
     * TODO to be removed
     * @private
     */
    CommonDataModel.prototype.getGroup = function (sId) {
        var oDeferred = new jQuery.Deferred();
        this._oSitePromise.then(function(oSite) {
            var oGroup = oSite.groups[sId];
            if (oGroup) {
                oDeferred.resolve(oGroup);
            } else {
                oDeferred.reject("Group " + sId + " not found");
            }
        });
        return oDeferred.promise();
    };

    /**
     * Returns the Common Data Model site with mixed in personalization.
     * The following sections are allowed to be changed:
     *   - site.payload.groupsOrder
     *   - groups
     * Everything else must not be changed.
     *
     * @returns {jQuery.promise}
     *    resolves with the Common Data Model site
     * @private
     *
     * @see #save
     * @since 1.40.0
     */
    CommonDataModel.prototype.getSite = function () {
        //TODO JSDoc: tbd is it allowed to change "personalization" section?
        return this._oSitePromise;
    };

    /**
     * Returns a given group from the original site.
     *
     * @param {string} sGroupId
     *  Group id
     * @returns {jQuery.promise}
     *  Resolves with the respective group from the original site.
     *  In case the group is not exisiting in the original site,
     *  a respective error message is passed to the fail handler.
     * @private
     *
     * @since 1.42.0
     */
    CommonDataModel.prototype.getGroupFromOriginalSite = function (sGroupId) {
        var oDeferred = new jQuery.Deferred();

        if (typeof sGroupId === "string" &&
                this._oOriginalSite &&
                this._oOriginalSite.groups &&
                this._oOriginalSite.groups[sGroupId]) {
            oDeferred.resolve(jQuery.extend(true, {}, this._oOriginalSite.groups[sGroupId]));
        } else {
            oDeferred.reject("Group does not exist in original site.");
        }

        return oDeferred.promise();
    };

    /**
     * Saves the personalization change together with the collected personalization
     * changes since the last FLP reload.
     *
     * @returns {jQuery.promise}
     *   The promise's done handler indicates whether the collected personalization has been saved successfully.
     *   In case an error occured, the promise's fail handler returns an error message.
     * @private
     *
     * @see #getSite
     * @since 1.40.0
     */
    CommonDataModel.prototype.save = function () {
        var oDeferred = new jQuery.Deferred(),
            that = this;

        this._oPersonalizationProcessor.extractPersonalization(this._oPersonalizedSite, this._oOriginalSite)
            .done(function (oExtractedPersonalization) {
                if (oExtractedPersonalization) {
                    that._oAdapter._storePersonalizationData(oExtractedPersonalization)
                        .done(function () {
                            oDeferred.resolve();
                        })
                        .fail(function (sMessage) {
                            oDeferred.reject(sMessage);
                        });
                } else {
                    // Nothing to store, but resolve the deferred object
                    oDeferred.resolve();
                }
            });

        return oDeferred.promise();
    };

    CommonDataModel.hasNoAdapter = false;
    return CommonDataModel;

}, true /* bExport */);
