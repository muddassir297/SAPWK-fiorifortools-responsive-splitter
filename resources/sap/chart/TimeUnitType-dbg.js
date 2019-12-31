/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

// Provides enumeration sap.chart.TimeUnitType
sap.ui.define(function() {
    "use strict";


    /**
    * Enumeration for supported time unit types in analytical chart
    *
    * @namespace
    * @public
    * @alias sap.chart.TimeUnitType
    */
    var TimeUnitType = {
        /**
         * type is Edm.DateTime and V2 annotation sap:display-format is "Date" or timestamp
         * @public
         */
        Date: "Date",
        /**
         * type is Edm.string and V2 annotation sap:semantics is "yearmonthday", like "yyyyMMdd"
         * @public
         */
        yearmonthday: "yearmonthday",

        /**
         * type is Edm.string, like "yyyyQQQQQ"
         * @public
         */
        yearquarter: "yearquarter",

        /**
         * type is Edm.string, like "yyyyMM"
         * @public
         */
        yearmonth: "yearmonth",
	    /**
         * type is Edm.string, like "YYYY"
         * @public
         */
        fiscalyear: "fiscalyear",
        /**
         * type is Edm.string, like "YYYYPPP"
         * @public
         */
        fiscalyearperiod: "fiscalyearperiod"

    };


    return TimeUnitType;

}, /* bExport= */ true);
