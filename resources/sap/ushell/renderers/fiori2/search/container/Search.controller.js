// @copyright@
(function(){"use strict";jQuery.sap.require("sap.ushell.renderers.fiori2.search.SearchModel");sap.ui.controller("sap.ushell.renderers.fiori2.search.container.Search",{onInit:function(){var t=this;sap.ui.getCore().getEventBus().subscribe("allSearchStarted",t.getView().onAllSearchStarted,t.getView());sap.ui.getCore().getEventBus().subscribe("allSearchFinished",t.getView().onAllSearchFinished,t.getView());},onExit:function(){var t=this;sap.ui.getCore().getEventBus().unsubscribe("allSearchStarted",t.getView().onAllSearchStarted,t.getView());sap.ui.getCore().getEventBus().unsubscribe("allSearchFinished",t.getView().onAllSearchFinished,t.getView());}});}());
