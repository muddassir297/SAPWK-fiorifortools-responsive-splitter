// @copyright@
/**
 * @fileOverview The Unified Shell's LaunchPageAdapter for the 'CDM'
 *               platform.
 *
 * @version
 * @version@
 */
(function () {
    "use strict";
    /* global jQuery, sap, window */

    /* eslint-disable no-warning-comments, consistent-this */

    // As the LaunchPageAdapter for the CDM platform is currently not in a finished state,
    // todo comments get disabled in EsLint

    jQuery.sap.declare("sap.ushell.adapters.cdm.LaunchPageAdapter");
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.m.Text");

    /**
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the LaunchPageAdapter for the 'CDM' platform.
     *
     * @param {object} oUnused
     *     the system served by the adapter
     * @param {string} sParameter
     *     parameter as string (legacy, was used before oAdapterConfiguration was added)
     * @param {oject} oAdapterConfiguration
     *     configuration for the adapter.
     *
     * @class
     *
     * @constructor
     * @since 1.15.0
     */
    sap.ushell.adapters.cdm.LaunchPageAdapter = function (oUnused, sParameter, oAdapterConfiguration) {
        var _oDefaultGroup;

        this._mResolvedTiles = {};
        this._mResolvedCatalogTiles = {};
        this._mCatalogTilePromises = {};
        this._mFailedResolvedCatalogTiles = {};
        this._mFailedResolvedTiles = {};

        //TODO: Rectify jQuery.sap.log.error calls and pass correct parameters
        // https://sapui5.netweaver.ondemand.com/sdk/#docs/api/symbols/jQuery.sap.log.html#.error

        this.TileType = {
            Tile: "tile",
            Link: "link"
        };

        /**
         * Returns the groups of the user. These group objects can be passed in to all
         * functions expecting a group.
         *
         * The first group in this list is considered the default group.
         *
         * @returns {jQuery.Promise}
         *  A promise which will be always resolved. In case of success the array consists
         *  of group objects, in case the groups could not be loaded the array is empty.
         */
        this.getGroups = function () {
            var oDeferred = new jQuery.Deferred();

            this._assureLoaded()
                .done(function (aGroups) {
                    oDeferred.resolve(aGroups);
                })
                .fail(function () {
                    // resolve with an empty array in case no groups could be loaded
                    oDeferred.resolve([]);
                });
            return oDeferred.promise();
        };

        /**
         * Construct an appropriate tile by resolving a given intent.
         *
         * @param {string} sHash
         *  Intent
         *
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the hash could be resolved to a tile,
         *  and rejected when the resolution did not work as expected.
         *
         * @private
         */
        this._getTileFromHash = function (sHash) {
            var oDeferred = new jQuery.Deferred(),
                oCatalogTilePromise = this._mCatalogTilePromises[sHash];

            if (!oCatalogTilePromise) {
                // only call resolveTileIntent if it was not resolved before
                oCatalogTilePromise = sap.ushell.Container
                    .getService("ClientSideTargetResolution")
                    .resolveTileIntent(sHash);

                // store promise for the next call
                this._mCatalogTilePromises[sHash] = oCatalogTilePromise;
            }

            oCatalogTilePromise.done(function (oTileIntentResolutionResult) {
                var oTileResolutionResult = {
                    tileIntent: sHash,
                    tileResolutionResult: oTileIntentResolutionResult
                };

                oDeferred.resolve(oTileResolutionResult);
            }).fail(function (sErrorMsg) {
                oDeferred.reject("Hash '" + sHash + "' could not be resolved to a tile. " + sErrorMsg);
            });

            return oDeferred.promise();
        };

        /**
         * Resolves items (tiles and links) for a given group.
         *
         * @param {object} oGroup
         *  Group for which the items should be resolved
         *
         * @returns {array}
         *  An array of jQuery promises each belonging to a respective item.
         *
         * @private
         */
        this._assureGroupItemsResolved = function (oGroup) {
            var aPromises = [],
                aResolvedTilesPromises,
                aResolvedLinksPromises;

            // Tiles
            if (oGroup.payload && oGroup.payload.tiles) {
                aResolvedTilesPromises = this._assureGroupTilesResolved(oGroup.payload.tiles);
                Array.prototype.push.apply(aPromises, aResolvedTilesPromises);
            }

            // Links
            if (oGroup.payload && oGroup.payload.links) {
                aResolvedLinksPromises = this._assureGroupLinksResolved(
                    oGroup.payload.links, oGroup.identification.id
                );
                Array.prototype.push.apply(aPromises, aResolvedLinksPromises);
            }

            return aPromises;
        };

        /**
         * Resolves the given group tiles.
         *
         * @param {array} aGroupTiles
         *  Array of tiles which should be resolved
         *
         * @returns {array}
         *  An array of jQuery promises each belonging to a respective tile.
         *
         * @private
         */
        this._assureGroupTilesResolved = function (aGroupTiles) {
            return (aGroupTiles || []).map(function (oTile, iIndex) {
                return this._getResolvedTile(oTile, iIndex)
                    .then(function (oResolvedTileOutcome) {
                        oResolvedTileOutcome.isLink = false;

                        return oResolvedTileOutcome;
                    });
            }, this);
        };

        /**
         * Resolves the given group links.
         *
         * @param {array} aGroupLinks
         *  Array of links which should be resolved
         * @param {string} sGroupId
         *  Group ID
         *
         * @returns {array}
         *  An array of jQuery promises each belonging to a respective link.
         *
         * @private
         */
        this._assureGroupLinksResolved = function (aGroupLinks, sGroupId) {
            return (aGroupLinks || []).map(function (oLink, iIndex) {
                return this._getResolvedTile(oLink, iIndex)
                    .then(function (oResolvedLinkOutcome) {
                        oResolvedLinkOutcome.isLink = true;

                        return oResolvedLinkOutcome;
                    });
            }, this);
        };

        /**
         * Constructs the hash for a given tile object. Additionaly parameters
         * get formatted.
         *
         * @param {object} oTile
         *  Tile object for which the hash should be constructed.
         * @returns {string} constructed hash or <code>undefined</code>
         *   in case something went wrong.
         *
         * @private
         */
        this._prepareTileHash = function (oTile) {
            var oURLParsing = sap.ushell.Container.getService("URLParsing"),
                oParams = {},
                oTarget,
                aRawParams;

            if (this._isCatalogTile(oTile)) {
                return oTile.tileIntent;
            }

            if (this._isGroupTile(oTile)) {
                // TODO use hash from _mResolvedTiles if tile has been already resolved
                aRawParams = oTile.target.parameters || [];
                aRawParams.forEach(function (oParameter) {
                    if (oParameter.name && oParameter.value) {
                        oParams[oParameter.name] = [oParameter.value];
                    }
                });

                oTarget = {
                    target: {
                        semanticObject: oTile.target.semanticObject,
                        action: oTile.target.action
                    },
                    params: oParams,
                    appSpecificRoute: oTile.target.appSpecificRoute
                };

                return "#" + oURLParsing.constructShellHash(oTarget);
            }
            return undefined;
        };

        /**
         * Works similar to jQuery.Deferred.when except of two facts:
         * - does not stop as soon as the first promise has failed
         * - always resolves, even if some promise(s) failed
         *
         * @param {array} aPromises
         *  Array of promises. The array may be empty.
         * @returns {jQuery.Promise}
         *  A promise which will be resolved in any case, success or failure.
         *
         * @private
         */
        this._allPromisesDone = function (aPromises) {
            var oDeferred = new jQuery.Deferred(),
                oDeferredAlways;

            if (aPromises.length === 0) {
                oDeferred.resolve();
            } else {
                // "replace" aPromises with an array of promises which will always resolve.
                var aNoneFailingPromises = aPromises.map(function (oPromise) {
                    oDeferredAlways = new jQuery.Deferred();
                    oPromise.always(oDeferredAlways.resolve.bind(oDeferredAlways));
                    return oDeferredAlways.promise();
                });
                // This jQuery.Deferred.when call will never fail, as all promises will always be resolved.
                // This is needed because jQuery.when will otherwise abort on the first fail and will
                // not wait for the remaining promises.
                jQuery.when.apply(this, aNoneFailingPromises).done(function () {
                    var aArgs = Array.prototype.slice.call(arguments);
                    oDeferred.resolve(aArgs);
                });
            }
            return oDeferred.promise();
        };

        /**
         * Generates a default group as no existing group is yet flagged
         * as a default group.
         *
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the default group has been generated
         *  successfully. The generated default group will then get passed to the
         *  <code>done</code> handler as an argument. The promise will be rejected
         *  with a respective error message when the generation did not work as expected.
         *
         * @private
         */
        this._generateDefaultGroup = function () {
            var sGeneratedId,
                oGeneratedDefaultGroup,
                oDeferred = new jQuery.Deferred(),
                oCdmService = sap.ushell.Container.getService("CommonDataModel");

            oCdmService.getSite()
                .done(function (oSite) {
                    // All existing group ids are stored in the groupsOrder array of the site
                    sGeneratedId = sap.ushell.utils.
                        generateUniqueId(oSite.site.payload.groupsOrder);

                    oGeneratedDefaultGroup = {
                            "identification": {
                                "id": sGeneratedId,
                                "namespace": "",
                                "title": "Home"
                            },
                            "payload": {
                                "isDefaultGroup": true,
                                "locked": false,
                                "tiles": [],
                                "links": [],
                                "groups": []
                            }
                    };

                    // assign default group to the closure variable of the LaunchPageAdapter
                    _oDefaultGroup = oGeneratedDefaultGroup;

                    // attach group to site object
                    oSite.groups[sGeneratedId] = oGeneratedDefaultGroup;

                    // add group in the front to groupsOrder array
                    oSite.site.payload.groupsOrder.unshift(sGeneratedId);

                    oDeferred.resolve(oGeneratedDefaultGroup);
                })
                .fail(function (sErrorMessage) {
                    oDeferred.reject("Failed to access site. " + sErrorMessage);
                });

            return oDeferred.promise();
        };

        /**
         * Assures that all items (tiles and links) for all groups returned by the CDM site
         * are resolved. Furthermore the default group gets set. If the default group does
         * not exist yet, one will get generated.
         *
         * @returns {jQuery.Promise}
         *  A promise which will be always resolved. In case all items (tiles and links)
         *  of all groups could be loaded using ClientSideTargetResolution the array
         *  contains the group objects. In case something went wrong
         *  The promise will be rejected when the resolution did not work as expected.
         *
         * @private
         */
        this._assureLoaded = function () {
            var that = this,
                oCDMSiteService = sap.ushell.Container.getService("CommonDataModel"),
                oDefaultGroupPromise,
                aLoadedGroups = [],
                oDeferred;

            // bundle multiple requests running in parallel
            if (this._assureLoadedDeferred) {
                return this._assureLoadedDeferred.promise();
            }

            oDeferred = new jQuery.Deferred();
             this._assureLoadedDeferred = oDeferred;

            oCDMSiteService.getSite()
                .done(function (oSite) {
                    var aItemPromises = [];

                    // order groups based on groupsOrder
                    oSite.site.payload.groupsOrder.forEach(function (sGroupId, iIndex) {
                        var oGroup = oSite.groups[sGroupId];
                        if (oGroup) {
                            oGroup.payload = oGroup.payload || {};

                            if (oGroup.payload.hasOwnProperty("isDefaultGroup")) {
                                _oDefaultGroup = oGroup;
                            }

                            // add groups in the correct order
                            aLoadedGroups.push(oGroup);

                            // resolve the tile intents already now, as methods like getGroupTiles
                            // or getTileTitle are synchronously called
                            aItemPromises = that._assureGroupItemsResolved(oGroup).concat(aItemPromises);
                        }
                    });

                    // generate a new default group if no group was flagged as a default group
                    if (_oDefaultGroup === undefined) {
                        // generate default group
                        oDefaultGroupPromise = that._generateDefaultGroup();
                        // attach promise to the collection of item promises which
                        // contains all the promises of all items of all groups.
                        // Once this collection of item promises is resolved,
                        // the loading of groups (including the default group, which might
                        // be generated) is complete.
                        aItemPromises.push(oDefaultGroupPromise);
                        oDefaultGroupPromise
                            .done(function (oGeneratedDefaultGroup) {
                                // attach generated default group in the front of the loaded groups collection
                                aLoadedGroups.unshift(oGeneratedDefaultGroup);
                            })
                            .fail(function (sErrorMessage) {
                                jQuery.sap.log.error("Delivering hompage groups failed - " + sErrorMessage);
                                that._assureLoadedDeferred.resolve([]);
                            });
                    }

                    // wait for resolving of all items
                    // Note: _allPromisesDone does never reject. Therefore no fail handler is required.
                    that._allPromisesDone(aItemPromises)
                        .done(function () {
                            that._assureLoadedDeferred.resolve(aLoadedGroups);
                            // ensure that following _assureLoaded calls get resolved with a new parameter
                            delete that._assureLoadedDeferred;
                        });
                })
                .fail(function (sErrorMessage0) {
                    jQuery.sap.log.error("Delivering hompage groups failed - " + sErrorMessage0);
                    that._assureLoadedDeferred.resolve([]);
                    // ensure that following _assureLoaded calls get resolved with a new parameter
                    delete that._assureLoadedDeferred;
                });

            return oDeferred.promise();
        };

        /**
         * Returns the default group.
         *
         * @returns {jQuery.Promise}
         *  In case of success its <code>done</code> handler is called with the default
         *  group as an argument. In case of failure an error message gets passed to the
         *  fail handler.
         *
         * @public
         */
        this.getDefaultGroup = function () {
            var oDeferred = new jQuery.Deferred(),
                oAssureLoadedDeferred;

            // check whether assureLoaded was already called.
            // The default group is not set before.
            if (!_oDefaultGroup) {
                oAssureLoadedDeferred = this._assureLoaded();
            }

            if (oAssureLoadedDeferred) {
                oAssureLoadedDeferred
                    .done(function () {
                        oDeferred.resolve(_oDefaultGroup);
                    })
                    .fail(function (sMessage) {
                        oDeferred.reject("Failed to access default group. " + sMessage);
                    });
            } else {
                oDeferred.resolve(_oDefaultGroup);
            }

            return oDeferred.promise();
        };

        /**
         * Checks whether a given title is valid string.
         *
         * @param {string} sTitle
         *  Title
         * @returns {boolean}
         *  Indicates whether a string is valid or not.
         *
         * @private
         */
        this._isValidTitle = function (sTitle) {
            if (typeof sTitle !== 'string' || !sTitle) {
                return false;
            }
            return true;
        };

        /**
         * Tells if the group is preset, meaning that the group was not added by the user but by an admin
         * (assigned group).
         * @param oGroup
         *  Group to be checked
         * @return {boolean}
         *  true if the group is preset (assigned by admin), false if added by the user.
         *
         * @private
         */
        this._isGroupPreset = function (oGroup) {
            if (!oGroup.payload.hasOwnProperty("isPreset")) {
                // the default is true as for all user-created groups false is set
                 return true;
            }
            return !!oGroup.payload.isPreset;
        };

        /**
         * Tells if the group is locked, meaning that the user is not able to do modifications.
         * @param oGroup
         *  Group to be checked
         * @return {boolean}
         *  true if the group is locked.
         *
         * @private
         */
        this._isGroupLocked = function (oGroup) {
            return !!oGroup.payload.locked;
        };

        /**
         * Adds a group to the homepage. Furthermore the personalization will be
         * persisted for the end user.
         *
         * @param {string} sTitle
         *  Group title
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when group has been added successfully.
         *  The group object itself and the group id will be passed to the promise's
         *  done handler. In case of failure, the fail handler will be called with
         *  a respective error message.
         */
        this.addGroup = function (sTitle) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = sap.ushell.Container.getService("CommonDataModel"),
                oGroup,
                sGeneratedId,
                sGenericErrorMessage,
                that = this;

            if (!this._isValidTitle(sTitle)) {
                return oDeferred.reject("No valid group title").promise();
            }

            sGenericErrorMessage = "Failed to add the group with title '" + sTitle +
                "' to the homepage. ";

            // add group to site
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    // all existing group ids are stored in the groupsOrder array of the site
                    sGeneratedId = sap.ushell.utils.
                        generateUniqueId(oSite.site.payload.groupsOrder);

                    // prepare new group object
                    oGroup = {
                        "identification": {
                            "id": sGeneratedId,
                            "namespace": "",
                            "title": sTitle
                        },
                        "payload": {
                            "locked": false,
                            "isPreset": false,
                            "tiles": [],
                            "links": [],
                            "groups": []
                        }
                    };

                    oSite.groups[sGeneratedId] = oGroup;

                    // add group to groupsOrder array
                    oSite.site.payload.groupsOrder.push(oGroup.identification.id);

                    // store personalization
                    oCdmSiteService.save()
                        .done(function () {
                            delete that._assureLoadedDeferred;
                            oDeferred.resolve(oSite.groups[sGeneratedId], sGeneratedId);
                        })
                        .fail(function (sErrorMsg0) {
                            oDeferred.reject(sErrorMsg0);
                        });
                })
                .fail(function (sErrorMsg) {
                    oDeferred.reject(sGenericErrorMessage + sErrorMsg);
                });

            return oDeferred.promise();
        };

        /**
         * Returns the title for a given group
         *
         * @param {object} oGroup
         *  Group object
         * @returns {string}
         *  Title for a given group
         */
        this.getGroupTitle = function (oGroup) {
            // TODO Write test
            return oGroup.identification.title;
        };

        /**
         * Sets a new title for a given group
         *
         * @param {object} oGroup
         *  Group object
         * @param {string} sNewTitle
         *  Title which should be set
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the group has been set successfully.
         *  In case of failure, the fail handler will be called with the old group title.
         */
        this.setGroupTitle = function (oGroup, sNewTitle) {
            var that = this,
                oDeferred = new jQuery.Deferred(),
                oCdmSiteService = sap.ushell.Container.getService("CommonDataModel"),
                sOldTitle, // necessary in case the renaming operation fails
                sGenericErrorMessage;

            if (typeof oGroup !== 'object' || !oGroup.identification || !oGroup.identification.id) {
                return oDeferred.reject("Unexpected group value").promise();
            }
            if (!that._isValidTitle(sNewTitle)) {
                return oDeferred.reject("Unexpected oGroup title value").promise();
            }
            sGenericErrorMessage = "Failed to set new title for group with id '" +
            oGroup.identification.id + "'. ";

            sOldTitle = oGroup.identification.title;

            oCdmSiteService.getSite()
                .done(function (oSite) {
                    // adapt title
                    if (oSite.groups[oGroup.identification.id]) {
                        oSite.groups[oGroup.identification.id].identification.title = sNewTitle;
                    }

                    // save personalization
                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve();
                        })
                        .fail(function (sErrorMsg) {
                            jQuery.sap.log.error(sErrorMsg);
                            oDeferred.reject(sOldTitle);
                        });
                })
                .fail(function (sError) {
                    oDeferred.reject(sOldTitle, sGenericErrorMessage + sError);
                });

            return oDeferred.promise();
        };

        /**
         * Returns the ID of a given group
         *
         * @param {object} oGroup
         *  Group object
         * @returns {string}
         *  Group ID
         */
        this.getGroupId = function (oGroup) {
            // TODO Write test
            return oGroup.identification.id;
        };

        /**
         * Hides a given set of groups on the homepage.
         * In case an empty array gets passed, all exisiting groups
         * on the homepage should be set to be visible.
         *
         * @param {object} aHiddenGroupIds
         *  Groups which should be set to be hidden
         * @returns {jQuery.Promise}
         *  Resolves in case the groups are set to be hidden successfully.
         *  In case of failure, the promise rejects with a respective
         *  error message.
         */
        this.hideGroups = function (aHiddenGroupIds) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = sap.ushell.Container.getService("CommonDataModel"),
                sGenericErrorMessage;

            if (aHiddenGroupIds && jQuery.isArray(aHiddenGroupIds)) {
                sGenericErrorMessage = "Failed to hide group. ";
                oCdmSiteService.getSite()
                    .done(function (oSite) {
                        if (aHiddenGroupIds.length > 0) {
                            // set given groups to be hidden, the other ones to visible
                            Object.keys(oSite.groups).forEach(function (sGroupKey) {
                                if (jQuery.inArray(oSite.groups[sGroupKey].identification.id, aHiddenGroupIds) > -1) {
                                    oSite.groups[sGroupKey].identification.isVisible = false;
                                } else {
                                    // if the isVisible property does not exist on a group,
                                    // it means that it is visible.
                                    delete oSite.groups[sGroupKey].identification.isVisible;
                                }
                            });
                        }
                        if (aHiddenGroupIds.length === 0) {
                            // set all exisiting groups to be visible
                            Object.keys(oSite.groups).forEach(function (sGroupKey) {
                                // if the isVisible property does not exist on a group,
                                // it means that it is visible.
                                delete oSite.groups[sGroupKey].identification.isVisible;
                            });
                        }

                        // persist personalization
                        oCdmSiteService.save()
                            .done(function () {
                                oDeferred.resolve();
                            })
                            .fail(function (oErrorMsg0) {
                                oDeferred.reject("Hiding of groups did not work as expected - " + oErrorMsg0);
                            });
                    })
                    .fail(function (sError) {
                        oDeferred.reject(sGenericErrorMessage + sError);
                    });
            } else {
                oDeferred.reject("Invalid input parameter aHiddenGroupIds. Please pass a valid input parameter.");
            }

            return oDeferred.promise();
        };

        /**
         * Checks if a given group is visible
         *
         * @param {object} oGroup
         *  Group object
         * @returns {boolean}
         *  The return value is <code>true</code> if the given group is visible,
         *  and <code>false</code> if it is not visible.
         */
        this.isGroupVisible = function (oGroup) {
            //TODO Write test
            if (oGroup.identification.isVisible === undefined || oGroup.identification.isVisible === true) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Moves a given group to a defined position
         *
         * @param {object} oGroup
         *  Group object
         * @param {number} nNewIndex
         *  New index the group will be moved to
         * @returns {jQuery.Deferred}
         *  A promise which will be resolved when the group has been moved successfully.
         *  In case of failure, the fail handler will be called with a respective error message.
         */
        this.moveGroup = function (oGroup, nNewIndex) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = sap.ushell.Container.getService("CommonDataModel"),
                aGroupsOrderAfterMove,
                sGenericErrorMessage;

            if (!oGroup || !oGroup.identification || !oGroup.identification.id || nNewIndex < 0) {
                return oDeferred.reject("Unable to move groups - invalid parameters").promise();
            }

            sGenericErrorMessage = "Failed to move group with id '" + oGroup.identification.id + "'. ";
            // move group inside the site object
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    if (!oSite.site.payload.groupsOrder) {
                        return oDeferred.reject("groupsOrder not found - abort operation of adding a group.");
                    } else if (oSite.site.payload.groupsOrder.indexOf(oGroup.identification.id) === nNewIndex) {
                        return oDeferred.resolve();
                    }

                    // move group inside the groupsOrder array
                    aGroupsOrderAfterMove = sap.ushell.utils
                        .moveElementInsideOfAnArray(oSite.site.payload.groupsOrder, oSite.site.payload.groupsOrder.indexOf(oGroup.identification.id), nNewIndex);

                    if (!aGroupsOrderAfterMove) {
                        return oDeferred.reject("invalid move group operation - abort.");
                    }

                    // store personalization
                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve();
                        })
                        .fail(function (sErrorMsg) {
                            oDeferred.reject(sErrorMsg);
                        });
                })
                .fail(function (sError) {
                    oDeferred.reject(sGenericErrorMessage + sError);
                });
            return oDeferred.promise();
        };

        /**
         * Removes a given group
         *
         * @param {object} oGroup
         *  Group object
         * @returns {jQuery.Deferred}
         *  A promise which will be resolved when the group has been removed successfully.
         *  In case of failure, the fail handler will be called with a respective error message.
         */
        this.removeGroup = function (oGroup) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = sap.ushell.Container.getService("CommonDataModel"),
                sGenericErrorMessage;

            if (!oGroup || typeof oGroup !== "object" || !oGroup.identification || !oGroup.identification.id) {
                return oDeferred.reject("no valid input parameter for 'oGroup'").promise();
            }

            sGenericErrorMessage = "Failed to remove group with id '" + oGroup.identification.id + "'. ";

            // remove group from site object
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    if (oSite && oSite.groups && oSite.groups[oGroup.identification.id]) {
                        delete oSite.groups[oGroup.identification.id];
                    }

                    // remove group id from groupsOrder array
                    if (oSite && oSite.site && oSite.site.payload && oSite.site.payload.groupsOrder) {
                        oSite.site.payload.groupsOrder = jQuery.grep(oSite.site.payload.groupsOrder, function (sGroupId) {
                            return sGroupId !== oGroup.identification.id;
                        });
                    }

                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve();
                        })
                        .fail(function (sErrorMsg) {
                            oDeferred.reject(sErrorMsg);
                        });
                })
                .fail(function (sError) {
                    oDeferred.reject(sGenericErrorMessage + sError);
                });

            return oDeferred.promise();
        };

        /**
         * Resets a given group. Only groups for which <code>isGroupRemovable</code> returns
         * false can be reset.
         *
         * @param {object} oGroup
         *  Group object
         * @returns {jQuery.Deferred}
         *  A promise which will be resolved when the group has been reset successfully.
         *  In case of failure, the fail handler will be called with a respective error message
         *  and the set of groups.
         */
        this.resetGroup = function (oGroup) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = sap.ushell.Container.getService("CommonDataModel"),
                oSiteGroupsBackup = {},
                that = this,
                sGenericErrorMessage;

            if (oGroup && typeof oGroup === "object" &&
                oGroup.identification &&
                oGroup.identification.id) {

                sGenericErrorMessage = "Failed to reset group with id '" + oGroup.identification.id + "'. ";

                oCdmSiteService.getSite()
                    .done(function (oSite) {
                        jQuery.extend(true, oSiteGroupsBackup, oSite.groups);

                        if (that.isGroupRemovable(oGroup) === false) {
                            oCdmSiteService.getGroupFromOriginalSite(oGroup.identification.id)
                                .done(function (oGroupFromOriginalSite) {
                                    // overwrite respective group in site with the one returned by the original site
                                    if (oSite && typeof oSite === "object" &&
                                        oSite.groups && oSite.groups[oGroup.identification.id]) {
                                        oSite.groups[oGroup.identification.id] = oGroupFromOriginalSite;
                                    }

                                    // persist personalization
                                    oCdmSiteService.save()
                                        .done(function () {
                                            oDeferred.resolve(oGroupFromOriginalSite);
                                        })
                                        .fail(function (sErrorMsg1) {
                                            oDeferred.reject("Group could not be reset - " + sErrorMsg1, oSiteGroupsBackup);
                                        });
                                })
                                .fail(function (sErrorMsg) {
                                    oDeferred.reject("Group could not be reset - " + sErrorMsg, oSiteGroupsBackup);
                                });
                        } else {
                            oDeferred.reject("Group could not be reset as it was created by the user", oSiteGroupsBackup);
                        }
                    })
                    .fail(function (sError) {
                        oDeferred.reject(sGenericErrorMessage + sError, oSiteGroupsBackup);
                    });
            }
            return oDeferred.promise();
        };

        /**
         * Returns the title for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @returns {string}
         *  The tile's title
         */
        this.getTileTitle = function (oTile) {
            var oResolvedTile;

            if (oTile && oTile.isBookmark) {
                return oTile.title;
            }

            oResolvedTile = this._mResolvedTiles[oTile.id];
            if (oResolvedTile) {
                // oTile.title is set by the user and overwrites the default title
                return oTile.title || oResolvedTile.tileResolutionResult.title;
            } else {
                return "";
            }

        };

        /**
         * Returns the subtitle for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @returns {string}
         *  The tile's subtitle
         *
         *  @private
         */
        this.getTileSubtitle = function (oTile) {
            var oResolvedTile;

            if (oTile.isBookmark) {
                return oTile.subTitle;
            }

            // TODO works in all cases? e.g. for tiles added via addTile?
            oResolvedTile = this._mResolvedTiles[oTile.id];

            // oTile.subTitle is set by the user and overwrites the default subtitle
            return oTile.subTitle || oResolvedTile.tileResolutionResult.subTitle;
        };

        /**
         * Returns the icon for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @returns {string}
         *  The tile's icon string
         *
         *  @private
         */
        this.getTileIcon = function (oTile) {
            var oResolvedTile;

            if (oTile.isBookmark) {
                return oTile.icon;
            }

            // TODO works in all cases? e.g. for tiles added via addTile?
            oResolvedTile = this._mResolvedTiles[oTile.id];

            // oTile.icon is set by the user and overwrites the default icon
            return oTile.icon || oResolvedTile.tileResolutionResult.icon;
        };

        /**
         * Returns the indicatorDataSource for a given tile.
         *
         * @param {object} oTile
         *  Tile object
         * @returns {object}
         *  The returned object will be empty if no indicatorDataSource exists,
         *  or it will have one of the following structures:
         *  <pre>
         *  {
         *     dataSource : {
         *          // same structure as in sap.app/datasources/datasource)
         *          "uri" : "/sap/opu/odata/snce/SRV/",
         *          "type" : "OData",
         *          "settings" : {
         *              // ...
         *          }
         *      },
         *      indicatorDataSource : {
         *          // relative path:
         *          "path" : "Foo$fitler=startswith(lastName, 'A') eq true",
         *          "refresh" : 10
         *      },
         *  }
         *  </pre>
         *  OR
         *  <pre>
         *  {
         *      indicatorDataSource : {
         *          // absolute path:
         *          "path" : "/sap/opu/odata/snce/SRV/Foo$fitler=startswith(lastName, 'A') eq true",
         *          "refresh" : 10
         *      },
         *  }
         *  </pre>
         *
         *  @private
         */
        this.getTileIndicatorDataSource = function (oTile) {
            // TODO works in all cases? e.g. for tiles added via addTile?
            var oResolvedTile = this._mResolvedTiles[oTile.id];
            var oResult = {};
            var oResolutionResult;

            if (oTile.indicatorDataSource) {
                // oTile is set by the user (Bookmark Service) and overwrites the defaults
                oResult.indicatorDataSource = oTile.indicatorDataSource;
                if (oTile.dataSource) {
                    oResult.dataSource = oTile.dataSource;
                }

                return oResult;
            }

            if (oResolvedTile) {
                oResolutionResult = oResolvedTile.tileResolutionResult;

                if (oResolutionResult.indicatorDataSource) {
                    oResult.indicatorDataSource = oResolutionResult.indicatorDataSource;
                }

                if (oResolutionResult.dataSource) {
                    oResult.dataSource = oResolutionResult.dataSource;
                }
            }

            return oResult;
        };

        /**
         * Checks if a given group is removable
         *
         * @param {object} oGroup
         *  Group object
         * @returns {boolean}
         *  The return value is <code>true</true> if the given group is
         *  removable, and <code>false</code> if not.
         */
        this.isGroupRemovable = function (oGroup) {
            return !this._isGroupPreset(oGroup);
        };

        /**
         * Checks if a given group is locked
         *
         * @param {object} oGroup
         *  Group object
         * @returns {boolean}
         *  The return value is <code>true</true> if the given group is
         *  locked, and <code>false</code> if not.
         */
        this.isGroupLocked = function (oGroup) {
            return this._isGroupLocked(oGroup);
        };

        /**
         * Returns the tiles for a given group
         *
         * @param {object} oGroup
         *  Group object
         * @returns {array}
         *  The array consists of all group items (tiles and links).
         *  In case the group does not have items, the array will
         *  be empty.
         */
        this.getGroupTiles = function (oGroup) {
            var aTilesAndLinks = oGroup.payload.tiles || [];
            if (oGroup.payload.links && jQuery.isArray(oGroup.payload.links) && oGroup.payload.links.length > 0) {
                // join both arrays
                aTilesAndLinks = aTilesAndLinks.concat(oGroup.payload.links);
            }
            return aTilesAndLinks;
        };

        /**
         * Returns the links for a given group
         *
         * @param {object} oGroup
         *  Group object
         * @returns {array}
         *  The array consists of all group items (tiles and links).
         *  In case the group does not have items, the array will
         *  be empty.
         */
        this.getLinkTiles = function (oGroup) {
            // TODO Write test
            // Note: This method is actually not used by the FLP Renderer ...
            // getGroupTiles + getTileType is used instead
            if (oGroup.payload.links && jQuery.isArray(oGroup.payload.links) && oGroup.payload.links.length > 0) {
                return oGroup.payload.links;
            } else {
                return [];
            }
        };

        /**
         * Returns the type for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @returns {string}
         *  Tile type
         */
        this.getTileType = function (oTile) {
            // TODO Write test
            var oResolvedTile = this._mResolvedTiles[oTile.id];
            if (oResolvedTile && oResolvedTile.isLink) {
                return this.TileType.Link;
            }

            return this.TileType.Tile;
        };

        /**
         * Returns the ID for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @returns {string}
         *  Tile ID
         */
        this.getTileId = function (oTile) {
            return oTile.id;
        };

        /**
         * Returns the size for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @returns {string}
         *  Tile size
         */
        this.getTileSize = function (oTile) {
            var oResolvedTile = this._mResolvedTiles[oTile.id];
            if (oResolvedTile && oResolvedTile.tileResolutionResult &&
                oResolvedTile.tileResolutionResult.size) {
                return oResolvedTile.tileResolutionResult.size;
            }
            return "1x1";
        };

        /**
         * Returns the target URL for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @returns {string}
         *  Tile target.
         *  String could be empty.
         */
        this.getTileTarget = function (oTile) {
            var oResolutionResult,
                oResolvedTile = this._mResolvedTiles[oTile.id],
                sTargetUrl;

            if (oResolvedTile && oResolvedTile.tileResolutionResult) {
                oResolutionResult = oResolvedTile.tileResolutionResult;

                if (oResolutionResult.isCustomTile !== true) {
                    // static or dynamic app launcher
                    return oResolvedTile.tileIntent;
                }

                if (oResolutionResult && typeof oResolutionResult.targetOutbound === "object") {
                    // custom tile with a target outbound
                    sTargetUrl = this._toHashFromOutbound(oResolutionResult.targetOutbound);

                    if (sTargetUrl) {
                        return sTargetUrl;
                    }
                }
            }

            jQuery.sap.log.warning(
                "Could not find a target for Tile with id '" + oTile.id + "'",
                "sap.ushell.adapters.cdm.LaunchPageAdapter"
            );
            return "";
        };

        /**
         * Checks if a tile intent is supported
         *
         * @param {object} oTile
         *  Tile object
         * @returns {boolean}
         *  The return value is <code>true</true> if the tile intent is
         *  supported, and <code>false</code> if not.
         */
        this.isTileIntentSupported = function (oTile) {
            return (this._mFailedResolvedTiles[oTile.id] === undefined) ? true : false;
        };

        /**
         * Refreshs a given tile
         *
         * @param {object} oTile
         *  Tile object
         */
        this.refreshTile = function (oTile) {
            // nothing to do here for the moment as we don't have dynamic data
        };

        /**
         * Sets the visibility for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @param {boolean} bNewVisible
         *  New visibility
         */
        this.setTileVisible = function (oTile, bNewVisible) {
            var oResolvedTile = this._mResolvedTiles[oTile.id];

            if (oResolvedTile && oResolvedTile.tileComponent && typeof oResolvedTile.tileComponent.tileSetVisible === "function") {
                // only inform the tile if something changed
                if (oResolvedTile.visibility !== bNewVisible) {
                    oResolvedTile.visibility = bNewVisible;
                    oResolvedTile.tileComponent.tileSetVisible(bNewVisible);
                }
            }
        };

        /**
         * Returns the UI for a given group tile
         *
         * @param {object} oGroupTile
         *  Group tile
         * @returns {jQuery.Promise}
         *  In case of success, the done handler is called with the respective
         *  tile UI. In case of failure a respective error message is passed
         *  to the fail handler which will be called in this case.
         */
        this.getTileView = function (oGroupTile) {
            var oAdapter = this;
            return new jQuery.Deferred(function (oDeferred) {
                return oAdapter._getTileView(oGroupTile, false).then(function (oTileUI) {
                    if (!oTileUI) {
                        oDeferred
                            .reject("Tile view or component could not be initialized");
                    }
                    oDeferred.resolve(oTileUI);
                }, function (reason) {
                    var sErrorMessage = "Tile with ID '" + oGroupTile.id + "' could not be initialized" + (reason ? ":\n" + reason : ".");

                    jQuery.sap.log.error(sErrorMessage, null, oGroupTile.tileType);
                    oDeferred.reject(sErrorMessage);
                });
            });
        };

        this._getResolvedTile = function (oTile, iIndex) {
            var sHash;
            var mSuccessCache = this._mResolvedTiles;
            var mFailureCache = this._mFailedResolvedTiles;

            if (mSuccessCache[oTile.id]) {
                return (new jQuery.Deferred())
                    .resolve(mSuccessCache[oTile.id])
                    .promise();
            }

            sHash = this._prepareTileHash(oTile, iIndex);

            return this._getTileFromHash(sHash).then(
                function (oResolvedTile) {
                    mSuccessCache[oTile.id] = oResolvedTile;

                    if (mFailureCache[oTile.id]) {
                        delete mFailureCache[oTile.id];
                    }

                    return oResolvedTile;
                },
                function (sError) {
                    mFailureCache[oTile.id] = sError;

                    return sError;
                }
            );
        };

        /**
         * Returns the component container including the respective UI
         * component for group and catalog tiles.
         * Helper function for _getCatalogTileView and _getTileView
         * functions. It bundles the common logic for both functions.
         *
         *
         * @param {object} oTile
         *  Group or catalog tile
         * @param {object} oResolvedTile
         *  Resolved group or catalog tile
         * @param {boolean} bIsCatalogTile
         *  Indicates whether the tile is a catalog tile or not
         *
         * @returns {object}
         *  Component container including the respective UI component
         *
         * @private
         */
        this._getTileUiComponentContainer = function (oTile, oResolvedTile, bIsCatalogTile) {
            var that = this,
                sTileTitle,
                sTileTargetUrl,
                oResolutionResult,
                sModulePath,
                sComponentName,
                oTileComponentData,
                oTileComponentInstance;

            // should only be called after tile has been resolved
            if (bIsCatalogTile === true) {
                sTileTitle = that.getCatalogTileTitle(oTile);
                oTileComponentData = that._createTileComponentData(oTile, true);
            } else {
                sTileTitle = that.getTileTitle(oTile);
                oTileComponentData = that._createTileComponentData(oTile, false);
            }

            oResolutionResult = oResolvedTile.tileResolutionResult;

            if (oResolvedTile.isLink) {
                // Do not instantiate the actual tile but only return a Link control
                sTileTargetUrl = that.getTileTarget(oTile);
                return that._createLinkInstance(sTileTitle, sTileTargetUrl);
            }

            if (typeof oResolutionResult.tileComponentLoadInfo === "string") {
                // This is a Static or Dynamic App Launcher
                // Consider also the indicatorDataSource from oTile, even if none is set in
                // oResolutionResult. This is done by using oTileComponentData instead of oResolutionResult
                if (oTileComponentData.properties.indicatorDataSource &&
                    oTileComponentData.properties.indicatorDataSource.path) {
                    // Dynamic App launcher
                    sComponentName = "sap.ushell.components.tiles.cdm.applauncherdynamic";
                } else {
                    // Static App Launcher
                    sComponentName = "sap.ushell.components.tiles.cdm.applauncher";
                }
            } else if (typeof oResolutionResult.tileComponentLoadInfo === "object") {
                // Custom tile
                sComponentName = oResolutionResult.tileComponentLoadInfo.componentName;
                sModulePath = oResolutionResult.tileComponentLoadInfo.url;

                if (sComponentName && sModulePath) {
                    jQuery.sap.registerModulePath(sComponentName, sModulePath);
                }
            }

            if (sComponentName) {
                var oCompContainer =  new sap.ui.core.ComponentContainer({
                    component: sap.ui.getCore().createComponent({
                        componentData: oTileComponentData,
                        name: sComponentName
                    })
                });

                oTileComponentInstance = oCompContainer.getComponentInstance();
                if (bIsCatalogTile === true) {
                    that._mResolvedCatalogTiles[oTile.id].tileComponent = oTileComponentInstance;
                } else {
                    that._mResolvedTiles[oTile.id].tileComponent = oTileComponentInstance;
                }

                return oCompContainer;
            }

            return null;
        };

        /**
         * Returns the UI for a given tile.
         *
         * @param {object} oGroupTile
         *  Group tile
         *
         * @returns {jQuery.Deferred}
         *  On success, returns a promise that resolves to tile UI or null (when component name is unknown).
         *  Or rejects when tile data cannot be accessed successfully.
         *
         * @private
         */
        this._getTileView = function (oGroupTile) {
            var that = this,
                oTileDataPromise,
                sTileHash,
                oTileViewComponent,
                sErrorMessage,
                oDeferred = new jQuery.Deferred();

            if (typeof oGroupTile !== "object" || !oGroupTile.id) {
                sErrorMessage = "Invalid input parameter passed to _getTileView: " + oGroupTile;
                jQuery.sap.log.error(sErrorMessage);
                return oDeferred.reject(sErrorMessage).promise();
            }

            sTileHash = this._prepareTileHash(oGroupTile);

            oTileDataPromise = (oGroupTile.id && this._mResolvedTiles[oGroupTile.id])
            || this._getTileFromHash(sTileHash);

            jQuery.when(oTileDataPromise).then(function (oResolvedTile) {
                if (that._mResolvedTiles.hasOwnProperty(oGroupTile.id) === false) {
                    that._mResolvedTiles[oGroupTile.id] = oResolvedTile;
                }

                try {
                    oTileViewComponent = that._getTileUiComponentContainer(oGroupTile, oResolvedTile, false);
                } catch (oError) {
                    oDeferred.reject(oError.message);
                }
                oDeferred.resolve(oTileViewComponent);
            });

            return oDeferred.promise();
        };

        /**
         * Returns the UI for a given catalog tile.
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         *
         * @returns {object}
         *  Catalog tile view of given catalog tile
         *
         * @private
         */
        this._getCatalogTileView = function (oCatalogTile) {
            if (typeof oCatalogTile !== "object") {
                throw new Error(oCatalogTile);
            }

            // As catalog tiles are already passed as resolved catalog tiles,
            // we do not distinguish between the unresolved and resolved variant
            // as part of the following call.
            return this._getTileUiComponentContainer(oCatalogTile, oCatalogTile, true);
        };

        /**
         * Creates the component data needed to instantiate tiles
         *
         * @param {object} oTile
         *  tile to create the component data for
         *  @param {boolean} bIsCatalogTile True, if given tile is a catalog tile.
         */
        this._createTileComponentData = function (oTile, bIsCatalogTile) {
            var sTitle = bIsCatalogTile ? this.getCatalogTileTitle(oTile) : this.getTileTitle(oTile),
                sSubTitle = bIsCatalogTile ? this.getCatalogTilePreviewSubtitle(oTile) : this.getTileSubtitle(oTile),
                sIcon = bIsCatalogTile ? this.getCatalogTilePreviewIcon(oTile) : this.getTileIcon(oTile),
                sTarget = bIsCatalogTile ? this.getCatalogTileTargetURL(oTile) : this.getTileTarget(oTile),
                oIndicatorDataSource = this.getTileIndicatorDataSource(oTile),
                oComponentData = {
                    properties: {},
                    startupParameters: {}
                };

            if (sTitle) {
                oComponentData.properties.title = sTitle;
            }
            if (sSubTitle) {
                oComponentData.properties.subtitle = sSubTitle;
            }
            if (sIcon) {
                oComponentData.properties.icon = sIcon;
            }
            if (sTarget) {
                oComponentData.properties.targetURL = sTarget;
            }
            if (oIndicatorDataSource.indicatorDataSource) {
                oComponentData.properties.indicatorDataSource =
                    oIndicatorDataSource.indicatorDataSource;

                // data source is only relevant if the indicatorDataSource is present as well
                if (oIndicatorDataSource.dataSource) {
                    oComponentData.properties.dataSource =
                        oIndicatorDataSource.dataSource;
                }
            }

            return oComponentData;
        };

        /**
         * Creates a link instance for the given tile
         *
         * @param {string} sTitle
         *  The title serves as text for the link
         * @param {s} sUrl
         *  tThe URL serves as HREF for the link.
         * @returns {object}
         *  Link object
         *
         * @private
         */
        this._createLinkInstance = function (sTitle, sUrl) {
            //TODO error handling for sTitle
            var oSettings = {
                text: sTitle
            };

            if (typeof sUrl === "string" && sUrl !== "") {
                oSettings.href = sUrl;
            } else {
                // Link shall be displayed as disabled, as it has no URL
                oSettings.enabled = false;
            }

            return new sap.m.Link(oSettings);
        };

        this._addTileToSite = function (oPersonalizedSite, oGroup, newTile, oCdmSiteService) {
            // TODO JSDoc
            // TODO consider to change the interface so it is not needed to pass newTile
            //  which should be created inside this method
            var that = this,
                oDeferred = new jQuery.Deferred(),
                oIntent = sap.ushell.Container.getService("URLParsing").parseShellHash(newTile.properties.targetURL),
                oTileToBeAdded = {
                    "id": that.getTileId(newTile),
                    "target": {
                        "semanticObject": oIntent.semanticObject,
                        "action": oIntent.action,
                        "parameters": createTileParametersFromIntentParams(oIntent.params)
                    }
                };

            oPersonalizedSite.groups[oGroup.identification.id].payload.tiles.push(oTileToBeAdded);

            //store personalization
            oCdmSiteService.save()
                .done(function () {
                    oDeferred.resolve(oTileToBeAdded);
                })
                .fail(function (sMessage) {
                    oDeferred.reject(sMessage);
                });

            return oDeferred.promise();
        };

        /**
         * Adds a tile to the homepage. Furthermore the personalization will be
         * persisted for the end user.
         *
         * @param {object} oCatalogTile
         *  Catalog Tile
         * @param {object} oGroup
         *  Group object
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the tile has been added successfully.
         *  The new tile itself will be passed to the promise's done handler in case of
         *  success. In case of failure, the fail handler will be called with a respective
         *  error message.
         */
        this.addTile = function (oCatalogTile, oGroup) {
            if (!oGroup) {
                oGroup = _oDefaultGroup;
            }

            var oDeferred = new jQuery.Deferred(),
                that = this,
                sGenericErrorMessage;

            // in the process of adding a catalog tile to the group, we resolve the tile
            var sHash = that.getCatalogTileTargetURL(oCatalogTile); // TODO check escaping

            var oUrlParsing = sap.ushell.Container.getService("URLParsing");
            var oIntent = oUrlParsing.parseShellHash(sHash);
            var oTile = composeNewTile(
                {}, // oParameters
                createNewTargetFromIntent(oIntent)
            );

            sGenericErrorMessage = "Failed to add tile with id '" + oTile.id +
                "' to group with id '" + oGroup.identification.id + "'. ";

            that._getTileFromHash(sHash)
                .fail(function (sErrorMsg) {
                    that._mFailedResolvedTiles[oTile.id] = sErrorMsg;
                })
                .done(function (newTile) {
                    // add new tile to list of resolved tiles
                    that._mResolvedTiles[oTile.id] = newTile;


                    var oCdmSiteService = sap.ushell.Container.getService("CommonDataModel");
                    // change title in site object

                    oCdmSiteService.getSite()
                        .done(function (oSite) {
                            // We should think about the reasons why it's not safe to
                            // do the following, even though it's more succint:
                            //     oGroup.payload.tiles.push(oTile);
                            oSite.groups[oGroup.identification.id].payload.tiles.push(oTile);

                            oCdmSiteService.save()
                                .done(function () {
                                    oDeferred.resolve(oTile);
                                })
                                .fail(function (sReason) {
                                    oDeferred.reject(sReason);
                                });
                        })
                        .fail(function (sError) {
                            oDeferred.reject(sGenericErrorMessage + sError);
                        });
                });

            return oDeferred.promise();
        };

        /**
         * Removes a tile from a given group on the homepage. Furthermore the personalization will be
         * persisted for the end user.
         *
         * @param {object} oGroup
         *  Group object
         * @param {object} oTile
         *  Tile object
         * @param {number} iIndex
         *  Index of the given tile in the respective group
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the tile has been removed successfully.
         *  In case of failure, the fail handler will be called with a collection of existing groups.
         */
        this.removeTile = function (oGroup, oTile, iIndex) {
            var oCdmSiteService,
                sGenericErrorMessage,
                oDeferred = new jQuery.Deferred();

            if (!oGroup || typeof oGroup !== "object" || !oGroup.identification || !oGroup.identification.id ||
                    !oTile || typeof oTile !== "object" || !oTile.id) {
                return oDeferred.reject({}, "Failed to remove tile. No valid input parameters passed to removeTile method.").promise();
            }

            sGenericErrorMessage = "Failed to remove tile with id '" + oTile.id + "' from group with id '" + oGroup.identification.id + "'. ";

            oCdmSiteService = sap.ushell.Container.getService("CommonDataModel");
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    var oPayload;

                    // Succintly convert iIndex to number
                    iIndex = +iIndex;

                    try {
                        oPayload = oSite.groups[oGroup.identification.id].payload;
                    } catch (e) {
                        oDeferred.reject(oSite.groups[oGroup.identification.id], sGenericErrorMessage);
                    }

                    if (iIndex >= 0) {
                        // remove tile in group
                        oPayload.tiles.splice(iIndex, 1);
                    } else {
                        oPayload.tiles = oPayload.tiles.filter(function (oGroupTile) {
                            return oGroupTile.id !== oTile.id;
                        });
                    }

                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve();
                        })
                        .fail(function (sErrorMsg) {
                            jQuery.sap.log.error(sErrorMsg);
                            oDeferred.reject(oSite.groups[oGroup.identification.id], sErrorMsg);
                        });
                })
                .fail(function (sError) {
                    // Reject an empty group object, as site with correct group data could not get accessed
                    oDeferred.reject({}, sGenericErrorMessage + sError);
                });

            return oDeferred.promise();
        };

        /**
         * Moves a tile within a certain group or across different groups
         * on the homepage
         *
         * @param {object} oTile
         *  Tile to be moved
         * @param {number} iSourceIndex
         *  Position index of tile in source group
         * @param {number} iTargetIndex
         *  Aimed position index of tile in target group
         * @param {object} oSourceGroup
         *  Source group which currently contains the tile
         * @param {object} oTargetGroup
         *  Aimed target group where the tile should be moved to
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the tile has been removed successfully.
         *  In case of failure, the fail handler will be called with a collection of existing groups.
         */
        this.moveTile = function (oTile, iSourceIndex, iTargetIndex, oSourceGroup, oTargetGroup) {
            // TODO Write test, Write error handling
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = sap.ushell.Container.getService("CommonDataModel"),
                aGroupTiles,
                sGenericErrorMessage;

            if (!oTile || jQuery.isEmptyObject(oTile) ||
                iSourceIndex === undefined || iSourceIndex < 0 ||
                iTargetIndex === undefined || iTargetIndex < 0 ||
                !oSourceGroup || !oSourceGroup.identification || !oSourceGroup.identification.id ||
                !oTargetGroup || !oTargetGroup.identification || !oTargetGroup.identification.id) {
                return oDeferred.reject("Invalid input parameters").promise();
            }

            sGenericErrorMessage = "Failed to move tile with id '" + oTile.id + "'. ";

            oCdmSiteService.getSite()
                .done(function (oSite) {
                    // check for move operation within a group or across different groups
                    if (oSourceGroup.identification.id === oTargetGroup.identification.id) {
                        // within a group
                        if (iSourceIndex !== iTargetIndex) {
                            aGroupTiles = oSite.groups[oTargetGroup.identification.id].payload.tiles;
                            aGroupTiles.splice(iSourceIndex, 1); // remove tile at source index
                            aGroupTiles.splice(iTargetIndex, 0, oTile); // add tile at target index
                        } else {
                            // no move operation took place
                            return oDeferred.resolve(oTile).promise();
                        }
                    } else {
                        // across different groups
                        oSite.groups[oSourceGroup.identification.id].payload.tiles.splice(iSourceIndex, 1); // remove tile in source group
                        oSite.groups[oTargetGroup.identification.id].payload.tiles.splice(iTargetIndex, 0, oTile); // add tile to target group
                    }

                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve(oTile);
                        })
                        .fail(function (sErrorMsg0) {
                            // TODO Write test
                            jQuery.sap.log.error(sErrorMsg0);
                            oCdmSiteService.getSite()
                                .done(function (oSite0) {
                                    oDeferred.reject(oSite0.groups, sErrorMsg0);
                                })
                                .fail(function (sErrorMsg1) {
                                    // TODO Write test
                                    jQuery.sap.log.error(sErrorMsg1);
                                    // reject with error message instead of groups,
                                    // because site could not be requested
                                    oDeferred.reject([], sErrorMsg1);
                                });
                        });
                })
                .fail(function (sError) {
                    oDeferred.reject([], sGenericErrorMessage + sError);
                });

            return oDeferred.promise();
        };

        /**
         * Requests a collection of catalogs. The catalogs get extracted out of
         * the Common Data Model site. Consumers of this method have the
         * opportunity to attach a progress handler to the returned jQuery
         * Promise to get notified for each catalog once it got processed.
         * The argument of the attached progress handler will be the respective
         * catalog object.
         *
         * @returns {jQuery.Promise}
         *  In case of success the done handler will be called with an array of
         *  catalog objects. In case of failure the fail handler will be called
         *  with a respective error message. No assumption should be made on
         *  the order with which the catalogs are returned.
         */
        this.getCatalogs = function () {
            var oDeferred = new jQuery.Deferred(),
                aCatalogs = [],
                oCDMSiteService = sap.ushell.Container.getService("CommonDataModel");

            // setTimeout is required here. Otherwise the the oDeferred.notify() would
            // be a synchrounous call, which would cause wrong behaviour in some scenarios
            window.setTimeout(function () {
                oCDMSiteService.getSite().done(function (oSite) {
                    Object.keys(oSite.catalogs).forEach(function (sCatalogName) {
                        var oCatalog = oSite.catalogs[sCatalogName];
                        oCatalog.id = sCatalogName;
                        aCatalogs.push(oCatalog);
                        oDeferred.notify(oCatalog);
                    });

                    // In our tests we use indices to access specific catalogs
                    // from the getCatalogs response. For this reason we are
                    // sorting the result. As stated in the documentation, this
                    // shouldn't really matter for the caller. The caller
                    // should not code against a specific sort order!
                    oDeferred.resolve(aCatalogs.sort(function (oA, oB) {
                        return oA.identification.id - oB.identification.id;
                    }));
                });
            }, 0);
            return oDeferred.promise();
        };

        /**
         * Test whether an inbound is potentially startable, e.g. has not  an obvious
         * filter.
         *
         * @param {object} oInbound
         *  An inbound
         * @returns {boolean}
         *  Indicates whether the inbound appears as startable
         *
         * @private
         */
        this._isStartableInbound = function (oInbound) {
            if (!jQuery.sap.getObject("signature.parameters", undefined, oInbound)) {
                return true;
            }
            var bRes = Object.keys(oInbound.signature.parameters).every(function (sParameter) {
                // there is a special modelling that an exported tile pointing to a URL
                // is matched by exactly this inbound with a plain filter.
                // The export models tiles in this way (Shell-startUrl), however, generically
                // enabling to display values with a filter would bring up tiles which are
                // explicitely "filtered out" by requiring filters
                return !oInbound.signature.parameters[sParameter].filter
                    || (sParameter === "sap-external-url");
            });
            return bRes;
        };

        this._isHiddenInbound = function (oInbound) {
            return !!oInbound.hideLauncher;
        };

        /**
         * Constructs an inner shell hash for an inbound which represents a hash.
         * This includes the hash, e.g. #SO-action?abc=def
         *
         * @param {object} oInbound
         *  Inbound which gets used to construct the hash
         *
         * @returns {string}
         *  Constructed Hash (with prefix '#')
         *
         * @private
         */
        this._toHashFromInbound = function (oInbound) {
            var oShellHash,
                oParams,
                sConstructedHash;

            oShellHash = {
                target: {
                    semanticObject: oInbound.semanticObject,
                    action: oInbound.action
                },
                params: {}
            };

            oParams = jQuery.sap.getObject("signature.parameters", undefined, oInbound) || {};

            Object.keys(oParams).forEach(function (sKey) {
                if (oParams[sKey].filter && Object.prototype.hasOwnProperty.call(oParams[sKey].filter, "value") &&
                    (oParams[sKey].filter.format === undefined || oParams[sKey].filter.format === "plain")) {
                    oShellHash.params[sKey] = [oParams[sKey].filter.value];
                }

                if (oParams[sKey].launcherValue && Object.prototype.hasOwnProperty.call(oParams[sKey].launcherValue, "value") &&
                        (oParams[sKey].launcherValue.format === undefined || oParams[sKey].launcherValue.format === "plain")) {
                        oShellHash.params[sKey] = [oParams[sKey].launcherValue.value];
                    }
            });

            sConstructedHash = sap.ushell.Container.getService("URLParsing").constructShellHash(oShellHash);

            if (!sConstructedHash) {
                return undefined;
            }
            return "#" + sConstructedHash;
        };

        /**
         * Constructs an inner shell hash for an outbound which represents a hash.
         * This includes the hash, e.g. #SO-action?abc=def
         *
         * @param {object} oOutbound
         *  Outbound which gets used to construct the hash
         *
         * @returns {string}
         *  Constructed Hash (with prefix '#')
         *
         * @private
         */
        this._toHashFromOutbound = function (oOutbound) {
            var oShellHash,
                oParams,
                sConstructedHash;

            oShellHash = {
                target: {
                    semanticObject: oOutbound.semanticObject,
                    action: oOutbound.action
                },
                params: {}
            };

            oParams = oOutbound.parameters || {};

            Object.keys(oParams).forEach(function (sKey) {
                if (oParams.hasOwnProperty(sKey) && oParams[sKey].value !== undefined) {
                    oShellHash.params[sKey] = [oParams[sKey].value];
                }
            });

            sConstructedHash = sap.ushell.Container.getService("URLParsing").constructShellHash(oShellHash);

            if (!sConstructedHash) {
                return undefined;
            }
            return "#" + sConstructedHash;
        };

        /**
         * Checks if an application represents a custom tile
         * @param {object} oApplication
         *  An AppDescriptor subset
         * @returns {boolean}
         *  Indicates whether the application represents a custom tile or not
         *
         * @private
         */
        this._isCustomTile = function (oApplication) {
            if (sap.ushell.utils.getMember(oApplication, "sap|flp.type") === "tile") {
                return true;
            }
            return false;
        };

        /**
         * Delivers the catalog tiles for a given catalog
         *
         * @param {object} oCatalog
         *  Catalog
         * @returns {jQuery.Promise}
         *  In case of success the done handler will be called with an array
         *  of catalog tiles.
         */
        this.getCatalogTiles = function (oCatalog) {
            var that = this,
                oDeferred = new jQuery.Deferred(),
                oCDMSiteService,
                aCatalogTiles = [],
                aCatalogTilePromises = [],
                oTilePromise;

            if (typeof oCatalog !== "object") {
                return oDeferred.reject("Invalid input parameter '" + oCatalog + "' passed to getCatalogTiles.").promise();
            }

            oCDMSiteService = sap.ushell.Container.getService("CommonDataModel");
            oCDMSiteService.getSite().done(function (oSite) {
                oCatalog.payload = oCatalog.payload || {};
                // find all intents which can be started, represent them as tiles.
                (oCatalog.payload.appDescriptors || []).forEach(function (oAppID) {
                    var oApplication = oSite.applications[oAppID.id];

                    var oInbounds = that._getMember(oApplication, "sap|app.crossNavigation.inbounds") || {},
                        mInboundIntents = {};

                    Object.keys(oInbounds).forEach(function (sKey) {
                        var oInbound = oInbounds[sKey],
                            sTargetUrl = that._toHashFromInbound(oInbound, oApplication);

                        // If the application has multiple inbounds defined and some of them
                        // share the same combination of semantic object and action,
                        // just one tile should be displayed. Different parameters as part
                        // of the signature do not influence this behaviour.
                        // Note: Multiple equal inbounds accross different applications will
                        // result in multiple tiles, which in the end resolve to the same application.
                        if (mInboundIntents.hasOwnProperty(oInbound.semanticObject + "-" + oInbound.action)) {
                            return;
                        } else {
                            mInboundIntents[oInbound.semanticObject + "-" + oInbound.action] = oInbound;
                        }

                        // Check for whether the inbound is startable or not and
                        // whether the inbound has the 'hideLauncher' flag attached or not
                        if (that._isStartableInbound(oInbound) && !that._isHiddenInbound(oInbound)) {
                            if (that._mResolvedCatalogTiles) {
                                if (!that._mResolvedCatalogTiles[sTargetUrl] &&
                                        !that._mFailedResolvedCatalogTiles[sTargetUrl]) {
                                    // Tile is not yet resolved
                                    oTilePromise = that._getTileFromHash(sTargetUrl);
                                    aCatalogTilePromises.push(oTilePromise);
                                    oTilePromise
                                        .done(function (oResolvedTile) {
                                            oResolvedTile.id = sTargetUrl;
                                            aCatalogTiles.push(oResolvedTile);
                                            // add new tile to list of resolved tiles
                                            that._mResolvedCatalogTiles[sTargetUrl] = oResolvedTile;
                                        })
                                        .fail(function (sErrorMessage0) {
                                            jQuery.sap.log.error(
                                                sErrorMessage0,
                                                "sap.ushell.adapters.cdm.LaunchPageAdapter"
                                            );
                                            that._mFailedResolvedCatalogTiles[sTargetUrl] = sErrorMessage0;
                                        });
                                } else {
                                    // In case the tile has been already resolved via CSTR, we create a promise
                                    // which directly resolves to the respective resolved tile
                                    oTilePromise = new jQuery.Deferred()
                                        .resolve(that._mResolvedCatalogTiles[sTargetUrl]).promise();
                                    aCatalogTilePromises.push(oTilePromise);
                                    oTilePromise.done(function (oResolvedTile) {
                                        aCatalogTiles.push(oResolvedTile);
                                    });
                                }
                            }
                        }
                    });
                });

                that._allPromisesDone(aCatalogTilePromises)
                    .done(function () {
                        oDeferred.resolve(aCatalogTiles);
                    })
                    .fail(function (sErrorMessage1) {
                        if (oCatalog.identification && oCatalog.identification.id) {
                            oDeferred.reject("Failed to deliver tiles for catalog '" +
                                oCatalog.identification.id + "'. " + sErrorMessage1);
                        }
                    });
            }).
            fail(function (sErrorMessage2) {
                oDeferred.reject("Failed to get site: " + sErrorMessage2);
            });
            return oDeferred.promise();
        };

        /**
         * Returns the catalog's technical error message in case it could not be loaded.
         * <p>
         * <b>Beware:</b> The technical error message is not translated!
         *
         * @param {object} oCatalog
         *  Catalog
         * @returns {string}
         *  Technical error message or <code>undefined</code> if the catalog was loaded
         *  properly
         */
        this.getCatalogError = function (oCatalog) {
            // TODO implement
            return undefined;
        };

        /**
         * Returns the ID for a given catalog
         *
         * @param {object} oCatalog
         *  Catalog object
         * @returns {string}
         *  Catalog ID
         */
        this.getCatalogId = function (oCatalog) {
            return oCatalog.identification.id;
        };

        /**
         * Returns the title for a given catalog
         *
         * @param {object} oCatalog
         *  Catalog object
         * @returns {string}
         *  Catalog title
         */
        this.getCatalogTitle = function (oCatalog) {
            return oCatalog.identification.title;
        };

        this._isGroupTile = function (oTile) {
            return !!(oTile && oTile.id && oTile.target);
        };

        this._isCatalogTile = function (oTile) {
            return !!(oTile && oTile.id && oTile.tileIntent && oTile.tileResolutionResult);
        };

        this._isFailedGroupTile = function (oTile) {
            return !!(oTile && this._mFailedResolvedTiles &&
                this._mFailedResolvedTiles[oTile.id]);
        };

        this._isFailedCatalogTile = function (oTile) {
            return !!(oTile && this._mFailedResolvedCatalogTiles &&
                this._mFailedResolvedCatalogTiles[oTile.id]);
        };

        /*eslint-disable no-lonely-if*/
        /**
         * Returns the catalog tile id for a given group tile or catalog tile
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         *
         * @returns {string}
         *  ID of respective group tile or catalog tile.
         *  In case the id could not be determined for group tiles,
         *  <code>undefined<code> is returned.
         */
        this.getCatalogTileId = function (oGroupTileOrCatalogTile) {
            if (this._isGroupTile(oGroupTileOrCatalogTile)) {
                if (this._isFailedGroupTile(oGroupTileOrCatalogTile)) {
                    return undefined;
                }
                // the hash of the group tile is the id of the catalog tile
                return this._mResolvedTiles[oGroupTileOrCatalogTile.id].tileIntent;
            }

            if (this._isCatalogTile(oGroupTileOrCatalogTile)) {
                return oGroupTileOrCatalogTile.id;
            }
        };
        /*eslint-enable no-lonely-if*/

        /**
         * Returns the catalog tile title for a given tile (group or catalog tile)
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {string}
         *  Title of respective group tile or catalog tile.
         *  In case the title could not be determined,
         *  <code>""<code> is returned.
         */
        this.getCatalogTileTitle = function (oGroupTileOrCatalogTile) {
            if (this._isGroupTile(oGroupTileOrCatalogTile)) {
                if (this._isFailedGroupTile(oGroupTileOrCatalogTile)) {
                    return "";
                }
                // the hash of the group tile is the id of the catalog tile
                return this._mResolvedTiles[oGroupTileOrCatalogTile.id].tileResolutionResult.title;
            }

            if (this._isCatalogTile(oGroupTileOrCatalogTile)) {
                if (this._isFailedCatalogTile(oGroupTileOrCatalogTile)) {
                    return undefined;
                }
                return oGroupTileOrCatalogTile.tileResolutionResult.title;
            }
        };

        /**
         * Returns the size for a given catalog tile
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         * @returns {string}
         *  Size of given catalog tile
         */
        this.getCatalogTileSize = function (oCatalogTile) {
            //TODO getTileSize may not be applicable!
            return this.getTileSize(oCatalogTile);
        };

        /**
         * Returns the UI for a given catalog tile
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         * @returns {object}
         *  UI (tile view) of given catalog tile
         */
        this.getCatalogTileView = function (oCatalogTile) {
            return this._getCatalogTileView(oCatalogTile);
        };

        /**
         * Returns the catalog tile target url for a given tile (group or catalog tile)
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {string}
         *  Target URL of respective catalog tile
         */
        this.getCatalogTileTargetURL = function (oGroupTileOrCatalogTile) {
            // The target is used as an id for catalog tiles
            return this.getCatalogTileId(oGroupTileOrCatalogTile);
        };

        /**
         * Returns the preview title for a given catalog tile
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         * @returns {string}
         *  Preview title of given catalog tile
         */
        this.getCatalogTilePreviewTitle = function (oCatalogTile) {
            return (oCatalogTile.tileResolutionResult &&
                oCatalogTile.tileResolutionResult.title) || "";
        };

        /**
         * Returns the preview subTitle for a given catalog tile
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         * @returns {string}
         *  Preview subtitle of given catalog tile
         */
        this.getCatalogTilePreviewSubtitle = function (oCatalogTile) {
            return (oCatalogTile.tileResolutionResult &&
                oCatalogTile.tileResolutionResult.subTitle) || "";
        };

        /**
         * Returns the preview icon for a given catalog tile
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         * @returns {string}
         *  Preview icon of given catalog tile
         */
        this.getCatalogTilePreviewIcon = function (oCatalogTile) {
            return (oCatalogTile.tileResolutionResult &&
                oCatalogTile.tileResolutionResult.icon) || "";
        };

        /**
         * Returns the keywords for a given tile (group or catalog tile)
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {array}
         *  Keywords of respective catalog tile
         */
        this.getCatalogTileKeywords = function (oGroupTileOrCatalogTile) {
            var aKeywords = [],
                oResolvedTile = oGroupTileOrCatalogTile;

            if (!oResolvedTile) {
                jQuery.sap.log.error(
                        "Could not find the Tile",
                        "sap.ushell.adapters.cdm.LaunchPageAdapter"
                    );
                return aKeywords;
            }

            if (this._mResolvedTiles && this._mResolvedTiles[oGroupTileOrCatalogTile.id]) {
                // input tile is a group tile
                oResolvedTile = this._mResolvedTiles[oGroupTileOrCatalogTile.id];
            }

            // Keywords from catalog tile
            if (oResolvedTile && oResolvedTile.tileResolutionResult &&
                    oResolvedTile.tileResolutionResult.title) {
                aKeywords.push(oResolvedTile.tileResolutionResult.title);
            }
            if (oResolvedTile && oResolvedTile.tileResolutionResult &&
                    oResolvedTile.tileResolutionResult.subTitle) {
                aKeywords.push(oResolvedTile.tileResolutionResult.subTitle);
            }

            return aKeywords;
        };

        /**
         * Counts <b>all</b> bookmarks pointing to the given URL from all of the user's groups.
         * The count is performed by visiting each matching bookmark and executing the optional
         * visitor procedure if it was provided. This method can be used to check if a bookmark
         * already exists. It will return a promise that resolves to a number greater than zero
         * if a bookmark exists.
         * <p>
         * This is a potentially asynchronous operation in case the user's groups have not yet been
         * loaded completely!
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be counted, exactly as specified to {@link #addBookmark}.
         * @param {function} [fnVisitor]
         *   For each bookmark tile that matches the given url, this function will be called with
         *   the respective tile as argument.
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation. In case of success, the count of existing bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         *
         * @see #countBookmark
         * @see #addBookmark
         *
         * @private
         */
        this._visitBookmarks = function (sUrl, fnVisitor) {
            var oContainer = sap.ushell.Container;
            var oUrlParser = oContainer.getService("URLParsing");
            var oCDM = oContainer.getService("CommonDataModel");

            var oReferenceTarget = createNewTargetFromIntent(oUrlParser.parseShellHash(sUrl));

            return oCDM.getSite().then(function (oSite) {
                var oGroups = oSite.groups;

                var aTiles = Object.keys(oGroups)
                    .filter(function (sKey) {
                        // Always ignore locked groups.
                        return !oGroups[sKey].payload.locked;
                    })
                    .map(function (sKey) {
                        return oGroups[sKey].payload.tiles.filter(function (oTile) {
                            // Consider only matching bookmark tiles.
                            return oTile.isBookmark && isSameTarget(oReferenceTarget, oTile.target);
                        });
                    })
                    .reduce(function (aAllTiles, aCurrentGroupTiles) {
                        Array.prototype.push.apply(aAllTiles, aCurrentGroupTiles);
                        return aAllTiles;
                    }, []);

                if (!fnVisitor) {
                    return aTiles.length;
                }

                return jQuery.when(aTiles.map(fnVisitor)).then(function () {
                    return aTiles.length;
                });
            });
        };

        /**
         * Adds a bookmark to the user's home page.
         * Given a specific group the bookmark is added to the group,
         * otherwise it's added to the default group on the user's home page.
         *
         * @param {object} oParameters
         *   Bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *   <p>
         *   The <code>oParameters.dataSource</code> property always shadows <code>oParameters.serviceUrl</code>.
         *   So if both are provided, the former is used and the later ignored. In essence, note that
         *   <code>oParameters.serviceUrl</code> is marked for eventual deprecation.
         *
         * @param {string} oParameters.title
         *   The title of the bookmark.
         * @param {string} oParameters.url
         *   The URL of the bookmark. If the target application shall run in the Shell the URL has
         *   to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>
         * @param {string} [oParameters.icon]
         *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info]
         *   The optional information text of the bookmark. This is a legacy property
         *   and is not applicable in CDM context.
         * @param {string} [oParameters.subtitle]
         *   The optional subtitle of the bookmark.
         *
         * @param {object} [oParameters.dataSource]
         *   This object describes settings for reaching the service the service
         *   that provides dynamic information for the bookmark. This property,
         *   together with the <code>serviceUrlPath</code> are the accepted means
         *   for specifying the location of the dynamic data resource.
         * @param {string} [oParameters.dataSource.uri]
         *   The base URL to the REST or OData service.
         * @param {string} [oParameters.dataDource.type]
         *   The type of the service e.g. "OData".
         * @param {object} [oParameters.dataDource.Settings]
         *   In-depth details of the data source service.
         * @param {string} [oParameters.dataSource.Settings.odataVersion]
         *   The version of oData implementation the service is based on.
         * @param {string} [oParameters.dataSource.Settings.annotations]
         * @param {string} [oParameters.dataSource.Settings.localUri]
         * @param {number} [oParameters.dataSource.Settings.maxAge]
         *
         * @param {string} [oParameter.serviceUrlPath]
         *   The path to the service method/action that actually returns the dynamic
         *   information.
         * @param {string} [oParameters.serviceRefreshInterval]
         *   The refresh interval for the <code>serviceUrl</code> in seconds.
         *
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information
         *   for the bookmark.
         *   The <code>dataSource</code> property is the preferred interface for
         *   defining where and how the dynamic data is fetched. This property
         *   remains for legacy reasons. Going forward, you are highly discouraged
         *   from utilising this property.
         * @param {string} [oParameters.numberUnit]
         *   The unit for the number retrieved from <code>serviceUrl</code>. This
         *   is a legacy property and is not applicable in CDM context.
         *
         * @param {object} [oGroup]
         *   Reference to the group the bookmark should be added to.
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> promise which resolves on success, but rejects
         *   (with a reason-message) on failure to add the bookmark to the specified or implied group.
         *
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.42.0
         * @public
         */
        this.addBookmark = function (oParameters, oGroup) {
            var oThisAdapter = this;

            return new jQuery.Deferred(function (oDeferred) {
                var oContainer = sap.ushell.Container;
                var oUrlParsing = oContainer.getService("URLParsing");
                var oCdmSiteService = oContainer.getService("CommonDataModel");

                jQuery.when(oGroup || oThisAdapter.getDefaultGroup(), oCdmSiteService.getSite())
                    .done(function (oGroup, oSite) {
                        var oTile;
                        var oIntent = oUrlParsing.parseShellHash(oParameters.url);

                        if (!oIntent) {
                            oDeferred.reject("Failed to parse bookmark URL.");

                            return;
                        }

                        oTile = composeNewBookmarkTile(
                            oParameters,
                            createNewTargetFromIntent(oIntent)
                        );

                        oSite.groups[oGroup.identification.id].payload.tiles.push(oTile);

                        oCdmSiteService.save()
                            .done(function () {
                                oDeferred.resolve(oTile);
                            })
                            .fail(function (sReason) {
                                oDeferred.reject(sReason);
                            });
                    })
                    .fail(function (sReason) {
                        oDeferred.reject(sReason);
                    });
            }).promise();
        };

        /**
         * Counts <b>all</b> bookmarks pointing to the given URL from all of the user's groups. You
         * can use this method to check if a bookmark already exists.
         * <p>
         * This is a potentially asynchronous operation in case the user's groups have not yet been
         * loaded completely!
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be counted, exactly as specified to {@link #addBookmark}.
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation. In case of success, the count of existing bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         *
         * @see #addBookmark
         * @private
         */
        this.countBookmarks = function (sUrl) {
            return this._visitBookmarks(sUrl);
        };

        /**
         * Updates <b>all</b> bookmarks pointing to the given URL in all of the user's groups
         * with the given new parameters. Parameters which are omitted are not changed in the
         * existing bookmarks.
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be updated, exactly as specified to {@link #addBookmark}.
         *   In case you need to update the URL itself, pass the old one here and the new one as
         *   <code>oParameters.url</code>!
         * @param {object} oParameters
         *   The bookmark parameters as documented in {@link #addBookmark}.
         *   <p>
         *   If it is desired to remove the dynamic nature of the bookmark,
         *   set either <code>oParameters.dataSource</code> or <code>oParameters.serviceUrl</code> to null.
         *   <p>
         *   The <code>oParameters.dataSource</code> property always shadows <code>oParameters.serviceUrl</code>.
         *   So if both are provided, the former is used and the later ignored. Trying to update
         *   <code>oParameters.dataSource</code> with <code>oParameters.serviceUrl</code> results
         *   in a warning.
         *   <p>
         *   In essence, note that <code>oParameters.serviceUrl</code> is marked for eventual deprecation.
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation.  In case of success, the number of updated bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         *
         * @see #addBookmark
         * @see #countBookmarks
         * @see #deleteBookmarks
         *
         * @since 1.42.0
         */
        this.updateBookmarks = function (sUrl, oParameters) {
            var oContainer = sap.ushell.Container;
            var oUrlParsing = oContainer.getService("URLParsing");
            var oCdmSiteService = oContainer.getService("CommonDataModel");

            var mResolvedTiles = this._mResolvedTiles;

            // Visitor function that updates each encountered bookmark tile as necessary.
            function updateEach(oTile) {
                return new jQuery.Deferred(function (oDeferred) {
                    var oIntent, oNewTarget;

                    var oTileComponent;
                    var bTileViewPropertiesChanged = false;
                    var oChangedTileViewProperties = Object.create(null);

                    if (oParameters.url || oParameters.url === "") {
                        oIntent = oUrlParsing.parseShellHash(oParameters.url);

                        if (!oIntent) {
                            oDeferred.reject("Failed to parse bookmark URL.");
                            return;
                        }

                        oNewTarget = createNewTargetFromIntent(oIntent);
                    }

                    // Check if necessary to propagate change in certain
                    // properties to the view. This check must be done before
                    // oTile is mutated with the effect that it's properties
                    // assume the updated state.
                    if (oTile.icon !== oParameters.icon) {
                        oChangedTileViewProperties.icon = oParameters.icon;
                        bTileViewPropertiesChanged = true;
                    }
                    if (oTile.title !== oParameters.title) {
                        oChangedTileViewProperties.title = oParameters.title;
                        bTileViewPropertiesChanged = true;
                    }
                    if (oTile.subTitle !== oParameters.subtitle) {
                        oChangedTileViewProperties.subtitle = oParameters.subtitle;
                        bTileViewPropertiesChanged = true;
                    }

                    // Update tile model - mutates the given oTile reference.
                    updateTileComposition(oTile, oParameters, oNewTarget);

                    if (bTileViewPropertiesChanged && mResolvedTiles[oTile.id]) {
                        oTileComponent = mResolvedTiles[oTile.id].tileComponent;
                        oTileComponent.tileSetVisualProperties(oChangedTileViewProperties);
                    }

                    oDeferred.resolve(oTile);
                }).promise;
            }

            // When save is successful, return count of updated bookmarks,
            // otherwise the rejected promise due to the failed save operation is returned.
            return this._visitBookmarks(sUrl, updateEach)
                .then(function (iUpdatedCount) {
                    return oCdmSiteService.save().then(function () {
                        return iUpdatedCount;
                    });
                });
        };

        /**
         * Deletes <b>all</b> bookmarks pointing to the given URL from all of the user's groups.
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be deleted, exactly as specified to {@link #addBookmark}.
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation. In case of success, the number of deleted bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         *
         * @see #addBookmark
         * @see #countBookmarks
         * @since 1.42.0
         */
        this.deleteBookmarks = function (sUrl) {
            var oContainer = sap.ushell.Container;
            var oUrlParser = oContainer.getService("URLParsing");
            var oCDM = oContainer.getService("CommonDataModel");

            var oReferenceTarget = createNewTargetFromIntent(oUrlParser.parseShellHash(sUrl));

            return oCDM.getSite().then(function (oSite) {
                var oGroups = oSite.groups;

                var iDeletedTiles = Object.keys(oGroups)
                    .map(function (sKey) {
                        var oPayload = oGroups[sKey].payload;
                        var iCountGroupTilesToDelete = 0;

                        oPayload.tiles = oPayload.tiles.filter(function (oTile) {
                            if (oTile.isBookmark
                                && isSameTarget(oReferenceTarget, oTile.target)) {
                                ++iCountGroupTilesToDelete;
                                return false;
                            }

                            return true;
                        });

                        return iCountGroupTilesToDelete;
                    })
                    .reduce(function (aggregateSum, groupSum) {
                        aggregateSum += groupSum;

                        return aggregateSum;
                    }, 0);

                return oCDM.save().then(function () {
                    return iDeletedTiles;
                });
            });
        };

        /**
         * This method is called to notify that the given tile has been added to some remote
         * catalog which is not specified further.
         *
         * @param {string} sTileId
         *   the ID of the tile that has been added to the catalog (as returned by that OData POST
         *   operation)
         * @private
         * @since 1.42.0
         */
        this.onCatalogTileAdded = function (sTileId) {
            // TODO implement (getCatalogs should relaod on the following call)
        };

        /**
         * Callback function which gets triggered once
         * the end user submits the tile settings dialog.
         * Updates the visual properties of the tile and
         * reflects the change to the Common Data Model site.
         * In addition it triggers saving the changes to
         * the personalization delta.
         *
         * @param {object} oTile
         *  Tile for which the settings dialog got opened
         * @param {object} oSettingsView
         *  Tile settings dialog view instance containing
         *  the input values of the dialog
         *
         * @private
         */
        this._onTileSettingsSave = function (oTile, oSettingsView) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSrvc,
                oUpdatedVisualTileProperties,
                sNewTitle,
                sNewSubtitle,
                sOldTitle,
                sOldSubtitle;

            if (oTile && oTile.id && oSettingsView) {
                sNewTitle = oSettingsView.oTitleInput.getValue();
                sNewSubtitle = oSettingsView.oSubTitleInput.getValue();
                sOldTitle = this.getTileTitle(oTile);
                sOldSubtitle = this.getTileSubtitle(oTile);

                // Check whether the end user changed the title or subtitle.
                // If nothing changed, return.
                if (sOldTitle === sNewTitle && sOldSubtitle === sNewSubtitle) {
                    return;
                }

                oCdmSrvc = sap.ushell.Container.getService("CommonDataModel");
                var that = this;
                oCdmSrvc.getSite()
                    .done(function (oSite) {
                        if (!oSite.modifiedTiles) {
                            oSite.modifiedTiles = {};
                        }

                        // Check if tile is already part of the modifiedTiles collection
                        if (!oSite.modifiedTiles[oTile.id]) {
                            oSite.modifiedTiles[oTile.id] = {
                                id: oTile.id
                            };
                        }

                        oUpdatedVisualTileProperties = {};
                        if (sOldTitle !== sNewTitle) {
                            oUpdatedVisualTileProperties.title = sNewTitle;

                            // Update properties also in the modifiedTiles section of the site itself,
                            // this a mandatory hint for the personalization processor.
                            oSite.modifiedTiles[oTile.id].title = sNewTitle;
                            // Add new properties also to tile for next startup
                            oTile.title = sNewTitle;
                        }
                        if (sOldSubtitle !== sNewSubtitle) {
                            oUpdatedVisualTileProperties.subtitle = sNewSubtitle;

                            // Update properties also in the modifiedTiles section of the site itself,
                            // this a mandatory hint for the personalization processor.
                            oSite.modifiedTiles[oTile.id].subTitle = sNewSubtitle;
                            // Add new properties also to tile for next startup
                            oTile.subTitle = sNewSubtitle;
                        }
                        // Update visual tile properties for current session,
                        // otherwise the change will only be visually reflected
                        // after a page reload.
                        //
                        // This is done conditionally, because this process may
                        // not be relevant for some tile types.
                        that._mResolvedTiles[oTile.id].tileComponent &&
                                that._mResolvedTiles[oTile.id].tileComponent.tileSetVisualProperties(oUpdatedVisualTileProperties);

                        // Persist personalization changes
                        oCdmSrvc.save()
                            .fail(function (sErrorMsg0) {
                                jQuery.sap.log.error(sErrorMsg0);
                                oDeferred.reject("Could not save personalization changes: " + sErrorMsg0);
                            })
                            .done(function () {
                                oDeferred.resolve();
                            });
                    })
                    .fail(function (sErrorMsg) {
                        jQuery.sap.log.error(sErrorMsg);
                        oDeferred.reject("Cannot get site: " + sErrorMsg);
                    });
            }

            return oDeferred.promise();
        };

        /**
         * Returns the tile actions for a given tile.
         *
         * @param {object} oTile
         *  Tile object
         * @returns {array}
         *  Tile actions for the given tile
         *
         * @public
         */
        this.getTileActions = function (oTile) {
            var aTileActions = [],
                oTileSettingsAction,
                oModel;

            if (this._isGroupTile(oTile) && !this._isFailedGroupTile(oTile)) {
                // Create necessary model for dialog to pass actual properties
                oModel = new sap.ui.model.json.JSONModel({
                    config: {
                        display_title_text: this.getTileTitle(oTile),
                        display_subtitle_text: this.getTileSubtitle(oTile)
                    }
                });

                // Get tile settings action
                oTileSettingsAction = sap.ushell.components.tiles.utilsRT
                    .getTileSettingsAction(oModel, this._onTileSettingsSave.bind(this, oTile));
                aTileActions.push(oTileSettingsAction);
            }
            return aTileActions;
        };

        function composeNewBookmarkTile(oParameters, oTarget) {
            var oTile = composeNewTile(oParameters, oTarget);

            oTile.isBookmark = true;

            return oTile;
        }

        function composeNewTile(oParameters, oTarget) {
            // TODO Collect all tile ids to pass them as an arry to
            // generateUniqueId
            var oTile = {
                id: sap.ushell.utils.generateUniqueId([])
            };

            updateTileComposition(oTile, oParameters, oTarget);

            return oTile;
        }

        function updateTileComposition(oTile, oParameters, oTarget) {
            // Avoid modifying callers reference.
            oParameters = jQuery.extend(true, {}, oParameters);

            if (oTarget) {
                oTile.target = oTarget;
            }

            if (oParameters.title || oParameters.title === "") {
                oTile.title = oParameters.title;
            }

            if (oParameters.icon || oParameters.icon === "") {
                oTile.icon = oParameters.icon;
            }

            if (oParameters.subtitle || oParameters.subtitle === "") {
                oTile.subTitle = oParameters.subtitle;
            }

            if (oParameters.dataSource) {
                oTile.dataSource = {};
                jQuery.extend(true, oTile.dataSource, oParameters.dataSource);

                // Just in case serviceUrl is set as well, we'll ignore it.
                // Since dataSource is preferred.
                delete oParameters.serviceUrl;
            } else if (oParameters.dataSource === null) {
                delete oTile.dataSource;
                delete oTile.indicatorDataSource;

                // Changes due to the preferred dataSource trumps any potential
                // change due to the serviceUrl property.
                delete oParameters.serviceUrl;
            }

            // Consider that the serviceUrlPath has no use when no dataSource exists
            if ((oParameters.dataSource || oTile.dataSource) && oParameters.serviceUrlPath) {
                oTile.indicatorDataSource = {
                    path: oParameters.serviceUrlPath
                };
            }

            if (oParameters.serviceUrl || oParameters.serviceUrl === "") {
                if (oTile.dataSource) {
                    // Warn about planned deprecation of serviceUrl.
                    jQuery.sap.log.warning(
                        "`serviceUrl` is marked for deprecation in the future." +
                        "It is not the preferred means for defining a dynamic " +
                        "tile's data source. Please use `oParameter.dataSource`"
                    );
                    delete oTile.dataSource;
                }

                oTile.indicatorDataSource = {
                    path: oParameters.serviceUrl
                };
            } else if (oParameters.serviceUrl === null && !oTile.dataSource) {
                delete oTile.indicatorDataSource;
            }

            if (oParameters.serviceRefreshInterval
                || oParameters.serviceRefreshInterval === 0) {
                oTile.indicatorDataSource.refresh
                    = oParameters.serviceRefreshInterval;
            }
        }

        function isSameTarget(oTarget, oOther) {
            if (oTarget && oOther) {
                return oTarget.semanticObject === oOther.semanticObject
                    && oTarget.action === oOther.action
                    && isSameParameters(oTarget.parameters, oOther.parameters);
            }

            return oTarget === oOther;
        }

        function isSameParameters(aParameters, aOthers) {
            var sFirst, sOther;

            aParameters = aParameters || [];
            aOthers = aOthers || [];

            if (aParameters.length === aOthers.length) {
                sFirst = transformParameterListToString(aParameters);
                sOther = transformParameterListToString(aOthers);

                return sFirst === sOther;
            }

            return false;
        }

        function transformParameterListToString(aList) {
            return aList
                .map(function (oParameter) {
                    return oParameter.name + oParameter.value;
                })
                .sort()
                .join();
        }

        function createNewTargetFromIntent(oIntent) {
            var oTarget = {
                semanticObject: oIntent.semanticObject,
                action: oIntent.action,
                parameters: createTileParametersFromIntentParams(oIntent.params)
            };

            if (oIntent.appSpecificRoute) {
                // do not loose the inner-app hash (e.g. &/ShoppingCart(12345))
                // BCP 1670533333
                oTarget.appSpecificRoute = oIntent.appSpecificRoute;
            }

            return oTarget;
        }

        function createTileParametersFromIntentParams(oIntentParams) {
            return Object.keys(oIntentParams).map(function (sKey) {
                var sValue = oIntentParams[sKey] && oIntentParams[sKey][0];

                return {
                    name: sKey,
                    // sValue maybe undefined.
                    value: sValue || ""
                };
            });
        }
    };

    // TODO check if this is really needed:
    sap.ushell.adapters.cdm.LaunchPageAdapter.prototype._getMember = function (oObject, sAccessPath) {
        return sap.ushell.utils.getMember(oObject, sAccessPath);
    };
    /* eslint-enable no-warning-comments, consistent-this */
} ());
