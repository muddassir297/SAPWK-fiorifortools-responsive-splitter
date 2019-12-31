"use strict";

var fnGetBootPath = require( "./common.boot.path" );

module.exports = function loadContent( sap, jQuery ) {
    var sBootPath = fnGetBootPath();
    // TODO: should not be part of common bootstrap modules, but rather in cdm;
    // and we should disable this option for productive scenarios
    var sValue = jQuery.sap.getUriParameters().get( "sap-ushell-cdm-site-url" );
    var oContent = sap.ushell.Container.createRenderer();

    if ( sValue ) {
        // CODE SMELL: There should be another method that explicitly sets
        // cdmSiteUrl. Reason - nothing associates the verb load with set.
        jQuery.sap.getObject(
            "sap-ushell-config.services.CommonDataModel.adapter.config",
            0
        ).cdmSiteUrl = sValue;
    }

    jQuery.sap.setIcons( {
        "phone": sBootPath + '/sap/ushell/themes/base/img/launchicons/57_iPhone_Desktop_Launch.png',
        "phone@2": sBootPath + '/sap/ushell/themes/base/img/launchicons/114_iPhone-Retina_Web_Clip.png',
        "tablet": sBootPath + '/sap/ushell/themes/base/img/launchicons/72_iPad_Desktop_Launch.png',
        "tablet@2": sBootPath + '/sap/ushell/themes/base/img/launchicons/144_iPad_Retina_Web_Clip.png',
        "favicon": sBootPath + '/sap/ushell/themes/base/img/launchpad_favicon.ico',
        "precomposed": true
    } );

    // load and register Fiori2 icon font
    jQuery.sap.require( "sap.ushell.iconfonts" );
    jQuery.sap.require( "sap.ushell.services.AppConfiguration" );
    sap.ushell.iconfonts.registerFiori2IconFont();

    // clean fiori loading screen markup before placing main content
    jQuery( "#canvas" ).empty();
    oContent.placeAt( "canvas" );
};