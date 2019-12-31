// @copyright@

/**
 * @fileOverview Enhanced provider of application navigation, and available
 * navigation targets.
 *
 * Defines a service that provides a `getLinks()` method which complements
 * the one provided by CrossApplicationNavigation service by sorting the
 * resulting list in the order of relevance to the calling application.
 *
 * Note that in order to effectively leverage the enhanced `getLinks()` method
 * provided by this service, it is pertinent that the API user employs this
 * service's version of `toExternal()` for cross application navigation (instead)
 * of using the one provided by CrossApplicationNavigation service.
 *
 * @version @version@
 */

/* global sap, jQuery */

( function ( sap, jQuery ) {
    "use strict";

    sap.ui.define(
        [
            "sap/ushell/services/Container",
            "sap/ushell/services/AppConfiguration",
            "sap/ushell/services/Personalization",
            "sap/ushell/services/URLParsing",
            "sap/ushell/services/CrossApplicationNavigation",
            "sap/ushell/services/AppLifeCycle",
            "sap/ushell/services/_SmartNavigation/complements"
        ],
        function ( oContainer, oAppConfiguration, oPersonalizationStore,
            oURLParsing, oCrossAppNav, oAppLifeCycle, oPrivate ) {

            oContainer = sap.ushell.Container;

            oURLParsing = oContainer.getService( "URLParsing" );
            oCrossAppNav = oContainer.getService( "CrossApplicationNavigation" );
            oAppLifeCycle = oContainer.getService( "AppLifeCycle" );
            oPersonalizationStore = oContainer.getService( "Personalization" );

            function ConstructorForUshellContainer() {
                return new SmartNavigation(
                    oPrivate,
                    oAppConfiguration,
                    oPersonalizationStore,
                    oURLParsing,
                    oCrossAppNav,
                    oAppLifeCycle
                );
            }

            ConstructorForUshellContainer.hasNoAdapter = true;
            return ConstructorForUshellContainer;
        }
    );

    sap.ushell.services.SmartNavigation = SmartNavigation;

    /**
     * Constructs an instance of SmartNavigation.
     *
     * The constructed service provides an enhancement on {@link CrossApplicationNavigation#getLinks}
     * and {@link CrossApplicationNavigation#toExternal}. In order for an application
     * to leverage this enhancement, it is pertinent that the application uses
     * @{link SmartNavigation#toExternal} for naviagtion. Hence the caller can
     * subsequently use @{link SmartNavigation#getLinks} with the outcome that
     * it sorts the resulting list in the order of frequency of <i>Attempted</i> navigation
     * from the application to respective links.
     *
     * <i>Attempted</i> in the previous paragraph is emphasized due to the fact
     * that a click on the link will cause an increment of the frequency count,
     * regardless of wether the navigation was successful or not.
     *
     * @name sap.ushell.services.SmartNavigation
     *
     * @constructor
     * @class
     * @see sap.ushell.services.Container#getService
     * @public
     * @since 1.44.0
     */
    function SmartNavigation( oPrivate, oAppConfiguration, oPersonalizationStore,
        oURLParsing, oCrossAppNav, oAppLifeCycle ) {

        if ( !SmartNavigation.instance ) {
            Object.defineProperty( SmartNavigation, "instance", {
                value: Object.create( null, {
                    /**
                     * Resolves the given semantic object (or action) and business
                     * parameters to a list of links available to the user, sorted
                     * according their relevance to the calling application.
                     *
                     * The relevance of link is defined by the frequency with which
                     * a navigation activity from the calling application to that
                     * link occurs.
                     *
                     * Internally, this method delegates to {@link sap.ushell.services.CrossApplicationNavigation#getLinks}
                     * and then sorts the resulting list accordingly.
                     *
                     * @returns {Promise}
                     *   A promise that resolves with an array of link objects
                     *   sorted according to their relevance to the calling application.
                     *
                     * @see {@link sap.ushell.services.CrossApplicationNavigation#getLinks}
                     *
                     * @memberof SmartNavigation#
                     * @since 1.44.0
                     * @public
                     * @name sap.ushell.services.SmartNavigation#getLinks
                     */
                    getLinks: {
                        value: function ( oArgs ) {

                            var aAllLinks = oCrossAppNav.getLinks( oArgs );
                            var sFromCurrentShellHash = oAppConfiguration
                                .getCurrentApplication().sShellHash;
                            var oAppComponent = oAppLifeCycle
                                .getCurrentApplication().componentInstance;

                            if ( !sFromCurrentShellHash ) {
                                // This may happen because, the application
                                // (the calling component belongs to) probably
                                // has not initialised fully.
                                jQuery.sap.log.warning(
                                    "Call to SmartNavigation#getLinks() simply "
                                    + "delegated to CrossApplicationNavigation#getLinks()"
                                    + " because oAppConfiguration#getCurrentApplication()#sShellHash"
                                    + " evaluates to undefined."
                                );

                                return aAllLinks;
                            }

                            return jQuery
                                .when(
                                aAllLinks,
                                oPrivate.getNavigationOccurrences(
                                    sFromCurrentShellHash,
                                    oPersonalizationStore,
                                    oAppComponent,
                                    oURLParsing
                                )
                                )
                                .then( function ( aLinks, aNavigationOccurrences ) {
                                    if ( aNavigationOccurrences.length === 0 ) {
                                        return aLinks;
                                    }

                                    return oPrivate
                                        .prepareLinksForSorting(
                                        aLinks,
                                        aNavigationOccurrences,
                                        oURLParsing
                                        )
                                        .sort( function ( oLink, oOtherLink ) {
                                            return oOtherLink.clickCount - oLink.clickCount;
                                        });
                                });
                        }
                    },
                    /**
                     * Usage of this method in place of {@link sap.ushell.services.CrossApplicationNavigation#toExternal}
                     * drives the smartness of the results returned by {@link sap.ushell.services.SmartNavigation#getLinks}.
                     *
                     * @see {@link sap.ushell.services.CrossApplicationNavigation#toExternal}
                     *
                     * @memberof SmartNavigation#
                     * @since 1.44.0
                     * @public
                     * @name sap.ushell.services.SmartNavigation#toExternal
                     */
                    toExternal: {
                        value: function ( oArgs, oComponent ) {
                            var _arguments = arguments;

                            var sDestinationShellHash = oPrivate
                                .getHashFromOArgs( oArgs.target, oURLParsing );

                            var fnToExternal = function () {
                                return oCrossAppNav.toExternal
                                    .apply( oCrossAppNav, _arguments );
                            };

                            var sFromCurrentShellHash = oAppConfiguration
                                .getCurrentApplication().sShellHash;

                            var oAppComponent = oAppLifeCycle
                                .getCurrentApplication().componentInstance;

                            // If current application has not been instantiated
                            // fully or functions called with invalid target
                            // the tracking will not be triggered. In case of
                            // invalid target it is up to CrossAppNavigation#toExternal
                            // to handle the error.
                            if ( !sFromCurrentShellHash ) {
                                jQuery.sap.log.warning(
                                    "Current shell hash could not be identified. Navigation will not be tracked.",
                                    null,
                                    "sap.ushell.services.SmartNavigation"
                                );

                                return jQuery.when( fnToExternal() );
                            }

                            if ( !sDestinationShellHash ) {
                                jQuery.sap.log.warning(
                                    "Destination hash does not conform with the ushell guidelines. Navigation will not be tracked.",
                                    null,
                                    "sap.ushell.services.SmartNavigation"
                                );

                                return jQuery.when( fnToExternal() );
                            }

                            return oPrivate
                                .recordNavigationOccurrences(
                                    sFromCurrentShellHash,
                                    sDestinationShellHash,
                                    oPersonalizationStore,
                                    oAppComponent,
                                    oURLParsing
                                )
                                .then( fnToExternal );
                        }
                    },
                    /**
                     * Completely delegates to {@link sap.ushell.services.CrossApplicationNavigation#hrefFoExternal},
                     * and either may be used in place of the other with exactly the
                     * same outcome.
                     *
                     * @see {@link sap.ushell.services.CrossApplicationNavigation#hrefForExternal}
                     *
                     * @memberof SmartNavigation#
                     * @since 1.46.0
                     * @public
                     * @name sap.ushell.services.SmartNavigation#hrefForExternal
                     */
                    hrefForExternal: {
                        value: function () {
                            var oHrefList = oCrossAppNav.hrefForExternal
                                .apply( oCrossAppNav, arguments );

                            return /* jQuery.when( */ oHrefList /* ) */;
                        }
                    },
                    /**
                     * Tracks a navigation to a valid intent if provided via arguments but does not perform the navigation itself.
                     * If no valid intent was provided tracking will be prevented. The intent has to consist of SemanticObject and Action.
                     * It may be passed as complete shellHash (presidence) or as individual parts
                     * Additional parameters will not be part of the tracking and ignored
                     * This Method can be used to track a click if the actual navigation was triggered via clicking a link on the UI.
                     *
                     *
                     * @param {object} oArguments
                     *      The navigation target as object, for example:
                     *
                     * <code>
                     *  {
                     *      target: {
                     *          shellHash: 'SaleOrder-display'
                     *      }
                     *  }
                     * </code>
                     *
                     *  or
                     *
                     * <code>
                     *  {
                     *      target: {
                     *          semanticObject: 'SalesOrder',
                     *          action: 'action'
                     *      }
                     *  }
                     *
                     *  @returns {object} promise
                     *      the new item created for tracking
                     *
                     * </code>
                     * @memberof SmartNavigation#
                     * @since 1.46.0
                     * @public
                     * @name sap.ushell.services.SmartNavigation#trackNavigation
                     */
                    trackNavigation: {
                        value: function ( oArgs ) {
                            var oTarget = oArgs.target;
                            var sFromCurrentShellHash = oAppConfiguration.getCurrentApplication().sShellHash;

                            var sDestinationShellHash;

                            if ( !sFromCurrentShellHash ) {
                                // Possibly the application (the calling
                                // component belongs to) has not initialised
                                // fully.
                                jQuery.sap.log.warning(
                                    "Call to SmartNavigation#trackNavigation() simply ignored"
                                    + " because oAppConfiguration#getCurrentApplication()#sShellHash"
                                    + " evaluates to undefined."
                                );

                                return jQuery.when( null );
                            }

                            sDestinationShellHash = oPrivate.getHashFromOArgs( oTarget, oURLParsing );
                            // Check if a valid destination was provided
                            if ( !sDestinationShellHash ) {
                                jQuery.sap.log.warning(
                                    "Navigation not tracked - no valid destination provided",
                                    null,
                                    "sap.ushell.services.SmartNavigation"
                                );

                                return jQuery.when( null );
                            }

                            jQuery.sap.log.debug(
                                "Navigation to " + sDestinationShellHash + " was tracked out of " + sFromCurrentShellHash,
                                null,
                                "sap.ushell.services.SmartNavigation"
                            );

                            return oPrivate.recordNavigationOccurrences(
                                sFromCurrentShellHash,
                                sDestinationShellHash,
                                oPersonalizationStore,
                                oAppLifeCycle.getCurrentApplication().componentInstance,
                                oURLParsing
                            );
                        }
                    },
                    // *************************
                    /**
                     * @private
                     */
                    constructor: {
                        value: SmartNavigation
                    }
                })
            });
        }

        return SmartNavigation.instance;
    }
})( sap, jQuery );