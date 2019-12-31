/* global jQuery, sap */

(function() {
    "use strict";

    // =======================================================================
    // import packages
    // =======================================================================        
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.eventlogging.EventConsumer');
    var EventConsumer = sap.ushell.renderers.fiori2.search.eventlogging.EventConsumer;

    // =======================================================================
    // declare package
    // =======================================================================        
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.eventlogging.SinaLogConsumer');

    // =======================================================================
    // SinaLogConsumer
    // =======================================================================        
    var module = sap.ushell.renderers.fiori2.search.eventlogging.SinaLogConsumer = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = jQuery.extend(new EventConsumer(), {

        collectEvents: true,

        init: function(sina) {
            this.sina = sina;
        },

        logEvents: function(events) {
            var formattedEvents = [];
            for (var i = 0; i < events.length; ++i) {
                var event = jQuery.extend({}, events[i]);
                event.type = event.type.toString(); // convert type object to string
                formattedEvents.push(event);
            }
            this.sina.logEvents(formattedEvents);
        },

        createEventLoggingTimestamp: function() {
            return this.sina.createEventLoggingTimestamp();
        }

    });


})();
