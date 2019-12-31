"use strict";

function readConfigItemsFromMeta( sConfigPrefix, $document, $JSON ) {
    var sSelector = "meta[name^='" + sConfigPrefix + "']:not([name=''])";
    var oMetaNodeList = $document.querySelectorAll( sSelector );

    var aConfigItems = [ ];

    Array.prototype.slice.call( oMetaNodeList )
        .forEach( function ( oMetaNode ) {
            try {
                aConfigItems.push( $JSON.parse( oMetaNode.content ) );
            }
            catch ( e ) {
                // TODO: log it.
            }
        } );

    return aConfigItems;
}

function mergeConfig( oMutatedBaseConfig, oConfigToMerge, bCloneConfigToMerge, $JSON ) {
    var oActualConfigToMerge;

    if ( !oConfigToMerge ) {
        return;
    }

    oActualConfigToMerge = bCloneConfigToMerge
        ? $JSON.parse( $JSON.stringify( oConfigToMerge ) )
        : oConfigToMerge;

    Object.keys( oActualConfigToMerge )
        .forEach( function ( sKey ) {
            if ( typeof oMutatedBaseConfig[sKey] === "object" &&
                    typeof oActualConfigToMerge[sKey] === "object" ) {
                mergeConfig( oMutatedBaseConfig[sKey], oActualConfigToMerge[sKey], false );
                return;
            }

            oMutatedBaseConfig[sKey] = oActualConfigToMerge[sKey];
        } );
}

function createGlobalConfigs( aMetaConfigItems, fnXXBootTask, aServerConfigItems, $window, $JSON ) {
    var sConfigPropertyName = "sap-ushell-config";

    $window[ sConfigPropertyName ] = $window[ sConfigPropertyName ] || { };

    aMetaConfigItems.forEach( function ( oConfigItem ) {
        mergeConfig( $window[ sConfigPropertyName ], oConfigItem, true, $JSON );
    } );

    aServerConfigItems && aServerConfigItems
            .forEach( function ( oServerConfig ) {
                mergeConfig( $window[sConfigPropertyName], oServerConfig, true, $JSON );
            } );

    $window["sap-ui-config"] = {
        "xx-bootTask": fnXXBootTask
    };
}

module.exports.readConfigItemsFromMeta = readConfigItemsFromMeta;
module.exports.createGlobalConfigs = createGlobalConfigs;
module.exports.mergeConfig = mergeConfig;