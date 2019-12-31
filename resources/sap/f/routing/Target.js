/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/routing/Target','./async/Target'],function(T,a){"use strict";var M=T.extend("sap.f.routing.Target",{constructor:function(o,v,p,t){this._oTargetHandler=t;T.prototype.constructor.apply(this,arguments);var b=a;this._super={};for(var f in b){this._super[f]=this[f];this[f]=b[f];}}});return M;},true);
