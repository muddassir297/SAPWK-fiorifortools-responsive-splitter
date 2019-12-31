// @copyright@

/**
 * @fileOverview
 *
 * Provides a list of inbounds describing all the possible navigation
 * targets.
 *
 * <p>An inbound is represented as an object with a structure like:</p>
 *
 * <pre>
 * {
 *     semanticObject: {string},
 *     action: {string},
 *     signature: {
 *         parameters: {
 *             "parameter1" {
 *                 "defaultValue": {
 *                     value: "abc"
 *                 },
 *                 "filter": {
 *                     value: "(abc)|(def)",
 *                     format: "regexp"
 *                 },
 *                 "required": true
 *             },
 *             ... more parameters
 *         }
 *         additionalParameters: "notallowed", // "allowed", "ignored"
 *    }
 * }
 * </pre>
 *
 * <p>This is a dependency of ClientSideTargetResolution.  Interfaces exposed
 * by this module may change at any time without notice.</p>
 *
 * @version
 * @version@
 */
sap.ui.define([
    "sap/ushell/services/_ClientSideTargetResolution/VirtualInbounds"
], function (oVirtualInbounds) {
    "use strict";

    /* global Promise */

    /**
     * Creates an InboundProvider object.
     *
     * @constructor
     * @class
     * @private
     */
    function InboundProvider () {
        this._init.apply(this, arguments);
    };

    InboundProvider.prototype._init = function (fnRetrieveInbounds) {
        this._fnRetrieveInbounds = fnRetrieveInbounds;
        this._oInboundsRetrievalPromise = null;
    };

    /**
     * Retrieves a list of inbounds.
     *
     * @param {object[]} [aSegments]
     *    When specified, allows to retrieve only a portion of all the
     *    inbounds. This is useful to optimize specific resolution flows (e.g.,
     *    direct start) that do not require the FLP to wait until all inbounds
     *    are returned.
     *
     *    <p>Example:</p>
     *<pre>
     * [
     *   {
     *     semanticObject : "So",
     *     action : "action"
     *   },
     *   ...
     * ]
     *</pre>
     *
     *    When not supplied, all available inbounds are returned.
     *
     * @returns {Promise}
     *    an ES6 promise that is resolved with the list of inbounds
     *    obtained.
     *
     * @private
     */
    InboundProvider.prototype.getInbounds = function(aSegments) {
        if (aSegments) {
            return this._getSomeInbounds(aSegments);
        }
        return this._getAllInbounds();
    };

    /**
     * Returns only some of the Inbounds. This method does not cache results.
     * In a typical FLP scenario, this method is likely to be called once.
     * Therefore there is no need to introduce caching at the moment.
     *
     * @param {object[]} aSegments
     *   A parameter indicating only a subset of all intents is required
     *   for execution.
     *
     *   <p>Example:</p>
     *
     * <pre>
     *  [
     *    {
     *      semanticObject : "So",
     *      action : "action"
     *    },
     *    ...
     *  ]
     * </pre>
     *
     * @returns {Promise}
     *    a promise that is resolved with the list of inbounds
     *    obtained.
     *
     * @private
     */
    InboundProvider.prototype._getSomeInbounds = function (aSegments) {
        var that = this;

        return new Promise(function (fnResolve, fnReject) {
            that._fnRetrieveInbounds(aSegments).done(function (aInbounds) {
                fnResolve(aInbounds.concat(oVirtualInbounds.getInbounds()));
            }).fail(function () {
                fnReject.apply(null, arguments);
            });
        });
    };

    /**
     * Returns the complete set of inbounds. This method caches the resulting
     * promise over multiple invocations.
     *
     * @returns {Promise}
     *    An ES6 promise that is resolved with the list of inbounds obtained,
     *    or rejected with <code>undefined</code>.
     *
     * @private
     */
    InboundProvider.prototype._getAllInbounds = function () {
        var that = this;

        if (this._oInboundsRetrievalPromise) {
            return this._oInboundsRetrievalPromise;
        }

        this._oInboundsRetrievalPromise = new Promise(function (fnResolve, fnReject) {
            that._fnRetrieveInbounds().done(function (aInbounds) {
                fnResolve((aInbounds || []).concat(oVirtualInbounds.getInbounds()));
            }).fail(function () {
                fnReject.apply(null, arguments);
            });
        });

        return this._oInboundsRetrievalPromise;

    };

    return InboundProvider;
});
