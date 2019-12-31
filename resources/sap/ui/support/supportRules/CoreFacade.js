/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 *
 * An interface to the core to be used by rules
 */
sap.ui.define([],function(){"use strict";var c=null;function C(o){c=o;return{getMetadata:function(){return c.getMetadata();},getUIAreas:function(){return c.mUIAreas;},getComponents:function(){return c.mObjects.component;},getModels:function(){return c.oModels;}};}return C;},false);
