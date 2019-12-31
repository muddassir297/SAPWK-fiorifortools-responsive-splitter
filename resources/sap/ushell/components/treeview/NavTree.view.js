// @copyright@
sap.ui.define(function(){"use strict";sap.ui.jsview("sap.ushell.components.treeview.NavTree",{createContent:function(c){jQuery.sap.require('sap.m.List');jQuery.sap.require('sap.m.CustomListItem');var l=new sap.m.CustomListItem({content:new sap.m.Link({text:"{title}",href:"{target}"}).addStyleClass('sapUshellNavTreeLink')}).addEventDelegate({onclick:c.onNavTreeTitleChange.bind(c)}).addStyleClass('sapUshellNavTreeListItem sapUshellNavTreeChild sapUshellNavTreeChildHide sapUshellNavTree_visual_transition');var L=new sap.m.List({items:{path:'/items',groupHeaderFactory:jQuery.proxy(c.getGroupHeader,c),sorter:new sap.ui.model.Sorter("groupIndex",false,true),template:l}});var o=L.onAfterRendering;L.onAfterRendering=function(){o.apply(this,arguments);if(this.getItems().length>0){var f=this.getItems()[0];if(f.getMetadata().getName()==="sap.m.GroupHeaderListItem"&&f.getTitle&&!f.getTitle()){f.destroy();}var O=jQuery('.sapUshellNavTreeParent');O.each(function(){var q=jQuery(this);var i=sap.ui.getCore().byId(q.attr('id'));var I=i.getContent().length&&i.getContent()[0]&&i.getContent()[0].getSrc()||'';if(I==='slim-arrow-down'){q.nextUntil('.sapUshellNavTreeSingle, .sapUshellNavTreeParent').removeClass("sapUshellNavTreeChildHide");}});}};return L;},getControllerName:function(){return"sap.ushell.components.treeview.NavTree";}});},true);
