// @copyright@
sap.ui.define(function(){"use strict";var l="sap.ushell",e,E={rendererLoaded:{oldNamespace:"sap.ushell.renderers.fiori2.Renderer",newEventName:"rendererLoaded"},componentCreated:{oldNamespace:"sap.ushell.components.container.ApplicationContainer",newEventName:"appComponentLoaded"},appOpened:{oldNamespace:"launchpad",newEventName:"appOpened"},appClosed:{oldNamespace:"launchpad",newEventName:"appClosed"},coreExtLoaded:{oldNamespace:"launchpad",newEventName:"coreResourcesFullyLoaded"}};function _(n,e,d){setTimeout(function(){sap.ui.getCore().getEventBus().publish(l,e,d);},0);}function a(n,s,d){var m=E[s];if(m!==undefined){_(l,m.newEventName,d);}}for(e in E){sap.ui.getCore().getEventBus().subscribe(E[e].oldNamespace,e,a);}},false);