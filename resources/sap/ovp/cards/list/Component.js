(function(){"use strict";jQuery.sap.declare("sap.ovp.cards.list.Component");jQuery.sap.require("sap.ovp.cards.generic.Component");sap.ovp.cards.generic.Component.extend("sap.ovp.cards.list.Component",{metadata:{properties:{"contentFragment":{"type":"string","defaultValue":"sap.ovp.cards.list.List"},"annotationPath":{"type":"string","defaultValue":"com.sap.vocabularies.UI.v1.LineItem"},"headerFragment":{"type":"string","defaultValue":"sap.ovp.cards.generic.CountHeader"},"footerFragment":{"type":"string","defaultValue":"sap.ovp.cards.generic.CountFooter"},"headerExtensionFragment":{"type":"string","defaultValue":"sap.ovp.cards.generic.KPIHeader"}},version:"1.46.0",library:"sap.ovp",includes:[],dependencies:{libs:["sap.m","sap.suite.ui.microchart"],components:[]},config:{},customizing:{"sap.ui.controllerExtensions":{"sap.ovp.cards.generic.Card":{controllerName:"sap.ovp.cards.list.List"}}}}});})();