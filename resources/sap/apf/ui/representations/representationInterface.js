/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare('sap.apf.ui.representations.representationInterface');(function(){'use strict';sap.apf.ui.representations.RepresentationInterfaceProxy=function(c,u){this.type='RepresentationInterfaceProxy';this.putMessage=function(m){return c.putMessage(m);};this.createMessageObject=function(C){return c.createMessageObject(C);};this.getActiveStep=function(){return c.getActiveStep();};this.setActiveStep=function(s){return c.setActiveStep(s);};this.getTextNotHtmlEncoded=function(l,p){return c.getTextNotHtmlEncoded(l,p);};this.getExits=function(){return u.getCustomFormatExit();};this.updatePath=function(s){return c.updatePath(s);};this.createFilter=function(){return c.createFilter();};this.selectionChanged=function(r){return u.selectionChanged(r);};this.getEventCallback=function(e){return u.getEventCallback(e);};};sap.apf.ui.representations.representationInterface=function(d,c){this.setData=function(m,D){};this.updateTreetable=function(a,m,b,e){};this.getSelectionAsArray=function(){return[0,2];};this.adoptSelection=function(s){};this.getFilterMethodType=function(){return sap.apf.constants.filterMethodTypes.selectionAsArray;};this.getRequestOptions=function(){return{};};this.getParameter=function(){var p={dimensions:[],measures:[]};return p;};this.getMainContent=function(){var u={};return u;};this.getThumbnailContent=function(){var u={};return u;};this.getPrintContent=function(){var u={};return u;};this.getTooltipContent=function(){var u={};return u;};this.removeAllSelection=function(){};this.serialize=function(){var s={};return s;};this.deserialize=function(s){};this.getAlternateRepresentation=function(){return this.oAlternateRepresentation;};this.getMetaData=function(){return this.metadata;};this.getData=function(){return this.aDataResponse;};};}());
