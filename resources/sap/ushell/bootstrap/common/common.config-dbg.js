"use strict";

var fn = require( "./common.config.private" );

ConfigUtil.prototype.createGlobalConfigs = function ( fnXXBootTask, aServerConfigItems ) {
    var aMetaConfigItems = fn.readConfigItemsFromMeta(
        this.prefix,
        this.document,
        this.JSON
    );

    fn.createGlobalConfigs(
        aMetaConfigItems,
        fnXXBootTask,
        aServerConfigItems,
        this.window,
        this.JSON
    );
};

/**
 * Constructs a new utility object for managing configuration.
 *
 * @param {string} sConfigPrefix Prefix of meta tag name attributes containing configuration strings.
 * @param {window} $window window
 * @param {HTMLDocument} $document window.document
 * @param {JSON} $JSON window.JSON
 *
 * @returns {Object} New utility object for managing configuration.
 */
function ConfigUtil( sConfigPrefix, $window, $document, $JSON ) {
    return Object.create( ConfigUtil.prototype, {
        JSON: {
            value: $JSON
        },
        prefix: {
            value: sConfigPrefix
        },
        window: {
            value: $window
        },
        document: {
            value: $document
        }
    } );
}

module.exports = ConfigUtil;