/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control','sap/m/Popover','sap/ui/core/delegate/ItemNavigation'],function(q,l,C,P,I){"use strict";var N=C.extend("sap.tnt.NavigationList",{metadata:{library:"sap.tnt",properties:{width:{type:"sap.ui.core.CSSSize",group:"Dimension"},expanded:{type:"boolean",group:"Misc",defaultValue:true}},defaultAggregation:"items",aggregations:{items:{type:"sap.tnt.NavigationListItem",multiple:true,singularName:"item"}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{itemSelect:{parameters:{item:{type:"sap.ui.core.Item"}}}}}});N.prototype.init=function(){this._itemNavigation=new I();this._itemNavigation.setCycling(false);this.addEventDelegate(this._itemNavigation);this._itemNavigation.setPageSize(10);this._resourceBundle=sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");};N.prototype.setHasListBoxRole=function(h){this._hasListBoxRole=h;};N.prototype.getHasListBoxRole=function(){return this._hasListBoxRole;};N.prototype.onAfterRendering=function(){this._itemNavigation.setRootDomRef(this.getDomRef());this._itemNavigation.setItemDomRefs(this._getDomRefs());if(this._selectedItem){this._selectedItem._select();}};N.prototype._updateNavItems=function(){this._itemNavigation.setItemDomRefs(this._getDomRefs());};N.prototype._getDomRefs=function(){var d=[];var a=this.getItems();for(var i=0;i<a.length;i++){q.merge(d,a[i]._getDomRefs());}return d;};N.prototype._adaptPopoverPositionParams=function(){if(this.getShowArrow()){this._marginLeft=10;this._marginRight=10;this._marginBottom=10;this._arrowOffset=18;this._offsets=["0 -18","18 0","0 18","-18 0"];this._myPositions=["center bottom","begin top","center top","end top"];this._atPositions=["center top","end top","center bottom","begin top"];}else{this._marginTop=0;this._marginLeft=0;this._marginRight=0;this._marginBottom=0;this._arrowOffset=0;this._offsets=["0 0","0 0","0 0","0 0"];this._myPositions=["begin bottom","begin top","begin top","end top"];this._atPositions=["begin top","end top","begin bottom","begin top"];}};N.prototype.exit=function(){if(this._itemNavigation){this._itemNavigation.destroy();}};N.prototype._selectItem=function(p){this.fireItemSelect(p);var i=p.item;if(this._selectedItem){this._selectedItem._unselect();}i._select();this._selectedItem=i;};N.prototype.getSelectedItem=function(){return this._selectedItem;};N.prototype.setSelectedItem=function(i){if(this._selectedItem){this._selectedItem._unselect();}if(i){i._select();}this._selectedItem=i;};N.prototype._openPopover=function(s,a){var t=this;var b=a.getSelectedItem();if(b&&a.isGroupSelected){b=null;}var p=this._popover=new P({showHeader:false,horizontalScrolling:false,verticalScrolling:true,initialFocus:b,afterClose:function(){t._popover=null;},content:a}).addStyleClass('sapContrast sapContrastPlus');p._adaptPositionParams=this._adaptPopoverPositionParams;p.openBy(s);};N.prototype._closePopover=function(){if(this._popover){this._popover.close();}};return N;},true);
