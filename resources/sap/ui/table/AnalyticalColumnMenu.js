/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./ColumnMenu','./library'],function(q,C,l){"use strict";var G=l.GroupEventType;var A=C.extend("sap.ui.table.AnalyticalColumnMenu",{metadata:{library:"sap.ui.table"},renderer:"sap.ui.table.ColumnMenuRenderer"});A.prototype._addMenuItems=function(){C.prototype._addMenuItems.apply(this);if(this._oColumn){this._addSumMenuItem();}};A.prototype._addGroupMenuItem=function(){var c=this._oColumn,t=this._oTable;if(c.isGroupableByMenu()){this._oGroupIcon=this._createMenuItem("group","TBL_GROUP",c.getGrouped()?"accept":null,q.proxy(function(e){var m=e.getSource(),g=c.getGrouped();c.setGrouped(!g);t.fireGroup({column:c,groupedColumns:t._aGroupedColumns,type:G.group});m.setIcon(!g?"sap-icon://accept":null);t._getRowContexts();},this));this.addItem(this._oGroupIcon);}};A.prototype._addSumMenuItem=function(){var c=this._oColumn,t=this._oTable,b=t.getBinding("rows"),r=b&&b.getAnalyticalQueryResult();if(t&&r&&r.findMeasureByPropertyName(c.getLeadingProperty())){this._oSumItem=this._createMenuItem("total","TBL_TOTAL",c.getSummed()?"accept":null,q.proxy(function(e){var m=e.getSource(),s=c.getSummed();c.setSummed(!s);m.setIcon(!s?"sap-icon://accept":null);t._getRowContexts();},this));this.addItem(this._oSumItem);}};A.prototype.open=function(){C.prototype.open.apply(this,arguments);var c=this._oColumn;this._oSumItem&&this._oSumItem.setIcon(c.getSummed()?"sap-icon://accept":null);this._oGroupIcon&&this._oGroupIcon.setIcon(c.getGrouped()?"sap-icon://accept":null);};return A;});
