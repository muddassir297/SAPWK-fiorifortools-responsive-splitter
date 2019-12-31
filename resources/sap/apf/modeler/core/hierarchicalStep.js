/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.modeler.core.hierarchicalStep");jQuery.sap.require("sap.apf.modeler.core.step");(function(){'use strict';sap.apf.modeler.core.HierarchicalStep=function(s,i,d){sap.apf.modeler.core.Step.call(this,s,i,d);var h;var c=this.createRepresentation;if(d){h=d.hierarchyProperty;}this.getType=function(){return"hierarchicalStep";};this.getHierarchyProperty=function(){return h;};this.setHierarchyProperty=function(p){h=p;this.getRepresentationContainer().getElements().forEach(function(r){r.setHierarchyProperty(h);});};this.createRepresentation=function(e){var r=c(e);if(h){r.setHierarchyProperty(h);}return r;};this.copy=function(n){var d=sap.apf.modeler.core.ConfigurationObjects.deepDataCopy(this.getDataForCopy());d.hierarchyProperty=h;d.representationContainer=this.getRepresentationContainer().copy((n||this.getId())+"-Representation");return new sap.apf.modeler.core.HierarchicalStep((n||this.getId()),i,d);};};}());
