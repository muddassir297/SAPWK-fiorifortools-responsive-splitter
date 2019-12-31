"use strict";

var fnGetBootScript = require( "./common.boot.script" );
var sBootPath;

module.exports = function getBootPath( $document ) {
    var oBootScript;

    if ( !sBootPath ) {
        oBootScript = fnGetBootScript( $document );

        if ( oBootScript ) {
            // implicitly relies on location of bootstrap script (4 levels from root)
            sBootPath = oBootScript.src.split( "/" ).slice( 0, -4 ).join( "/" );
        }
        else {
            // TODO: warn.
        }
    }

    return sBootPath;
};