/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/routing/Route'],function(C){"use strict";var R=C.extend("sap.f.routing.Route",{_beforeRouteMatched:function(a){var r=this._oRouter,c,e,v,t;c=jQuery.extend({},r._oConfig,this._oConfig);if(typeof c.layout!=="undefined"){v=sap.ui.getCore().byId(c.targetParent);t=v.byId(c.controlId);t.setLayout(c.layout);}e={name:c.name,arguments:a,config:c};this._oRouter.fireBeforeRouteMatched(e);}});return R;});
