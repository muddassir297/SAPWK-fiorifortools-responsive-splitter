
// @copyright@
/**
 * @fileOverview
 *
 * <p>This module performs client side navigation target resolution.</p>
 *
 * <p>This Module focuses on the core algorithm of matching an intent against a
 * list of Inbounds, (aka AppDescriptor signature objects), which in addition
 * have a property resolutionResult representing an "opaque"
 * resolutionResult.</p>
 *
 * <p>getLinks should be called with already expanded hash fragment.
 * The output of getLinks should then be postprocessed for
 * compaction, outside this service.</p>
 *
 * <p>
 *   Missing:
 *   <ul>
 *   <li>Scope mechanism</li>
 *   <li>Parameter expansion with dynamic parameters</li>
 *   </ul>
 * </p>
 *
 * <p><b>NOTE:</b> Currently the ABAP adapter also delegates isIntentSupported
 * <b>only</b> (=erroneously) to the resolveHashFragment adapter implementation,
 * missing intents injected via custom resolver plug-ins.  The custom resolver
 * hook functionality is currently outside of this method (only affecting
 * resolveHashFragment), as before. The future architecture should handle this
 * consistently.</p>
 *
 * <p><b>NOTE:</b> Old implementations also gave inconsistent results. For example
 * the ABAP adapter on isIntentSupported did call directly the adapter, not the
 * service, thus missing additional targets added only via a custom resolver.</p>
 *
 * <p> In the future, the custom resolver mechanism should be probably moved
 * towards modifying (or only adding to the list of Inbounds), this way a
 * single data source has to be altered to support consistently
 * getLinks, isIntentSupported.</p>
 *
 * @version
 * @version@
 */
sap.ui.define([
    "sap/ushell/services/AppConfiguration",
    "sap/ui/generic/app/navigation/service/SelectionVariant",
    "sap/ushell/services/_ClientSideTargetResolution/InboundProvider",
    "sap/ushell/services/_ClientSideTargetResolution/VirtualInbounds"
], function(appConfiguration, SelectionVariant, InboundProvider, oVirtualInbounds) {
    "use strict";
    /*global jQuery, sap, URI */

    /**
     * <p>A module to perform client side target resolution where possible, based
     * on a complete list of Inbounds.</p>
     *
     * <p>This list defines a common strategy for selecting <b>one</b> appropriate
     * target (even in case of conflicts) across all platforms.</p>
     *
     * <p>The interface assumes a <b>complete</b> list of inbounds has been
     * passed, including parameter signatures. The array of inbounds is to be
     * injected by the <code>oAdapter.getInbounds()</code> function.
     *
     * <p>Note that the resolution results (e.g. targets and descriptions) may
     * <b>not</b> be present on the client.</p>
     *
     * <p>All interfaces shall still be asynchronous interfaces w.r.t client
     * invocation.</p>n
     *
     * The following request can be served from the client:
     * <ol>
     * <li>isIntentSupported</li>
     * <li>getLinks</li>
     * </ol>
     *
     * <p>This module does <b>not</b> perform hash expansion or compaction.</p> This
     * is performed by respective preprocessing of the hash (see
     * {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}) and:</p>
     *
     * <ul>
     * <li>resolveHashFragment    (expansion, NavTargetResolution.isIntentSupported)</li>
     * <li>isIntentSupported
     * <li>getLinks   (post processing, Service)</li>
     * </ul>
     *
     *
     * <p>
     * the Parameter sap-ui-tech-hint can be used to attempt to give one Ui technology preference
     * over another, legal values are UI5, WDA, GUI
     * </p>
     *
     *
     *
     *
     * Usage:
     *
     * <pre>
     * var oSrvc = sap.ushell.Container.getService("ClientSideTargetResolution");
     * oSrvc.isIntentSupported("#SemanticObject-action");
     * </pre>
     *
     * @name sap.ushell.services.ClientSideTargetResolution
     *
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
     * @since 1.32.0
     */
    function ClientSideTargetResolution(oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        this._init.apply(this, arguments);
    };

    ClientSideTargetResolution.prototype._init = function(oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {

        if (!this._implementsServiceInterface(oAdapter)) {
            jQuery.sap.log.error(
                "Cannot get Inbounds",
                "ClientSideTargetResolutionAdapter should implement getInbounds method",
                "sap.ushell.services.ClientSideTargetResolution"
            );
            return;
        }

        this._oInboundProvider = new InboundProvider(oAdapter.getInbounds.bind(oAdapter));

        // Deferred objects resolved once the easy access systems are obtained
        this._oHaveEasyAccessSystemsDeferreds = {
            userMenu: null,
            sapMenu: null
        };

        // Latter entries give a certain technology a higher precedence
        this._aTechnologyPriority = [undefined, "GUI", "WDA", "UI5" /* comes first */ ];

        this._oServiceConfiguration = oServiceConfiguration;

        this._oAdapter = oAdapter;
    };

    /**
     * Checks whether the platform adapter has a compatible service
     * interface.
     *
     * @param {object} oAdapter
     *   An instance of ClientSideTargetResolution Adapter for the platform
     *   at hand.
     *
     * @return {boolean}
     *   Whether the adapter implements the ClientSideTargetResolution
     *   required interface.
     */
    ClientSideTargetResolution.prototype._implementsServiceInterface = function(oAdapter) {
        if (typeof oAdapter.getInbounds === "function") {
            return true;
        }
        return false;
    };


    ClientSideTargetResolution.prototype._getURLParsing = function() {
        if (!this._oURLParsing) {
            this._oURLParsing = sap.ushell.Container.getService("URLParsing");
        }
        return this._oURLParsing;
    };

    /**
     * Construct the effective parameter list. This is the union of:
     * <ul>
     *   <li>Intent parameters minus the sap-ushell-defaultedParameterNames
     *   if present (it's a output only reserved parameter).</li>
     *   <li>Any inbound parameter with a known (resolved reference
     *   or plain value) <code>defaultValue</code> specified.</li>
     * </ul>
     *
     * <p>Reference default values will not be part of the effective parameter
     * list if their value is yet to be determined.</p>
     *
     * @param {object} oIntentParams
     *    Intent parameter object (not modified!)
     * @param {object} oSignatureParams
     *    Signature structure
     * @param {object} oKnownReferenceIn
     *    The input user default reference object. See {@link #_matchToInbound}
     * @param {string[]} aMissingReferenceIfMatch
     *    Parameters that should be added as missing parameters in case the match is successful
     * @param {string[]} aDefaultedParamNames
     *    Output array of parameters that were not present in the signature
     *
     * @returns {object}
     *    The effective parameter list.
     * <p>
     * NOTE: may be a shallow copy of actual parameter arrays!
     * </p>
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._addDefaultParameterValues = function(oIntentParams, oSignatureParams, oKnownReferenceIn, aMissingReferenceIfMatch, aDefaultedParamNames) {
        var oIntentParamsPlusDefaults = {},
            oDefaultedParameters = {}; // keeps unique entries

        // add the intent parameters first (exclude the sap-ushell-defaultedParamNames)
        Object.keys(oIntentParams).forEach(function(sParamName) {
            // this parameter is output only, and must be ignored during resolveHashFragment
            if (sParamName !== "sap-ushell-defaultedParameterNames") {
                oIntentParamsPlusDefaults[sParamName] = oIntentParams[sParamName];
            }
        });

        if (!oSignatureParams) {
            return oIntentParamsPlusDefaults;
        }

        // add default parameters on top
        Object.keys(oSignatureParams).forEach(function(sParamName) {
            var oTmSignatureParam = oSignatureParams[sParamName],
                sTmSignatureParamDefaultValue,
                bValueKnown = false;

            if (!oIntentParamsPlusDefaults[sParamName] && oTmSignatureParam.hasOwnProperty("defaultValue")) {

                if (oTmSignatureParam.defaultValue.format &&
                    oTmSignatureParam.defaultValue.format === "reference") {

                    // is there a known value for this reference?
                    sTmSignatureParamDefaultValue = oTmSignatureParam.defaultValue.value;
                    if (oKnownReferenceIn.hasOwnProperty(sTmSignatureParamDefaultValue)) {
                        // Simple user defaults
                        if (typeof oKnownReferenceIn[sTmSignatureParamDefaultValue] === "string") {
                            // ... user default value was found
                            oIntentParamsPlusDefaults[sParamName] = [oKnownReferenceIn[sTmSignatureParamDefaultValue]];
                            bValueKnown = true;
                        } else if (typeof oKnownReferenceIn[sTmSignatureParamDefaultValue] === "object") {
                            // Extended user defaults
                            oIntentParamsPlusDefaults[sParamName] = oKnownReferenceIn[sTmSignatureParamDefaultValue];
                            bValueKnown = true;
                        }
                        // else discard this default parameter
                    } else {
                        // ... no user default value found
                        oIntentParamsPlusDefaults[sParamName] = [oTmSignatureParam.defaultValue]; // NOTE: ref

                        aMissingReferenceIfMatch.push(oTmSignatureParam.defaultValue.value);
                    }
                } else {
                    oIntentParamsPlusDefaults[sParamName] = [oTmSignatureParam.defaultValue.value];
                    bValueKnown = true;
                }

                // Important, only add known values!
                if (bValueKnown) {
                    oDefaultedParameters[sParamName] = true;
                }
            }
        });

        Object.keys(oDefaultedParameters).sort().forEach(function(sParam) {
            aDefaultedParamNames.push(sParam);
        });

        return oIntentParamsPlusDefaults;
    };

    /**
     * Checks that a value matches a filter.
     *
     * @param {string} sValue
     *    Filter value to test, may be undefined or string
     * @param {object} oFilter
     *    Filter object as defined in app descriptor input signature, may
     *    be undefined.
     * @param {object} oKnownReferenceIn
     *    The set of known reference values. See {@link #_matchToInbound}
     * @param {object} oMissingReferenceOut
     *    The set of missing references. See {@link #_matchToInbound}
     *
     * @returns {boolean}
     *    Match result
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._matchesFilter = function(sValue, oFilter, oKnownReferenceIn, oMissingReferenceOut) {
        var sFilterValue;

        if (!oFilter) {
            return true; // no filter -> match
        }
        if (!sValue && sValue !== "") {
            return false;
        }

        sFilterValue = oFilter.value;

        if (oFilter.format === "reference") {
            // potentially remove these inbounds already in adapter
            if (/UserDefault\.extended\./.test(sFilterValue)) {
                jQuery.sap.log.error("Illegal inbound: extended user default '" + sFilterValue + "' used as filter");
                return false;
            }
            // if we have this value, check if it matches...
            if (oKnownReferenceIn.hasOwnProperty(sFilterValue)) {
                return sValue === oKnownReferenceIn[sFilterValue];
            }

            // ...or save reference if found for the first time
            oMissingReferenceOut[sFilterValue] = true;

            return true;
        }
        if (oFilter.format === "value" || oFilter.format === "plain" || oFilter.format === undefined) {
            return sValue === oFilter.value;

        } else if (oFilter.format === "regexp") {
            return !!sValue.match("^" + oFilter.value + "$");

        } else {
            jQuery.sap.log.error("Illegal oFilter format");
            return false;
        }
    };

    /**
     * An internal helper that serves as a getter of the technology of a
     * given matched target.
     *
     * @param {object} oMatchResult
     *   The matched target.
     *
     * @returns {string}
     *   The technology of the given matched target.
     */
    function getTechnology(oMatchResult) {
        return oMatchResult.inbound &&
            oMatchResult.inbound.resolutionResult &&
            oMatchResult.inbound.resolutionResult["sap.ui"] &&
            oMatchResult.inbound.resolutionResult["sap.ui"].technology;
    }

    /**
     * Returns a number that indicates whether the "sap-ui-tech-hint"
     * parameter in a matched target matches the value of the
     * "sap-ui-tech-hint" URL parameter.
     *
     *
     * @param {object} oMatchResult
     *   The matching target.
     *
     * @returns {number}
     *   Matching can occur at different levels, depending whether the a
     *   default or required parameter has matched. Therefore the result is
     *   manyfold, as follows:
     *
     *   <ul>
     *   <li><b>2</b>: the "sap-ui-tech-hint" parameter matched a required parameter</li>
     *   <li><b>1</b>: the "sap-ui-tech-hint" parameter matched a default parameter</li>
     *   <li><b>0</b>: the "sap-ui-tech-hint" parameter did not match.
     *   </ul>
     *
     * @private
     */
    ClientSideTargetResolution.prototype._calculateTechnologyMatch = function(oMatchResult) {
        var sTechHintParamValue = oMatchResult.intentParamsPlusAllDefaults["sap-ui-tech-hint"] && oMatchResult.intentParamsPlusAllDefaults["sap-ui-tech-hint"][0];

        var bIsDefault = oMatchResult.defaultedParamNames && (oMatchResult.defaultedParamNames.indexOf("sap-ui-tech-hint") >= 0);

        if (sTechHintParamValue && getTechnology(oMatchResult) === sTechHintParamValue) {
            // matches!
            return bIsDefault ? 1 : 2;
        }
        return 0;
    };

    /**
     * Returns the priority of the technology specified in the given
     * matched target.
     *
     * @param {object} oMatchResult
     *   The match result.
     *
     * @returns {number}
     *   An integer representing the priority of a the technology in the
     *   given matched target. The higher the number, the more priority has
     *   the technology.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._getTechnologyPriority = function(oMatchResult) {
        var sTechnology = getTechnology(oMatchResult);
        var iPriority = this._aTechnologyPriority.indexOf(sTechnology);

        return Math.max(0, iPriority);
    };

    ClientSideTargetResolution.prototype._addSortString = function(oMatchResult) {
        function addLeadingZeros(iNumber) {
            var s = "000" + iNumber;
            return s.substr(s.length - 3);
        }

        oMatchResult.priorityString = [
            /*
             * General idea: the inbound that fits best to the
             * intent has priority.
             *
             * NOTE1: when it comes to the digits, we later sort from large
             *        to small. So a higher number 005 has precedence over
             *        a lower number 003.
             *
             * NOTE2: all intent parameters are matching the inbound at
             *        this point.
             *
             * Terminology:
             *
             * - Required parameter: a parameter that appears in the Inbound
             *   signature with the flag "required = true".
             *
             * - Filter parameter: a parameter that appears in the Inbound
             *   signature in the form "filter: { value: ... }" or
             *   "filter: {}".
             *
             * - Default parameter: a parameter that appears in the Inbound
             *   signature in the form "defaultValue: { value: ... }" or
             *   "defaultValue: {}".
             *
             * - Defaulted parameter: a default parameter with a specified
             *   value that will be added to the intent parameter if match
             *   occurred.
             *
             * - Free parameter: a parameter of the Inbound
             *   signature that is not an intent parameter.
             *
             * NOTE: a certain parameter can specify
             * filter/default/required at the same time. E.g., {
             *    "param": {
             *       required: true,
             *       filter: {}, // param must exist
             *       defaultValue: {
             *          value: "apple" // will be defaulted to "apple" if not specified
             *       }
             *    }
             *
             * }
             */

            /*
             * Exact SemanticObject matches have priority
             *
             * g: generic  x: explicit/exact semantic object (NOTE: "x" > "g")
             */
            oMatchResult.genericSO ? "g" : "x",
            /**
             * Techmatch: whether the technology is explicitely specified
             * and matches (1) or not (0)
             *
             */
            "TECM=" + this._calculateTechnologyMatch(oMatchResult),
            /**
             * Number of matching parameters.
             *
             * Number of inbound parameters that match the intent. For
             * filter parameters, the corresponding intent parameter must
             * have a matching value specified.
             */
            "MTCH=" + addLeadingZeros(oMatchResult.countMatchingParams),
            /*
             * Number of matching required parameters.
             *
             * Number inbound parameters that match the intent and
             * are required.
             */
            "MREQ=" + addLeadingZeros(oMatchResult.countMatchingRequiredParams),
            /*
             * Number of Matching filter parameters.
             *
             * Number inbound parameters that match the intent and specify
             * a filter value.
             */
            "NFIL=" + addLeadingZeros(oMatchResult.countMatchingFilterParams),
            /*
             * Number of Defaulted parameters
             *
             * Inbound parameters that are not part of the intent
             * but specify a default value (defaulted parameters).
             */
            "NDEF=" + addLeadingZeros(oMatchResult.countDefaultedParams),
            /*
             * Number of Potentially matching parameters
             *
             * Intent parameters that can potentially match the inbound.
             */
            "POT=" + addLeadingZeros(oMatchResult.countPotentiallyMatchingParams),
            /*
             * Reverse number of inbound parameters that were not found in
             * the intent (free parameters).
             */
            "RFRE=" + addLeadingZeros(999 - oMatchResult.countFreeInboundParams),
            /*
             * Technology preference
             */
            "TECP=" + this._getTechnologyPriority(oMatchResult)
        ].join(" ");
    };

    /**
     * Checks whether additional intent parameter (plus defaults) conform
     * to the signature expectation regarding additionalParameters.
     *
     * @param {object} oInbound
     *    The inbound
     * @param {object} oIntentParamsPlusDefaults
     *    The intent parameters (plus defaults)
     *
     * @returns {boolean}
     *    Whether additional intent parameters conform to the signature
     *    expectations.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._checkAdditionalParameters = function(oInbound, oIntentParamsPlusDefaults) {
        var bAdditionalParametersMatchExpectation = false;

        if (oInbound.signature.additionalParameters === "allowed" ||
            oInbound.signature.additionalParameters === "ignored") {

            return true;
        }

        if (oInbound.signature.additionalParameters === "notallowed" ||
            oInbound.signature.additionalParameters === undefined) {

            bAdditionalParametersMatchExpectation =
                Object.keys(oIntentParamsPlusDefaults).every(function(sParamName) {
                    return (!oInbound.signature.parameters[sParamName] && sParamName.indexOf("sap-") !== 0) ? false // parameter not in Inbound signature and not sap- parameter
                        : true;
                });

        } else {
            jQuery.sap.log.error("Unexpected value of inbound for signature.additionalParameters");
        }

        return bAdditionalParametersMatchExpectation;
    };

    /**
     * Update oMissingReferenceOut (containing filter user defaults)
     * with any default parameters that were found during defaulting.
     *
     * @param {array} aReferenceIfMatch
     *     The user default references that must be added to
     *     <code>oUserDefaultRefsOut</code> if the match occurred
     * @param {object} oMissingReferenceOut
     *     The user default references required to perform a
     *     non-approximate matching
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._addFoundParametersToRefs = function(aReferenceIfMatch, oMissingReferenceOut) {
        aReferenceIfMatch.forEach(function(sRefValue) {
            oMissingReferenceOut[sRefValue] = true;
        });
    };

    /**
     * Extract an integer value from a parameter "sap-priority" if present
     * among the intent parameters, and adds it to the passed mutated
     * object.
     *
     * @param {object} oIntentParams
     *    The intent parameters that may contain the "sap-priority" to be
     *    parsed.
     * @param {object} oMutated
     *    The mutated object to write the parsed "sap-priority" parameter
     *    to.
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._extractSapPriority = function(oIntentParams, oMutated) {
        var iSapPriority;
        if (oIntentParams && oIntentParams["sap-priority"] && oIntentParams["sap-priority"][0]) {
            iSapPriority = parseInt(oIntentParams["sap-priority"][0], 10);
            if (!isNaN(iSapPriority)) {
                oMutated["sap-priority"] = iSapPriority;
            }
        }
        return;
    };

    /**
     * Construct a map that allows to detect which parameters of a given
     * parameter set would be affected if a parameter renaming took place.
     *
     * <p>When a parameter is renamed to an already existing parameter name,
     * the existing parameter name is said to be "dominated" by the
     * parameter that was renamed.</p>
     *
     * @param {object} oParameters
     *    An object containing the input parameters to analyze.
     *
     * <pre>
     *    {
     *      "A" : {"renameTo" : "ANew" },
     *      "B" : {"renameTo" : "ANew" },
     *      "C" : {}
     *      "D" : { "renameTo" : "C"},
     *      "E" : { }
     *    }
     * </pre>
     *
     *
     * @return {object}
     *    The parameter dominator map. An object like:
     * <pre>
     *    { "A" : {  renameTo : "ANew", "dominatedBy" : ["A", "B" ] },
     *    { "B" : {  renameTo : "ANew", "dominatedBy" : ["A", "B" ] },
     *    { "C" : {  renameTo : "C", "dominatedBy" : ["C", "D" ] },
     *    { "D" : {  renameTo : "C", "dominatedBy" : ["C", "D" ] },
     *    { "E" : {  renameTo : "E", "dominatedBy" : ["E" ] }
     * </pre>
     */
    ClientSideTargetResolution.prototype._constructParameterDominatorMap = function(oParameters) {
        var oDominatorMap = {},
            oRenameMap = {};

        Object.keys(oParameters).forEach(function(sKey) {
            var sRenameTo = oParameters[sKey].renameTo || sKey;
            oRenameMap[sRenameTo] = oRenameMap[sRenameTo] || {
                "renameTo": sRenameTo,
                "dominatedBy": []
            };
            oRenameMap[sRenameTo].dominatedBy.push(sKey);
            oRenameMap[sRenameTo].dominatedBy = oRenameMap[sRenameTo].dominatedBy.sort();
            oDominatorMap[sKey] = oRenameMap[sRenameTo];
        });
        return oDominatorMap;
    };

    /**
     *
     * @param {object} oIntentParamsPlusAllDefaults
     *    intent params with defaults map
     * @param {array} aDefaultedParamNames
     *    string array defaulted Parameter names
     * @param {object} oParameterDominatorMap
     *    see _constructParameterDominatorMap
     * @return {object}
     *   A tuple of all modified members of the input:
     *   <code>{
     *        intentParamsPlusAllDefaults : ...
     *        defaultedParamNames : ...
     *   };
     *   </code>
     */
    // If multiple parameters map onto the same parameter with renameTo,
    // a value which was explicitly passed dominates all other values
    // we remove the spurious defaulted values.
    // TODO: also in ?? the complex newParamterValue?
    ClientSideTargetResolution.prototype._removeSpuriousDefaultedValues = function(oIntentParamsPlusAllDefaults, aDefaultedParamNames, oParameterDominatorMap) {
        // run through the defaulted Parameter names, if any one is dominated by a non-defaulted,
        // remove it and it's value
        var aOriginalList = aDefaultedParamNames.slice(0);
        aOriginalList.forEach(function(sParamName, iIndex) {
            var sPresentNonDefault;
            var bNonDefaultPresent = oParameterDominatorMap[sParamName].dominatedBy.some(function(sKey) {
                if (oIntentParamsPlusAllDefaults[sKey] && (sKey !== sParamName) && aDefaultedParamNames.indexOf(sKey) === -1) {
                    sPresentNonDefault = sKey;
                    return true;
                }
                return false;
            });
            if (bNonDefaultPresent && (sPresentNonDefault !== sParamName)) {
                aDefaultedParamNames.splice(iIndex, 1);
                delete oIntentParamsPlusAllDefaults[sParamName];
                // TODO: delete in list of required UserDefault Parameters references, so that it is
                // not required there
            }
        });
        return {
            intentParamsPlusAllDefaults: oIntentParamsPlusAllDefaults,
            defaultedParamNames: aDefaultedParamNames
        };
    };

    /**
     * Perform matching between an intent and the given inbound. The
     * matching procedure takes into account references (to user default
     * values) in filters and default values.<br />
     *
     * <ul>
     *   <li>An inbound with a filter reference (to a user default)
     *     is matched against a given intent if the intent specifies the
     *     filter (name) among its parameters. Otherwise a match does
     *     not occur.
     *   </li>
     *   <li>An inbound with a default reference (to a user default)
     *     is matched as if such default value was not specified in the
     *     inbound signature.
     *   </li>
     * </ul>
     *
     * Any reference value involved in the match will be added to the
     * output parameter aMissingReferenceOut array, indicating that
     * the returned result is a "potential" match. To obtain a certain
     * result, this method must be called again with resolved references
     * (supplied via the oKnownReferenceIn parameter).
     *
     * @param {object} oIntent
     *    The parsed shell hash representing an intent.<br />
     *    <br />
     *    NOTE: this method treats the semantic object/action/formFactor
     *    inside the intent literally, as any other semantic
     *    object/action/formFactor string. It is possible, however, to
     *    specify wildcards for semantic object action and formFactor by
     *    setting them to undefined.
     *    <br />
     *    NOTE: if sap-ui-tech-hint[0] is present and
     *    oIntent.treatTechHintAsFilter is truthy, only
     *    inbounds with matching technology are considered
     *
     * @param {object} oInbound
     *    An inbound
     * @param {object} oKnownReferenceIn
     *    An input parameter used during the matching procedure to resolve
     *    reference values of defaults and filters.
     * @param {object} oMissingReferenceOut
     *    <p>An output object containing missing references to user
     *    default values that must be resolved. This is not an array for
     *    optimization reasons, for example, when providing unique user
     *    default values across multiple calls of this method or for
     *    quickly finding out when a reference value was alrady missing in
     *    a previous call.</p>
     *
     *    This object has the form:
     * <pre>
     *     {
     *        "UserDefault.Value1": true,
     *        "UserDefault.Value2": true  // never false
     *        ...
     *     }
     * </pre>
     *     NOTE: it cannot be undefined, must be supplied as an object.
     *
     * @returns {object}
     *    the match result. When a match occurs, this is an object like:
     *
     * <pre>
     *    {
     *        matches: {boolean},
     *        genericSO: {boolean},
     *        inbound: {object},
     *        intentParamsPlusAllDefaults: {object},
     *        countMatchingParams: {number},
     *        countMatchingRequiredParams: {number},
     *        countMatchingFilterParams: {number},
     *        countDefaultedParams: {number},
     *        countPotentiallyMatchingParams: {number},
     *        countFreeInboundParams: {number},
     *        resolutionResult: {object}
     *    }
     * </pre>
     *
     * When no matching occurs, the returned object looks like:
     * <pre>
     *    {
     *        matches: false,
     *        noMatchReason: "...",
     *        noMatchDebug: "...",     // interpret this in combination with noMatchReason
     *        inbound: {object},
     *        [one or more count* keys]: {number}
     *    }
     * </pre>
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._matchToInbound = function(oIntent, oInbound, oKnownReferenceIn, oMissingReferenceOut) {
        var that = this,
            oMatchResult = {
                inbound: oInbound
            };

        function fnNoMatch(oResult, sReason, sDebugInfo) {
            oResult.matches = false;
            oResult.noMatchReason = sReason;
            oResult.noMatchDebug = sDebugInfo;
            return oResult;
        }

        function fnMatch(oResult) {
            oResult.matches = true;
            oResult.matchesVirtualInbound = oVirtualInbounds.isVirtualInbound(oInbound);
            return oResult;
        }

        // test the semantic object
        oMatchResult.genericSO = (oInbound.semanticObject === "*");
        if (!(oIntent.semanticObject === undefined || oIntent.semanticObject === oInbound.semanticObject || oInbound.semanticObject === '*')) {
            return fnNoMatch(oMatchResult, "Semantic object \"" + oIntent.semanticObject + "\" did not match");
        }
        // test the action
        if (!(oIntent.action === undefined || oIntent.action === oInbound.action)) {
            return fnNoMatch(oMatchResult, "Action \"" + oIntent.action + "\" did not match");
        }
        // test the form factor
        if (oInbound.deviceTypes && !(oIntent.formFactor === undefined || oInbound.deviceTypes[oIntent.formFactor])) {
            return fnNoMatch(oMatchResult, "Form factor \"" + oIntent.formFactor + "\" did not match",
                "Inbound: [" + Object.keys(oInbound.deviceTypes)
                .filter(function(sKey) {
                    return !!oInbound.deviceTypes[sKey];
                })
                .join(", ") + "]");
        }
        // test for sap-ui-tech-hint as filter
        var sTechHint = oIntent.params && oIntent.params["sap-ui-tech-hint"] && oIntent.params["sap-ui-tech-hint"][0];
        if (oIntent.treatTechHintAsFilter && sTechHint) {
            var sInboundTech = getTechnology({
                inbound: oInbound
            });
            if (sInboundTech !== sTechHint) {
                return fnNoMatch(oMatchResult, "Tech Hint as filter \"" + sTechHint + "\" did not match",
                    "Inbound: [" + sInboundTech + "]");
            }
        }
        // An array like: [{ refValue: <string>}, ... ] later used to
        // augment oMissingReferenceOut *if* a match occurs.
        var aReferenceIfMatch = [],
            aDefaultedParamNames = [],
            oIntentParams = oIntent.params;

        // Expand default values into intent parameters
        var oIntentParamsPlusAllDefaults = this._addDefaultParameterValues(
            oIntentParams,
            oInbound.signature && oInbound.signature.parameters,
            oKnownReferenceIn,
            aReferenceIfMatch,
            aDefaultedParamNames
        );

        oMatchResult.intentParamsPlusAllDefaults = oIntentParamsPlusAllDefaults;
        oMatchResult.defaultedParamNames = aDefaultedParamNames;

        // extractSapPriority
        this._extractSapPriority(oIntentParamsPlusAllDefaults, oMatchResult);

        // check whether the parameter signature matches
        var countMatchingParams = 0,
            countMatchingRequiredParams = 0,
            countMatchingFilterParams = 0,
            countFreeInboundParams = 0;

        var bSignatureMatches = Object.keys(oInbound.signature.parameters).every(function(sParameterName) {
            var aValues = oIntentParamsPlusAllDefaults[sParameterName],
                sValue = aValues && aValues[0],
                oSignature = oInbound.signature.parameters[sParameterName],
                bIntentHasParam = oIntentParams.hasOwnProperty(sParameterName);

            if (oSignature.required && (sValue === null || sValue === undefined)) {
                // no required parameter present -> fatal
                return false;
            }

            if (oSignature.filter) {

                if (!that._matchesFilter(sValue, oSignature.filter, oKnownReferenceIn, oMissingReferenceOut)) {
                    // filter does not match -> fatal
                    return false;
                }

                if (bIntentHasParam) {
                    ++countMatchingFilterParams;
                }
            }

            if (bIntentHasParam && oSignature.required) {
                ++countMatchingRequiredParams;
            }

            if (bIntentHasParam) {
                ++countMatchingParams;
            }
            if (!bIntentHasParam && (sValue === null || sValue === undefined)) {
                ++countFreeInboundParams;
            }
            // If multiple parameters map onto the same parameter with renameTo,
            // a value which was explicitly passed dominates all other values
            // we remove the spurious defaulted values.
            var parameterDominatorMap = that._constructParameterDominatorMap(oInbound.signature.parameters);
            var oRes = that._removeSpuriousDefaultedValues(oMatchResult.intentParamsPlusAllDefaults,
                oMatchResult.defaultedParamNames, parameterDominatorMap);
            oMatchResult.intentParmsPlusAllDefaults = oRes.intentParmsPlusAllDefaults;
            oMatchResult.defaultedParamNames = oRes.defaultedParamNames;
            return true;
        });

        oMatchResult.countMatchingParams = countMatchingParams;
        oMatchResult.countMatchingRequiredParams = countMatchingRequiredParams;
        oMatchResult.countMatchingFilterParams = countMatchingFilterParams;
        oMatchResult.countDefaultedParams = aDefaultedParamNames.length;
        oMatchResult.countPotentiallyMatchingParams = Object.keys(oIntent.params).length;
        oMatchResult.countFreeInboundParams = countFreeInboundParams;

        if (!bSignatureMatches) {
            return fnNoMatch(oMatchResult, "Inbound parameter signature did not match",
                this._compactSignatureNotation(oInbound.signature));
        }

        if (!this._checkAdditionalParameters(oInbound, oIntentParamsPlusAllDefaults)) {
            return fnNoMatch(oMatchResult, "Additional parameters not allowed",
                this._compactSignatureNotation(oInbound.signature));
        }

        if (oInbound.signature.additionalParameters === "ignored") {
            this._filterObjectKeys(oIntentParamsPlusAllDefaults, function(sKey) {
                if (sKey.indexOf("sap-") === 0) {
                    return true; // keep sap params
                }
                if (oInbound.signature.parameters.hasOwnProperty(sKey)) {
                    return true; // keep parameters in the Inbound signature
                }
                return false;
            }, true /* bInPlace */ );

            // count is reduced in case of ignored additional parameters
            oMatchResult.countPotentiallyMatchingParams = Object.keys(oIntent.params).filter(function(sIntentParam) {
                return oInbound.signature.parameters.hasOwnProperty(sIntentParam);
            }).length;
        }

        this._constructEarlyResolutionResult(oMatchResult, oInbound);
        this._addSortString(oMatchResult);
        this._addFoundParametersToRefs(aReferenceIfMatch, oMissingReferenceOut);

        return fnMatch(oMatchResult);
    };

    /**
     * Deletes keys from an object based on a given filter function.
     *
     * @param {object} oObject
     *    The object to be filtered (modified in place)
     * @param {object} fnFilterFunction
     *    The filter function to decide which keys to delete
     * @param {boolean} bInPlace
     *    Modifies the the given object in place
     *
     * @returns {object}
     *    The filtered object
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._filterObjectKeys = function(oObject, fnFilterFunction, bInPlace) {
        var oObjectToFilter = bInPlace ? oObject : jQuery.extend(true, {}, oObject);

        Object.keys(oObjectToFilter).forEach(function(sKey) {
            if (fnFilterFunction(sKey) === false) {
                delete oObjectToFilter[sKey];
            }
        });

        return oObjectToFilter;
    };

    /**
     * Determine whether we are dealing with local full url construction
     * (given sap.wda namespace, construct a full url)
     *
     * @param {object} oMatchResult
     *    The current match result
     *
     * @returns {boolean}
     *    Whether a local WDA resolution is to be made.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._isFullLocalWDAResolution = function(oMatchResult) {
        var oInbound = oMatchResult.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult;

        if (this._oServiceConfiguration && this._oServiceConfiguration.config && this._oServiceConfiguration.config["enableWdaLocalResolution"] === false) {
            return false;
        }

        return !(!oInbound ||
            !oResolutionResult ||
            !(oResolutionResult["sap.wda"]) ||
            !(oResolutionResult.applicationType === "WDA")
        );
    };

    /**
     * Determine whether we can apply local WDA resolution.
     *
     * @param {object} oMatchResult
     *    The current match result
     *
     * @returns {boolean}
     *    Whether a local WDA resolution is to be made.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._isLocalWDAResolution = function(oMatchResult) {
        var oInbound = oMatchResult.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult;

        if (this._oServiceConfiguration && this._oServiceConfiguration.config && this._oServiceConfiguration.config["enableWdaLocalResolution"] === false) {

            return false;
        }

        return !(!oInbound ||
            !oResolutionResult ||
            !(oResolutionResult.applicationType === "WDA")
        );
    };

    /**
     * Determine whether we are dealing with local full url construction
     * (given sap.gui namespace with Transaction id, construct a full url)
     *
     * @param {object} oMatchResult
     *    The current match result
     *
     * @returns {boolean}
     *    Whether a local WDA resolution is to be made.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._isFullLocalWebguiResolution = function(oMatchResult) {
        var oInbound = oMatchResult.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult;

        if (this._oServiceConfiguration && this._oServiceConfiguration.config && this._oServiceConfiguration.config["enableWebguiLocalResolution"] === false) {
            return false;
        }

        return !(!oInbound ||
            !oResolutionResult ||
            !(oResolutionResult["sap.gui"]) ||
            !(oResolutionResult.applicationType === "TR")
        );
    };

    /**
     * Determine whether we can apply local Webgui resolution for
     * non-wrapped URLs.
     *
     * <p>Example:
     * <code>/ui2/nwbc/~canvas;window=app/transaction/SU01</code>
     * </p>
     *
     * @param {object} oMatchResult
     *    The current match result
     *
     * @returns {boolean}
     *    Whether a local Webgui resolution is to be made.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._isLocalWebguiNowrapResolution = function(oMatchResult) {
        var oInbound = oMatchResult.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult;

        if (this._oServiceConfiguration && this._oServiceConfiguration.config && this._oServiceConfiguration.config["enableWebguiLocalResolution"] === false) {

            return false;
        }

        // possible wrapped URLs:
        // - <protocol>://<host>:<port>/ui2/nwbc/~canvas;window=app/transaction/APB_LPD_CALL_B_I_TXN?DYNP_OKCODE=onli&P_APPL=FS2_TEST&P_CTO=EA%20%20X%20X&P_DYNNR=1000&P_OBJECT=&P_OKCODE=OKCODE&P_PRGRAM=FOOS&P_ROLE=FS2SAMAP&P_SELSCR=X&P_TCODE=SU01&sap-client=120&sap-language=EN"
        // - /ui2/nwbc/~canvas;window=app/transaction/APB_LPD_CALL_TRANS?DYNP_OKCODE=onli&P_APPL=UI_INTEGRATION_SAMPLES&P_OBJECT=&P_PNP=&P_ROLE=FLP_SAMPLE&P_SELSCR=X&P_TCODE=SU01&sap-client=120&sap-language=EN&sap-theme=sap_bluecrystal

        return !(!oInbound ||
            !oResolutionResult ||
            !(oResolutionResult.applicationType === "TR") ||
            !(oResolutionResult.url.indexOf("/~canvas;") >= 0) ||
            !(oResolutionResult.url.indexOf("app/transaction/APB_LPD_CALL_") === -1) // check no WRAPPED transaction
        );
    };

    /**
     * Determine whether we can apply local Webgui resolution for wrapped
     * URLs.
     *
     * <p>Examples:</p>
     * <p>
     * <code><protocol>://<host>:<port>/ui2/nwbc/~canvas;window=app/transaction/APB_LPD_CALL_B_I_TXN?DYNP_OKCODE=onli&P_APPL=FS2_TEST&P_CTO=EA%20%20X%20X&P_DYNNR=1000&P_OBJECT=&P_OKCODE=OKCODE&P_PRGRAM=FOOS&P_ROLE=FS2SAMAP&P_SELSCR=X&P_TCODE=SU01&sap-client=120&sap-language=EN"</code>
     * <code>/ui2/nwbc/~canvas;window=app/transaction/APB_LPD_CALL_TRANS?DYNP_OKCODE=onli&P_APPL=UI_INTEGRATION_SAMPLES&P_OBJECT=&P_PNP=&P_ROLE=FLP_SAMPLE&P_SELSCR=X&P_TCODE=SU01&sap-client=120&sap-language=EN&sap-theme=sap_bluecrystal</code>
     * </p>
     *
     * @param {object} oMatchResult
     *    The current match result
     *
     * @returns {boolean}
     *    Whether a local Webgui resolution is to be made.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._isLocalWebguiWrapResolution = function(oMatchResult) {
        var oInbound = oMatchResult.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult;

        if (this._oServiceConfiguration && this._oServiceConfiguration.config && this._oServiceConfiguration.config["enableWebguiLocalResolution"] === false) {

            return false;
        }

        return !(!oInbound ||
            !oResolutionResult ||
            !(oResolutionResult.applicationType === "TR") ||
            !(oResolutionResult.url.indexOf("/~canvas;") >= 0) ||
            !(oResolutionResult.url.indexOf("app/transaction/APB_LPD_CALL_") >= 0) // check WRAPPED transaction
        );
    };

    /**
     * Determine whether we can apply local Webgui resolution for
     * wrapped URLs.
     *
     * <p>Example:
     * <code>/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=*APB_LPD_CALL_TRANS%20DYNP_OKCODE%3donli%3bP_APPL%3dUI_INTEGRATION_SAMPLES%3bP_OBJECT%3d%3bP_PNP%3d%3bP_ROLE%3dFLP_SAMPLE%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN</code>
     * </p>
     *
     * @param {object} oMatchResult
     *    The current match result
     *
     * @returns {boolean}
     *    Whether a local native Webgui resolution is to be made.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._isLocalNativeWebguiWrapResolution = function(oMatchResult) {
        var oInbound = oMatchResult.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult;

        if (this._oServiceConfiguration && this._oServiceConfiguration.config && this._oServiceConfiguration.config["enableNativeWebguiLocalResolution"] === false) {
            return false;
        }

        // Possible URL:
        // /sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=*APB_LPD_CALL_TRANS%20DYNP_OKCODE%3donli%3bP_APPL%3dUI_INTEGRATION_SAMPLES%3bP_OBJECT%3d%3bP_PNP%3d%3bP_ROLE%3dFLP_SAMPLE%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN

        return !(!oInbound ||
            !oResolutionResult ||
            !(oResolutionResult.applicationType === "TR") ||
            !(oResolutionResult.url.indexOf("/its/webgui") >= 0) || // a native webgui URL
            !(oResolutionResult.url.indexOf("APB_LPD_CALL_") !== -1) // a WRAPPED URL
        );
    };

    /**
     * Determine whether we can apply local Webgui resolution for
     * non-wrapped URLs.
     *
     * <p>Example:
     * <code>/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255;~transaction=SU01?sap-client=120&sap-language=EN</code>
     * </p>
     *
     * @param {object} oMatchResult
     *    The current match result
     *
     * @returns {boolean}
     *    Whether a local native Webgui resolution is to be made.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._isLocalNativeWebguiNowrapResolution = function(oMatchResult) {
        var oInbound = oMatchResult.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult;

        if (this._oServiceConfiguration && this._oServiceConfiguration.config && this._oServiceConfiguration.config["enableNativeWebguiLocalResolution"] === false) {
            return false;
        }

        // Possible URL:
        // /sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255;~transaction=SU01?sap-client=120&sap-language=EN

        return !(!oInbound ||
            !oResolutionResult ||
            !(oResolutionResult.applicationType === "TR") ||
            !(oResolutionResult.url.indexOf("/its/webgui") >= 0) || // a native webgui URL
            !(oResolutionResult.url.indexOf("APB_LPD_CALL_") === -1) // a non wrapped URL
        );
    };

    /**
     * Extract and prepare early resolution result.
     *
     * @param {object} oMatchResult
     *   An object representing a match result
     * @param {object} oInbound
     *   The inbound
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._constructEarlyResolutionResult = function(oMatchResult, oInbound) {
        oMatchResult.resolutionResult = {};
        if (oInbound && oInbound.resolutionResult && oInbound.resolutionResult.hasOwnProperty("sap.platform.runtime")) {
            oMatchResult.resolutionResult["sap.platform.runtime"] = oInbound.resolutionResult["sap.platform.runtime"];
        }
        // here we fill a map of all oNewAppStateMembers
        // to identify the relevant names to retrieve
        Object.keys(oMatchResult.intentParamsPlusAllDefaults).slice(0).forEach(function(sName) {
            if (!jQuery.isArray(oMatchResult.intentParamsPlusAllDefaults[sName])) {
                if (!oMatchResult.resolutionResult.oNewAppStateMembers) {
                    oMatchResult.resolutionResult.oNewAppStateMembers = {};
                }
                oMatchResult.resolutionResult.oNewAppStateMembers[sName] = oMatchResult.intentParamsPlusAllDefaults[sName];
            }
        });
    };

    /**
     * return true iff any of the signature parameters of oMatchingTarget indicate
     * a renaming is happening
     * @param {object} oMatchingTarget
     *  a matchign target
     * @return {boolean}
     *  whether a renaming is part of the signature
     */
    ClientSideTargetResolution.prototype._hasRenameTo = function(oMatchingTarget) {
        return oMatchingTarget.inbound && oMatchingTarget.inbound.signature &&
            oMatchingTarget.inbound.signature.parameters &&
            Object.keys(oMatchingTarget.inbound.signature.parameters).some(function(sKey) {
                return !!(oMatchingTarget.inbound.signature.parameters[sKey].renameTo);
            });
    };

    /**
     * Clean up the unused complex parameter values from the default list
     *
     * After the invocation, the
     *  oMatchingTarget.resolutionResult.oNewAppStateMembers
     *  contains the actually *used* members (members present are deleted from the collection)
     *  Thus all defaultedParameterNames which are  thus the following defaultedParameterNames can be d
     * a) complex and b) not part of oMatchingTarget.resolutionResult.oNewAppStateMembers
     * can be removed, as they were effectively not defaulted
     * @param {object} oMatchingTarget the matching target
     * @private
     */
    ClientSideTargetResolution.prototype._removeUnusedComplexParameterValuesFromDefaultList = function(oMatchingTarget) {
        oMatchingTarget.defaultedParamNames = oMatchingTarget.defaultedParamNames.filter(function(sName) {
            if (oMatchingTarget.intentParamsPlusAllDefaults[sName] && !jQuery.isArray(oMatchingTarget.intentParamsPlusAllDefaults[sName])) {
                if (!(oMatchingTarget.resolutionResult.oNewAppStateMembers && oMatchingTarget.resolutionResult.oNewAppStateMembers[sName])) {
                    return false;
                }
            }
            return true;
        });
    };

    /**
     * set a member .navigationMode  and "sap-ushell-next-navmode"
     * iff a parameter
     * sap-ushell-navmode and "sap-ushell-next-navmode" respectively
     * is supplied and a valid value
     * @param {object} oMatchingTarget the matching target
     * @private
     */
    ClientSideTargetResolution.prototype._computeNavigationMode = function(oMatchingTarget) {
        var sApplicationType,
            sInternalNavigationMode,
            sExternalNextNavigationMode,
            sExternalNavigationMode,
            bLegacyToLegacyNavigation,
            oCurrentApplication,
            oNextApplication,
            aAllowedExternalNavModes = ["inplace", "explace"],
            oInbound = oMatchingTarget.inbound;

        // sap-ushell-next-navmode

        sExternalNextNavigationMode = (oMatchingTarget.intentParamsPlusAllDefaults["sap-ushell-next-navmode"] || [])[0];

        if (aAllowedExternalNavModes.indexOf(sExternalNextNavigationMode) >= 0) {
            oMatchingTarget.resolutionResult["sap-ushell-next-navmode"] = sExternalNextNavigationMode;
        }


        // sap-ushell-navmode

        sExternalNavigationMode = (oMatchingTarget.intentParamsPlusAllDefaults["sap-ushell-navmode"] || [])[0];

        if (aAllowedExternalNavModes.indexOf(sExternalNavigationMode) >= 0) {
            sApplicationType = (oInbound.resolutionResult || {}).applicationType;

            sInternalNavigationMode = this._getInternalNavigationMode(sExternalNavigationMode, sApplicationType);

            oMatchingTarget.resolutionResult.navigationMode = sInternalNavigationMode;
            oMatchingTarget.resolutionResult.explicitNavMode = true;

            jQuery.sap.log.debug(
                "Navigation mode was forced to " + sInternalNavigationMode,
                "because sap-ushell-navmode parameter was set to " + sExternalNavigationMode
                    + " for target with applicationType: " + sApplicationType,
                "sap.ushell.services.ClientSideTargetResolution"
            );

            return;
        }


        // enableInPlaceForClassicUIs

        oCurrentApplication = appConfiguration.getCurrentApplication() || {};
        oNextApplication = jQuery.sap.getObject("inbound.resolutionResult", undefined, oMatchingTarget) || {};

        bLegacyToLegacyNavigation =
            this._isLegacyApplicationType(oCurrentApplication.applicationType) && this._isLegacyApplicationType(oNextApplication.applicationType);

        if (this._oServiceConfiguration
            && this._oServiceConfiguration.config
            && this._oServiceConfiguration.config.enableInPlaceForClassicUIs === true /* important */ && !bLegacyToLegacyNavigation) {

            oMatchingTarget.resolutionResult.navigationMode = "embedded";
        }
    };

    /**
     * Determine the internal navigation mode for a given navigation mode.
     *
     * @param {string} sExternalNavigationMode
     *    A string identifying the external navigation mode. This is normally
     *    the value of the sap-ushell-next-navmode parameter configured in a
     *    matched inbound or provided in the intent.
     *
     *    This string can be one of:
     *    <ul>
     *       <li>explace</li>
     *       <li>inplace</li>
     *    </ul>
     *
     * @param {string} sApplicationType
     *    The application type of the inbound that has
     *    <code>sExternalNavigationMode</code> configured.
     *
     * @return {string}
     *
     *    The corresponding internal navigation mode. Can be one of the followings:
     *
     *    <ul>
     *      <li>replace: "take the URL of this target and replace it with the FLP"</li>
     *      <li>newWindow: "open a new window and put the URL of this target in the address bar"</li>
     *      <li>embedded: "embed this target (not merely its URL) into the current FLP"</li>
     *      <li>newWindowThenEmbedded: "open an FLP in a new window and embed this target (not merely its URL) into it"</li>
     *    </ul>
     *
     *    Returns null and logs an error in case wrong input parameters were given.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._getInternalNavigationMode = function (sExternalNavigationMode, sApplicationType) {
        var oInternalNavigationModeMap = {
            SAPUI5: {
                inplace: "embedded",
                explace: "newWindowThenEmbedded"
            },
            WDA: {
                inplace: "embedded",
                explace: "newWindowThenEmbedded"
            },
            TR: {
                inplace: "embedded",
                explace: "newWindowThenEmbedded"
            },
            URL: {
                inplace: "replace",
                explace: "newWindow"
            }
        };

        if (!oInternalNavigationModeMap.hasOwnProperty(sApplicationType)) {
            jQuery.sap.log.error(
                sApplicationType + " is not a valid application type",
                "expected one of " + Object.keys(oInternalNavigationModeMap).join(", "),
                "sap.ushell.services.ClientSideTargetResolution"
            );
            return null;
        }

        if (sExternalNavigationMode !== "inplace" && sExternalNavigationMode !== "explace") {
            jQuery.sap.log.error(
                sExternalNavigationMode + " is not a valid external navigation mode",
                "expected one of 'internal', 'external'",
                "sap.ushell.services.ClientSideTargetResolution"
            );
            return null;
        }

        return oInternalNavigationModeMap[sApplicationType][sExternalNavigationMode];
    };

    /**
     *  read: defaultedParamNames
     *        inbound.signature.parameters
     *  created: mappedDefaultedParamNames
     * @param {object} oMatchingTarget the matching target
     * @private
     */
    ClientSideTargetResolution.prototype._mapDefaultParameterNames = function(oMatchingTarget) {
        var oParameters = jQuery.sap.getObject("inbound.signature.parameters", undefined, oMatchingTarget) || {},
            oMap = {};
        oMatchingTarget.defaultedParamNames.forEach(function(sName) {
            var sNewName = (oParameters[sName] && oParameters[sName].renameTo) || sName;
            if (oMap[sNewName]) {
                jQuery.sap.log.error("renaming of defaultedParamNames creates duplicates" + sName + "->" + sNewName);
            } else {
                oMap[sNewName] = true;
            }
        });
        oMatchingTarget.mappedDefaultedParamNames = Object.keys(oMap).sort();
    };

    /**
     * This method modifies a passed Application State if
     * extended User Defaults are to be merged with an AppState or renaming takes place.
     *
     * It also *always* takes care of renaming parameters (generating mappedDefauledParamNames)
     * Thus it must be invoked in the flow even for targets which do not deal with appstate
     *
     * If one or more extended user default values are present, they will be added to a new
     * AppState unless already present
     *
     * A new Appstate is created when renaming has to occur or parameters are merged
     * <note>
     * If an incoming AppState content is encountered which is not
     * a) undefined or (b) an object, no new AppState is created and no renaming
     * or default merging takes place. The original passed AppState is returned unchanged
     *</note>
     *
     *Note that within this function also renaming of default Parameter names takes place
     *(independent of whether the AppState was tampered with!
     *
     * Technically, we
     * a) remove defaulted parameters which are already present
     * b) merge the remaining parameters into the appstate
     * c) rename the app state, logging collisions
     * d) remove effectively not used defaults from defaultParamNames
     * e) remap defaultParamNames in case of renameTo
     *
     * The new AppState is mixed it into the resolution result
     *
     * After the invocation, the
     * oMatchingTarget.resolutionResult.oNewAppStateMembers
     * contains the actually *used* members (members present are deleted from the collection)
     * Thus all defaultedParameterNames which are  thus the following defaultedParameterNames can be d
     * a) complex and b) not part of oMatchingTarget.resolutionResult.oNewAppStateMembers
     * can be removed, as they were effectively not defaulted
     *
     * If one or more extended user default values are present, they will be added to a new
     * AppState. In case there is an existing AppState, it's values will be copied as well.
     * The new AppState is mixed it into the resolution result.
     * If no extended user default value is present, the existing AppState is reused.
     * @param {object} oMatchingTarget
     *   One of the objects returned by {@link #_getMatchingInbounds}.
     * @param {object} oAppStateService
     *   the app state service instance
     * @returns {object}
     *   jQuery promise
     * @private
     * @since 1.34.0
     *
     */
    ClientSideTargetResolution.prototype._mixAppStateIntoResolutionResultAndRename = function(oMatchingTarget, oAppStateService) {
        var oDeferred = new jQuery.Deferred(),
            that = this,
            oNewAppState,
            sSourceAppStateKey,
            oSourceAppStateData;

        function cleanupAndResolve(oTarget) {
            that._removeUnusedComplexParameterValuesFromDefaultList(oTarget);
            that._mapDefaultParameterNames(oTarget);
            // compute NavigationMode
            that._computeNavigationMode(oTarget);
            // remove oNewAppStateMembers as it is not needed afterwards anymore
            delete oTarget.resolutionResult.oNewAppStateMembers;
            oDeferred.resolve(oTarget);
        }

        function hasAppStateMembers(oMatchingTarget) {
            return (oMatchingTarget.resolutionResult.oNewAppStateMembers && !jQuery.isEmptyObject(oMatchingTarget.resolutionResult.oNewAppStateMembers));
        }

        function isPresentProperty(aList, aParamName) {
            return jQuery.isArray(aList) && aList.some(function(oMember) {
                return (aParamName.indexOf(oMember) !== -1);
            });
        }

        function checkIfParameterExists(oAppStateData, aParamName) {
            var oSelectionVariant,
                aPNs,
                aSOs;
            // check whether parameter exists as part of selectionVariant.Parameters or SelectOptions
            if (oAppStateData && oAppStateData.selectionVariant) {
                oSelectionVariant = new SelectionVariant(JSON.stringify(oAppStateData.selectionVariant));
                aSOs = oSelectionVariant.getSelectOptionsPropertyNames() || [];
                aPNs = oSelectionVariant.getParameterNames() || [];
                if (isPresentProperty(aSOs, aParamName) || isPresentProperty(aPNs, aParamName)) {
                    return true;
                }
            }
            return false;
        }

        function renameAndRemoveDuplicates(oSelectionVariant, oRecordChange, oParameters) {
            var oResultingSelectionVariant = new SelectionVariant(),
                aSelectionVariantParameterNames = oSelectionVariant.getParameterNames() || [],
                aSelectionVariantSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames() || [],
                sParamValue,
                aSelectOption;

            // Rename parameters and remove duplicates
            aSelectionVariantParameterNames.forEach(function(sParamName) {
                sParamValue = oSelectionVariant.getParameter(sParamName);
                if (oParameters[sParamName] && oParameters[sParamName].renameTo) {
                    // Check whether a parameter with the -renameTo- name already exists as part of the SelectionVariant
                    if ((oResultingSelectionVariant.getParameter(oParameters[sParamName].renameTo) === undefined) &&
                        (oResultingSelectionVariant.getSelectOption(oParameters[sParamName].renameTo) === undefined)) {
                        oResultingSelectionVariant.addParameter(oParameters[sParamName].renameTo, sParamValue);
                        oRecordChange.changed = true;
                    } else {
                        jQuery.sap.log.error("renaming of appstate creates duplicates " + sParamName + "->" + oParameters[sParamName].renameTo);
                    }
                } else {
                    /* eslint-disable no-lonely-if */
                    if ((oResultingSelectionVariant.getParameter(sParamName) === undefined) &&
                        (oResultingSelectionVariant.getSelectOption(sParamName) === undefined)) {
                        oResultingSelectionVariant.addParameter(sParamName, sParamValue);
                    }
                    /* eslint-enable no-lonely-if */
                }
            });

            // Rename SelectOptions and remove duplicates
            aSelectionVariantSelectOptionsPropertyNames.forEach(function(sSelectOptionPropertyName) {
                aSelectOption = oSelectionVariant.getSelectOption(sSelectOptionPropertyName);
                if (oParameters[sSelectOptionPropertyName] && oParameters[sSelectOptionPropertyName].renameTo) {
                    // Check whether a parameter with the -renameTo- name already exists as part of the SelectionVariant
                    if ((oResultingSelectionVariant.getSelectOption(oParameters[sSelectOptionPropertyName].renameTo) === undefined) &&
                        (oResultingSelectionVariant.getParameter(oParameters[sSelectOptionPropertyName].renameTo) === undefined)) {
                        oResultingSelectionVariant.massAddSelectOption(oParameters[sSelectOptionPropertyName].renameTo, aSelectOption);
                        oRecordChange.changed = true;
                    } else {
                        jQuery.sap.log.error("renaming of appstate creates duplicates " + sSelectOptionPropertyName + "->" + oParameters[sSelectOptionPropertyName].renameTo);
                    }
                } else {
                    /* eslint-disable no-lonely-if */
                    if ((oResultingSelectionVariant.getSelectOption(sSelectOptionPropertyName) === undefined) &&
                        (oResultingSelectionVariant.getParameter(sSelectOptionPropertyName) === undefined)) {
                        oResultingSelectionVariant.massAddSelectOption(sSelectOptionPropertyName, aSelectOption);
                    }
                    /* eslint-enable no-lonely-if */
                }
            });

            // Remove all parameters from source SelectionVariant
            aSelectionVariantParameterNames.forEach(function(sParamName) {
                oSelectionVariant.removeParameter(sParamName);
            });
            // Remove all SelectOptions from source SelectionVariant
            aSelectionVariantSelectOptionsPropertyNames.forEach(function(sSelectOptionPropertyName) {
                oSelectionVariant.removeSelectOption(sSelectOptionPropertyName);
            });

            // Copy all parameters and SelectOptions from resulting SelectionVariant into source SelectionVariant,
            // because other important attributes as ID, Text, ParameterContextUrl, FilterContextUrl need to be kept as they were before
            oResultingSelectionVariant.getParameterNames().forEach(function(sParamName) {
                oSelectionVariant.addParameter(sParamName, oResultingSelectionVariant.getParameter(sParamName));
            });
            oResultingSelectionVariant.getSelectOptionsPropertyNames().forEach(function(sSelectOptionPropertyName) {
                oSelectionVariant.massAddSelectOption(sSelectOptionPropertyName, oResultingSelectionVariant.getSelectOption(sSelectOptionPropertyName));
            });

            return oSelectionVariant;
        }

        function fnRenameAppState(oSelectionVariant, oRecordChange, oParameters) {
            // rename all parameters
            return renameAndRemoveDuplicates(oSelectionVariant, oRecordChange, oParameters);
        }

        function isInvalidAppStateData(oData) {
            if (oData === undefined || jQuery.isPlainObject(oData)) {
                return false;
            }
            return true;
        }

        function fnMergeAppState(oNewAppState0) {
            // at this point, oNewAppState Members only contains members which are to be added!
            // (there should be no collisions!)
            var oNewAppStateData = oNewAppState0.getData() || {},
                oSelectionVariant,
                oChangeRecorder = {};

            if (oNewAppStateData.selectionVariant) {
                oSelectionVariant = new SelectionVariant(JSON.stringify(oNewAppStateData.selectionVariant));
            } else {
                oSelectionVariant = new SelectionVariant();
            }

            if (hasAppStateMembers(oMatchingTarget)) {
                Object.keys(oMatchingTarget.resolutionResult.oNewAppStateMembers).forEach(function(sName) {
                    oSelectionVariant.massAddSelectOption(sName, oMatchingTarget.resolutionResult.oNewAppStateMembers[sName].Ranges);
                });
            }
            oSelectionVariant = fnRenameAppState(oSelectionVariant, oChangeRecorder, oMatchingTarget.inbound.signature.parameters);
            // Save SelectionVariant in app state if it is not an empty SelectionVatiant (no parameters and no SelectOptions)
            if (oSelectionVariant.getParameterNames().length !== 0 || oSelectionVariant.getSelectOptionsPropertyNames().length !== 0) {
                oNewAppStateData.selectionVariant = oSelectionVariant.toJSONObject();
            }

            if (!oChangeRecorder.changed && !hasAppStateMembers(oMatchingTarget)) {
                // there was no effective change -> retain old appstate
                cleanupAndResolve(oMatchingTarget);
                return;
            }
            oNewAppState0.setData(oNewAppStateData);
            oNewAppState0.save().done(function() {
                oMatchingTarget.intentParamsPlusAllDefaults["sap-xapp-state"] = [oNewAppState0.getKey()];
                oMatchingTarget.mappedIntentParamsPlusSimpleDefaults["sap-xapp-state"] = [oNewAppState0.getKey()];
                cleanupAndResolve(oMatchingTarget);
            });
        }

        if (!hasAppStateMembers(oMatchingTarget) && !that._hasRenameTo(oMatchingTarget)) {
            // keep old AppState
            cleanupAndResolve(oMatchingTarget);
        } else {
            sSourceAppStateKey = oMatchingTarget.intentParamsPlusAllDefaults["sap-xapp-state"] &&
                oMatchingTarget.intentParamsPlusAllDefaults["sap-xapp-state"][0];

            if (sSourceAppStateKey) {
                // if an AppState key is already present as part of the intent parameters, take
                // this one and copy its data to a new AppState (remember, AppState instances
                // are immutable)
                oAppStateService.getAppState(sSourceAppStateKey).done(function(oSourceAppState) {
                    var oParameterDominatorMap = that._constructParameterDominatorMap(oMatchingTarget.inbound.signature.parameters);
                    oSourceAppStateData = oSourceAppState.getData();
                    // if the data is not usable ...
                    if (isInvalidAppStateData(oSourceAppStateData)) {
                        // we indicate removal of all extended defaults!
                        delete oMatchingTarget.resolutionResult.oNewAppStateMembers;
                        // and return the old appstate
                        cleanupAndResolve(oMatchingTarget);
                    }
                    if (oMatchingTarget.resolutionResult.oNewAppStateMembers) {
                        Object.keys(oMatchingTarget.resolutionResult.oNewAppStateMembers).forEach(function(sParamName) {
                            var aDominatorParams = oParameterDominatorMap[sParamName].dominatedBy;
                            if (checkIfParameterExists(oSourceAppStateData, aDominatorParams)) {
                                delete oMatchingTarget.resolutionResult.oNewAppStateMembers[sParamName];
                            }
                        });
                    }

                    if (!hasAppStateMembers(oMatchingTarget) && !that._hasRenameTo(oMatchingTarget)) {
                        // keep old AppState
                        cleanupAndResolve(oMatchingTarget);
                    } else {
                        oNewAppState = oAppStateService.createEmptyAppState(undefined, true);
                        if (oNewAppState) {
                            oNewAppState.setData(oSourceAppState.getData());
                            fnMergeAppState(oNewAppState);
                        }
                    }
                });
            } else if (hasAppStateMembers(oMatchingTarget)) {
                fnMergeAppState(oAppStateService.createEmptyAppState(undefined, true));
            } else {
                // no need to rename in nonexisting appstate
                cleanupAndResolve(oMatchingTarget);
            }
        }
        return oDeferred.promise();
    };

    /**
     * Expand inbound filter object for the CSTR Adapter if enabled via configuration.
     *
     * @param {variant} vObject
     *   An input structure to extract the filter from.
     *   Currently we support a string representing a hash fragment.
     *
     * @returns {object[]}
     *   <code>undefined</code>, or an array of Segments (tuples semanticObject, action) in the form:
     * <pre>
     *  [
     *    {
     *      semanticObject : "So1",
     *      action : "action1"
     *    },
     *    ...
     *  ]
     * </pre>
     *
     */
    ClientSideTargetResolution.prototype._extractInboundFilter = function(vObject) {
        if (!this._oAdapter.hasSegmentedAccess) {
            return undefined;
        }
        if (typeof vObject !== "string") {
            return undefined;
        }

        var sFixedHashFragment = vObject.indexOf("#") === 0 ? vObject : "#" + vObject;
        var oShellHash = this._getURLParsing().parseShellHash(sFixedHashFragment);

        if (!oShellHash || !oShellHash.semanticObject || !oShellHash.action) {
            return undefined;
        }

        return [{
            semanticObject: oShellHash.semanticObject,
            action: oShellHash.action
        }];
    };

    /**
     * Resolves the URL hash fragment asynchronously.
     * <p>
     * The form factor of the current device is used to filter the
     * navigation targets returned.
     * </p>
     * @param {string} sHashFragment
     *   The URL hash fragment in internal format (as obtained by the hasher service from SAPUI5,
     *   not as given in <code>location.hash</code>)
     *
     * @returns {object}
     *   A <code>jQuery.Promise</code>. Its <code>done()</code> function
     *   gets an object that you can use to create a {@link
     *   sap.ushell.components.container.ApplicationContainer} or
     *   <code>undefined</code> in case the hash fragment was empty.
     *
     * @private
     * @since 1.34.0
     */
    ClientSideTargetResolution.prototype.resolveHashFragment = function(sHashFragment) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            // NOTE: adapter may not implement fallback function
            fnBoundFallback = this._oAdapter.resolveHashFragmentFallback && this._oAdapter.resolveHashFragmentFallback.bind(this._oAdapter),
            aSegments = this._extractInboundFilter(sHashFragment);

        this._oInboundProvider.getInbounds(aSegments).then(
            function(aInbounds) {
                that._resolveHashFragment(sHashFragment, fnBoundFallback, aInbounds)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            },
            function() {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );

        return oDeferred.promise();
    };

    /**
     * Resolves a given intent to information that can be used to render a tile.
     *
     * @param {string} sHashFragment
     *   The intent to be resolved (including the "#" sign)
     *
     * @return {jQuery.Deferred.promise}
     *   A promise that resolves with an object containing the necessary
     *   information to render a tile, or rejects with an error message or
     *   <code>undefined</code>.
     *
     * @private
     * @since 1.38.0
     */
    ClientSideTargetResolution.prototype.resolveTileIntent = function(sHashFragment) {
        var that = this,
            oDeferred = new jQuery.Deferred(),

            // NOTE: adapter may not implement fallback function
            aSegments = this._extractInboundFilter(sHashFragment);

        this._oInboundProvider.getInbounds(aSegments).then(
            function(aInbounds) {
                that._resolveTileIntent(sHashFragment, undefined, aInbounds)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            },
            function() {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );
        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._resolveHashFragment = function(sHashFragment, fnBoundFallback, aInbounds) {
        var oUrlParsing = this._getURLParsing(),
            that = this,
            oDeferred = new jQuery.Deferred(),
            sFixedHashFragment = sHashFragment.indexOf("#") === 0 ? sHashFragment : "#" + sHashFragment,
            oShellHash = oUrlParsing.parseShellHash(sFixedHashFragment);

        if (oShellHash === undefined) {
            jQuery.sap.log.error("Could not parse shell hash '" + sHashFragment + "'",
                "please specify a valid shell hash",
                "sap.ushell.services.ClientSideTargetResolution");
            return oDeferred.reject().promise();
        }

        oShellHash.formFactor = sap.ushell.utils.getFormFactor();

        this._getMatchingInbounds(oShellHash, aInbounds, true /* bExcludeTileInbounds */ )
            .fail(function(sError) {
                jQuery.sap.log.error("Could not resolve " + sHashFragment,
                    "_getMatchingInbounds promise rejected with: " + sError,
                    "sap.ushell.services.ClientSideTargetResolution");
                oDeferred.reject(sError);
            })
            .done(function(aMatchingTargets) {
                var oMatchingTarget;

                if (aMatchingTargets.length === 0) {
                    jQuery.sap.log.warning("Could not resolve " + sHashFragment,
                        "rejecting promise",
                        "sap.ushell.services.ClientSideTargetResolution");
                    oDeferred.reject("Could not resolve navigation target");
                    return;
                }

                oMatchingTarget = aMatchingTargets[0];
                that._resolveSingleMatchingTarget(oMatchingTarget, fnBoundFallback, sFixedHashFragment)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            });

        return oDeferred.promise();
    };

    /**
     * Produces a resolution result from an Easy Access Menu intent
     * like Shell-startGUI or Shell-startWDA.
     *
     * @param {object} oIntent
     *   The intent to be resolved. It must have semantic object and
     *   actions like: #Shell-startGUI and #Shell-startWDA.
     * @param {object} [oMatchingTarget]
     *   The mathing target, an oInbound.resolutionResult["sap.platform.runtime"] member will be propagated
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolved with the resolution result generated from
     *   the given intent, or rejects with an error message.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._resolveEasyAccessMenuIntent = function(oIntent, oMatchingTarget) {
        var sError = "Intent must be either #Shell-startGUI or #Shell-startWDA";

        // Determine whether intent is valid
        if (oIntent.action === "startGUI") {
            return this._resolveEasyAccessMenuIntentWebgui(oIntent, oMatchingTarget);
        }

        if (oIntent.action === "startWDA") {
            return this._resolveEasyAccessMenuIntentWDA(oIntent, oMatchingTarget);
        }

        // Error occurred if this point is reached
        return new jQuery.Deferred().reject(
            "The easy access menu intent " + oIntent.semanticObject + "-" + oIntent.action + " could not be resolved: " + sError
        ).promise();
    };

    ClientSideTargetResolution.prototype._resolveEasyAccessMenuIntentWDA = function(oIntent, oMatchingTarget) {
        var oDeferred = new jQuery.Deferred(),
            sUrl,
            oURI,
            that = this,
            oAppParameters = {};

        sUrl = "/ui2/nwbc/~canvas;window=app/wda/" + oIntent.params["sap-ui2-wd-app-id"][0] + "/";

        // also parameters for the application itself should be added
        jQuery.each(oIntent.params, function(index, value) {
            if (index === "sap-ui2-wd-app-id" || index === "sap-system") {
                return;
            }
            if (index === "sap-ui2-wd-conf-id") {
                oAppParameters["sap-wd-configId"] = value;
                return;
            }

            oAppParameters[index] = value;
        });
        if (oAppParameters) {
            sUrl = sUrl + "?" + that._getURLParsing().paramsToString(oAppParameters);
        }

        oURI = new URI(sUrl);
        this._spliceSapSystemIntoURI(oURI, "" /*sSystemAlias*/ , oIntent.params["sap-system"][0], "WDA")
            .done(function(oURI) {
                var oResolutionResult = {
                    url: oURI.toString(),
                    applicationType: "NWBC",
                    text: oIntent.params["sap-ui2-wd-app-id"][0],
                    additionalInformation: "",
                    "sap-system": oIntent.params["sap-system"][0]
                };
                if (oMatchingTarget && oMatchingTarget.inbound && oMatchingTarget.inbound.resolutionResult && oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"]) {
                    oResolutionResult["sap.platform.runtime"] = oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"];
                }
                oDeferred.resolve(oResolutionResult);
            })
            .fail(oDeferred.reject.bind(oDeferred));
        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._resolveEasyAccessMenuIntentWebgui = function(oIntent, oMatchingTarget) {
        var oDeferred = new jQuery.Deferred(),
            sUrl, oURI;
        sUrl = "/sap/bc/gui/sap/its/webgui?%7etransaction=" + oIntent.params["sap-ui2-tcode"][0] + "&%7enosplash=1";
        oURI = new URI(sUrl);
        this._spliceSapSystemIntoURI(oURI, "" /*sSystemAlias*/ , oIntent.params["sap-system"][0], "NATIVEWEBGUI")
            .done(function(oURI) {
                var oResolutionResult = {
                    url: oURI.toString(),
                    applicationType: "TR",
                    text: oIntent.params["sap-ui2-tcode"][0],
                    additionalInformation: "",
                    "sap-system": oIntent.params["sap-system"][0]
                };
                if (oMatchingTarget && oMatchingTarget.inbound && oMatchingTarget.inbound.resolutionResult && oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"]) {
                    oResolutionResult["sap.platform.runtime"] = oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"];
                }
                oDeferred.resolve(oResolutionResult);
            })
            .fail(oDeferred.reject.bind(oDeferred));
        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._resolveSingleMatchingTarget = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            oUrlParsingSrvc = this._getURLParsing(),
            oIntent = oUrlParsingSrvc.parseShellHash(sFixedHashFragment);

        if (oIntent.semanticObject === "Shell" && (
                oIntent.action === "startWDA" || oIntent.action === "startGUI")) {

            return this._resolveEasyAccessMenuIntent(oIntent, oMatchingTarget);
        }

        // rename Parameters
        this._mapParameterNamesAndRemoveObjects(oMatchingTarget);
        this._mixAppStateIntoResolutionResultAndRename(oMatchingTarget, sap.ushell.Container.getService("AppState")).done(function(oMatchingTarget) {
            // prepare a proper URL!
            var fnBoundResolutionResultProcessor = that._determineResultProcessor(oMatchingTarget);
            fnBoundResolutionResultProcessor(oMatchingTarget, fnBoundFallback, sFixedHashFragment)
                .done(function(oMatchingTarget) {
                    oDeferred.resolve(oMatchingTarget.resolutionResult);

                    jQuery.sap.log.debug(
                        "Intent was resolved to the following target",
                        JSON.stringify(oMatchingTarget.resolutionResult, null, 3),
                        "sap.ushell.services.ClientSideTargetResolution"
                    );
                })
                .fail(function(sMessage) {
                    if (sMessage.indexOf("fallback:") >= 0) {
                        that._constructFallbackResolutionResult.call(this, oMatchingTarget, fnBoundFallback, sFixedHashFragment)
                            .fail(oDeferred.reject.bind(oDeferred))
                            .done(function(oMatchingTarget) {
                                oDeferred.resolve(oMatchingTarget.resolutionResult);
                            });
                    } else {
                        oDeferred.reject(sMessage);
                    }
                });
        });

        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._resolveTileIntent = function(sHashFragment, fnBoundFallback, aInbounds) {
        var oUrlParsing = this._getURLParsing(),
            that = this,
            oDeferred = new jQuery.Deferred(),
            sFixedHashFragment = sHashFragment.indexOf("#") === 0 ? sHashFragment : "#" + sHashFragment,
            oShellHash = oUrlParsing.parseShellHash(sFixedHashFragment);

        if (oShellHash === undefined) {
            jQuery.sap.log.error("Could not parse shell hash '" + sHashFragment + "'",
                "please specify a valid shell hash",
                "sap.ushell.services.ClientSideTargetResolution");
            return oDeferred.reject("Cannot parse shell hash").promise();
        }

        oShellHash.formFactor = sap.ushell.utils.getFormFactor();

        this._getMatchingInbounds(oShellHash, aInbounds, false)
            .fail(function(sError) {
                jQuery.sap.log.error("Could not resolve " + sHashFragment,
                    "_getMatchingInbounds promise rejected with: " + sError,
                    "sap.ushell.services.ClientSideTargetResolution");
                oDeferred.reject(sError);
            })
            .done(function(aMatchingTargets) {
                var oMatchingTarget;

                if (aMatchingTargets.length === 0) {
                    jQuery.sap.log.warning("Could not resolve " + sHashFragment,
                        "no matching targets were found",
                        "sap.ushell.services.ClientSideTargetResolution");
                    oDeferred.reject("No matching targets found");
                    return;
                }

                oMatchingTarget = aMatchingTargets[0];
                that._resolveSingleMatchingTileIntent(oMatchingTarget, fnBoundFallback, sFixedHashFragment)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            });
        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._resolveSingleMatchingTileIntent = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var oDeferred = new jQuery.Deferred();

        // if it's not a custom tile, we are done for now (Hardcoding tile type)
        oDeferred.resolve(oMatchingTarget.inbound.tileResolutionResult);
        return oDeferred.promise();

        // Handle custom tile (TODO)
        /*
         * // Construct proper url  for invocation of the Custom tile application,
         * // amend tileResolutionResult with a resolutionResult for the tile
         * // the instantiated component is invoked with the parameters
         * // rename Parameters
         * this._mapParameterNamesAndRemoveObjects(oMatchingTarget);
         * this._mixAppStateIntoResolutionResultAndRename(oMatchingTarget,sap.ushell.Container.getService("AppState")).done(function(oMatchingTarget) {
         *     // prepare a proper URL!
         *     var fnBoundResolutionResultProcessor = that._determineResultProcessor(oMatchingTarget);
         *     fnBoundResolutionResultProcessor(oMatchingTarget, fnBoundFallback, sFixedHashFragment)
         *         .done(function (oMatchingTarget) {
         *             oDeferred.resolve(oMatchingTarget.resolutionResult);
         *         })
         *         .fail(function (sMessage) {
         *             if (sMessage.indexOf("fallback:") >= 0 ) {
         *                 that._constructFallbackResolutionResult.call(this, oMatchingTarget, fnBoundFallback, sFixedHashFragment)
         *                     .fail(oDeferred.reject.bind(oDeferred))
         *                     .done(function (oMatchingTarget) {
         *                         oDeferred.resolve(oMatchingTarget.resolutionResult);
         *                     });
         *             } else {
         *                 oDeferred.reject(sMessage);
         *             }
         *         });
         * });
         */
    };

    /**
     * Determines the result processor for the matching target.
     *
     * @param {object} oMatchingTarget
     *   The matching target
     *
     * @returns {function}
     *   The result processor for the given matching target, that is, a
     *   function that can be called on the matching target to construct an
     *   appropriate resolution result.
     */
    ClientSideTargetResolution.prototype._determineResultProcessor = function(oMatchingTarget) {
        var oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult;

        function logProcessor(sProcessorType, sReason) {
            jQuery.sap.log.debug(
                "Resolution result will be constructed via " + sProcessorType + " processor",
                sReason,
                "sap.ushell.services.ClientSideTargetResolution"
            );
        }

        if (!oInbound || !oResolutionResult) {
            logProcessor("FALLBACK", "the inbound or the inbound resolutionResult member was not available");
            return this._constructFallbackResolutionResult.bind(this);
        }

        if (oResolutionResult.applicationType === "SAPUI5") {
            logProcessor("SAPUI5", "inbound resolutionResult had SAPUI5 applicationType");
            return this._constructSAPUI5ResolutionResult.bind(this);
        }

        var isFullWDA = this._isFullLocalWDAResolution(oMatchingTarget);
        if (isFullWDA) {
            logProcessor("WDA full url construction");
            return this._constructFullWDAResolutionResult.bind(this);
        }

        var isWDA = this._isLocalWDAResolution(oMatchingTarget);
        if (isWDA) {
            logProcessor("WDA");
            return this._constructWDAResolutionResult.bind(this);
        }

        var isFullWebgui = this._isFullLocalWebguiResolution(oMatchingTarget);
        if (isFullWebgui) {
            logProcessor("NON-WRAPPED WEBGUI full url construction");
            return this._constructFullWebguiResolutionResult.bind(this);
        }
        var isLocalWebguiNowrap = this._isLocalWebguiNowrapResolution(oMatchingTarget);
        if (isLocalWebguiNowrap) {
            logProcessor("NON-WRAPPED WEBGUI");
            return this._constructWebguiNowrapResult.bind(this);
        }

        var isLocalWebguiWrap = this._isLocalWebguiWrapResolution(oMatchingTarget);
        if (isLocalWebguiWrap) {
            logProcessor("WRAPPED WEBGUI");
            return this._constructWebguiWrapResult.bind(this);
        }

        var isNativeWebguiNowrap = this._isLocalNativeWebguiNowrapResolution(oMatchingTarget);
        if (isNativeWebguiNowrap) {
            logProcessor("NATIVE NON-WRAPPED WEBGUI");
            return this._constructNativeWebguiNowrapResult.bind(this);
        }

        var isNativeWebguiWrap = this._isLocalNativeWebguiWrapResolution(oMatchingTarget);
        if (isNativeWebguiWrap) {
            logProcessor("NATIVE WRAPPED WEBGUI");
            return this._constructNativeWebguiWrapResult.bind(this);
        }

        if (oResolutionResult.applicationType === "URL") {
            logProcessor("URL", "inbound resolutionResult had URL applicationType");
            return this._constructURLResolutionResult.bind(this);
        }

        logProcessor("FALLBACK", "could not apply any result processor to inbound resolutionResult: " + JSON.stringify(oResolutionResult, null, "   "));
        return this._constructFallbackResolutionResult.bind(this);
    };

    /**
     * De-interpolates a URL interpolated with data (protocol, port...)
     * from a system alias.
     *
     * @param {URI} oURI
     *   A URI object that may or may not have been interpolated with a
     *   certain system alias.
     * @param {string} sSystemAlias
     *   The system alias the url in <code>oURI</code> was interpolated
     *   with, or <code>undefined</code> if the URL was not intepolated.
     *   <p>This is used as a hint to de-interpolate the URL path
     *   prefix.</p>
     * @param {string} sURIType
     *   The type of URI, for example, "WDA".
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves to a URI object containing a URL
     *   de-interpolated of parts from a system alias.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._stripURI = function(oURI, sSystemAlias, sURIType) {
        var oDeferred = new jQuery.Deferred(),
            that = this;

        if (typeof sSystemAlias === "undefined") {
            this._stripURIWithSystemAlias(oURI, sSystemAlias, sURIType, undefined)
                .fail(function(sError) {
                    oDeferred.reject(sError);
                })
                .done(function(oNewURI) {
                    oDeferred.resolve(oNewURI);
                });

            return oDeferred.promise();
        }

        this._oAdapter.resolveSystemAlias(sSystemAlias)
            .fail(function(sErrorMessage) {
                oDeferred.reject(sErrorMessage);
            })
            .done(function(oResolvedSystemAlias) {
                that._stripURIWithSystemAlias(oURI, sSystemAlias, sURIType, oResolvedSystemAlias)
                    .fail(function(sError) {
                        oDeferred.reject(sError);
                    })
                    .done(function(oNewURI) {
                        oDeferred.resolve(oNewURI);
                    });
            });

        return oDeferred.promise();
    };

    /**
     * Helper for {@link #_stripURI}.
     *
     * @param {URI} oURI
     *   A URI object that may or may not have been interpolated with a
     *   certain system alias.
     * @param {string} sSystemAlias
     *   The system alias the url in <code>oURI</code> was interpolated
     *   with, or <code>undefined</code> if the URL was not intepolated.
     *   <p>This is used as a hint to de-interpolate the URL path
     *   prefix.</p>
     * @param {string} sURIType
     *   The type of URI, for example, "WDA".
     * @param {object} oResolvedSystemAlias
     *   The resolved system alias
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves to a URI object containing a URL
     *   de-interpolated of parts from a system alias.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._stripURIWithSystemAlias = function(oURI, sSystemAlias, sURIType, oResolvedSystemAlias) {
        var that = this,
            oSystemAliasData,
            sSystemAliasDataName,
            sTmpPath,
            sSystemAliasPathPrefix,
            oDeferred = new jQuery.Deferred(),
            oPathPrefixDeferred = new jQuery.Deferred();

        // Strip web-related parts..
        oURI.protocol("");
        oURI.hostname("");
        oURI.port("");

        that._removeParametersFromURI(oURI, ["sap-client", "sap-language"]);

        /*
         * Only modify paths if we are going to replace a systemAlias (i.e.,
         * take into account undefined system alias -> no replacement).
         */
        if (!jQuery.isPlainObject(oResolvedSystemAlias) || typeof sSystemAlias !== "string") {
            return oDeferred.resolve(oURI).promise();
        }

        // guess what web system alias was used to interpolate URL
        sSystemAliasDataName = that._selectSystemAliasDataName(
            oResolvedSystemAlias, new URI(window.location.toString()).protocol()
        );
        oSystemAliasData = oResolvedSystemAlias[sSystemAliasDataName];

        // decide path prefix
        sSystemAliasPathPrefix = (typeof oSystemAliasData.pathPrefix === "string") && oSystemAliasData.pathPrefix;
        if (sSystemAliasPathPrefix !== "") {
            // current system alias is good enough for de-interpolate
            oPathPrefixDeferred.resolve(sSystemAliasPathPrefix);

        } else {
            // must use local path prefix
            this._oAdapter.resolveSystemAlias("" /* local system alias */ )
                .fail(function(sErrorMessage) {
                    oDeferred.reject(sErrorMessage);
                })
                .done(function(oResolvedLocalSystemAlias) {
                    var oResolvedLocalSystemAliasData = oResolvedLocalSystemAlias[sSystemAliasDataName];
                    oPathPrefixDeferred.resolve(oResolvedLocalSystemAliasData.pathPrefix);
                });
        }

        // deinterpolate path prefix from url string
        oPathPrefixDeferred
            .fail(function(sErrorMessage) {
                oDeferred.reject(sErrorMessage);
            })
            .done(function(sSystemAliasPathPrefix) {

                if (sSystemAliasPathPrefix && sSystemAliasPathPrefix.length > 0) {

                    // use the obtained data to strip path prefix, otherwise assume it was hardcoded
                    sTmpPath = oURI.path();
                    sTmpPath = sTmpPath.replace(sSystemAliasPathPrefix, "");

                    // add leading forward slash if replacement deleted it
                    if (sTmpPath.indexOf("/") !== 0) {
                        sTmpPath = "/" + sTmpPath;
                    }

                    oURI.path(sTmpPath);
                }

                // Deal with transaction related parts
                if (sURIType === "NATIVEWEBGUI" && oResolvedSystemAlias.hasOwnProperty("rfc")) {

                    // remove all rfc related parameters from the path
                    sTmpPath = oURI.path();
                    sTmpPath = sTmpPath.split(";")
                        .filter(function(sParam) {
                            return sParam.indexOf("~sysid=") !== 0 &&
                                sParam.indexOf("~service=") !== 0 &&
                                sParam.indexOf("~loginGroup=") !== 0 &&
                                sParam.indexOf("~messageServer=") !== 0 &&
                                sParam.indexOf("~sncNameR3=") !== 0 &&
                                sParam.indexOf("~sncQoPR3=") !== 0;
                        })
                        .join(";");

                    oURI.path(sTmpPath);
                }

                oDeferred.resolve(oURI);
            });

        return oDeferred.promise();
    };

    /**
     * Removes the specified parameters from the given URI object. Treats
     * the given object which is mutated.
     *
     * @param {URI} oURI
     *    The URI object to remove parameter from.
     * @param {string[]} aParametersToRemove
     *    An array of parameters to remove from oURI query
     *
     * @private
     */
    ClientSideTargetResolution.prototype._removeParametersFromURI = function(oURI, aParametersToRemove) {
        var oBannedParametersLookup = {},
            sTmpQuery;

        aParametersToRemove.forEach(function(sParam) {
            oBannedParametersLookup[sParam] = true;
        });

        sTmpQuery = oURI.query();
        sTmpQuery = sTmpQuery
            .split("&")
            .filter(function(sParam) {
                var sParamName = (sParam.split("=")[0] || "").toLowerCase();
                return !oBannedParametersLookup.hasOwnProperty(sParamName);
            })
            .join("&");
        oURI.query(sTmpQuery);
    };


    /**
     * Resolves the given sSapSystem interpolating the result into the
     * given oURI object.
     *
     * @param {URI} oURI
     *   An URI object representing the current URL type.
     *
     * @param {string} [sSystemAlias]
     *   The sap-system alias that was used to generate the url in
     *   <code>oURI</code>. The value <code>undefined</code> will
     *   implicitly indicate that the url in <code>oURI</code> was not
     *   generated or processed based on a sap-system alias.
     *
     * @param {string} sSapSystem
     *   The sap-system alias to be resolved, may be undefined.  The object
     *   is mutated, e.g. server, port, and search (sap-client within
     *   search) are modified to represent the actual system.
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that is resolved with a modified URI object, or rejected
     *   with two parameters in case it was not possible to resolve the
     *   given sap-system.
     *
     *   <p> NOTE: the "fallback:" prefix in the error message of the
     *   rejected promise is currently used as a convention to trigger
     *   fallback behavior. </p>
     *
     * @private
     */
    ClientSideTargetResolution.prototype._spliceSapSystemIntoUrlURI = function(oURI, sSystemAlias, sSapSystem) {
        var that = this,
            oDeferred = new jQuery.Deferred();

        // no need to manipulate URL
        if (typeof sSapSystem === "undefined" || sSystemAlias === sSapSystem) {
            return oDeferred.resolve(oURI).promise();
        }

        /*
         * Deal with empty system alias cases
         *
         * having an empty or undefined system alias indicates that the URL
         * was not pre-interpolated.
         */
        if (sSystemAlias === "" || typeof sSystemAlias === "undefined") {
            // absolute urls are kept as is and resolved directly
            if (this._isAbsoluteURI(oURI)) {
                return oDeferred.resolve(oURI);
            }

            // no need to check for containment of all parts, can apply sap
            // system directly as the url is relative.
            that._applyAliasToURI(sSapSystem, oURI, "URL")
                .fail(function(sError) {
                    oDeferred.reject(sError);
                })
                .done(function(oURIWithSystemAlias) {
                    oDeferred.resolve(oURIWithSystemAlias);
                });

            return oDeferred.promise();
        }

        // we *must* call resolveSystemAlias past this point
        if (typeof this._oAdapter.resolveSystemAlias !== "function") {
            return oDeferred.reject("fallback: the adapter does not implement resolveSystemAlias").promise();
        }

        /*
         * At this point we need to detect the case in which an absolute
         * URL was given because the system alias was applied to it.  To
         * detect this, we try to strip each piece of the system alias from
         * the URL and if we are not successful we can assume the URL was
         * hardcoded.
         */
        this._oAdapter.resolveSystemAlias(sSystemAlias) // must check if the URL was given absolute because of the systemAlias
            .fail(function(sError) {
                oDeferred.reject(sError);
            })
            .done(function(oResolvedSystemAlias) {
                var sSystemAliasDataName = that._selectSystemAliasDataName(
                        oResolvedSystemAlias, new URI(window.location.toString()).protocol()
                    ),
                    oSystemAliasData = oResolvedSystemAlias[sSystemAliasDataName],
                    sDeinterpolatedPath;

                // Check if URL contains *all* the parts from the systemAlias
                if ((oURI.protocol() || "").toLowerCase() === sSystemAliasDataName &&
                    (oURI.hostname() || "") === oSystemAliasData.host &&
                    (oURI.path().indexOf(oSystemAliasData.pathPrefix) === 0)) {

                    // URL was interpolated - must de-interpolate it!
                    oURI.protocol("");
                    oURI.hostname("");
                    sDeinterpolatedPath = oURI.path().replace(oSystemAliasData.pathPrefix, "");
                    oURI.path(sDeinterpolatedPath);
                    that._removeParametersFromURI(oURI, ["sap-language", "sap-client"]);

                    // URL was interpolated, apply sap system!
                    that._applyAliasToURI(sSapSystem, oURI, "URL")
                        .fail(function(sError) {
                            oDeferred.reject(sError);
                        })
                        .done(function(oURIWithSystemAlias) {
                            oDeferred.resolve(oURIWithSystemAlias);
                        });
                } else {
                    oDeferred.resolve(oURI);
                }

            });


        return oDeferred.promise();
    };

    /**
     * Resolves the given sSapSystem interpolating the result into the
     * given oURI object.
     *
     * @param {URI} oURI
     *   An URI object representing the current URI.
     *
     * @param {string} [sSystemAlias]
     *   The sap-system alias that was used to generate the url in
     *   <code>oURI</code>. The value <code>undefined</code> will
     *   implicitly indicate that the url in <code>oURI</code> was not
     *   generated or processed based on a sap-system alias.
     *
     * @param {string} sSapSystem
     *   The sap-system alias to be resolved, may be undefined.  The object
     *   is mutated, e.g. server, port, and search (sap-client within
     *   search) are modified to represent the actual system.
     *
     * @param {string} sURIType
     *   The type of URI passed as first parameter, for example, "WDA".
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that is resolved with a modified URI object, or rejected
     *   with two parameters in case it was not possible to resolve the
     *   given sap-system.
     *
     *   <p> NOTE: the "fallback:" prefix in the error message of the
     *   rejected promise is currently used as a convention to trigger
     *   fallback behavior.  </p>
     *
     * @private
     */
    ClientSideTargetResolution.prototype._spliceSapSystemIntoURI = function(oURI, sSystemAlias, sSapSystem, sURIType) {
        var oDeferred = new jQuery.Deferred(),
            that = this;

        // Treat URL types separately
        if (sURIType === "URL") {
            return this._spliceSapSystemIntoUrlURI(oURI, sSystemAlias, sSapSystem);
        }

        // Cases in which there is no need to manipulate the source url.
        if (typeof sSapSystem === "undefined" || sSystemAlias === sSapSystem) {
            return oDeferred.resolve(oURI).promise();
        }

        // Prepare to call resolveSystemAlias, ensure method is there.
        if (typeof this._oAdapter.resolveSystemAlias !== "function") {
            return oDeferred.reject("fallback: the adapter does not implement resolveSystemAlias").promise();
        }

        this._stripURI(oURI, sSystemAlias, sURIType)
            .fail(function(sErrorMessage) {
                oDeferred.reject(sErrorMessage);
            })
            .done(function(oStrippedURI) {
                that._applyAliasToURI(sSapSystem, oStrippedURI, sURIType)
                    .fail(function(sError) {
                        oDeferred.reject(sError);
                    })
                    .done(function(oInterpolatedURI) {
                        oDeferred.resolve(oInterpolatedURI);
                    });
            });

        return oDeferred.promise();
    };

    /**
     * Applies the given system alias to the given URI object.
     *
     * @param {string} sSystemAlias
     *   The name of the system alias to interpolate the given URI with.
     * @param {URI} oURI
     *   The URI object to interpolate with the system alias.
     * @param {string} sURIType
     *   The type of URI (e.g., "TR")
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves to a URI object with data from the given
     *   sSystemAlias.
     *
     * @private
     * @since 1.34.1
     */
    ClientSideTargetResolution.prototype._applyAliasToURI = function(sSystemAlias, oURI, sURIType) {
        var that = this,
            oNewURI = oURI,
            oDeferred = new jQuery.Deferred();

        // Interpolate oURI
        this._oAdapter.resolveSystemAlias(sSystemAlias)
            .fail(function(sErrorMessage) {
                oDeferred.reject(sErrorMessage);
            })
            .done(function(oResolvedSystemAlias) {
                var sSystemAliasDataName = that._selectSystemAliasDataName(
                        oResolvedSystemAlias, new URI(window.location.toString()).protocol()
                    ),
                    oSystemAliasData = oResolvedSystemAlias[sSystemAliasDataName],
                    sQuery,
                    sLanguage,
                    oUser;

                // replace using data in oSystemAliasData

                // Add web-related parts
                oNewURI.protocol(sSystemAliasDataName); // http or https
                oNewURI.hostname(oSystemAliasData.host);
                oNewURI.port(oSystemAliasData.port);

                that._interpolatePathPrefixIntoURI(oNewURI, sURIType, oSystemAliasData.pathPrefix)
                    .fail(function(sErrorMessage) {
                        oDeferred.reject(sErrorMessage);
                    })
                    .done(function(oNewURI) {
                        // add sap-client and sap-language in case we have data for them
                        sQuery = oNewURI.query();
                        if (typeof oResolvedSystemAlias.client === "string" && oResolvedSystemAlias.client !== "") {
                            sQuery = sQuery + (sQuery.length > 0 ? "&" : "") + "sap-client=" + oResolvedSystemAlias.client;
                        }

                        // set sap-language
                        if (typeof oResolvedSystemAlias.language === "string" && oResolvedSystemAlias.language !== "") {
                            sLanguage = oResolvedSystemAlias.language;
                        } else {
                            oUser = sap.ushell.Container.getUser();
                            if (!oUser) {
                                jQuery.sap.log.error(
                                    "Cannot retieve the User object via sap.ushell.Container while determining sap-language",
                                    "will default to 'en' language",
                                    "sap.ushell.services.ClientSideTargetResolution"
                                );
                                sLanguage = "en";
                            } else {
                                sLanguage = oUser.getLanguage();
                            }
                        }
                        sQuery = sQuery + (sQuery.length > 0 ? "&" : "") + "sap-language=" + sLanguage;
                        oNewURI.query(sQuery);

                        // native webgui interpolation
                        oNewURI = that._interpolateNativeWebguiDataIntoURI(oResolvedSystemAlias, oNewURI, sURIType);

                        oDeferred.resolve(oNewURI);
                    });
            });

        return oDeferred.promise();
    };


    /**
     * Interpolates system alias data in the given Native Webgui URL. The
     * method will check for the type of URL being interpolated before
     * proceeding; any call of this method on other URL types will result
     * in a no-op.
     *
     * @param {object} oSystemAliasData
     *   The collection of the a system alias data.
     * @param {URI} oURI
     *   The URI object to interpolate with transaction parameters for native webgui applications.
     * @param {string} sURIType
     *   The type of URI (e.g., "TR")
     *
     * @returns {URI}
     *   A URI object that may be amended with sap
     *
     * @private
     */
    ClientSideTargetResolution.prototype._interpolateNativeWebguiDataIntoURI = function(oSystemAliasData, oURI, sURIType) {
        var bIsLoadBalancing,
            aTransactionParamSet,
            oSystemAliasDataRfc,
            sPath;

        // Add transaction related parts
        if (oSystemAliasData.hasOwnProperty("rfc") && sURIType === "NATIVEWEBGUI") {

            oSystemAliasDataRfc = oSystemAliasData.rfc;

            /*
             * Add a certain subset of parameters depending on
             * whether load balancing is active in rfc. For now use:
             *
             * system id provided -> load balancing active
             */
            bIsLoadBalancing = !!oSystemAliasDataRfc.systemId;


            if (bIsLoadBalancing) {
                aTransactionParamSet = [
                    oSystemAliasDataRfc.systemId && ("~sysid=" + oSystemAliasDataRfc.systemId),
                    oSystemAliasDataRfc.loginGroup && ("~loginGroup=" + oSystemAliasDataRfc.loginGroup),
                    oSystemAliasDataRfc.sncNameR3 && ("~messageServer=" + encodeURIComponent(oSystemAliasDataRfc.sncNameR3)),
                    oSystemAliasDataRfc.sncNameR3 && ("~sncNameR3=" + encodeURIComponent(oSystemAliasDataRfc.sncNameR3)),
                    oSystemAliasDataRfc.sncQoPR3 && ("~sncQoPR3=" + oSystemAliasDataRfc.sncQoPR3)
                ].filter(function(o) {
                    return (typeof o === "string") && (o !== "");
                }); // remove empty parameters
            } else {
                aTransactionParamSet = [
                    oSystemAliasDataRfc.service && ("~service=" + oSystemAliasDataRfc.service),
                    oSystemAliasDataRfc.sncNameR3 && ("~sncNameR3=" + encodeURIComponent(oSystemAliasDataRfc.sncNameR3)),
                    oSystemAliasDataRfc.sncQoPR3 && ("~sncQoPR3=" + oSystemAliasDataRfc.sncQoPR3)
                ].filter(function(o) {
                    return (typeof o === "string") && (o !== "");
                }); // remove empty parameters
            }

            sPath = oURI.path() + ";" +
                aTransactionParamSet.join(";")
                .replace(/(%[A-F0-9]{2})/g, function(sEncodedChars) { // lower case all HEX-encoded strings to avoid double
                    return sEncodedChars.toLowerCase(); // encoding format (lower case is currently used anywhere
                }); // else when dealing with URLs.

            // 1. invalidate internal oURI _string cache
            oURI.path(sPath); // NOTE: after this, oURI._parts.path is
            // partly unescaped (we want to keep escaping!)

            // Overwrite internal _parts.path member of URI object.
            //
            // With 1. the _string cache is invalidated, and this new
            // _parts.path should be used to reconstruct it when
            // the toString() method is next called.
            //
            oURI._parts.path = sPath;
        }

        return oURI;
    };

    /**
     * Helper method to interpolate the given path prefix into the given
     * URI object, taking into account that the empty path prefix should be
     * resolved to the local path prefix.
     *
     * @param {URI} oURI
     *   The URI object to interpolate tha path prefix into.
     * @param {string} sURIType
     *   The type of the URI being interpolated. e.g., "WEBGUI"
     * @param {string} sPathPrefixToInterpolate
     *   The path prefix to interpolate. The empty string indicates that
     *   the path prefix should be taken from the local system alias.
     *   <p>
     *      <b>IMPORTANT</b> this parameter cannot be <code>undefined</code>
     *   </p>
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves to a URI object amended with the given path prefix.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._interpolatePathPrefixIntoURI = function(oURI, sURIType, sPathPrefixToInterpolate) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            sTmpPath;

        // Do not treat empty path prefix as local path prefix
        if (sURIType === "URL" && sPathPrefixToInterpolate.length === 0) {
            return oDeferred.resolve(oURI).promise();
        }

        function prependPathAndResolve(sPath) {
            var sResultPath = sPath + oURI.path();
            oURI.path(sResultPath.replace(/\/+/g, "/")); // avoid double slashes
            oDeferred.resolve(oURI);
        }

        if (sPathPrefixToInterpolate.length > 0) {
            /*
             * In these cases WDA and WEBGUI urls have their complete
             * prefix stripped! So the pathPrefix is prepended before
             * ~canvas.
             */
            if ((sURIType === "WDA" || sURIType === "WEBGUI") && oURI.path().indexOf("~canvas") >= 0) {
                // Strip the complete path if we are dealing with WDA and TR urls.
                sTmpPath = oURI.path();
                sTmpPath = "/~canvas" + sTmpPath.split("~canvas")[1]; // "<anything>~canvas;<anything>" -> "/~canvas;<anything>"
                oURI.path(sTmpPath);
            }
            prependPathAndResolve(sPathPrefixToInterpolate);
        } else {
            // must take the path from local system alias
            this._oAdapter.resolveSystemAlias("")
                .fail(function(sErrorMessage) {
                    oDeferred.reject(sErrorMessage);
                })
                .done(function(oResolvedSystemAlias) {
                    var sSystemAliasDataName = that._selectSystemAliasDataName(
                            oResolvedSystemAlias, new URI(window.location.toString()).protocol()
                        ),
                        sPathPrefix = oResolvedSystemAlias[sSystemAliasDataName].pathPrefix;

                    prependPathAndResolve(sPathPrefix);
                });
        }

        return oDeferred.promise();
    };

    /**
     * Select the name of the right system alias among those available in
     * the given collection.
     *
     * @param {object} oSystemAliasData
     *   All available system alias data. An object with either one or both
     *   http/https, like:
     *   <pre>
     *   {
     *      "http": { ... },
     *      "https": { ... }
     *   }
     *   </pre>
     * @param {string} sBrowserLocationProtocol
     *   The protocol displayed in the current url. Can be obtained via
     *   <code>window.location.url</code>.
     *
     * @return {string}
     *   The name of the right system alias name in
     *   <code>oSystemAliasData</code>, or logs an error message
     *   and returns undefined if it was not possible to determine the
     *   name of the right system alias name.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._selectSystemAliasDataName = function(oSystemAliasData, sBrowserLocationProtocol) {
        // 1. prefer https
        if (oSystemAliasData.hasOwnProperty("https")) {
            return "https";
        }

        // 2. fallback to http
        if (oSystemAliasData.hasOwnProperty("http")) {
            return "http";
        }

        jQuery.sap.log.error(
            "Cannot select which system alias to pick between http/https",
            "make sure they are provided in the given system alias collection",
            "sap.ushell.services.ClientSideTargetResolution"
        );

        return undefined;
    };

    /**
     * Retrieves the renamed parameter of a given parameter from the
     * signature object.
     *
     * @param {string} sParamName
     *   The parameter name
     * @param {object} oSignature
     *   The signature object that may contain a mapping for
     *   <code>sParamName</code>
     * @param {array} aParamValue
     *   The value of <code>sParamName</code> into an array (as one
     *   parameter may have multiple values).
     *
     * @returns {string}
     *   The renamed parameter for <code>sParamName</code> if present in
     *   the given signature object, or <code>sParamName</code> otherwise.
     *
     *   <p>NOTE: the aParamValue must be present and passed in the form of
     *   an array, otherwise <code>sParamName</code> will be returned even
     *   if a renamed parameter exists in the signature.</p>
     *
     * @private
     */
    ClientSideTargetResolution.prototype._getRenameParameterName = function(sParamName, oSignature, aParamValue) {
        if (!aParamValue || !jQuery.isArray(aParamValue)) {
            return sParamName;
        }
        if (oSignature && oSignature.parameters && oSignature.parameters[sParamName] && oSignature.parameters[sParamName].renameTo) {

            return oSignature.parameters[sParamName].renameTo;
        }

        return sParamName;
    };

    /**
     * Creates a member <code>mappedIntentParamsPlusSimpleDefaults</code>
     * in the given <code>oMatchingTarget</code>, which contains the
     * re-mapped parameters based on the mappings provided in the
     * signature.
     *
     * <p>The member is added to <code>oMatchingTarget</code> as it is not clear whether
     * we also want to modify the original sap-ushell-defaultedParameter names collection.</p>
     *
     * <p>NOTE: only simple parameters are re-mapped, complex parameters
     * are not part of the
     * <code>mappedIntentParamsPlusSimpleDefaults</code>.</p>
     *
     * @param {object} oMatchingTarget
     *   The mutated matching target object
     *
     * @private
     */
    ClientSideTargetResolution.prototype._mapParameterNamesAndRemoveObjects = function(oMatchingTarget) {
        var that = this,
            oNewParameters = {},
            oOldParamsPlusAllDefaults = oMatchingTarget.intentParamsPlusAllDefaults;

        Object.keys(oOldParamsPlusAllDefaults).sort().forEach(function(sParamName) {
            var sRenameTo = that._getRenameParameterName(sParamName, oMatchingTarget.inbound.signature, oOldParamsPlusAllDefaults[sParamName]);

            if (jQuery.isArray(oMatchingTarget.intentParamsPlusAllDefaults[sParamName])) {
                if (oNewParameters[sRenameTo]) {
                    jQuery.sap.log.error("collision of values during parameter mapping : \"" + sParamName + "\" -> \"" + sRenameTo + "\"");
                } else {
                    oNewParameters[sRenameTo] = oMatchingTarget.intentParamsPlusAllDefaults[sParamName];
                }
            }
        });
        oMatchingTarget.mappedIntentParamsPlusSimpleDefaults = oNewParameters;
    };

    /*
     * The following table compares the capabilities and behaviour of
     * the differnt technologies
     *                                            SAPUI5  URL  WDA WebGui WebGuiWrapped
     *
     * server/port/client etc. altered               N     Y    Y     Y    Y
     * sap-system part of URL                        Y     Y    N     N    N
     * sap-ushell-defaultedParametersNames part      Y     Y    Y     N    N
     * part of URL
     *
     * parameters                                    Y     N    Y     N    N
     * compacted
     */


    /**
     * Constructs the resolution result of the given WDA matching target
     * from applicationid, configurationid
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     *
     * @param {function} fnBoundFallback
     *   A fallback function used to resolve the hash fragment server-side
     *
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input oMatchingTarget amended with a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructFullWDAResolutionResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oDeferred = new jQuery.Deferred();

        var oIntent = {
            target: {
                "semanticObject": "Shell",
                "action": "startWDA"
            },
            "params": {
                "sap-ui2-wd-app-id": [oInbound.resolutionResult["sap.wda"].applicationId],
                "sap-system": [oResolutionResult.systemAlias]
            }
        };
        if (oInbound.resolutionResult["sap.wda"].configId) {
            oIntent.params["sap-ui2-wd-conf-id"] = [oInbound.resolutionResult["sap.wda"].configId];
        }
        this._resolveEasyAccessMenuIntentWDA(oIntent, oMatchingTarget).done(function(oCalculatedResolutionResult) {
            //   sUrl = "/ui2/nwbc/~canvas;window=app/wda/" + oIntent.params["sap-ui2-wd-app-id"][0] + "/";
            oResolutionResult.url = oCalculatedResolutionResult.url;
            return that._constructWDAResolutionResult(oMatchingTarget, fnBoundFallback, sFixedHashFragment).done(function(a) {
                oDeferred.resolve(a);
            }).fail(function(sMsg) {
                oDeferred.reject(sMsg);
            });
        });
        return oDeferred.promise();
    };

    /**
     * Constructs the resolution result of the given WebGui matching target
     * from ["sap.gui"]transaction
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     *
     * @param {function} fnBoundFallback
     *   A fallback function used to resolve the hash fragment server-side
     *
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input oMatchingTarget amended with a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructFullWebguiResolutionResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oDeferred = new jQuery.Deferred();

        var oIntent = {
            target: {
                "semanticObject": "Shell",
                "action": "startGUI"
            },
            "params": {
                "sap-ui2-tcode": [oInbound.resolutionResult["sap.gui"].transaction],
                "sap-system": [oResolutionResult.systemAlias]
            }
        };
        this._resolveEasyAccessMenuIntentWebgui(oIntent, oMatchingTarget).done(function(oCalculatedResolutionResult) {
            //   sUrl = "/ui2/nwbc/~canvas;window=app/wda/" + oIntent.params["sap-ui2-wd-app-id"][0] + "/";
            oResolutionResult.url = oCalculatedResolutionResult.url;
            return that._constructWebguiNowrapResult(oMatchingTarget, fnBoundFallback, sFixedHashFragment).done(function(a) {
                oDeferred.resolve(a);
            }).fail(function(sMsg) {
                oDeferred.reject(sMsg);
            });
        });
        return oDeferred.promise();
    };

    /**
     * Constructs the resolution result of the given WDA matching target.
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     *
     * @param {function} fnBoundFallback
     *   A fallback function used to resolve the hash fragment server-side
     *
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input oMatchingTarget amended with a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructWDAResolutionResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oDeferred = new jQuery.Deferred();

        // splice parameters into WDA url
        var oWDAURI = new URI(oResolutionResult.url);

        // construct effective parameters including defaults
        var oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);
        if (oMatchingTarget.mappedDefaultedParamNames.length > 0) {
            oEffectiveParameters["sap-ushell-defaultedParameterNames"] = [JSON.stringify(oMatchingTarget.mappedDefaultedParamNames)];
        }

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];

        // in the WDA case, the sap-system intent parameter is *not* part of the final url
        oMatchingTarget.resolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        that._spliceSapSystemIntoURI(oWDAURI, oResolutionResult.systemAlias, sSapSystem, "WDA")
            .fail(oDeferred.reject.bind(oDeferred))
            .done(function(oWDAURI) {
                // compact our intent url parameters if required
                sap.ushell.Container.getService("ShellNavigation").compactParams(oEffectiveParameters, ["sap-xapp-state", "sap-ushell-defaultedParameterNames", "sap-intent-params"], undefined /* no Component*/ , true /*transient*/ )
                    .fail(oDeferred.reject.bind(oDeferred))
                    .done(function(oEffectiveCompactedIntentParams) {

                        // important to extract here to get a potentially modified client
                        var sEffectiveStartupParams = that._getURLParsing().paramsToString(oEffectiveCompactedIntentParams);

                        // Reconstruct the final url
                        // ASSUMPTION: there are no relevant parameters in the WDA url, but only WDA parameters.
                        var sParams = oWDAURI.search(); // WDA parameters
                        if (sEffectiveStartupParams) {
                            // append effective parameters to WDA URL
                            sParams = sParams + ((sParams.indexOf("?") < 0) ? "?" : "&") + sEffectiveStartupParams;
                        }
                        oWDAURI.search(sParams);

                        // propagate properties from the inbound in the resolution result
                        ["additionalInformation", "applicationDependencies"].forEach(function(sPropName) {
                            if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                                oMatchingTarget.resolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                            }
                        });
                        oMatchingTarget.resolutionResult.url = oWDAURI.toString();
                        oMatchingTarget.resolutionResult.text = oInbound.title;
                        oMatchingTarget.resolutionResult.applicationType = "NWBC";
                        oDeferred.resolve(oMatchingTarget);
                    });
            });

        return oDeferred.promise();
    };

    /**
     * Constructs the resolution result of the given non-wrapped Webgui matching target.
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     * @param {function} fnBoundFallback
     *   A fallback function used to resolve the hash fragment server-side
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input oMatchingTarget amended with a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructWebguiNowrapResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oDeferred = new jQuery.Deferred();

        // splice parameters into Webgui url
        var oWebguiURI = new URI(oResolutionResult.url);

        // construct effective parameters excluding defaults (!)
        var oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];

        // in the Webgui case, the sap-system intent parameter is *not* part of the final url
        oMatchingTarget.resolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        that._adjustDYNP_OKCODE(oEffectiveParameters, oMatchingTarget);

        that._spliceSapSystemIntoURI(oWebguiURI, oResolutionResult.systemAlias, sSapSystem, "WEBGUI")
            .fail(oDeferred.reject.bind(oDeferred))
            .done(function(oWebguiURI) {
                // important to extract here to get a potentially modified client
                var sEffectiveStartupParams = that._getURLParsing().paramsToString(oEffectiveParameters);

                // Reconstruct the final url
                // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.
                var sParams = oWebguiURI.search(); // Webgui parameters
                if (sEffectiveStartupParams) {
                    // append effective parameters to Webgui URL
                    sParams = sParams + ((sParams.indexOf("?") < 0) ? "?" : "&") + sEffectiveStartupParams;
                }
                oWebguiURI.search(sParams);

                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies"].forEach(function(sPropName) {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oMatchingTarget.resolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });
                oMatchingTarget.resolutionResult.url = oWebguiURI.toString();
                oMatchingTarget.resolutionResult.text = oInbound.title;
                oMatchingTarget.resolutionResult.applicationType = "NWBC";
                oDeferred.resolve(oMatchingTarget);
            });

        return oDeferred.promise();
    };

    /**
     * Constructs the resolution result of the given wrapped Webgui matching target.
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     *
     * @param {function} fnBoundFallback
     *   A fallback function used to resolve the hash fragment server-side
     *
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input oMatchingTarget amended with a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructWebguiWrapResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oDeferred = new jQuery.Deferred();

        // splice parameters into Webgui url
        var oWebguiURI = new URI(oResolutionResult.url);

        // construct effective parameters
        /*
        /* NOTE: do not include defaultedParameterNames for wrapped URLs,
         * as they may cause a crash the called application.
         */
        var oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];

        // in the Webgui case, the sap-system intent parameter is *not* part of the final url
        oMatchingTarget.resolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        that._spliceSapSystemIntoURI(oWebguiURI, oResolutionResult.systemAlias, sSapSystem, "WEBGUI")
            .fail(oDeferred.reject.bind(oDeferred))
            .done(function(oWebguiURI) {
                // Reconstruct the final url
                // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.
                var sParams = oWebguiURI.search(); // Webgui parameters

                // Inject effective startup param
                sParams = that._injectEffectiveParametersIntoWebguiPobjectParam(sParams, oEffectiveParameters, "&", "=");

                oWebguiURI.search(sParams);

                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies"].forEach(function(sPropName) {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oMatchingTarget.resolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });
                oMatchingTarget.resolutionResult.url = oWebguiURI.toString();
                oMatchingTarget.resolutionResult.text = oInbound.title;
                oMatchingTarget.resolutionResult.applicationType = "NWBC";
                oDeferred.resolve(oMatchingTarget);
            });

        return oDeferred.promise();
    };

    /**
     * Interpolates the parameters into the given query using transaction
     * interpolation format.
     *
     * The method tries to intepolate the given parameters into the
     * <code>P_OBJECT</code> query parameter if present in the query
     * string.  Otherwise the <code>P_OBJECT</code> parameter is added to
     * the query string.
     *
     * <p>Contrarily to standard URLs, the parameter must be injected into the
     * query parameter double escaped (via encodeURIComponent) and with
     * the nonstandard delimiters passed as input.
     *
     * <p >For example, when using '&' and '=' as delimiters, given the
     * query string <code>A=B&P_OBJECT=</code>
     * and the parameter object
     * <pre>
     * {
     *    B: ["C"],
     *    C: ["D"]
     * }
     * </pre>, the interpolated query string
     * <code>A=B&P_OBJECT=B%2521C%2525C%2521D</code> is returned.
     *
     * <p>
     * IMPORTANT: the <code>P_OBJECT</code> parameter can take maximum 132
     * characters in its value. In case the given parameters form a string
     * that is longer than 132 characters (unescaped), the string will be
     * splitted over multiple <code>P_OBJx</code> parameters that are added
     * to the URL.
     * <br />
     * For example, this method may return the following interpolated query:
     * <code>P_OBJ1=rest_of_p_object_value&P_OBJ2=...&P_OBJECT=...some_long_value...</code>
     * </p>
     *
     * @param {string} sQuery
     *   The query string to interpolate the parameters into
     * @param {object} oParamsToInject
     *   An object indicating the parameters that need to be interpolated.
     * @param {string} sQueryParamDelimiter
     *   The delimiter used to separate parameters and values in <code>sQuery</code>. E.g., "&"
     * @param {string} sQueryParamAssignDelimiter
     *   The delimiter used to separate assignments of a value to a parameter in <code>sQuery</code>. E.g., "="
     *
     * @return {string}
     *   The interpolated query string.
     */
    ClientSideTargetResolution.prototype._injectEffectiveParametersIntoWebguiPobjectParam = function(sQuery, oParamsToInject, sQueryParamDelimiter, sQueryParamAssignDelimiter) {
        var sInjectedParams,
            sPobjectPlusDelimiter = "P_OBJECT" + sQueryParamAssignDelimiter,
            iMaxGUIParamLength = 132;

        // NOTE: the result of privparamsToString does not encode
        //       delimiters, hence we pass them encoded.
        var sParamsToInject = this._getURLParsing().privparamsToString(
            oParamsToInject,
            "%25", // a.k.a. "%", instead of &
            "%21" // a.k.a. "!", instead of =
        );

        if (!sParamsToInject) {
            return sQuery;
        }

        // Parse away existing parameters in P_OBJECT
        var sParamsToInjectPrefix = "";
        this._amendGuiParam("P_OBJECT", sQuery, sQueryParamDelimiter, sQueryParamAssignDelimiter, function(sParamNameAndValueDoubleEncoded) {
            var sParamValueDoubleEncoded = sParamNameAndValueDoubleEncoded.replace(sPobjectPlusDelimiter, "");
            sParamsToInjectPrefix = decodeURIComponent(sParamValueDoubleEncoded);
            if (sParamsToInjectPrefix.length > 0) {
                sParamsToInjectPrefix = sParamsToInjectPrefix + "%25";
            }

            return sPobjectPlusDelimiter; // just leave the P_OBJECT= placeholder if found
        });
        sParamsToInject = sParamsToInjectPrefix + sParamsToInject;

        // Generate the injected parameters
        var oParamsSections = {
            pObjX: "",
            pObject: ""
        };
        sParamsToInject
            .match(new RegExp(".{1," + iMaxGUIParamLength + "}", "g"))
            .map(function(sParamGroupEncoded) {
                return encodeURIComponent(sParamGroupEncoded);
            })
            .forEach(function(sParamGroupDoubleEncoded, iGroupIdx) {
                // parameter name should be P_OBJECT or P_OBJx for further parameters
                var sParamName = "P_OBJECT";
                var sParamSection = "pObject";
                if (iGroupIdx > 0) {
                    sParamName = "P_OBJ" + iGroupIdx;
                    sParamSection = "pObjX";
                }

                var sSectionDelimiter = oParamsSections[sParamSection].length === 0 ? "" : sQueryParamDelimiter;

                oParamsSections[sParamSection] = oParamsSections[sParamSection] + sSectionDelimiter + sParamName + sQueryParamAssignDelimiter + sParamGroupDoubleEncoded;
            });

        sInjectedParams = [oParamsSections.pObjX, oParamsSections.pObject]
            .filter(function(sParamSection) {
                return sParamSection.length > 0;
            })
            .join(sQueryParamDelimiter);

        // Place the injected params in the right place in the query
        var oAmendResult = this._amendGuiParam("P_OBJECT", sQuery, sQueryParamDelimiter, sQueryParamAssignDelimiter, function(sFoundParamNameAndValue) {
            return sInjectedParams;
        });

        if (oAmendResult.found) {
            return oAmendResult.query;
        }

        // amendment not performed: just append the concatenation
        return sQuery + (sQuery.length === 0 ? "" : sQueryParamDelimiter) + sInjectedParams;
    };

    /**
     * Amends a specified GUI param through a given callback function.
     *
     * @param {string} sTargetParamName
     *   The target WebGui parameter to find
     * @param {string} sQuery
     *   The query string to find the parameter in
     * @param {string} sQueryParamDelimiter
     *   The delimiter used to separate parameters and values in <code>sQuery</code>. E.g., "&"
     * @param {string} sQueryParamAssignDelimiter
     *   The delimiter used to separate assignments of a value to a parameter in <code>sQuery</code>. E.g., "="
     * @param {function} fnAmend
     *   A callback used to amend the <code>sTargetParamName</code>
     *   parameter of the query string. It is a function that should return
     *   the value to assign to the target parameter in the query string,
     *   should this target parameter be present.
     *   <p>When this function returns <code>undefined</code>, the target
     *   parameter will be removed from the query string</p>
     *
     * @return {object}
     *   An object representing the result of the amend operation. It is like:
     *   <pre>
     *   {
     *      found: <boolean> // whether the target parameter was found
     *      query: <string>  // the amended query string or the original
     *                       // query string if the target parameter was not found
     *   }
     *   </pre>
     */
    ClientSideTargetResolution.prototype._amendGuiParam = function(sTargetParamName, sQuery, sQueryParamDelimiter, sQueryParamAssignDelimiter, fnAmend) {
        var bFound = false,
            sParamSearchPrefix = sTargetParamName + sQueryParamAssignDelimiter; // Param=

        var sAmendedQuery = sQuery
            .split(sQueryParamDelimiter)
            .map(function(sParam) {

                if (sParam.indexOf(sParamSearchPrefix) !== 0) {
                    return sParam;
                }

                bFound = true;

                return fnAmend(sParam);
            })
            .filter(function(sParam) {
                return typeof sParam !== "undefined";
            })
            .join(sQueryParamDelimiter);

        return {
            found: bFound,
            query: sAmendedQuery
        };
    };

    /**
     * Parses Native Webgui query parameter
     *
     * @param {string} sTransactionQueryParam
     *   The full ~transaction query parameter with or without question
     *   mark. E.g., <code>?%7etransaction=*SU01%20p1%3d%3bP2=v2</code>
     *
     * @returns {object}
     *   An object containing the parsed parts of the URL parameter
     *
     * @private
     */
    ClientSideTargetResolution.prototype._parseWebguiTransactionQueryParam = function(sTransactionQueryParam) {

        var sTransactionValueRe = "^(.+?)(%20|(%20)(.+))?$",
            reTransactionValue = new RegExp(sTransactionValueRe, "i"),
            sTransactionValue,
            oParsed = {
                hasParameters: null, // whether actual parameters are passed to the transaction
                transactionParamName: "", // ?%7etransaction or %7etransaction
                transactionCode: "", // SU01 or *SU01
                parameters: [] // { name: ..., value: ... }
            };

        var aParamNameValues = sTransactionQueryParam.split("=");

        if (aParamNameValues.length > 2) {
            return {
                "error": "Found more than one assignment ('=') in the transaction query parameter",
                "details": "Only one '=' sign is expected in " + sTransactionQueryParam
            };
        }

        if (aParamNameValues.length < 2 || typeof aParamNameValues[1] === "undefined" || aParamNameValues[1].length === 0) {
            return {
                "error": "The transaction query parameter must specify at least the transaction name",
                "details": "Got " + sTransactionQueryParam + " instead."
            };
        }

        oParsed.transactionParamName = aParamNameValues[0];
        sTransactionValue = aParamNameValues[1];

        var aMatch = sTransactionValue.match(reTransactionValue);
        if (!aMatch) {
            return {
                "error": "Cannot parse ~transaction query parameter value.",
                "details": sTransactionValue + " should match /" + sTransactionValueRe + "/"
            };
        }

        oParsed.transactionCode = aMatch[1];
        if (aMatch[2] && aMatch[2] !== "%20") { // if !== "%20" -> matches (%20)(.+)
            // must parse parameters
            var sTransactionParams = aMatch[4] || "";
            sTransactionParams
                .split("%3b") // i.e., "="
                .forEach(function(sNameAndValue) {
                    var aNameAndValue = sNameAndValue.split("%3d"),
                        sParamName = aNameAndValue[0];

                    if (sParamName && typeof sParamName === "string" && sParamName.length > 0) { // no empty names
                        oParsed.parameters.push({
                            name: sParamName,
                            value: aNameAndValue[1]
                        });
                    }
                });
        }

        // post parsing adjustments

        // detect whether the transaction name had a '*' or if the * was
        // added because of parameters.
        // NOTE: **SU01 would be a valid tcode
        oParsed.hasParameters = false;
        if (oParsed.parameters.length > 0) {
            oParsed.hasParameters = true;

            // must remove the starting "*" from the transaction code if
            // any is found (was added because of parameters).
            oParsed.transactionCode = oParsed.transactionCode.replace(/^[*]/, "");
        }

        return oParsed;
    };


    /**
     * Interpolates the given parameters into the webgui ~transaction parameter.
     *
     * The method tries to intepolate the given parameters after the
     * transaction code present in the given ~transaction parameter.
     *
     * <p>For example, given the query string
     * <code>?%7etransaction=SU01</code>
     *
     * and the parameter object
     * <pre>
     * {
     *    B: ["C"],
     *    C: ["D"]
     * }
     * </pre>, the following string is returned:
     * <code>?%7etransaction=*SU01%20B%3dC%3bC%3dD</code
     *
     * @param {string} sTransactionQueryParam
     *   The whole ~transaction parameter. Must start with "?%7etransaction" or "%7etransaction".
     *   For example <ul
     *   <li><code>%7etransaction=*SU01%20AAAA%3d4321</code> (with AAAA=4321 parameter)</li>
     *   <li><code>?%7etransaction=SU01</code> (no parameters)</li>
     *   </ul>
     * @param {object} oParamsToInject
     *   An object ating the parameters that need to be interpolated
     *   into <code>sTransactionQueryParam</code>.
     *
     * @return {string}
     *   The interpolated ~transaction parameter (the leading ? is
     *   preserved if passed).  The transaction code will have the form
     *   <code>*[CODE]%20[PARAMETERS]]</code> only when the transaction
     *   will be called with parameters, otherwise the format would be
     *   <code>[CODE]</code>.
     */
    ClientSideTargetResolution.prototype._injectEffectiveParametersIntoWebguiQueryParam = function(sTransactionQueryParam, oParamsToInject) {
        var oParsedTransactionQueryParam = this._parseWebguiTransactionQueryParam(sTransactionQueryParam);
        if (oParsedTransactionQueryParam.error) {
            jQuery.sap.log.error(
                oParsedTransactionQueryParam.error,
                oParsedTransactionQueryParam.details,
                "sap.ushell.services.ClientSideTargetResolution"
            );
            return sTransactionQueryParam;
        }

        // Inject parameters
        var aParametersFinal = oParsedTransactionQueryParam.parameters.map(function(oParameter) {
            return oParameter.name.toUpperCase() + "%3d" + oParameter.value;
        });

        // Turn all names upper case
        var oParamsToInjectUpperCase = {};
        Object.keys(oParamsToInject).forEach(function(sKey) {
            oParamsToInjectUpperCase[sKey.toUpperCase()] = oParamsToInject[sKey];
        });
        // NOTE: privparamsToString treats delimiters verbatim and encodes
        //       the parameters if necessary.
        //       Therefore we pass the delimiters already encoded!
        //
        var sParamsToInject = this._getURLParsing().privparamsToString(
            oParamsToInjectUpperCase,
            "%3b", // parameters delimiter
            "%3d" // assigment
        );
        if (sParamsToInject) {
            aParametersFinal.push(sParamsToInject);
        }

        // Note: do not rely on oParsedTransactionQueryParam as we may
        // still have injected parameters here.
        var bHasParameters = aParametersFinal.length > 0;

        return oParsedTransactionQueryParam.transactionParamName + "=" + (bHasParameters ? "*" : "") + oParsedTransactionQueryParam.transactionCode + (bHasParameters ? "%20" : "") + aParametersFinal.join("%3b");
    };

    /**
     * Constructs the resolution result of the given native wrapped Webgui
     * matching target.
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     * @param {function} fnBoundFallback
     *   A fallback function used to resolve the hash fragment server-side
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input oMatchingTarget amended with a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructNativeWebguiWrapResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oDeferred = new jQuery.Deferred();

        // splice parameters into Webgui url
        var oWebguiURI = new URI(oResolutionResult.url);

        // construct effective parameters
        /*
        /* NOTE: do not include defaultedParameterNames for wrapped URLs,
         * as they may cause a crash the called application.
         */
        var oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];

        // in the Webgui case, the sap-system intent parameter is *not* part of the final url
        oMatchingTarget.resolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        that._spliceSapSystemIntoURI(oWebguiURI, oResolutionResult.systemAlias, sSapSystem, "NATIVEWEBGUI")
            .fail(oDeferred.reject.bind(oDeferred))
            .done(function(oWebguiURI) {
                // Reconstruct the final url
                // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.

                var sParams = oWebguiURI.search(); // Webgui parameters
                var sParamsInterpolated = sParams
                    .split("&")
                    .map(function(sQueryParam) {
                        // interpolate effective parameter in the correct place within the ~transaction parameter

                        var sInterpolatedQueryParam;
                        if (sQueryParam.indexOf("?%7etransaction") === 0 ||
                            sQueryParam.indexOf("%7etransaction") === 0) { // found transaction

                            // treat transaction as if it was a query parameter
                            sInterpolatedQueryParam = that._injectEffectiveParametersIntoWebguiPobjectParam(
                                sQueryParam,
                                oEffectiveParameters,
                                "%3b", // parameter separator -> ";"
                                "%3d" // parameter assign delimiter -> "="
                            );
                            return sInterpolatedQueryParam;
                        }

                        return sQueryParam;
                    })
                    .join("&");

                oWebguiURI.search(sParamsInterpolated);

                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies"].forEach(function(sPropName) {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oMatchingTarget.resolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });
                oMatchingTarget.resolutionResult.url = oWebguiURI.toString();
                oMatchingTarget.resolutionResult.text = oInbound.title;
                oMatchingTarget.resolutionResult.applicationType = "TR"; // Triggers Native navigation
                oDeferred.resolve(oMatchingTarget);
            });

        return oDeferred.promise();

    };

    /**
     * Tells whether the given parameter is a Webgui business parameter
     * This method has a polimorphic signature: it can be called with one or two arguments.
     * If called with one argument both the name and the parameter value
     * should be passed, separated by "=". The first "=" will be treated as
     * parameter separator. Otherwise two parameters (name, value) can be passed.
     *
     * NOTE: the method determines whether the value is passed based on how
     * many arguments are passed.
     *
     * @param {string} sName
     *   A parameter name or a name=value string.
     * @param {string} [sValue]
     *   An optional parameter value to be used in combination with the
     *   name specified in <code>sNameMaybeValue</code>.
     *
     * @returns {boolean}
     *   Whether the given parameter is a Webgui business parameter.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._isWebguiBusinessParameter = function(sName, sValue) {
        var aNameValue;
        // handle case in which sName is in the form "name=value"
        if (arguments.length === 1) {
            aNameValue = sName.split(/[=](.+)?/); // split on first "="
            if (aNameValue.length > 1) {
                return this._isWebguiBusinessParameter.apply(this, aNameValue);
            }
        }

        return !(
            sName.indexOf("sap-") === 0 ||
            sName.charAt(0) === "~"
        );
    };

    /**
     * Extracts parameters that should not belong to business parameters in
     * webgui (wrapped or non-wrapped) transactions.  The parameters
     * extracted are supposed to be appended to the final URL as common URL
     * parameters.
     *
     * @param {object} oParams
     *   an object containing business and non-business parameters (name-value pairs).
     *   NOTE: this object is modified in place in case non-business
     *   parameters are found!
     * @returns {object}
     *   non-business parameters to be appended to the URL as traditional parameters in array format.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._extractWebguiNonBusinessParameters = function(oParams) {
        var that = this,
            oNonBusinessParams = {};

        Object.keys(oParams).forEach(function(sParamName) {
            var sParamValue = oParams[sParamName];

            if (!that._isWebguiBusinessParameter(sParamName, sParamValue)) {
                oNonBusinessParams[sParamName] = sParamValue;
                delete oParams[sParamName];
            }
        });

        return oNonBusinessParams;
    };

    function isDYNP_OKCODE_required(oInbound) {
        return oInbound && oInbound.signature && oInbound.signature && oInbound.signature.parameters && oInbound.signature.parameters.DYNP_OKCODE && oInbound.signature.parameters.DYNP_OKCODE.required === true;
    }

    ClientSideTargetResolution.prototype._adjustDYNP_OKCODE = function(oEffectiveParameters, oMatchingTarget) {
        var that = this;
        var bIsRequired = isDYNP_OKCODE_required(oMatchingTarget && oMatchingTarget.inbound);
        if (bIsRequired) {
            return oEffectiveParameters;
        }
        // calculate nr of other relevant (Business) parameters.
        var nr = Object.keys(oEffectiveParameters).reduce(function(sPrevValue, sParamName) {
            if (!that._isWebguiBusinessParameter(sParamName)) {
                return sPrevValue;
            }
            if (sParamName.toUpperCase() === "DYNP_OKCODE") {
                return sPrevValue;
            }
            return sPrevValue + 1;
        }, 0);
        if (nr === 0) {
            Object.keys(oEffectiveParameters).forEach(function(sParamName) {
                if (sParamName.toUpperCase() === "DYNP_OKCODE") {
                    delete oEffectiveParameters[sParamName];
                }
            });
        }
        return oEffectiveParameters;
    }

    /**
     * Constructs the resolution result of the given non-wrapped Native
     * Webgui matching target.
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     * @param {function} fnBoundFallback
     *   A fallback function used to resolve the hash fragment server-side
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input oMatchingTarget amended with a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructNativeWebguiNowrapResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oDeferred = new jQuery.Deferred(),
            oForbiddenParameters = {
                "sap-wd-run-sc": true,
                "sap-wd-auto-detect": true,
                "sap-ep-version": true,
                "sap-system": true
            };

        // splice parameters into Webgui url
        var oWebguiURI = new URI(oResolutionResult.url);

        // construct effective parameters
        /*
        /* NOTE: do not include defaultedParameterNames for wrapped URLs,
         * as they may cause a crash the called application.
         */
        var oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];

        // before deleting forbidden parameters, back-up sap-system
        oMatchingTarget.resolutionResult["sap-system"] = sSapSystem;

        // remove "forbidden" parameters
        Object.keys(oEffectiveParameters).forEach(function(sParamName) {
            if (oForbiddenParameters[sParamName.toLowerCase()]) {
                delete oEffectiveParameters[sParamName];
            }
        });
        that._adjustDYNP_OKCODE(oEffectiveParameters, oMatchingTarget);

        var oEffectiveParametersToAppend = this._extractWebguiNonBusinessParameters(oEffectiveParameters);

        that._spliceSapSystemIntoURI(oWebguiURI, oResolutionResult.systemAlias, sSapSystem, "NATIVEWEBGUI")
            .fail(oDeferred.reject.bind(oDeferred))
            .done(function(oWebguiURI) {
                // Reconstruct the final url
                // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.

                var sParams = oWebguiURI.search(); // Webgui parameters
                var sParamsInterpolated = sParams
                    .split("&")
                    .map(function(sQueryParam) {
                        var aNonBusinessParam;

                        // interpolate effective parameter in the correct
                        // place within the ~transaction parameter

                        if (!that._isWebguiBusinessParameter(sQueryParam)) { // non-business parameters go in the end

                            // we need name = value
                            if (sQueryParam.indexOf("=") >= 0) {

                                aNonBusinessParam = sQueryParam.split("=");
                                if (!oEffectiveParametersToAppend.hasOwnProperty(aNonBusinessParam[0])) { // effective parameters have precedence
                                    oEffectiveParametersToAppend[
                                        aNonBusinessParam[0] // name
                                    ] = aNonBusinessParam[1]; // value
                                }

                            } else {
                                jQuery.sap.log.error(
                                    "Found no '=' separator of Webgui non-business parameter. Parameter will be skipped.",
                                    "'" + sQueryParam + "'",
                                    "sap.ushell.services.ClientSideTargetResolution"
                                );
                            }

                            return undefined; // do not append this parameter
                        }

                        var sInterpolatedQueryParam;
                        if (sQueryParam.indexOf("?%7etransaction") === 0 ||
                            sQueryParam.indexOf("%7etransaction") === 0) { // found transaction

                            // treat transaction as if it was a query parameter
                            sInterpolatedQueryParam = that._injectEffectiveParametersIntoWebguiQueryParam(
                                sQueryParam,
                                oEffectiveParameters,
                                "%3b", // parameter separator -> ";"
                                "%3d" // parameter assign delimiter -> "="
                            );
                            return sInterpolatedQueryParam;
                        }

                        return sQueryParam;
                    })
                    .filter(function(sParam) {
                        return typeof sParam !== "undefined";
                    }) // remove skipped parameters
                    .join("&");

                // append non business parameters
                var sEffectiveParamsToAppend = that._getURLParsing().paramsToString(oEffectiveParametersToAppend);
                sParamsInterpolated = [
                    sParamsInterpolated,
                    sEffectiveParamsToAppend.replace("~", "%7e") // encodeURIComponent escapes all characters except:
                    // alphabetic, decimal digits, - _ . ! ~ * ' ( )'
                ].join("&");

                oWebguiURI.search(sParamsInterpolated);

                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies", "sap.platform.runtime"].forEach(function(sPropName) {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oMatchingTarget.resolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });
                oMatchingTarget.resolutionResult.url = oWebguiURI.toString();
                oMatchingTarget.resolutionResult.text = oInbound.title;
                oMatchingTarget.resolutionResult.applicationType = "TR"; // Triggers native navigation
                oDeferred.resolve(oMatchingTarget);
            });

        return oDeferred.promise();
    };

    /**
     * Constructs the resolution result of the given SAPUI5 matching target.
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     *
     * @param {function} fnBoundFallback
     *   A fallback function used to resolve the hash fragment server-side
     *
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input oMatchingTarget amended with a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructSAPUI5ResolutionResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var oInbound = oMatchingTarget.inbound,
            oDeferred = new jQuery.Deferred(),
            sUrlParams,
            sSapSystem,
            oEffectiveParameters;

        // propagate properties from the inbound in the resolution result
        // NOTE: we **propagate** applicationType here, as we want to handle URLs as well
        ["applicationType", "additionalInformation", "url", "applicationDependencies"].forEach(function(sPropName) {
            if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                oMatchingTarget.resolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
            }
        });

        // urls are not required if the UI5 specifies the manifestUrl among the application dependencies.
        if (oMatchingTarget.resolutionResult.applicationDependencies
            && typeof oMatchingTarget.resolutionResult.applicationDependencies.manifestUrl === "string"
            && typeof oMatchingTarget.resolutionResult.url === "undefined") {

            oMatchingTarget.resolutionResult.url = ""; // relative url
        }

        // empty urls are valid (they indicate relative url path). This happens in case of
        // app variants where the Component is located in the dist layer.
        if (typeof oMatchingTarget.resolutionResult.url === "undefined") {
            return oDeferred.reject("Cannot resolve intent: url was not specified in matched inbound").promise();
        }

        // construct effective parameters including defaults
        oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);
        if (oMatchingTarget.mappedDefaultedParamNames.length > 0) {
            oEffectiveParameters["sap-ushell-defaultedParameterNames"] = [JSON.stringify(oMatchingTarget.mappedDefaultedParamNames)];
        }

        sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];

        // contrarily to the WDA case, in the SAPUI5 case the sap-system is part of the final URL
        oMatchingTarget.resolutionResult["sap-system"] = sSapSystem;

        // prepare a proper URL!
        sUrlParams = this._getURLParsing().paramsToString(oEffectiveParameters);
        if (sUrlParams) {
            // append parameters to URL
            oMatchingTarget.resolutionResult.url = oInbound.resolutionResult.url + ((oInbound.resolutionResult.url.indexOf("?") < 0) ? "?" : "&") + sUrlParams;
        }

        // IMPORTANT: check for no ui5ComponentName to avoid adding it to URL types
        if (typeof oInbound.resolutionResult.ui5ComponentName !== "undefined") {
            oMatchingTarget.resolutionResult.ui5ComponentName = oInbound.resolutionResult.ui5ComponentName;
        }

        oMatchingTarget.resolutionResult.text = oInbound.title;

        oDeferred.resolve(oMatchingTarget);

        return oDeferred.promise();
    };

    /**
     * Determines whether the given URI object is absolute or not.
     *
     * @param {URI} oURI
     *    The URI object to check.
     *
     * @returns {boolean}
     *    Whether the given URI object is absolute.
     */
    ClientSideTargetResolution.prototype._isAbsoluteURI = function(oURI) {
        return (oURI.protocol() || "").length > 0;
    };

    /**
     * Constructs the resolution result of the given URL matching target.
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     *
     * @param {function} fnBoundFallback
     *   A fallback function used to resolve the hash fragment server-side
     *
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input oMatchingTarget amended with a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructURLResolutionResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        var that = this,
            oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oDeferred = new jQuery.Deferred();

        // splice parameters into url
        var oURI = new URI(oResolutionResult.url);

        // construct effective parameters including defaults
        var oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        // a special hack to work around the AA modelling of Tile Intents in the export
        // the special intent Shell-launchURL with a dedicated parameter sap-external-url
        // which shall *not* be propagated into the final url
        if (oMatchingTarget.inbound && oMatchingTarget.inbound.action === "launchURL" && oMatchingTarget.inbound.semanticObject === "Shell") {
            delete oEffectiveParameters["sap-external-url"];
        }

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];

        // do not include the sap-system parameter in the URL
        oMatchingTarget.resolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        that._spliceSapSystemIntoURI(oURI, oResolutionResult.systemAlias, sSapSystem, "URL")
            .fail(oDeferred.reject.bind(oDeferred))
            .done(function(oSapSystemURI) {
                var sSapSystemUrl = oSapSystemURI.toString(),
                    sSapSystemUrlWoFragment,
                    sFragment,
                    sAdditionalParams;

                // Append URL parameters to a query string
                sAdditionalParams = that._getURLParsing().paramsToString(oEffectiveParameters);
                if (sAdditionalParams) {
                    if (oSapSystemURI.fragment()) {
                        sFragment = "#" + oSapSystemURI.fragment();
                        sSapSystemUrlWoFragment = sSapSystemUrl.replace(/#.*/, "");
                    } else {
                        sSapSystemUrlWoFragment = sSapSystemUrl;
                        sFragment = "";
                    }
                    // append parameters to URL
                    sSapSystemUrl = sSapSystemUrlWoFragment + ((sSapSystemUrl.indexOf("?") < 0) ? "?" : "&") + sAdditionalParams + sFragment;
                }

                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies"].forEach(function(sPropName) {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oMatchingTarget.resolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });
                oMatchingTarget.resolutionResult.url = sSapSystemUrl;
                oMatchingTarget.resolutionResult.text = oInbound.title;
                oMatchingTarget.resolutionResult.applicationType = "URL";
                oDeferred.resolve(oMatchingTarget);
            });

        return oDeferred.promise();
    };

    /**
     * Construct the resolution result of the given matching target using
     * the given fallback function.
     *
     * @param {object} oMatchingTarget
     *   The matching target to amend with the resolution result
     *
     * @param {function} fnBoundFallback
     *   A fallback function used by this method to resolve the given hash fragment
     *
     * @param {string} sFixedHashFragment
     *   The hash fragment to be resolved with a guaranteed "#" prefix
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with the input
     *   <code>oMatchingTarget</code> amended with a resolution result, or
     *   rejects with an error message if either the
     *   <code>fnBoundFallback</code> parameter was undefined or failed to
     *   produce a resolution result.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._constructFallbackResolutionResult = function(oMatchingTarget, fnBoundFallback, sFixedHashFragment) {
        /*
         * The current flow is to resolve the result with all
         * *uncompressed* default substituted parameters and alteres
         * appState compress the url afterwards if needed (the fallback
         * function takes care of this).
         */
        var oDeferred = new jQuery.Deferred(),
            oEffectiveParameters = {},
            aDefaultedParamNames;

        Object.keys(oMatchingTarget.intentParamsPlusAllDefaults).forEach(function(sParamName) {
            if (jQuery.isArray(oMatchingTarget.intentParamsPlusAllDefaults[sParamName])) {
                oEffectiveParameters[sParamName] = oMatchingTarget.intentParamsPlusAllDefaults[sParamName];
            }
        });
        aDefaultedParamNames = oMatchingTarget.mappedDefaultedParamNames || oMatchingTarget.defaultedParamNames;
        if (aDefaultedParamNames.length > 0) {
            oEffectiveParameters["sap-ushell-defaultedParameterNames"] = [JSON.stringify(aDefaultedParamNames)];
        }

        if (typeof fnBoundFallback !== "function") {
            // no fallback logic available
            jQuery.sap.log.error(
                "Cannot resolve hash fragment",
                sFixedHashFragment + " has matched an inbound that cannot be resolved client side" + " and no resolveHashFragmentFallback method was implemented in ClientSideTargetResolutionAdapter",
                "sap.ushell.services.ClientSideTargetResolution"
            );

            oDeferred.reject("Cannot resolve hash fragment: no fallback provided.");
            return oDeferred.promise();
        }

        // fallback
        jQuery.sap.log.warning(
            "Cannot resolve hash fragment client side",
            sFixedHashFragment + " has matched an inbound that cannot be resolved client side. Using fallback logic",
            "sap.ushell.services.ClientSideTargetResolution"
        );
        // NOTE: the callback function will be invoked with the effective *unmapped* parameter names! as 3rd argument
        fnBoundFallback(
                sFixedHashFragment,
                jQuery.extend(true, {}, oMatchingTarget.inbound), // don't let adapters to change the inbound member
                oEffectiveParameters
            )
            .done(function(oResolutionResult) {
                // propagate properties from the resolution result returned by the fallback function into oMatchingTarget.resolutionResult
                ["applicationType", "additionalInformation", "url", "applicationDependencies", "text"].forEach(function(sPropName) {
                    if (oResolutionResult.hasOwnProperty(sPropName)) {
                        oMatchingTarget.resolutionResult[sPropName] = oResolutionResult[sPropName];
                    }
                });
                oDeferred.resolve(oMatchingTarget);
            })
            .fail(oDeferred.reject.bind(oDeferred));

        return oDeferred.promise();
    };

    /**
     * Returns a list of unique semantic objects assigned to the current
     * user. The semantic objects coming from an inbound with
     * hideIntentLink set to <code>true</code> are not returned since these
     * inbounds are not returned by getLinks.
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with an array of strings representing the
     *   User's semantic objects or rejects with an error message.
     *   <p>
     *   NOTE: semantic objects are returned in lexicographical order in
     *   the result array.
     *   </p>
     *
     * @private
     * @since 1.38.0
     */
    ClientSideTargetResolution.prototype.getDistinctSemanticObjects = function() {
        var oDeferred = new jQuery.Deferred();

        this._oInboundProvider.getInbounds().then(function(aInbounds) {
                var oSemanticObjects = {};

                aInbounds.forEach(function(oInbound) {
                    if (typeof oInbound.semanticObject === "string" && oInbound.semanticObject !== "*" && !oInbound.hideIntentLink && oInbound.semanticObject.length > 0) {

                        oSemanticObjects[oInbound.semanticObject] = true;
                    }
                });

                oDeferred.resolve(
                    Object.keys(oSemanticObjects).sort()
                );
            },
            function() {
                oDeferred.reject.apply(oDeferred, arguments);
            });

        return oDeferred.promise();
    };

    /**
     * Resolves a semantic object/action and business parameters to a list
     * of links, taking into account the form factor of the current device.
     *
     * @param {object} oArgs
     *   An object containing nominal arguments for the method, having the
     *   following structure:
     *   {
     *      semanticObject: "Object", // optional (matches all semantic objects)
     *      action: "action",         // optional (matches all actions)
     *      params: {                 // optional business parameters
     *         A: "B",
     *         C: ["e", "j"]
     *      },
     *      ignoreFormFactor: true    // (optional) defaults to false
     *      treatTechHintAsFilter : true // (optional, default false)
     *   }
     *
     *   <p>
     *   Note: positional arguments supported prior to version 1.38.0 are
     *   now deprecated. The caller should always specify nominal
     *   parameters, using an object. Also, wildcards for semanticObject
     *   and action parameters are now expressed via <code>undefined</code>,
     *   or by just omitting the parameter in the object.
     *   </p>
     *   <p>
     *   Note: treatTechHintAsFilter does a plain filtering on technology if supplied
     *   it does *not* do conflict resolution.
     *     Example:   "UI5" ?P1=1   "(UI5)"
     *                "WDA" ?P1=1   "(WDA)"
     *                "GUI"         "(GUI)"
     *
     *   <p>calling getLinks with P1=1&sap-ui-tech-hint=GUI will return
     *   <br>A-b?P1=1&sap-ui-tech-hint=GUI</br> and the text "(GUI)"</p>
     *   <p>
     *   resolving A-b?P1=1&sap-ui-tech-hint=GUI will always invoke UI5 (!)
     *   </p>
     *   </p>
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with an array of links objects containing
     *   (at least) the following properties:
     *
     * <pre>
     *   {
     *      intent: "#AnObject-Action?A=B&C=e&C=j",
     *      text: "Perform action"
     *   }
     * </pre>
     *
     * @private
     * @since 1.38.0
     */
    ClientSideTargetResolution.prototype.getLinks = function(oArgs) {
        var that = this,
            sSemanticObject, mParameters, bIgnoreFormFactor, // old 3-arguments tuple
            oDeferred = new jQuery.Deferred(),
            oCallArgs;

        if (arguments.length === 1 && jQuery.isPlainObject(arguments[0])) {
            var oArgs = arguments[0];
            oCallArgs = jQuery.extend(true, {}, oArgs);
            // assure action : undefined in transported, as there is a check on this below !?!
            ["action", "semanticObject"].forEach(function(sArg) {
                if (oArgs.hasOwnProperty(sArg)) {
                    oCallArgs[sArg] = oArgs[sArg];
                }
            });
            if (oCallArgs.appStateKey) {
                oCallArgs.params = oCallArgs.params || {};
                oCallArgs.params["sap-xapp-state"] = [oCallArgs.appStateKey];
                delete oCallArgs.appStateKey;
            }

            // note, may be a 1.38+ call or a pre 1.38 call if without action.

        } else if (arguments.length <= 3) {
            // 3 parameters: pre-1.38.0 behavior, parameters are sSemanticObject, mParameters, bIgnoreFormFactor
            // NOTE: in 1.38.0 only the first argument is mandatory!

            // NOTE: in theory there should be no public caller of this
            // method (it's private) apart from some sample apps.
            jQuery.sap.log.warning(
                "Passing positional arguments to getLinks is deprecated",
                "Please use nominal arguments instead",
                "sap.ushell.services.ClientSideTargetResolution"
            );

            sSemanticObject = arguments[0];
            mParameters = arguments[1];
            bIgnoreFormFactor = arguments[2];

            oCallArgs = { // NOTE: no action passed here
                semanticObject: sSemanticObject,
                params: mParameters,
                ignoreFormFactor: bIgnoreFormFactor
            };
        } else {
            return oDeferred.reject("invalid arguments for getLinks").promise();
        }

        this._oInboundProvider.getInbounds().then(function(aInbounds) {

            that._getLinks(oCallArgs, aInbounds)
                .done(oDeferred.resolve.bind(oDeferred))
                .fail(oDeferred.reject.bind(oDeferred));

        }, function() {
            oDeferred.reject.apply(oDeferred, arguments);
        });

        return oDeferred.promise();
    };

    /**
     * Validate input arguments for <code>_getLinks</code>
     * and log the first input validation error.
     *
     * @param {object} oArgs
     *   An object of nominal parameters.
     *
     * @returns {string}
     *   An error message if validation was not successful or undefined in
     *   case of successful validation.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._validateGetSemanticObjectLinksArgs = function(oArgs) {
        var sSemanticObject = oArgs.semanticObject,
            sAction = oArgs.action,
            bIsPre138Call = !oArgs.hasOwnProperty("action"); // action always passed in ushell-lib 1.38.0+

        if (typeof sSemanticObject !== "undefined" || bIsPre138Call) {
            if (typeof sSemanticObject !== "string") {
                jQuery.sap.log.error("invalid input for _getLinks",
                    "the semantic object must be a string, got " + Object.prototype.toString.call(sSemanticObject) + " instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid semantic object";
            }
            if (bIsPre138Call && sSemanticObject.match(/^\s+$/)) {
                jQuery.sap.log.error("invalid input for _getLinks",
                    "the semantic object must be a non-empty string, got '" + sSemanticObject + "' instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid semantic object";
            }
            if (!bIsPre138Call && sSemanticObject.length === 0) {
                jQuery.sap.log.error("invalid input for _getLinks",
                    "the semantic object must not be an empty string, got '" + sSemanticObject + "' instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid semantic object";
            }
        }
        if (typeof sAction !== "undefined") {
            if (typeof sAction !== "string") {
                jQuery.sap.log.error("invalid input for _getLinks",
                    "the action must be a string, got " + Object.prototype.toString.call(sAction) + " instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid action";
            }
            if (sAction.length === 0) {
                jQuery.sap.log.error("invalid input for _getLinks",
                    "the action must not be an empty string, got '" + sAction + "' instead",
                    "sap.ushell.services.ClientSideTargetResolution");
                return "invalid action";
            }
        }

        return undefined;
    };

    /**
     * Internal implementation of getLinks
     *
     * @param {object} oArgs
     *   An object containing nominal parameters for getLinks like:
     *
     *   <pre>
     *   {
     *      semanticObject: "...",       // optional
     *      action: "...",               // optional
     *      params: { ... },             // optional
     *      appStateKey : string         // optional, better put into params!
     *      withAtLeastOneUsedParam: true|false,  // optional, defailts to false
     *      ignoreFormFactor: true|false // optional, defaults to true
     *   }
     *   </pre>
     *
     * @param {array} aInbounds
     *   An array of inbounds to retrieve the get semantic object links from.
     *
     * @returns {array}
     *   An array of link objects containing (at least) the following
     *   properties:
     * <pre>
     * {
     *   intent: "#AnObject-Action?A=B&C=e&C=j",
     *   text: "Perform action"
     * }
     * </pre>
     *
     * @private
     */
    ClientSideTargetResolution.prototype._getLinks = function(oArgs, aInbounds) {
        var sSemanticObject = oArgs.semanticObject,
            sAction = oArgs.action,
            mParameters = oArgs.params,
            bWithAtLeastOneUsedParam = !!oArgs.withAtLeastOneUsedParam,
            bTreatTechHintAsFilter = !!oArgs.treatTechHintAsFilter,
            bIgnoreFormFactor = oArgs.ignoreFormFactor,
            sSortProperty = oArgs.sortResultOnTexts ? "text" : "intent";

        var sErrorMessage = this._validateGetSemanticObjectLinksArgs(oArgs);
        if (sErrorMessage) {
            return new jQuery.Deferred().reject(sErrorMessage).promise();
        }

        if (sSemanticObject === "*") {
            // shortcut: skip matching inbounds and return directly.
            // It can only match "*" and we don't return it anyway.
            return new jQuery.Deferred().resolve([]).promise();
        }

        /*
         * Returns ?-prefixed business parameters
         */
        function fnConstructBusinessParamsString(oUrlParsing, mParameters) {
            var sBusinessParams = oUrlParsing.paramsToString(mParameters);
            return sBusinessParams ? "?" + sBusinessParams : "";
        }

        var that = this,
            oUrlParsing = this._getURLParsing(),
            oDeferred = new jQuery.Deferred(),
            sFormFactor = sap.ushell.utils.getFormFactor(),
            oAllIntentParams = oUrlParsing.parseParameters(fnConstructBusinessParamsString(oUrlParsing, mParameters)),
            oShellHash = {
                semanticObject: (sSemanticObject === "" ? undefined : sSemanticObject),
                action: sAction, // undefined: match all actions
                formFactor: (
                    bIgnoreFormFactor ? undefined // match any form factor
                    : sFormFactor
                ),
                params: oAllIntentParams
            };
        if (bTreatTechHintAsFilter) {
            oShellHash.treatTechHintAsFilter = true;
        }
        this._getMatchingInbounds(oShellHash, aInbounds, /*bExcludeTileInbounds*/ true)
            .done(function(aMatchingTargets) {
                var oUniqueIntents = {},
                    aResults = aMatchingTargets
                    .map(function(oMatchResult) {
                        var sAdjustedSemanticObject = sSemanticObject || oMatchResult.inbound.semanticObject,
                            sIntent = "#" + sAdjustedSemanticObject + "-" + oMatchResult.inbound.action,
                            oNeededParameters;

                        // we never return "*" semantic objects from
                        // getLinks as they are not parsable links
                        if (sAdjustedSemanticObject === "*") {
                            return undefined;
                        }

                        // we never want to return "*" actions from
                        // getLinks as they are non parsable links
                        if (oMatchResult.inbound.action === "*") {
                            return undefined;
                        }

                        if (oMatchResult.inbound && oMatchResult.inbound.hasOwnProperty("hideIntentLink") && oMatchResult.inbound.hideIntentLink === true) {
                            return undefined;
                        }

                        if (!oUniqueIntents.hasOwnProperty(sIntent)) {
                            oUniqueIntents[sIntent] = 1;

                            if (oMatchResult.inbound.signature.additionalParameters === "ignored") {
                                /*
                                 * In the result do not show all intent
                                 * parameters, but only those mentioned by
                                 * the inbound.
                                 */
                                oNeededParameters = that._filterObjectKeys(oAllIntentParams, function(sIntentParam) {
                                    return (sIntentParam.indexOf("sap-") === 0) ||
                                        oMatchResult.inbound.signature.parameters.hasOwnProperty(sIntentParam);
                                }, false);
                            } else {
                                oNeededParameters = oAllIntentParams;
                            }

                            if (bWithAtLeastOneUsedParam) {
                                var bAtLeastOneNonSapParam = Object.keys(oNeededParameters).some(function(sNeededParamName) {
                                    return sNeededParamName.indexOf("sap-") !== 0;
                                });
                                if (!bAtLeastOneNonSapParam) {
                                    return undefined;
                                }
                            }

                            return {
                                "intent": sIntent + fnConstructBusinessParamsString(oUrlParsing, oNeededParameters),
                                "text": oMatchResult.inbound.title
                            };
                        } else {
                            // for debugging purposes
                            oUniqueIntents[sIntent]++;
                        }
                        return undefined;
                    })
                    .filter(function(oSemanticObjectLink) {
                        return typeof oSemanticObjectLink === "object";
                    })
                    .sort(function(oGetSoLinksResult1, oGetSoLinksResult2) {
                        return oGetSoLinksResult1[sSortProperty] < oGetSoLinksResult2[sSortProperty] ? -1 : 1;
                    });

                if (aResults.length === 0) {
                    jQuery.sap.log.debug("_getLinks returned no results");
                } else if (jQuery.sap.log.getLevel() >= jQuery.sap.log.Level.DEBUG) {

                    if (jQuery.sap.log.getLevel() >= jQuery.sap.log.Level.TRACE) {
                        var aResultLines = [];
                        aResults.forEach(function(oResult) {
                            var sIntent = oResult.intent.split("?")[0],
                                sLine = "- " +
                                sIntent + " (" + oUniqueIntents[sIntent] + ") " +
                                "text: " + oResult.text + " " +
                                "intent: " + oResult.intent;

                            aResultLines.push(sLine);
                        });
                        jQuery.sap.log.debug(
                            "_getLinks filtered to the following unique intents:",
                            aResultLines.join("\n"),
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    } else {
                        jQuery.sap.log.debug(
                            "_getLinks filtered to unique intents.",
                            "Reporting histogram: " + Object.keys(oUniqueIntents).join(", "),
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    }
                }
                oDeferred.resolve(aResults);
            })
            .fail(oDeferred.reject.bind(oDeferred));

        return oDeferred.promise();
    };

    /**
     * Transform a matching result into a string for tie-breaking during sort.
     *
     * @param {object} oMatchResult
     *    The match result
     * @param {boolean} bIncludeFieldNames
     *    Whether to include the name of the field being serialized in the
     *    output string. This option should be used for debugging purposes
     *    only.
     *
     * @returns {string}
     *    The serialized match result
     *
     * @see {@link #_getMatchingInbounds}
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._serializeMatchingResult = function(oMatchResult, bIncludeFieldNames) {
        var oResolutionResult = oMatchResult.inbound.resolutionResult;

        return [
            "applicationType",
            "ui5ComponentName",
            "url",
            "additionalInformation",
            "text"
        ].map(function(sKey) {
            if (bIncludeFieldNames) {
                return oResolutionResult.hasOwnProperty(sKey) ? sKey + ":" + oResolutionResult[sKey] : "";
            }
            return oResolutionResult.hasOwnProperty(sKey) ? oResolutionResult[sKey] : "";
        }).join("");
    };

    /**
     * Matches the given resolved shell hash against all the inbounds.
     *
     * @param {object} oShellHash
     *     The resolved hash fragment
     * @param {array} aInbounds
     *     An array of inbounds to match the shell hash against
     * @param {boolean} [bExcludeTileInbounds]
     *     Whether the tile inbounds should be filtered out during
     *     matching. Defaults to <code>false</code>. Tile inbounds can be
     *     distinguished by other inbounds because they specify the
     *     following:
     *<pre>
     *  { ...
     *    "tileResolutionResult" : { "isCustomTile": true }
     *    ...
     *  }
     *</pre>
     *
     * @returns {jQuery.Promise[]}
     *     a sorted array of targets. A target is a matching result
     *     obtained via {@link #_matchToInbound} that in addition has
     *     a specific priority with respect to other matching targets.
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._getMatchingInbounds = function(oShellHash, aInbounds, bExcludeTileInbounds) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            oReadyToSortDeferred = new jQuery.Deferred(),
            oReadyToRematchDeferred = new jQuery.Deferred();

        /*
         * A helper that calls the given function only when certain log
         * levels are set. The information logged can change based on the
         * boolean flag passed as second argument.
         */
        function fnWhenDebugEnabled(fn) {
            var iCurrentLogLevel = jQuery.sap.log.getLevel();

            if (iCurrentLogLevel >= jQuery.sap.log.Level.DEBUG) {
                var bIsCurrentLevelTrace = iCurrentLogLevel >= jQuery.sap.log.Level.TRACE;
                fn(bIsCurrentLevelTrace);
            }
        }

        // Replacer for JSON.stringify to show undefined values
        function fnUndefinedReplacer(sKey, vVal) {
            return this[sKey] === undefined ? "<undefined>" : vVal;
        }

        var fnResolve = function() {

            var aMatchingTargets = [],
                oMissingReferences = {},
                aPotentiallyMatchingTargets = [],
                aPreFilteredInbounds = [],
                oNoMatchReasons = {};

            fnWhenDebugEnabled(function() {
                jQuery.sap.log.debug(
                    "Intent to navigate to is: \"#" +
                    ((oShellHash || {}).semanticObject || "") +
                    "-" +
                    ((oShellHash || {}).action || "") +
                    "\" with parameters" + "\n" + JSON.stringify(oShellHash.params, fnUndefinedReplacer, "   "),
                    null,
                    "sap.ushell.services.ClientSideTargetResolution"
                );
            });

            /*
             * Logic that filters independently on the target to be
             * matched goes here.
             */
            aPreFilteredInbounds = aInbounds;
            if (bExcludeTileInbounds) {
                aPreFilteredInbounds = aInbounds.filter(function(oInbound) {
                    // keep all non custom tiles
                    return !oInbound.tileResolutionResult || !oInbound.tileResolutionResult.isCustomTile;
                });
            }

            // match without known values first
            aPreFilteredInbounds.forEach(function(oInbound) {
                var oMatchResult = that._matchToInbound(oShellHash, oInbound, {} /* no known references the first time */ , oMissingReferences);

                if (oMatchResult.matches) {
                    aMatchingTargets.push(oMatchResult);

                    // may be useful for re-matching
                    aPotentiallyMatchingTargets.push(oInbound);
                } else {
                    fnWhenDebugEnabled(function() {
                        // collect no match reasons and log (debugging purposes)
                        if (!oNoMatchReasons[oMatchResult.noMatchReason]) {
                            oNoMatchReasons[oMatchResult.noMatchReason] = [];
                        }

                        oNoMatchReasons[oMatchResult.noMatchReason].push(
                            "#" + (oMatchResult.inbound || {}).semanticObject +
                            "-" + (oMatchResult.inbound || {}).action +
                            (oMatchResult.noMatchDebug ? "|" + oMatchResult.noMatchDebug : "")
                        );
                    });
                }
            });

            // output no match reasons (debugging)
            fnWhenDebugEnabled(function(bIsDetailedLogging) {
                if (bIsDetailedLogging) {
                    Object.keys(oNoMatchReasons).forEach(function(sReason) {
                        jQuery.sap.log.debug(
                            sReason + ": " + oNoMatchReasons[sReason].join("; "),
                            null,
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    });
                }
            });

            if (jQuery.isEmptyObject(oMissingReferences)) {
                // aMatchingTargets represents a "precise" match, that
                // is, it was carried out without references to unknown
                // user default values.
                oReadyToSortDeferred.resolve(aMatchingTargets);
            } else {
                // unknown values were found during the matching
                // procedure: must get these default values from
                // UserDefaultService.
                fnWhenDebugEnabled(function(bIsDetailedLogging) {
                    jQuery.sap.log.debug(
                        bIsDetailedLogging ? "A rematch is required because the following user defaults need to be determined:" + "\n" + Object.keys(oMissingReferences).join("\n") : "A rematch is required because one or more user defaults need to be determined.",
                        null,
                        "sap.ushell.services.ClientSideTargetResolution"
                    );
                });

                fnWhenDebugEnabled(function() {
                    jQuery.sap.log.debug(
                        "Waiting for ReferenceResolver service to resolve all missing UserDefault references",
                        "Promises are being resolved...",
                        "sap.ushell.services.ClientSideTargetResolution"
                    );
                });

                sap.ushell.Container.getService("ReferenceResolver")
                    .resolveReferences(Object.keys(oMissingReferences))
                    .done(function(oResolvedRefs) {
                        oReadyToRematchDeferred.resolve(oResolvedRefs, aPotentiallyMatchingTargets);
                        fnWhenDebugEnabled(function() {
                            jQuery.sap.log.debug(
                                "ReferenceResolver service has resolved all UserDefault references",
                                "All Promises are resolved",
                                "sap.ushell.services.ClientSideTargetResolution"
                            );
                        });
                    })
                    .fail(function(sError) {
                        jQuery.sap.log.error("Failed to resolve all references",
                            sError, "sap.ushell.services.ClientSideTargetResolution");

                        oReadyToSortDeferred.resolve([]);
                    });
            }
        }; // function
        if (sap.ushell.utils.getParameterValueBoolean("sap-ushell-cstr-timeout")) {
            setTimeout(fnResolve, 0);
        } else {
            fnResolve();
        }

        // triggered in case of re-match
        oReadyToRematchDeferred.done(function(oKnownReferences, aPotentiallyMatchingTargets) {
            fnWhenDebugEnabled(function(bIsDetailedLogging) {
                jQuery.sap.log.debug(
                    bIsDetailedLogging ? "Rematching with the following resolved user defaults:" + JSON.stringify(oKnownReferences, fnUndefinedReplacer, "   ") : "Rematching with resolved user defaults.",
                    null,
                    "sap.ushell.services.ClientSideTargetResolution"
                );
            });

            var aPreciseMatchingTargets = [],
                oMissingReferences = {};

            aPotentiallyMatchingTargets.forEach(function(oInbound) {
                var oMatchResult = that._matchToInbound(oShellHash, oInbound, oKnownReferences, oMissingReferences);
                if (oMatchResult.matches) {
                    aPreciseMatchingTargets.push(oMatchResult);
                }
            });

            if (jQuery.isEmptyObject(oMissingReferences)) {
                oReadyToSortDeferred.resolve(aPreciseMatchingTargets);
            } else {
                jQuery.sap.log.error(
                    "Still obtained unknown references during rematch",
                    JSON.stringify(oMissingReferences, fnUndefinedReplacer, "   "),
                    "sap.ushell.services.ClientSideTargetResolution"
                );
                oDeferred.reject("Rematching returned unknown references!");
            }
        });

        // triggered when a precise (maybe empty) match set is obtained
        oReadyToSortDeferred.done(function(aPreciseMatchingTargets) {

            that._sortMatchingResultsDeterministic(aPreciseMatchingTargets);

            fnWhenDebugEnabled(function(bIsDetailedLogging) {

                if (aPreciseMatchingTargets.length === 0) {
                    fnWhenDebugEnabled(function() {
                        jQuery.sap.log.debug("The intent did not match any inbounds", null, "sap.ushell.services.ClientSideTargetResolution");
                    });
                    return;
                }

                var iTmId = 0,
                    fnReplacer = function(key, value) {
                        return (key === "_original") ? undefined : fnUndefinedReplacer.call(this, key, value);
                    },
                    sInboundsListFormatted = aPreciseMatchingTargets.map(function(oMatchResult) {
                        var sConditionalDebugInfo = "";

                        iTmId++;

                        if (bIsDetailedLogging) {
                            sConditionalDebugInfo = " " + (oMatchResult["sap-priority"] || "") +
                                " Priority: " + (oMatchResult["sap-priority"] ? "sap-priority : " + oMatchResult["sap-priority"] : "") +
                                oMatchResult.priorityString +
                                " Signature: " + that._compactSignatureNotation((oMatchResult.inbound || {}).signature) +
                                " Deterministic blob: " + that._serializeMatchingResult(oMatchResult, true);
                        }

                        return iTmId + ". #" +
                            (oMatchResult.inbound || {}).semanticObject +
                            "-" +
                            (oMatchResult.inbound || {}).action +
                            (oMatchResult.matchesVirtualInbound ? " (virtual)" : "") +
                            sConditionalDebugInfo;

                    }).join("\n"),
                    sTopMatchedResult = bIsDetailedLogging ? JSON.stringify(aPreciseMatchingTargets[0], fnUndefinedReplacer, "   ") : JSON.stringify(aPreciseMatchingTargets[0].resolutionResult || aPreciseMatchingTargets[0], fnReplacer, "   ");

                jQuery.sap.log.debug(
                    "Intent has matched the following inbounds (in priority): \n" + sInboundsListFormatted,
                    "\nTop matched inbound resolves to:" + sTopMatchedResult,
                    "sap.ushell.services.ClientSideTargetResolution"
                );
            });

            oDeferred.resolve(aPreciseMatchingTargets);
        });
        return oDeferred.promise();
    };

    /**
     * Sorts the matching results deterministically, using the priority
     * string in the match result and an integer sap-priority if present.
     *
     * @param {object[]} aMatchingResults
     *    The matching results
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._sortMatchingResultsDeterministic = function(aMatchingResults) {
        var that = this;
        // deterministic sorting
        aMatchingResults.sort(function(oMatchResult1, oMatchResult2) {
            if ((oMatchResult1["sap-priority"] || 0) - (oMatchResult2["sap-priority"] || 0) !== 0) {
                return -((oMatchResult1["sap-priority"] || 0) - (oMatchResult2["sap-priority"] || 0));
            }
            if (oMatchResult1.priorityString < oMatchResult2.priorityString) {
                return 1;
            }
            if (oMatchResult1.priorityString > oMatchResult2.priorityString) {
                return -1;
            }

            // make it deterministic
            return (that._serializeMatchingResult(oMatchResult1) < that._serializeMatchingResult(oMatchResult2)) ? 1 // NOTE: inverted result, longer matches come first
                : -1;
        });
    };

    /**
     *
     * Determines whether a single intent matches one or more navigation
     * targets.
     *
     * @param {string} sIntent
     *    the intent to be matched
     * @param {object[]} aInbounds
     *    the set of inbounds to be matched
     *
     * @returns {jQuery.Deferred.promise}
     *    a promise that is resolved with a boolean if the intent is
     *    supported and rejected if not. The promise resolves to true
     *    if only one target matches the intent, and false if multiple
     *    targets match the intent.
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._isIntentSupportedOne = function(sIntent, aInbounds) {
        var oDeferred = new jQuery.Deferred(),
            oShellHash = this._getURLParsing().parseShellHash(sIntent);
        // navigation to '#' is always considered possible
        if (sIntent === "#") {
            oDeferred.resolve(true);
            return oDeferred.promise();
        }
        if (oShellHash === undefined) {
            jQuery.sap.log.error("Could not parse shell hash '" + sIntent + "'",
                "please specify a valid shell hash",
                "sap.ushell.services.ClientSideTargetResolution");
            return oDeferred.reject().promise();
        }

        oShellHash.formFactor = sap.ushell.utils.getFormFactor();

        this._getMatchingInbounds(oShellHash, aInbounds, true /* bExcludeTileInbounds */ )
            .done(function(aTargets) {
                oDeferred.resolve(aTargets.length > 0);
            })
            .fail(function() {
                oDeferred.reject();
            });

        return oDeferred.promise();
    };

    /**
     * Tells whether the given intent(s) are supported, taking into account
     * the form factor of the current device. "Supported" means that
     * navigation to the intent is possible.
     *
     * @param {string[]} aIntents
     *   The intents (such as <code>"#AnObject-Action?A=B&C=e&C=j"</code>) to be checked
     *
     * @returns {object}
     *   A <code>jQuery.Deferred</code> object's promise which is resolved with a map
     *   containing the intents from <code>aIntents</code> as keys. The map values are
     *   objects with a property <code>supported</code> of type <code>boolean</code>.<br/>
     *   Example:
     * <pre>
     * {
     *   "#AnObject-Action?A=B&C=e&C=j": { supported: false },
     *   "#AnotherObject-Action2": { supported: true }
     * }
     * </pre>
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype.isIntentSupported = function(aIntents) {
        var that = this,
            oDeferred = new jQuery.Deferred();

        this._oInboundProvider.getInbounds().then(
            function(aInbounds) {
                that._isIntentSupported(aIntents, aInbounds)
                    .done(oDeferred.resolve.bind(oDeferred))
                    .fail(oDeferred.reject.bind(oDeferred));
            },
            function() {
                oDeferred.reject.apply(oDeferred, arguments);
            });

        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._isIntentSupported = function(aIntents, aInbounds) {
        var that = this,
            oDeferred = new jQuery.Deferred(),
            mSupportedByIntent = {};

        oDeferred.resolve();

        /*
         * Sets the result for the given intent as indicated.
         * @params {string} sIntent
         * @params {boolean} bSupported
         */
        function setResult(sIntent, bSupported) {
            mSupportedByIntent[sIntent] = {
                supported: bSupported
            };
        }

        aIntents.forEach(function(sIntent) {
            var oNextPromise = that._isIntentSupportedOne(sIntent, aInbounds);
            oNextPromise.fail(function(sErrorMessage) {
                setResult(sIntent, false);
            });
            oNextPromise.done(function(bResult) {
                setResult(sIntent, bResult);
            });
            oDeferred = jQuery.when(oDeferred, oNextPromise);
        });

        var oRes = new jQuery.Deferred();
        oDeferred.done(function() {
            oRes.resolve(mSupportedByIntent);
        }).fail(function() {
            oRes.reject.bind(oDeferred);
        });

        return oRes.promise();
    };

    /**
     * Finds and returns all unique user default parameter names referenced
     * in inbounds.
     *
     * @returns {jQuery.Deferred.promise}
     *    <p>A promise that resolves to an object with the following structure <code>
     *    {
     *        simple: {
     *           parameternamextractUserDefaultReferenceNamee1 : {},
     *           parametername2 : {}
     *        }
     *        extended: {
     *           parametername3: {},
     *           parametername4: {}
     *        }
     *    }
     *    </code>
     *    The name of a user default parameter referenced in an inbound.
     *    </p>
     *    <p>
     *    NOTE: the parameter names do not include surrounding special
     *    syntax. Only the inner part is returned. For example:
     *    <pre>
     *    "UserDefault.ParameterName" is returned as "ParameterName"
     *    </pre>
     *    </p>
     *
     * Signature changed in 1.34!
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype.getUserDefaultParameterNames = function() {
        // the empty objects may in future bear information like sap-system relevance
        var that = this,
            oDeferred = new jQuery.Deferred();

        this._oInboundProvider.getInbounds().then(
            function(aInbounds) {
                var oRes;
                try {
                    oRes = that._getUserDefaultParameterNames(aInbounds);
                    oDeferred.resolve(oRes);
                } catch (e) {
                    oDeferred.reject("Cannot get user default parameters from inbounds: " + e);
                }
            },
            function() {
                oDeferred.reject.apply(oDeferred, arguments);
            }
        );

        return oDeferred.promise();
    };

    ClientSideTargetResolution.prototype._getUserDefaultParameterNames = function(aInbounds) {
        var oRefs = {
            simple: {},
            extended: {}
        };

        aInbounds.forEach(function(oTm) {
            var oSignatureParams = oTm.signature && oTm.signature.parameters || [];

            Object.keys(oSignatureParams).forEach(function(sParamName) {
                var oParam = oSignatureParams[sParamName],
                    sRefName,
                    sExtendedRefName,
                    sReferenceParamName,
                    oRefResolverSrvc;

                if (oParam) {
                    // first try to get the user default value from the filter

                    if (oParam.filter && oParam.filter.format === "reference") {
                        sReferenceParamName = oParam.filter.value;

                    } else if (oParam.defaultValue && oParam.defaultValue.format === "reference") {
                        sReferenceParamName = oParam.defaultValue.value;
                    }

                    if (typeof sReferenceParamName === "string") {
                        oRefResolverSrvc = sap.ushell.Container.getService("ReferenceResolver");
                        // only extract user defaults
                        sRefName = oRefResolverSrvc.extractUserDefaultReferenceName(sReferenceParamName);
                        if (typeof sRefName === "string") {
                            oRefs.simple[sRefName] = {};
                        }
                        sExtendedRefName = oRefResolverSrvc.extractExtendedUserDefaultReferenceName(sReferenceParamName);
                        if (typeof sExtendedRefName === "string") {
                            oRefs.extended[sExtendedRefName] = {};
                        }
                    }
                }
            });
        });

        return oRefs;
    };

    /**
     * Returns a compact string representation of an Inbound signature.
     *
     * @param {object} oSignature
     *    The input parameters in app descriptor format
     * @returns {string}
     *    The input parameters in compact notation
     *
     * @private
     * @since 1.32.0
     */
    ClientSideTargetResolution.prototype._compactSignatureNotation = function(oSignature) {
        var oFixedSignature = oSignature || {};
        var mParams = oFixedSignature.parameters || {},
            oTypeNotation = {
                optional: "[FORMAT]",
                required: "FORMAT"
            },
            oFormatNotation = {
                regexp: "/VALUE/",
                reference: "@VALUE",
                value: "VALUE",
                plain: "VALUE",
                _unknown: "?VALUE" // unknown format specified
            },
            oAdditionalParametersSymbol = {
                allowed: "<+>",
                notallowed: "<->",
                ignored: "<o>",
                _unknown: "<?>"
            };

        if (jQuery.isEmptyObject(mParams)) {
            return "<no params>" + (
                oAdditionalParametersSymbol[oFixedSignature.additionalParameters || "_unknown"]
            );
        }

        var aResults = [];

        Object.keys(mParams).forEach(function(sParamName) {
            var oParamDefinition = mParams[sParamName],
                sParamType = oParamDefinition.required ? "required" : "optional",
                sParamFilterValue = oParamDefinition.filter && oParamDefinition.filter.value,
                sParamDefaultValue = oParamDefinition.defaultValue && oParamDefinition.defaultValue.value,
                sParamFilterFormat = (oParamDefinition.filter && oParamDefinition.filter.format) || "plain",
                sParamDefaultFormat = (oParamDefinition.defaultValue && oParamDefinition.defaultValue.format) || "plain";

            var aValueRepr = [],
                sParamFilterFormatNotation = oFormatNotation[sParamFilterFormat] || oFormatNotation._unknown,
                sParamDefaultFormatNotation = oFormatNotation[sParamDefaultFormat] || oFormatNotation._unknown;

            if (sParamFilterValue) {
                aValueRepr.push(
                    oTypeNotation["required"].replace("FORMAT",
                        sParamFilterFormatNotation.replace("VALUE", sParamFilterValue)
                    )
                );
            }
            if (sParamDefaultValue) {
                aValueRepr.push(
                    oTypeNotation["optional"].replace("FORMAT",
                        sParamDefaultFormatNotation.replace("VALUE", sParamDefaultValue)
                    )
                );
            }
            aResults.push(
                oTypeNotation[sParamType].replace("FORMAT",
                    sParamName + ":" + aValueRepr.join("")
                )
            );
        });

        return aResults.join(";") + (
            oAdditionalParametersSymbol[oFixedSignature.additionalParameters || "_unknown"]
        );
    };


    /**
     * Determines whether the given application type represents a legacy
     * application.
     *
     * @param {string} sApplicationType
     *   The application type to be checked
     * @returns {boolean}
     *   Whether the given application type represents a legacy application
     *   type.
     *
     * @private
     */
    ClientSideTargetResolution.prototype._isLegacyApplicationType = function(sApplicationType) {
        switch (sApplicationType) {
            case "WDA":
            case "TR":
            case "NWBC":
                // consider NWBC a legacy application type because this
                // method can be called with the resolutionResult returned
                // by ClientSideTargetResolution, for example,
                // via appConfiguration.getCurrentApplication().applicationType
                return true;
            default:
                return false;
        }
    };

    /**
     * Returns the list of easy access systems provided via specific inbounds.
     *
     * <p>The admin can define one or more of <code>Shell-start*</code> inbounds.
     * In case multiple <code>Shell-start*</code> inbounds are defined with
     * the same system alias, the title will be chosen from the inbound with
     * the most priority, which is as follows:
     * <ol>
     * <li>Shell-startGUI</li>
     * <li>Shell-startWDA</li>
     * <li>Shell-startURL</li>
     * </ol>
     *
     * @param {string} [sMenuType="sapMenu"]
     *   The type of menu to return the entries for. This can be one of
     *   "userMenu" or "sapMenu". If this parameter is not specified, just
     *   the entries for the sap menu will be returned for the sap menu are
     *   returned.
     *
     * @returns {jQuery.Deferred.promise}
     *   Returns a promise that resolves with an object containing the systems:
     * <pre>
     *   {
     *       <system alias {string}>: {
     *           text: <text to be displayed in the system list {string}>
     *       }
     *   }
     * </pre>
     *
     * Example
     * <pre>
     * {
     *     AB1CLNT000: {
     *        text: "CRM Europe",
     *        appType: {
     *           WDA: true,
     *           GUI: true,
     *           URL: true
     *        }
     *     }
     * }
     * </pre>
     *
     * @private
     * @since 1.38.0
     */
    ClientSideTargetResolution.prototype.getEasyAccessSystems = function(sMenuType) {
        var that = this,
            oResultEasyAccessSystemSet = {}, // see @returns example in JSDOC
            oActionDefinitions,
            oValidMenuTypeActions,
            oDeferred;

        // default
        sMenuType = sMenuType || "sapMenu";

        if (this._oHaveEasyAccessSystemsDeferreds[sMenuType]) {
            return this._oHaveEasyAccessSystemsDeferreds[sMenuType].promise();
        }
        this._oHaveEasyAccessSystemsDeferreds[sMenuType] = new jQuery.Deferred();
        oDeferred = this._oHaveEasyAccessSystemsDeferreds[sMenuType]; // shorter name

        function isValidEasyAccessMenuInbound(oInbound, sCurrentFormFactor, oValidMenuTypeActions) {
            return oInbound && oInbound.semanticObject && oInbound.semanticObject === "Shell" && oInbound.action && oValidMenuTypeActions[sMenuType][oInbound.action] && oInbound.deviceTypes && sCurrentFormFactor !== undefined && oInbound.deviceTypes[sCurrentFormFactor];
        }

        function getInboundAsString(oInbound) {
            return [
                "#" + oInbound.semanticObject, "-", oInbound.action,
                ", signature: " + that._compactSignatureNotation((oInbound || {}).signature)
            ].join("");
        }

        oActionDefinitions = {
            startGUI: {
                priority: 3, // startGUI titles are preferred over WDA and URL
                appType: "TR"
            },
            startWDA: {
                priority: 2, // preferred over URL
                appType: "WDA"
            },
            startURL: {
                priority: 1,
                appType: "URL"
            }
        };

        oValidMenuTypeActions = {
            userMenu: {
                startGUI: true,
                startWDA: true,
                startURL: true // NOTE: startURL should only appear in the user menu
            },
            sapMenu: {
                startGUI: true,
                startWDA: true,
                startURL: false
            }
        };

        this._oInboundProvider.getInbounds().then(function(aInbounds) { // all inbounds, no segments
            var oLastPriorityPerSystem = {};

            aInbounds.filter(function(oInbound) {
                return isValidEasyAccessMenuInbound(
                    oInbound, sap.ushell.utils.getFormFactor(), oValidMenuTypeActions
                );
            }).forEach(function(oEasyAccessInbound) {
                // extract the data for the easy access system list
                var sSystemAliasName;
                if (jQuery.isPlainObject(oEasyAccessInbound.signature.parameters["sap-system"]) &&
                    oEasyAccessInbound.signature.parameters["sap-system"].hasOwnProperty("filter")) {

                    sSystemAliasName = jQuery.sap.getObject("signature.parameters.sap-system.filter.value", undefined, oEasyAccessInbound);
                }

                if (typeof sSystemAliasName === "string") {
                    /*
                     * Code below builds the set of easy access system that
                     * should be displayed in the sapMenu/userMenu.  In
                     * case multiple inbounds exist with a certain system,
                     * the app type with the highest priority is used to
                     * choose the title (see oActionDefinitions above).
                     * Note that other app types should still appear in the
                     * result set (see 'appType' in the example result from
                     * jsdoc).
                     */
                    var iCurrentActionPriority = oActionDefinitions[oEasyAccessInbound.action].priority;
                    var sCurrentActionAppType = oActionDefinitions[oEasyAccessInbound.action].appType;

                    if (!oResultEasyAccessSystemSet[sSystemAliasName]) {
                        // provide base structure...
                        oLastPriorityPerSystem[sSystemAliasName] = -1;
                        oResultEasyAccessSystemSet[sSystemAliasName] = {
                            appType: {}
                        };
                    }

                    if (oLastPriorityPerSystem[sSystemAliasName] < iCurrentActionPriority) {
                        // ...then populate in case
                        oResultEasyAccessSystemSet[sSystemAliasName].text = oEasyAccessInbound.title;
                        oLastPriorityPerSystem[sSystemAliasName] = iCurrentActionPriority;
                    }

                    // keep track of all the app types
                    oResultEasyAccessSystemSet[sSystemAliasName].appType[sCurrentActionAppType] = true;

                } else {

                    jQuery.sap.log.warning(
                        "Cannot extract sap-system from easy access menu inbound: " + getInboundAsString(oEasyAccessInbound),
                        "This parameter is supposed to be a string. Got '" + sSystemAliasName + "' instead.",
                        "sap.ushell.services.ClientSideTargetResolution"
                    );
                }
            });

            oDeferred.resolve(oResultEasyAccessSystemSet);

        }, function() {

            oDeferred.reject.apply(oDeferred, arguments);
        });

        return oDeferred.promise();
    };

    ClientSideTargetResolution.hasNoAdapter = false;
    return ClientSideTargetResolution;

}, true /* bExport */ );
