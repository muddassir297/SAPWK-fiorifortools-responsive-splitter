/*!
 * 
 * 		SAP UI development toolkit for HTML5 (SAPUI5)
 * 		(c) Copyright 2009-2015 SAP SE. All rights reserved
 * 	
 */
jQuery.sap.declare("sap.suite.ui.commons.ChartContainer");jQuery.sap.require("sap.suite.ui.commons.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.suite.ui.commons.ChartContainer",{metadata:{publicMethods:["switchChart","updateChartContainer","getSelectedContent"],library:"sap.suite.ui.commons",properties:{"showPersonalization":{type:"boolean",group:"Misc",defaultValue:false},"showFullScreen":{type:"boolean",group:"Misc",defaultValue:false},"fullScreen":{type:"boolean",group:"Misc",defaultValue:false},"showLegend":{type:"boolean",group:"Misc",defaultValue:true},"title":{type:"string",group:"Misc",defaultValue:''},"selectorGroupLabel":{type:"string",group:"Misc",defaultValue:null,deprecated:true},"autoAdjustHeight":{type:"boolean",group:"Misc",defaultValue:false},"showZoom":{type:"boolean",group:"Misc",defaultValue:true},"showLegendButton":{type:"boolean",group:"Misc",defaultValue:true}},defaultAggregation:"content",aggregations:{"dimensionSelectors":{type:"sap.ui.core.Control",multiple:true,singularName:"dimensionSelector"},"content":{type:"sap.suite.ui.commons.ChartContainerContent",multiple:true,singularName:"content"},"toolbar":{type:"sap.m.OverflowToolbar",multiple:false},"customIcons":{type:"sap.ui.core.Icon",multiple:true,singularName:"customIcon"}},events:{"personalizationPress":{},"contentChange":{parameters:{"selectedItemId":{type:"string"}}},"customZoomInPress":{},"customZoomOutPress":{}}}});sap.suite.ui.commons.ChartContainer.M_EVENTS={'personalizationPress':'personalizationPress','contentChange':'contentChange','customZoomInPress':'customZoomInPress','customZoomOutPress':'customZoomOutPress'};jQuery.sap.require("sap.m.Button");jQuery.sap.require("sap.m.ButtonType");jQuery.sap.require("sap.m.Title");jQuery.sap.require("sap.m.OverflowToolbarButton");jQuery.sap.require("sap.m.Select");jQuery.sap.require("sap.m.SegmentedButton");jQuery.sap.require("sap.m.ToolbarSpacer");jQuery.sap.require("sap.ui.core.CustomData");jQuery.sap.require("sap.ui.core.delegate.ScrollEnablement");jQuery.sap.require("sap.ui.core.Popup");jQuery.sap.require("sap.ui.core.ResizeHandler");jQuery.sap.require("sap.ui.Device");sap.ui.getCore().loadLibrary("sap.viz");
sap.suite.ui.commons.ChartContainer.prototype.init=function(){this._aUsedContentIcons=[];this._aCustomIcons=[];this._oToolBar=null;this._aToolbarContent;this._aDimensionSelectors=[];this._bChartContentHasChanged=false;this._bControlNotRendered=true;this._bSegmentedButtonSaveSelectState=false;this._mOriginalVizFrameHeights={};this._oActiveChartButton=null;this._oSelectedContent=null;this._sResizeListenerId=null;this._bHasApplicationToolbar=false;this._iPlaceholderPosition=0;this._oResBundle=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");this._oFullScreenButton=new sap.m.ToggleButton({icon:"sap-icon://full-screen",type:sap.m.ButtonType.Transparent,tooltip:this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN"),press:this._onFullScreenButtonPress.bind(this)});this._oPopup=new sap.ui.core.Popup({modal:true,shadow:false,autoClose:false});this._oShowLegendButton=new sap.m.OverflowToolbarButton({icon:"sap-icon://legend",type:sap.m.ButtonType.Transparent,text:this._oResBundle.getText("CHARTCONTAINER_LEGEND"),tooltip:this._oResBundle.getText("CHARTCONTAINER_LEGEND"),press:this._onShowLegendButtonPress.bind(this)});this._oPersonalizationButton=new sap.m.OverflowToolbarButton({icon:"sap-icon://action-settings",type:sap.m.ButtonType.Transparent,text:this._oResBundle.getText("CHARTCONTAINER_PERSONALIZE"),tooltip:this._oResBundle.getText("CHARTCONTAINER_PERSONALIZE"),press:this._onPersonalizationButtonPress.bind(this)});this._oZoomInButton=new sap.m.OverflowToolbarButton({icon:"sap-icon://zoom-in",type:sap.m.ButtonType.Transparent,text:this._oResBundle.getText("CHARTCONTAINER_ZOOMIN"),tooltip:this._oResBundle.getText("CHARTCONTAINER_ZOOMIN"),press:this._zoom.bind(this,true)});this._oZoomOutButton=new sap.m.OverflowToolbarButton({icon:"sap-icon://zoom-out",type:sap.m.ButtonType.Transparent,text:this._oResBundle.getText("CHARTCONTAINER_ZOOMOUT"),tooltip:this._oResBundle.getText("CHARTCONTAINER_ZOOMOUT"),press:this._zoom.bind(this,false)});this._oChartSegmentedButton=new sap.m.SegmentedButton({select:this._onChartSegmentButtonSelect.bind(this)});this._oChartTitle=new sap.m.Title();};
sap.suite.ui.commons.ChartContainer.prototype.onAfterRendering=function(){this._sResizeListenerId=sap.ui.core.ResizeHandler.register(this,this._performHeightChanges.bind(this));if(!sap.ui.Device.system.desktop){sap.ui.Device.resize.attachHandler(this._performHeightChanges,this);}if(this.getAutoAdjustHeight()||this.getFullScreen()){jQuery.sap.delayedCall(500,this,this._performHeightChanges.bind(this));}var s=this.getSelectedContent();var v=s&&s.getContent()instanceof sap.viz.ui5.controls.VizFrame;this._oScrollEnablement=new sap.ui.core.delegate.ScrollEnablement(this,this.getId()+"-wrapper",{horizontal:!v,vertical:!v});this._bControlNotRendered=false;};
sap.suite.ui.commons.ChartContainer.prototype.onBeforeRendering=function(){if(this._sResizeListenerId){sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);this._sResizeListenerId=null;}if(!sap.ui.Device.system.desktop){sap.ui.Device.resize.detachHandler(this._performHeightChanges,this);}if(this._bChartContentHasChanged||this._bControlNotRendered){this._chartChange();}var c=this._aCustomIcons;this._aCustomIcons=[];var C=this.getAggregation("customIcons");if(C&&C.length>0){for(var i=0;i<C.length;i++){this._addButtonToCustomIcons(C[i]);}}if(this._bControlNotRendered){if(!this.getToolbar()){this.setAggregation("toolbar",new sap.m.OverflowToolbar({design:"Transparent"}));}}this._adjustDisplay();this._destroyButtons(c);};
sap.suite.ui.commons.ChartContainer.prototype.exit=function(){if(this._oFullScreenButton){this._oFullScreenButton.destroy();this._oFullScreenButton=undefined;}if(this._oPopup){this._oPopup.destroy();this._oPopup=undefined;}if(this._oShowLegendButton){this._oShowLegendButton.destroy();this._oShowLegendButton=undefined;}if(this._oPersonalizationButton){this._oPersonalizationButton.destroy();this._oPersonalizationButton=undefined;}if(this._oActiveChartButton){this._oActiveChartButton.destroy();this._oActiveChartButton=undefined;}if(this._oChartSegmentedButton){this._oChartSegmentedButton.destroy();this._oChartSegmentedButton=undefined;}if(this._oSelectedContent){this._oSelectedContent.destroy();this._oSelectedContent=undefined;}if(this._oToolBar){this._oToolBar.destroy();this._oToolBar=undefined;}if(this._aDimensionSelectors){for(var i=0;i<this._aDimensionSelectors.length;i++){if(this._aDimensionSelectors[i]){this._aDimensionSelectors[i].destroy();}}this._aDimensionSelectors=undefined;}if(this._oScrollEnablement){this._oScrollEnablement.destroy();this._oScrollEnablement=undefined;}if(this._sResizeListenerId){sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);this._sResizeListenerId=null;}if(!sap.ui.Device.system.desktop){sap.ui.Device.resize.detachHandler(this._performHeightChanges,this);}if(this._oZoomInButton){this._oZoomInButton.destroy();this._oZoomInButton=undefined;}if(this._oZoomOutButton){this._oZoomOutButton.destroy();this._oZoomOutButton=undefined;}};
sap.suite.ui.commons.ChartContainer.prototype._onButtonIconPress=function(e){var c=e.getSource().getCustomData()[0].getValue();this._switchChart(c);};
sap.suite.ui.commons.ChartContainer.prototype._onFullScreenButtonPress=function(e){if(e.getParameter("pressed")===true){this._oFullScreenButton.setTooltip(this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN_CLOSE"));this._oFullScreenButton.setIcon("sap-icon://exit-full-screen");}else{this._oFullScreenButton.setTooltip(this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN"));this._oFullScreenButton.setIcon("sap-icon://full-screen");}this._bSegmentedButtonSaveSelectState=true;this._toggleFullScreen();this._oFullScreenButton.focus();};
sap.suite.ui.commons.ChartContainer.prototype._onShowLegendButtonPress=function(e){this._bSegmentedButtonSaveSelectState=true;this._onLegendButtonPress();};
sap.suite.ui.commons.ChartContainer.prototype._onChartSegmentButtonSelect=function(e){var c=e.getParameter("button").getCustomData()[0].getValue();this._bSegmentedButtonSaveSelectState=true;this._switchChart(c);};
sap.suite.ui.commons.ChartContainer.prototype._onOverflowToolbarButtonPress=function(e,d){d.icon.firePress({controlReference:e.getSource()});};
sap.suite.ui.commons.ChartContainer.prototype._onLegendButtonPress=function(){var s=this.getSelectedContent();if(s){var a=s.getContent();if(jQuery.isFunction(a.getLegendVisible)){var l=a.getLegendVisible();a.setLegendVisible(!l);this.setShowLegend(!l);}else{this.setShowLegend(!this.getShowLegend());}}else{this.setShowLegend(!this.getShowLegend());}};
sap.suite.ui.commons.ChartContainer.prototype._onPersonalizationButtonPress=function(){this.firePersonalizationPress();};
sap.suite.ui.commons.ChartContainer.prototype._setSelectedContent=function(s){if(this.getSelectedContent()===s){return this;}if(s===null){this._oShowLegendButton.setVisible(false);return this;}var c=s.getContent();this._toggleShowLegendButtons(c);var S=(c instanceof sap.viz.ui5.controls.VizFrame)||(jQuery.isFunction(c.setLegendVisible));if(this.getShowLegendButton()){this._oShowLegendButton.setVisible(S);}var b=(this.getShowZoom())&&(sap.ui.Device.system.desktop)&&(c instanceof sap.viz.ui5.controls.VizFrame);this._oZoomInButton.setVisible(b);this._oZoomOutButton.setVisible(b);this._oSelectedContent=s;return this;};
sap.suite.ui.commons.ChartContainer.prototype._toggleShowLegendButtons=function(c){var C=c.getId();var r=null;for(var i=0;!r&&i<this._aUsedContentIcons.length;i++){if(this._aUsedContentIcons[i].getCustomData()[0].getValue()===C&&c.getVisible()===true){r=this._aUsedContentIcons[i];this._oChartSegmentedButton.setSelectedButton(r);break;}}};
sap.suite.ui.commons.ChartContainer.prototype._setDefaultOnSegmentedButton=function(){if(!this._bSegmentedButtonSaveSelectState){this._oChartSegmentedButton.setSelectedButton(null);}this._bSegmentedButtonSaveSelectState=false;};
sap.suite.ui.commons.ChartContainer.prototype._toggleFullScreen=function(){var f=this.getProperty("fullScreen");if(f){var c=this.getAggregation("content");this._closeFullScreen();this.setProperty("fullScreen",false,true);var C;var h;for(var i=0;i<c.length;i++){C=c[i].getContent();C.setWidth("100%");h=this._mOriginalVizFrameHeights[C.getId()];if(h){C.setHeight(h);}}this.invalidate();}else{this._openFullScreen();this.setProperty("fullScreen",true,true);}};
sap.suite.ui.commons.ChartContainer.prototype._openFullScreen=function(){var e=sap.ui.core.Popup.Dock;this.$content=this.$();if(this.$content){this.$tempNode=jQuery("<div></div>");this.$content.before(this.$tempNode);this._$overlay=jQuery("<div id='"+jQuery.sap.uid()+"'></div>");this._$overlay.addClass("sapSuiteUiCommonsChartContainerOverlay");this._$overlay.append(this.$content);this._oPopup.setContent(this._$overlay);}else{jQuery.sap.log.warn("Overlay: content does not exist or contains more than one child");}this._oPopup.open(200,e.BeginTop,e.BeginTop,jQuery("body"));if(!sap.ui.Device.system.desktop){jQuery.sap.delayedCall(500,this,this._performHeightChanges.bind(this));}};
sap.suite.ui.commons.ChartContainer.prototype._closeFullScreen=function(){if(this._oScrollEnablement!==null){this._oScrollEnablement.destroy();this._oScrollEnablement=null;}this.$tempNode.replaceWith(this.$content);this._oToolBar.setDesign(sap.m.ToolbarDesign.Auto);this._oPopup.close();this._$overlay.remove();};
sap.suite.ui.commons.ChartContainer.prototype._performHeightChanges=function(){var t,v;if(this.getAutoAdjustHeight()||this.getFullScreen()){var $=this.$(),s,i;t=$.find(".sapSuiteUiCommonsChartContainerToolBarArea :first");v=$.find(".sapSuiteUiCommonsChartContainerChartArea :first");s=this.getSelectedContent();if(t[0]&&v[0]&&s){var c=$.height();var T=t.height();var a=Math.round(parseFloat(t.css("borderBottomWidth")));var n=c-T-a;var e=v.height();i=s.getContent();if((i instanceof sap.viz.ui5.controls.VizFrame)||(sap.chart&&sap.chart.Chart&&i instanceof sap.chart.Chart)){if(n>0&&n!==e){this._rememberOriginalHeight(i);i.setHeight(n+"px");}}else if(i.getDomRef().offsetWidth!==this.getDomRef().clientWidth){this.rerender();}}}};
sap.suite.ui.commons.ChartContainer.prototype._rememberOriginalHeight=function(c){var h;if(jQuery.isFunction(c.getHeight)){h=c.getHeight();}else{h=0;}this._mOriginalVizFrameHeights[c.getId()]=h;};
sap.suite.ui.commons.ChartContainer.prototype._switchChart=function(c){var C=this._findChartById(c);this._setSelectedContent(C);this.fireContentChange({selectedItemId:c});this.rerender();};
sap.suite.ui.commons.ChartContainer.prototype._chartChange=function(){var c=this.getContent();this._destroyButtons(this._aUsedContentIcons);this._aUsedContentIcons=[];if(this.getContent().length===0){this._oChartSegmentedButton.removeAllButtons();this._setDefaultOnSegmentedButton();this.switchChart(null);}if(c){var s=this.getShowLegend();var I;var b;for(var i=0;i<c.length;i++){if(!c[i].getVisible()){continue;}I=c[i].getContent();if(jQuery.isFunction(I.setVizProperties)){I.setVizProperties({legend:{visible:s},sizeLegend:{visible:s}});}if(jQuery.isFunction(I.setWidth)){I.setWidth("100%");}if(jQuery.isFunction(I.setHeight)&&this._mOriginalVizFrameHeights[I.getId()]){I.setHeight(this._mOriginalVizFrameHeights[I.getId()]);}b=new sap.m.Button({icon:c[i].getIcon(),type:sap.m.ButtonType.Transparent,width:"3rem",tooltip:c[i].getTitle(),customData:[new sap.ui.core.CustomData({key:'chartId',value:I.getId()})],press:this._onButtonIconPress.bind(this)});this._aUsedContentIcons.push(b);if(i===0){this._setSelectedContent(c[i]);this._oActiveChartButton=b;}}}this._bChartContentHasChanged=false;};
sap.suite.ui.commons.ChartContainer.prototype._findChartById=function(a){var o=this.getAggregation("content");if(o){for(var i=0;i<o.length;i++){if(o[i].getContent().getId()===a){return o[i];}}}return null;};
sap.suite.ui.commons.ChartContainer.prototype._getToolbarPlaceHolderPosition=function(t){for(var i=0;i<t.getContent().length;i++){if(t.getContent()[i]instanceof sap.suite.ui.commons.ChartContainerToolbarPlaceholder){return i;}}return-1;};
sap.suite.ui.commons.ChartContainer.prototype._addContentToolbar=function(c,p){if(!this._bHasApplicationToolbar){if(!p){this._oToolBar.addContent(c);}else{this._oToolBar.insertContent(c,p);}}else{if(c instanceof sap.m.ToolbarSpacer){this._iPlaceholderPosition=this._getToolbarPlaceHolderPosition(this._oToolBar);return;}if(p){this._iPlaceholderPosition=this._iPlaceholderPosition+p;}this._oToolBar.insertAggregation("content",c,this._iPlaceholderPosition,true);this._iPlaceholderPosition=this._iPlaceholderPosition+1;}};
sap.suite.ui.commons.ChartContainer.prototype._rearrangeToolbar=function(){var t=this._aToolbarContent.length;for(var i=0;i<t;i++){this._oToolBar.insertContent(this._aToolbarContent[i],i);}};
sap.suite.ui.commons.ChartContainer.prototype._adjustIconsDisplay=function(){if(this.getShowLegendButton()){this._addContentToolbar(this._oShowLegendButton);}if(this.getShowZoom()&&sap.ui.Device.system.desktop){this._addContentToolbar(this._oZoomInButton);this._addContentToolbar(this._oZoomOutButton);}if(this.getShowPersonalization()){this._addContentToolbar(this._oPersonalizationButton);}if(this.getShowFullScreen()){this._addContentToolbar(this._oFullScreenButton);}for(var i=0;i<this._aCustomIcons.length;i++){this._addContentToolbar(this._aCustomIcons[i]);}if(!this._bControlNotRendered){this._oChartSegmentedButton.removeAllButtons();}var I=this._aUsedContentIcons.length;if(I>1){for(var i=0;i<I;i++){this._oChartSegmentedButton.addButton(this._aUsedContentIcons[i]);}this._addContentToolbar(this._oChartSegmentedButton);}};
sap.suite.ui.commons.ChartContainer.prototype._adjustSelectorDisplay=function(){if(this._aDimensionSelectors.length===0){this._oChartTitle.setVisible(true);this._addContentToolbar(this._oChartTitle);return;}for(var i=0;i<this._aDimensionSelectors.length;i++){if(jQuery.isFunction(this._aDimensionSelectors[i].setAutoAdjustWidth)){this._aDimensionSelectors[i].setAutoAdjustWidth(true);}this._addContentToolbar(this._aDimensionSelectors[i]);}};
sap.suite.ui.commons.ChartContainer.prototype._adjustDisplay=function(){this._oToolBar=this.getToolbar();this._oToolBar.removeAllContent();this._oToolBar.setProperty("height","3rem",true);if(this._bHasApplicationToolbar){this._rearrangeToolbar();this._iPlaceholderPosition=0;}this._adjustSelectorDisplay();this._addContentToolbar(new sap.m.ToolbarSpacer());this._adjustIconsDisplay();};
sap.suite.ui.commons.ChartContainer.prototype._addButtonToCustomIcons=function(i){var I=i;var s=I.getTooltip();var b=new sap.m.OverflowToolbarButton({icon:I.getSrc(),text:s,tooltip:s,type:sap.m.ButtonType.Transparent,width:"3rem",press:[{icon:I},this._onOverflowToolbarButtonPress.bind(this)]});this._aCustomIcons.push(b);};
sap.suite.ui.commons.ChartContainer.prototype._zoom=function(z){var c=this.getSelectedContent().getContent();if(c instanceof sap.viz.ui5.controls.VizFrame){if(z){c.zoom({"direction":"in"});}else{c.zoom({"direction":"out"});}}if(z){this.fireCustomZoomInPress();}else{this.fireCustomZoomOutPress();}};
sap.suite.ui.commons.ChartContainer.prototype._destroyButtons=function(b){for(var i=0;i<b.length;i++){b[i].destroy();}};
sap.suite.ui.commons.ChartContainer.prototype._setShowLegendForAllCharts=function(s){var c=this.getContent();var I;for(var i=0;i<c.length;i++){I=c[i].getContent();if(jQuery.isFunction(I.setLegendVisible)){I.setLegendVisible(s);}else{jQuery.sap.log.info("ChartContainer: chart with id "+I.getId()+" is missing the setVizProperties property");}}};
sap.suite.ui.commons.ChartContainer.prototype.setFullScreen=function(f){if(this._bControlNotRendered){return this;}if(this.getFullScreen()===f){return this;}if(this.getProperty("fullScreen")!==f){this._toggleFullScreen();}return this;};
sap.suite.ui.commons.ChartContainer.prototype.setTitle=function(t){if(this.getTitle()===t){return this;}this._oChartTitle.setText(t);this.setProperty("title",t,true);return this;};
sap.suite.ui.commons.ChartContainer.prototype.setShowLegendButton=function(s){if(this.getShowLegendButton()===s){return this;}this.setProperty("showLegendButton",s,true);if(!this.getShowLegendButton()){this.setShowLegend(false);}return this;};
sap.suite.ui.commons.ChartContainer.prototype.setSelectorGroupLabel=function(s){if(this.getSelectorGroupLabel()===s){return this;}this.setProperty("selectorGroupLabel",s,true);return this;};
sap.suite.ui.commons.ChartContainer.prototype.setShowLegend=function(s){if(this.getShowLegend()===s){return this;}this.setProperty("showLegend",s,true);this._setShowLegendForAllCharts(s);return this;};
sap.suite.ui.commons.ChartContainer.prototype.setToolbar=function(t){if(!t||this._getToolbarPlaceHolderPosition(t)===-1){jQuery.sap.log.info("A placeholder of type 'sap.suite.ui.commons.ChartContainerToolbarPlaceholder' needs to be provided. Otherwise, the toolbar will be ignored");return this;}if(this.getToolbar()!==t){this.setAggregation("toolbar",t);}if(this.getToolbar()){this._aToolbarContent=this.getToolbar().getContent();this._bHasApplicationToolbar=true;}else{this._aToolbarContent=null;this._bHasApplicationToolbar=false;}this.invalidate();return this;};
sap.suite.ui.commons.ChartContainer.prototype.getDimensionSelectors=function(){return this._aDimensionSelectors;};
sap.suite.ui.commons.ChartContainer.prototype.indexOfDimensionSelector=function(d){for(var i=0;i<this._aDimensionSelectors.length;i++){if(this._aDimensionSelectors[i]===d){return i;}}return-1;};
sap.suite.ui.commons.ChartContainer.prototype.addDimensionSelector=function(d){this._aDimensionSelectors.push(d);return this;};
sap.suite.ui.commons.ChartContainer.prototype.insertDimensionSelector=function(d,a){if(!d){return this;}var i;if(a<0){i=0;}else if(a>this._aDimensionSelectors.length){i=this._aDimensionSelectors.length;}else{i=a;}if(i!==a){jQuery.sap.log.warning("ManagedObject.insertAggregation: index '"+a+"' out of range [0,"+this._aDimensionSelectors.length+"], forced to "+i);}this._aDimensionSelectors.splice(i,0,d);return this;};
sap.suite.ui.commons.ChartContainer.prototype.destroyDimensionSelectors=function(){if(this._oToolBar){for(var i=0;i<this._aDimensionSelectors.length;i++){if(this._aDimensionSelectors[i]){this._oToolBar.removeContent(this._aDimensionSelectors[i]);this._aDimensionSelectors[i].destroy();}}}this._aDimensionSelectors=[];return this;};
sap.suite.ui.commons.ChartContainer.prototype.removeDimensionSelector=function(d){if(!d){return null;}if(this._oToolBar){this._oToolBar.removeContent(d);}var D=this.indexOfDimensionSelector(d);if(D===-1){return null;}else{return this._aDimensionSelectors.splice(D,1)[0];}};
sap.suite.ui.commons.ChartContainer.prototype.removeAllDimensionSelectors=function(){var d=this._aDimensionSelectors.slice();if(this._oToolBar){for(var i=0;i<this._aDimensionSelectors.length;i++){if(this._aDimensionSelectors[i]){this._oToolBar.removeContent(this._aDimensionSelectors[i]);}}}this._aDimensionSelectors=[];return d;};
sap.suite.ui.commons.ChartContainer.prototype.addContent=function(c){this.addAggregation("content",c);this._bChartContentHasChanged=true;return this;};
sap.suite.ui.commons.ChartContainer.prototype.insertContent=function(c,i){this.insertAggregation("content",c,i);this._bChartContentHasChanged=true;return this;};
sap.suite.ui.commons.ChartContainer.prototype.updateContent=function(){this.updateAggregation("content");this._bChartContentHasChanged=true;};
sap.suite.ui.commons.ChartContainer.prototype.addAggregation=function(a,o,s){if(a==="dimensionSelectors"){return this.addDimensionSelector(o);}else{return sap.ui.base.ManagedObject.prototype.addAggregation.apply(this,arguments);}};
sap.suite.ui.commons.ChartContainer.prototype.getAggregation=function(a,d){if(a==="dimensionSelectors"){return this.getDimensionSelectors();}else{return sap.ui.base.ManagedObject.prototype.getAggregation.apply(this,arguments);}};
sap.suite.ui.commons.ChartContainer.prototype.indexOfAggregation=function(a,o){if(a==="dimensionSelectors"){return this.indexOfDimensionSelector(o);}else{return sap.ui.base.ManagedObject.prototype.indexOfAggregation.apply(this,arguments);}};
sap.suite.ui.commons.ChartContainer.prototype.insertAggregation=function(a,o,i,s){if(a==="dimensionSelectors"){return this.insertDimensionSelector(o,i);}else{return sap.ui.base.ManagedObject.prototype.insertAggregation.apply(this,arguments);}};
sap.suite.ui.commons.ChartContainer.prototype.destroyAggregation=function(a,s){if(a==="dimensionSelectors"){return this.destroyDimensionSelectors();}else{return sap.ui.base.ManagedObject.prototype.destroyAggregation.apply(this,arguments);}};
sap.suite.ui.commons.ChartContainer.prototype.removeAggregation=function(a,o,s){if(a==="dimensionSelectors"){return this.removeDimensionSelector(o);}else{return sap.ui.base.ManagedObject.prototype.removeAggregation.apply(this,arguments);}};
sap.suite.ui.commons.ChartContainer.prototype.removeAllAggregation=function(a,s){if(a==="dimensionSelectors"){return this.removeAllDimensionSelectors();}else{return sap.ui.base.ManagedObject.prototype.removeAllAggregation.apply(this,arguments);}};
sap.suite.ui.commons.ChartContainer.prototype.getSelectedContent=function(){return this._oSelectedContent;};
sap.suite.ui.commons.ChartContainer.prototype.getScrollDelegate=function(){return this._oScrollEnablement;};
sap.suite.ui.commons.ChartContainer.prototype.switchChart=function(c){this._setSelectedContent(c);this.rerender();};
sap.suite.ui.commons.ChartContainer.prototype.updateChartContainer=function(){this._bChartContentHasChanged=true;this.rerender();return this;};
