/*!
 * (c) Copyright 2010-2017 SAP SE or an SAP affiliate company.
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.zen.dsh.AnalyticGrid.
jQuery.sap.declare("sap.zen.dsh.AnalyticGrid");
jQuery.sap.require("sap.zen.dsh.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new AnalyticGrid.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize</li>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize</li>
 * <li>{@link #getSelectionVariant selectionVariant} : object</li>
 * <li>{@link #getQueryName queryName} : string</li>
 * <li>{@link #getSystemAlias systemAlias} : string</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Control for embedding a Design Studio Analytic Grid in an S/4 HANA Fiori application
 * @extends sap.ui.core.Control
 * @version 1.46.0
 *
 * @constructor
 * @public
 * @since 1.46
 * @experimental Since version 1.46. 
 * API is incomplete and may change incompatibly
 * @name sap.zen.dsh.AnalyticGrid
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.zen.dsh.AnalyticGrid", { metadata : {

	library : "sap.zen.dsh",
	properties : {
		"width" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"height" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"selectionVariant" : {type : "object", group : "Data", defaultValue : null},
		"queryName" : {type : "string", group : "Data", defaultValue : null},
		"systemAlias" : {type : "string", group : "Data", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.zen.dsh.AnalyticGrid with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.zen.dsh.AnalyticGrid.extend
 * @function
 */


/**
 * Getter for property <code>width</code>.
 * Desired width of the AnalyticGrid control
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.zen.dsh.AnalyticGrid#getWidth
 * @function
 */

/**
 * Setter for property <code>width</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.zen.dsh.AnalyticGrid} <code>this</code> to allow method chaining
 * @public
 * @name sap.zen.dsh.AnalyticGrid#setWidth
 * @function
 */


/**
 * Getter for property <code>height</code>.
 * Desired width of the AnalyticGrid control
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.zen.dsh.AnalyticGrid#getHeight
 * @function
 */

/**
 * Setter for property <code>height</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.zen.dsh.AnalyticGrid} <code>this</code> to allow method chaining
 * @public
 * @name sap.zen.dsh.AnalyticGrid#setHeight
 * @function
 */


/**
 * Getter for property <code>selectionVariant</code>.
 * A SelectionVariant specifying the selection state used by the AnalyticGrid. At present, supports only initial setting at time of control creation. This behaviour will change in the future.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>selectionVariant</code>
 * @public
 * @name sap.zen.dsh.AnalyticGrid#getSelectionVariant
 * @function
 */

/**
 * Setter for property <code>selectionVariant</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oSelectionVariant  new value for property <code>selectionVariant</code>
 * @return {sap.zen.dsh.AnalyticGrid} <code>this</code> to allow method chaining
 * @public
 * @name sap.zen.dsh.AnalyticGrid#setSelectionVariant
 * @function
 */


/**
 * Getter for property <code>queryName</code>.
 * Name of the Query to bind the AnalyticGrid to.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>queryName</code>
 * @public
 * @name sap.zen.dsh.AnalyticGrid#getQueryName
 * @function
 */

/**
 * Setter for property <code>queryName</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sQueryName  new value for property <code>queryName</code>
 * @return {sap.zen.dsh.AnalyticGrid} <code>this</code> to allow method chaining
 * @public
 * @name sap.zen.dsh.AnalyticGrid#setQueryName
 * @function
 */


/**
 * Getter for property <code>systemAlias</code>.
 * Target System alias for data connectivity
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>systemAlias</code>
 * @public
 * @name sap.zen.dsh.AnalyticGrid#getSystemAlias
 * @function
 */

/**
 * Setter for property <code>systemAlias</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sSystemAlias  new value for property <code>systemAlias</code>
 * @return {sap.zen.dsh.AnalyticGrid} <code>this</code> to allow method chaining
 * @public
 * @name sap.zen.dsh.AnalyticGrid#setSystemAlias
 * @function
 */

// Start of sap\zen\dsh\AnalyticGrid.js
/**
 * This file defines behavior for the control,
 */
var DSH_deployment = true; 
var sapbi_dshControl; 
var sapbi_ajaxHandler = sapbi_ajaxHandler || {};
window.sapbi_page = window.sapbi_page || {};
//sapbi_page.staticMimeUrlPrefix = this.dshBaseUrl;
sapbi_page.getParameter = sapbi_page.getParameter || function(){return "";};
var sapbi_MIMES_PIXEL = sapbi_MIMES_PIXEL || "";
sapbi_page.staticMimeUrlPrefix = sap.ui.resource("sap.zen.dsh","rt/");

if (!window.sap) {
	window.sap = {};
}

if (!sap.zen) {
	sap.zen = {};
}

sap.zen.doReplaceDots = true;

sap.zen.dsh.AnalyticGrid.prototype.init = function() {
	this.initial = true;
	this.parameters = {};
	this.dshBaseUrl = sap.ui.resource("sap.zen.dsh","rt/");
	if (sapbi_dshControl) {
		sapbi_dshControl.logoff();
	}
	sapbi_dshControl = this;
};

sap.zen.dsh.AnalyticGrid.prototype.doInit = function() {
	this.repositoryUrl = sap.ui.resource("sap.zen.dsh", "applications/");

	this.addParameter("XQUERY", this.getQueryName());

	if(this.initial == false){
		return;
	}
    this.initial= false;

    jQuery.sap.require("sap.zen.dsh.rt.all");

    /*
     * load modules required in Debug Mode
     * 	- load jszip synchron
     * 	- load xlsx synchron
     */
    if (jQuery.sap.debug() == "true") {
		jQuery.sap.require("sap.zen.dsh.rt.zen_rt_firefly.js.jszip");
		jQuery.sap.require("sap.zen.dsh.rt.zen_rt_firefly.js.xlsx");
    }
    
    this.initializeSelectionVariant(this.getSelectionVariant());
    var that = this;
	setTimeout(function(){
		that.doIt();
	}, 0);
};

sap.zen.dsh.AnalyticGrid.prototype.doIt = function() {
	this.doInit();
	sap.zen.dsh.scriptLoaded= true; 
	
	var that = this;
	var oConfig = sap.ui.getCore().getConfiguration();

	language = oConfig.getLocale().getSAPLogonLanguage();

	if (!language || language == "") {
		language = window.navigator.userLanguage || window.navigator.language;
	}
	
	var client = "";
	if(document.cookie) {
		var match = /(?:sap-usercontext=)*sap-client=(\d{3})/.exec(document.cookie);
		if (match && match[1])
		{
			client = match[1];
		}
	} 
	
	var urlParams = sap.firefly.XHashMapOfStringByString.create();

	for (var key in this.parameters) {
		urlParams.put(key, this.parameters[key]);
	}

	var designStudio = new sap.zen.DesignStudio();
	designStudio.setHost(document.location.hostname);
	designStudio.setPort(document.location.port);
	designStudio.setProtocol(document.location.protocol.split(":")[0]);
	designStudio.setClient(client);
	designStudio.setLanguage(language);
	if (this.repositoryUrl) {
		designStudio.setRepositoryUrl(this.repositoryUrl);
	}
	designStudio.setApplicationPath(this.repositoryUrl + "0ANALYTIC_GRID");
	designStudio.setApplicationName("0ANALYTIC_GRID");			
	designStudio.setUrlParameter(urlParams);
	designStudio.setSdkLoaderPath("");
	designStudio.setHanaMode(true);
	designStudio.setDshControlId(that.getId());
	designStudio.setStaticMimesRootPath(this.dshBaseUrl);
	designStudio.setSystemAlias(this.getSystemAlias());
	designStudio.setNewBW(true);

	var page = designStudio.createPage();	
	
	window[that.getId()+"Buddha"] = page;
	
	var sapbi_page = sapbi_page || {};
	sapbi_page.staticMimeUrlPrefix = this.dshBaseUrl;
	sapbi_page.getParameter = function(){return "";};
	sapbi_MIMES_PIXEL = "";

	window.sapbi_page = sapbi_page;
	
	var zenCssFileRef = document.createElement('link');
	zenCssFileRef.setAttribute("type", "text/css");
	zenCssFileRef.setAttribute("rel", "stylesheet");
	zenCssFileRef.setAttribute("href", URI(sapbi_page.staticMimeUrlPrefix + "zen_rt_framework/resources/css/zen.css").normalize().toString());
	document.getElementsByTagName("head")[0].appendChild(zenCssFileRef);
};

sap.zen.dsh.AnalyticGrid.prototype.onAfterRendering = function(){
	this.doInit(); 
};

sap.zen.dsh.AnalyticGrid.prototype.logoff = function(){
	if (window[this.getId()+"Buddha"]){
		if (!this.loggedOff) {
			this.loggedOff = true;
			window.buddhaHasSendLock++;
			window[this.getId()+"Buddha"].exec("APPLICATION.logoff();");
		}
	}
}

sap.zen.dsh.AnalyticGrid.prototype.exit = function(){
	this.logoff();

	var oRootAbsLayout = sap.ui.getCore().byId(this.sId + "ROOT_absolutelayout");
	
	if (oRootAbsLayout) {
		oRootAbsLayout.destroy();
	}
	if (sapbi_dshControl && sapbi_dshControl === this) {
		sapbi_dshControl = undefined;
	}
};

sap.zen.dsh.AnalyticGrid.prototype.addParameter = function(name, value) {
	this.parameters[name] = value;
};

sap.zen.dsh.AnalyticGrid.prototype.executeScript = function(script){
	this.page.exec(script);
};

sap.zen.dsh.AnalyticGrid.prototype.initializeSelectionVariant = function(oSelectionVariant) {
//Placeholder for now -- will work only initially.  Later need to have resettability here.
	
	function addValuesToObject(sObject, oValueHolder, sValue) {
		if (!oValueHolder.hasOwnProperty(sObject)) {
			oValueHolder[sObject] = sValue;
		}
	}

	oNavParams = {};
	
	if (oSelectionVariant) {
		var aParameters = oSelectionVariant.Parameters;
		var aSelectOptions = oSelectionVariant.SelectOptions;
		
		//Nav Parameters are NOT mapped <--> semantic objects.
		if (aParameters) {
			for (var parameterNum = 0; parameterNum < aParameters.length; parameterNum++) {
				var oParameter = aParameters[parameterNum];

				oNavParams[oParameter.PropertyName] = oParameter.PropertyValue;
			} 
		}

		if (aSelectOptions) {
			for (var i = 0; i < aSelectOptions.length; ++i) {
				var oSelectOption = aSelectOptions[i];
				var aRanges = oSelectOption.Ranges;
				var aFilters = [];

				for (var j = 0; j < aRanges.length; ++j) {
					var oRange = aRanges[j];
					
					//Only include ranges are supported by setFilter.
					if (oRange.Sign !== "I") {
						continue;
					}
					
					var option = oRange.Option || "EQ";

					
					if (option === "EQ") {
						filterValue = oRange.Low;
					} else {
						filterValue = {};
						if (option === "BT") {
							filterValue.low = oRange.Low;
							filterValue.high = oRange.High;
						} else if (option === "LE") {
							filterValue.low = oRange.Low;
						} else if (option === "GE") {
							filterValue.high = oRange.Low;
						}
					}

					aFilters.push(filterValue);
				}
				if (aFilters.length > 0) {
					addValuesToObject(oSelectOption.PropertyName, oNavParams, aFilters);
				}
			}
		}
	}
	if (!jQuery.isEmptyObject(oNavParams)) {
		this.addParameter("NAV_PARAMS", JSON.stringify(oNavParams));
	}
}

