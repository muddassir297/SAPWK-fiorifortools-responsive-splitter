/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */
jQuery.sap.declare("sap.suite.ui.commons.HeaderCell");jQuery.sap.require("sap.suite.ui.commons.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.suite.ui.commons.HeaderCell",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{"heigth":{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:'100px',deprecated:true},"height":{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:'106px'}},aggregations:{"west":{type:"sap.suite.ui.commons.HeaderCellItem",multiple:false},"north":{type:"sap.suite.ui.commons.HeaderCellItem",multiple:false},"east":{type:"sap.suite.ui.commons.HeaderCellItem",multiple:false},"south":{type:"sap.suite.ui.commons.HeaderCellItem",multiple:false}}}});
