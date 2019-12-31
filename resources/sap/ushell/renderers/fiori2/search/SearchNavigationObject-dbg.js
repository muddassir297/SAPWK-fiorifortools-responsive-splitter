/* global jQuery, sap, window, document, console */
(function() {
    "use strict";

    // jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchNavigationObject');
    //
    // var SearchNavigationObject = sap.ushell.renderers.fiori2.search.SearchNavigationObject = function() {
    //     this.init.apply(this, arguments);
    // };

    // SearchNavigationObject.prototype = {

    sap.ui.base.Object.extend("sap.ushell.renderers.fiori2.search.SearchNavigationObject", {

        constructor: function(params) {
            if (params) {
                this.setHref(params.href);
                this.setText(params.text);
                this.setTarget(params.target);
            }
        },

        getHref: function() {
            return this._href;
        },

        setHref: function(href) {
            this._href = href;
        },

        getText: function() {
            return this._text;
        },

        setText: function(text) {
            this._text = text;
        },

        getTarget: function() {
            return this._target;
        },

        setTarget: function(target) {
            this._target = target;
        },

        performNavigation: function() {
            if (!this._target) {
                window.open(this._href);
            } else {
                window.open(this._href, this._target);
            }
        }
    });

})();
