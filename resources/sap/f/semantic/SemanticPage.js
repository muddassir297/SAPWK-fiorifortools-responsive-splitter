/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/Control","sap/ui/base/ManagedObject","sap/f/library","sap/f/DynamicPage","sap/f/DynamicPageTitle","sap/f/DynamicPageHeader","sap/m/OverflowToolbar","sap/m/ActionSheet","./SemanticTitle","./SemanticFooter","./SemanticShareMenu","./SemanticConfiguration"],function(q,C,M,l,D,a,b,O,A,S,c,d,e){"use strict";var f=C.extend("sap.f.semantic.SemanticPage",{metadata:{library:"sap.f",properties:{headerExpanded:{type:"boolean",group:"Behavior",defaultValue:true},headerPinnable:{type:"boolean",group:"Behavior",defaultValue:true},preserveHeaderStateOnScroll:{type:"boolean",group:"Behavior",defaultValue:false},toggleHeaderOnTitleClick:{type:"boolean",group:"Behavior",defaultValue:true},showFooter:{type:"boolean",group:"Behavior",defaultValue:false}},defaultAggregation:"content",aggregations:{titleHeading:{type:"sap.ui.core.Control",multiple:false,defaultValue:null},titleSnappedContent:{type:"sap.ui.core.Control",multiple:true},titleExpandedContent:{type:"sap.ui.core.Control",multiple:true},titleMainAction:{type:"sap.f.semantic.TitleMainAction",multiple:false},addAction:{type:"sap.f.semantic.AddAction",multiple:false},deleteAction:{type:"sap.f.semantic.DeleteAction",multiple:false},copyAction:{type:"sap.f.semantic.CopyAction",multiple:false},flagAction:{type:"sap.f.semantic.FlagAction",multiple:false},favoriteAction:{type:"sap.f.semantic.FavoriteAction",multiple:false},fullScreenAction:{type:"sap.f.semantic.FullScreenAction",multiple:false},exitFullScreenAction:{type:"sap.f.semantic.ExitFullScreenAction",multiple:false},closeAction:{type:"sap.f.semantic.CloseAction",multiple:false},titleCustomTextActions:{type:"sap.m.Button",multiple:true},titleCustomIconActions:{type:"sap.m.OverflowToolbarButton",multiple:true},headerContent:{type:"sap.ui.core.Control",multiple:true},content:{type:"sap.ui.core.Control",multiple:false},footerMainAction:{type:"sap.f.semantic.FooterMainAction",multiple:false},messagesIndicator:{type:"sap.f.semantic.MessagesIndicator",multiple:false},draftIndicator:{type:"sap.m.DraftIndicator",multiple:false},positiveAction:{type:"sap.f.semantic.PositiveAction",multiple:false},negativeAction:{type:"sap.f.semantic.NegativeAction",multiple:false},footerCustomActions:{type:"sap.m.Button",multiple:true},discussInJamAction:{type:"sap.f.semantic.DiscussInJamAction",multiple:false},shareInJamAction:{type:"sap.f.semantic.ShareInJamAction",multiple:false},sendMessageAction:{type:"sap.f.semantic.SendMessageAction",multiple:false},sendEmailAction:{type:"sap.f.semantic.SendEmailAction",multiple:false},printAction:{type:"sap.f.semantic.PrintAction",multiple:false},customShareActions:{type:"sap.m.Button",multiple:true},_dynamicPage:{type:"sap.f.DynamicPage",multiple:false,visibility:"hidden"}}}});f._EVENTS={SHARE_MENU_BTN_CHANGED:"_shareMenuBtnChanged"};f.prototype.init=function(){this._initDynamicPage();this._attachShareMenuButtonChange();};f.prototype.exit=function(){this._cleanMemory();};f.prototype.setHeaderExpanded=function(h){this._getPage().setHeaderExpanded(h);return this;};f.prototype.getHeaderExpanded=function(){return this._getPage().getHeaderExpanded();};f.prototype.setHeaderPinnable=function(h){var o=this._getPage(),g=o.getHeader();g.setPinnable(h);return this.setProperty("headerPinnable",g.getPinnable(),true);};f.prototype.setPreserveHeaderStateOnScroll=function(p){var o=this._getPage();o.setPreserveHeaderStateOnScroll(p);return this.setProperty("preserveHeaderStateOnScroll",o.getPreserveHeaderStateOnScroll(),true);};f.prototype.setToggleHeaderOnTitleClick=function(t){this._getPage().setToggleHeaderOnTitleClick(t);return this.setProperty("toggleHeaderOnTitleClick",t,true);};f.prototype.setShowFooter=function(s){this._getPage().setShowFooter(s);return this.setProperty("showFooter",s,true);};f.prototype.setAggregation=function(s,o,g){var h=this.mAggregations[s],t,p;if(h===o){return this;}o=this.validateAggregation(s,o,false);t=this.getMetadata().getManagedAggregation(s).type;if(e.isKnownSemanticType(t)){p=e.getPlacement(t);if(h){this._getSemanticContainer(p).removeContent(h,p);}if(o){this._getSemanticContainer(p).addContent(o,p);}return M.prototype.setAggregation.call(this,s,o,true);}return M.prototype.setAggregation.call(this,s,o,g);};f.prototype.destroyAggregation=function(s,g){var o=this.getMetadata().getAggregations()[s],h,p;if(o&&e.isKnownSemanticType(o.type)){h=M.prototype.getAggregation.call(this,s);if(h){p=e.getPlacement(o.type);this._getSemanticContainer(p).removeContent(h,p);}}return M.prototype.destroyAggregation.call(this,s,g);};["getTitleHeading","setTitleHeading","destroyTitleHeading"].forEach(function(m){f.prototype[m]=function(o){var g=this._getTitle(),t=m.replace(/TitleHeading?/,"Heading");return g[t].apply(g,arguments);};},this);["addTitleExpandedContent","insertTitleExpandedContent","removeTitleExpandedContent","indexOfTitleExpandedContent","removeAllTitleExpandedContent","destroyTitleExpandedContent","getTitleExpandedContent"].forEach(function(m){f.prototype[m]=function(o){var g=this._getTitle(),t=m.replace(/TitleExpandedContent?/,"ExpandedContent");return g[t].apply(g,arguments);};});["addTitleSnappedContent","insertTitleSnappedContent","removeTitleSnappedContent","indexOfTitleSnappedContent","removeAllTitleSnappedContent","destroyTitleSnappedContent","getTitleSnappedContent"].forEach(function(m){f.prototype[m]=function(o){var g=this._getTitle(),t=m.replace(/TitleSnappedContent?/,"SnappedContent");return g[t].apply(g,arguments);};});["addHeaderContent","insertHeaderContent","removeHeaderContent","indexOfHeaderContent","removeAllHeaderContent","destroyHeaderContent","getHeaderContent"].forEach(function(m){f.prototype[m]=function(o){var g=this._getHeader(),h=m.replace(/HeaderContent?/,"Content");return g[h].apply(g,arguments);};});["getContent","setContent","destroyContent"].forEach(function(m){f.prototype[m]=function(o){var g=this._getPage();return g[m].apply(g,arguments);};},this);["addTitleCustomTextAction","insertTitleCustomTextAction","indexOfTitleCustomTextAction","removeTitleCustomTextAction","removeAllTitleCustomTextActions","destroyTitleCustomTextActions","getTitleCustomTextActions"].forEach(function(m){f.prototype[m]=function(){var s=this._getSemanticTitle(),g=m.replace(/TitleCustomTextAction?/,"CustomTextAction");return s[g].apply(s,arguments);};},this);["addTitleCustomIconAction","insertTitleCustomIconAction","indexOfTitleCustomIconAction","removeTitleCustomIconAction","removeAllTitleCustomIconActions","destroyTitleCustomIconActions","getTitleCustomIconActions"].forEach(function(m){f.prototype[m]=function(){var s=this._getSemanticTitle(),g=m.replace(/TitleCustomIconAction?/,"CustomIconAction");return s[g].apply(s,arguments);};},this);["addFooterCustomAction","insertFooterCustomAction","indexOfFooterCustomAction","removeFooterCustomAction","removeAllFooterCustomActions","destroyFooterCustomActions","getFooterCustomActions"].forEach(function(m){f.prototype[m]=function(){var s=this._getSemanticFooter(),g=m.replace(/FooterCustomAction?/,"CustomAction");return s[g].apply(s,arguments);};},this);["addCustomShareAction","insertCustomShareAction","indexOfCustomShareAction","removeCustomShareAction","removeAllCustomShareActions","destroyCustomShareActions","getCustomShareActions"].forEach(function(m){f.prototype[m]=function(){var s=this._getShareMenu(),g=m.replace(/CustomShareAction?/,"CustomAction");return s[g].apply(s,arguments);};},this);f.prototype._attachShareMenuButtonChange=function(){this.attachEvent(f._EVENTS.SHARE_MENU_BTN_CHANGED,this._onShareMenuBtnChanged,this);};f.prototype._onShareMenuBtnChanged=function(E){var n=E.getParameter("oNewButton"),o=E.getParameter("oOldButton");this._getSemanticTitle().removeContent(o,"shareIcon");this._getSemanticTitle().addContent(n,"shareIcon");};f.prototype._getPage=function(){if(!this.getAggregation("_dynamicPage")){this._initDynamicPage();}return this.getAggregation("_dynamicPage");};f.prototype._initDynamicPage=function(){this.setAggregation("_dynamicPage",new D(this.getId()+"-page",{title:this._getTitle(),header:this._getHeader(),footer:this._getFooter()}),true);};f.prototype._getTitle=function(){if(!this._oDynamicPageTitle){this._oDynamicPageTitle=this._getSemanticTitle()._getContainer();}return this._oDynamicPageTitle;};f.prototype._getHeader=function(){if(!this._oDynamicPageHeader){this._oDynamicPageHeader=new b(this.getId()+"-pageHeader");}return this._oDynamicPageHeader;};f.prototype._getFooter=function(){if(!this._oDynamicPageFooter){this._oDynamicPageFooter=this._getSemanticFooter()._getContainer();}return this._oDynamicPageFooter;};f.prototype._getSemanticTitle=function(){if(!this._oSemanticTitle){this._oSemanticTitle=new S(new a(this.getId()+"-pageTitle"),this);}return this._oSemanticTitle;};f.prototype._getShareMenu=function(){if(!this._oShareMenu){this._oShareMenu=new d(this._getActionSheet(),this);}return this._oShareMenu;};f.prototype._getActionSheet=function(){if(!this._oActionSheet){this._oActionSheet=new A(this.getId()+"-shareMenu");}return this._oActionSheet;};f.prototype._getSemanticFooter=function(){if(!this._oSemanticFooter){this._oSemanticFooter=new c(this._getOverflowToolbar(),this);}return this._oSemanticFooter;};f.prototype._getOverflowToolbar=function(){if(!this._oOverflowToolbar){this._oOverflowToolbar=new O(this.getId()+"-pageFooter");}return this._oOverflowToolbar;};f.prototype._getSemanticContainer=function(p){var P=e._Placement;if(p===P.titleText||p===P.titleIcon){return this._getSemanticTitle();}else if(p===P.footerLeft||p===P.footerRight){return this._getSemanticFooter();}else if(p===P.shareMenu){return this._getShareMenu();}return null;};f.prototype._cleanMemory=function(){if(this._oDynamicPageTitle){this._oDynamicPageTitle.destroy();this._oDynamicPageTitle=null;}if(this._oDynamicPageHeader){this._oDynamicPageHeader.destroy();this._oDynamicPageHeader=null;}if(this._oDynamicPageFooter){this._oDynamicPageFooter.destroy();this._oDynamicPageFooter=null;}if(this._oOverflowToolbar){this._oOverflowToolbar.destroy();this._oOverflowToolbar=null;}if(this._oActionSheet){this._oActionSheet.destroy();this._oActionSheet=null;}if(this._oShareMenu){this._oShareMenu.destroy();this._oShareMenu=null;}if(this._oSemanticTitle){this._oSemanticTitle.destroy();this._oSemanticTitle=null;}if(this._oSemanticFooter){this._oSemanticFooter.destroy();this._oSemanticFooter=null;}};return f;},true);