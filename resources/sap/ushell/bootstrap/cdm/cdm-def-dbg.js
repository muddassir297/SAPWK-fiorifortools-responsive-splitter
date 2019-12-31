"use strict";

/* global window, document, sap */

( function ( $window, $document, $JSON, oUtil ) {
    var sScriptTags, sStoredSapUiDebugValue;

    var sUI5LibraryRootPath = oUtil.getBootPath( $document );
    var oUi5ResourceRoots = { "": sUI5LibraryRootPath };

    var bDebugSources = /sap-ui-debug=(true|x|X)/.test( $window.location.search );

    var oConfigUtil = new oUtil.ConfigUtil( "sap.ushellConfig", $window, $document, $JSON );

    var fnXXBootTask = function ( fnCallback ) {

        $window.jQuery.sap.require( "sap.ushell.services.Container" );

        // tell SAPUI5 that this boot task is done once the container has loaded
        // TODO: change from local to cdm platform (once we have a ContainerAdapter)
        $window.sap.ushell.bootstrap( "local" ).done( fnCallback );
        //TODO what about .fail()?
    };

    $window.fnOnUI5Init = oUtil.onUI5Init;

    try {
        if ( !bDebugSources ) {
            sStoredSapUiDebugValue = $window.localStorage.getItem( "sap-ui-debug" );
            bDebugSources = !!sStoredSapUiDebugValue &&
                    /^(true|x|X)$/.test( sStoredSapUiDebugValue );
        }
    }
    catch ( e ) {
        // TODO: warn.
    }

    oConfigUtil.createGlobalConfigs( fnXXBootTask, null );
    $window[ "sap-ushell-config" ][ "sap-ui-debug" ] = bDebugSources;

    sScriptTags = "<script id='sap-ui-bootstrap' src='" + sUI5LibraryRootPath + "/sap/fiori/core-min-0.js' " +
            "data-sap-ui-evt-oninit='fnOnUI5Init( sap, jQuery );' " +
            "data-sap-ui-xx-bindingSyntax='complex' " +
            "data-sap-ui-libs='sap.fiori, sap.m, sap.ushell' " +
            "data-sap-ui-theme='sap_belize' " +
            "data-sap-ui-compatVersion='1.16' " +
            "data-sap-ui-resourceroots='" + JSON.stringify( oUi5ResourceRoots ) + "' " +
            "><\/script>";

    if ( !bDebugSources ) {
        sScriptTags += "<script src='" + sUI5LibraryRootPath +
                "/sap/fiori/core-min-1.js' " + "><\/script>" + "<script src='" +
                sUI5LibraryRootPath + "/sap/fiori/core-min-2.js' " + "><\/script>" +
                "<script src='" + sUI5LibraryRootPath + "/sap/fiori/core-min-3.js' " +
                "><\/script>";
    }

    $document.write( sScriptTags );

} )( window, document, JSON, require( "../common/" ) );