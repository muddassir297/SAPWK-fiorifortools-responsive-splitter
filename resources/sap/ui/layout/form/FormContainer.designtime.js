/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";return{aggregations:{formElements:{domRef:function(e){var d=e.getDomRef();if(!d&&e.getFormElements().length===0){var g=e.getTitle()||e.getToolbar();if(g){return g.getDomRef();}}else{return d;}}}}};},false);
