// @copyright@
sap.ui.define(['./DashboardUIActions','sap/ushell/ui/launchpad/TileContainer','sap/ushell/utils'],function(D,T,u){"use strict";sap.ui.controller("sap.ushell.components.flp.launchpad.dashboard.DashboardContent",{onInit:function(){var e=sap.ui.getCore().getEventBus();this.isActionModeInited=false;this.handleDashboardScroll=this._handleDashboardScroll.bind(this);e.subscribe("launchpad","appClosed",this._resizeHandler,this);e.subscribe("launchpad","appOpened",this._appOpenedHandler,this);e.subscribe("launchpad","dashboardModelContentLoaded",this._modelLoaded,this);e.subscribe('launchpad','actionModeInactive',this._handleGroupVisibilityChanges,this);e.subscribe("launchpad",'animationModeChange',this._handleAnimationModeChange,this);window.document.addEventListener("visibilitychange",u.handleTilesVisibility,false);this.sViewId="#"+this.oView.getId();if(sap.ui.Device.browser.mobile){e.subscribe("launchpad","contentRefresh",this._webkitMobileRenderFix,this);}this.isDesktop=(sap.ui.Device.system.desktop&&(navigator.userAgent.toLowerCase().indexOf('tablet')<0));this.isNotificationPreviewLoaded=false;this._setCenterViewPortShift();},onExit:function(){var e=sap.ui.getCore().getEventBus();e.unsubscribe("launchpad","contentRefresh",this._webkitMobileRenderFix,this);e.unsubscribe("launchpad","appClosed",this._resizeHandler,this);e.unsubscribe("launchpad","appOpened",this._appOpenedHandler,this);e.unsubscribe("launchpad","dashboardModelContentLoaded",this._modelLoaded,this);window.document.removeEventListener("visibilitychange",u.handleTilesVisibility,false);},onAfterRendering:function(){var e=sap.ui.getCore().getEventBus(),m,t,g,i,a;e.unsubscribe("launchpad","scrollToGroup",this._scrollToGroup,this);e.unsubscribe("launchpad","scrollToGroupByName",this._scrollToGroupByName,this);e.subscribe("launchpad","scrollToGroup",this._scrollToGroup,this);e.subscribe("launchpad","scrollToGroupByName",this._scrollToGroupByName,this);e.unsubscribe("launchpad","scrollToFirstVisibleGroup",this._scrollToFirstVisibleGroup,this);e.subscribe("launchpad","scrollToFirstVisibleGroup",this._scrollToFirstVisibleGroup,this);sap.ui.Device.orientation.attachHandler(function(){var j=jQuery('#dashboardGroups').find('.sapUshellTileContainer:visible');if(j.length){m=this.getView().getModel();t=m.getProperty('/topGroupInViewPortIndex');if(j.get(t)){g=sap.ui.getCore().byId(j.get(t).id);i=m.getProperty('/editTitle');this._publishAsync("launchpad","scrollToGroup",{group:g,isInEditTitle:i});}}},this);jQuery(window).bind("resize",function(){clearTimeout(a);a=setTimeout(this._resizeHandler.bind(this),300);}.bind(this));if(this.getView().getModel().getProperty("/personalization")&&!this.isActionModeInited){sap.ui.require(["sap/ushell/components/flp/ActionMode"],function(A){A.init(this.getView().getModel());}.bind(this));this.isActionModeInited=true;}this._updateTopGroupInModel();},_setCenterViewPortShift:function(){var v=sap.ui.getCore().byId("viewPortContainer");if(v){v.shiftCenterTransition(true);}},_dashboardDeleteTileHandler:function(e){var t=e.getSource(),o=t.getBindingContext().getObject().object,d={originalTileId:sap.ushell.Container.getService("LaunchPage").getTileId(o)};sap.ui.getCore().getEventBus().publish("launchpad","deleteTile",d,this);},dashboardTilePress:function(e){var t=e.getSource();if(t&&document.activeElement.tagName!=="INPUT"){if(t&&sap.ui.getCore().byId(t.getId())){sap.ushell.components.flp.ComponentKeysHandler.setTileFocus(t.$());}}sap.ui.getCore().getEventBus().publish("launchpad","dashboardTileClick");},_updateTopGroupInModel:function(){var m=this.getView().getModel(),t=this._getIndexOfTopGroupInViewPort();m.setProperty('/topGroupInViewPortIndex',t);},_getIndexOfTopGroupInViewPort:function(){var v=this.getView(),d=v.getDomRef(),s=d.getElementsByTagName('section'),j=$(s).find('.sapUshellTileContainer'),o=j.not('.sapUshellHidden').first().offset(),f=(o&&o.top)||0,t=[],n=s[0].scrollTop,a=0;if(!j||!o){return a;}j.each(function(){if(!jQuery(this).hasClass("sapUshellHidden")){var c=jQuery(this).parent().offset().top;t.push([c,c+jQuery(this).parent().height()]);}});var b=n+f;jQuery.each(t,function(i,c){var e=c[0],g=c[1];if(e-24<=b&&b<=g){a=i;return false;}});return a;},_handleDashboardScroll:function(){var v=this.getView(),m=v.getModel(),n=1000;var h=m.getProperty("/homePageGroupDisplay"),e=h!=="tabs",t=m.getProperty("/tileActionModeActive");function H(){u.handleTilesVisibility();}clearTimeout(this.timeoutId);this.timeoutId=setTimeout(H,n);v.oAnchorNavigationBar.closeOverflowPopup();if(e||t){this._updateTopGroupInModel();}v.oAnchorNavigationBar.reArrangeNavigationBarElements();},_handleGroupDeletion:function(g){var e=sap.ui.getCore().getEventBus(),G=g.getObject(),i=G.removable,s=G.title,a=G.groupId,r=sap.ushell.resources.i18n,m=sap.ushell.Container.getService("Message"),A,c,v=this.getView();sap.ui.require(['sap/m/MessageBox'],function(M){A=M.Action;c=(i?A.DELETE:r.getText('ResetGroupBtn'));m.confirm(r.getText(i?'delete_group_msg':'reset_group_msg',s),function(o){if(o===c){e.publish("launchpad",i?'deleteGroup':'resetGroup',{groupId:a});}},r.getText(i?'delete_group':'reset_group'),[c,A.CANCEL]);v.oAnchorNavigationBar.updateVisibility();});},_modelLoaded:function(){this.bModelInitialized=true;sap.ushell.Layout.getInitPromise().then(function(){this._initializeUIActions();}.bind(this));},_initializeUIActions:function(){var d=new D();d.initializeUIActions(this);},_forceBrowserRerenderElement:function(e){var a=window.requestAnimationFrame||window.webkitRequestAnimationFrame;if(a){a(function(){var d=e.style.display;e.style.display='none';e.style.display=d;});}else{jQuery.sap.log.info('unsupported browser for animation frame');}},_webkitMobileRenderFix:function(){if(sap.ui.Device.browser.chrome||sap.ui.Device.os.android){this._forceBrowserRerenderElement(document.body);}},_resizeHandler:function(){this._addBottomSpace();u.handleTilesVisibility();var i=jQuery.find("#dashboardGroups:visible").length;if(sap.ushell.Layout&&i){sap.ushell.Layout.reRenderGroupsLayout(null);this._initializeUIActions();}},_handleAnimationModeChange:function(c,e,a){var m=this.getView().getModel();m.setProperty('/animationMode',a);},_appOpenedHandler:function(c,e,d){var v,p,P,m=this.getView().getModel();p=this.getOwnerComponent();P=p.getMetadata().getComponentName();if(d.additionalInformation.indexOf(P)===-1){u.setTilesNoVisibility();v=sap.ui.getCore().byId("viewPortContainer");if(v){v.shiftCenterTransition(false);}}if(sap.ushell.components.flp.ActionMode&&sap.ushell.components.flp.ActionMode.oModel&&sap.ushell.components.flp.ActionMode.oModel.getProperty("/tileActionModeActive")){sap.ushell.components.flp.ActionMode.toggleActionMode(m,"Menu Item");}},_addBottomSpace:function(){u.addBottomSpace();},_scrollToFirstVisibleGroup:function(c,e,d){var g,v=this.oView.oDashboardGroupsBox.getGroups(),f=d.fromTop>0?d.fromTop:0;if(d.group){g=d.group.getGroupId();}else{g=d.groupId;}if(v){jQuery.each(v,function(n,G){if(G.getGroupId()===g){var y=document.getElementById(G.sId).offsetTop;jQuery('.sapUshellDashboardView section').stop().animate({scrollTop:y+f},0);sap.ushell.components.flp.ComponentKeysHandler.setTileFocus(jQuery("#"+G.getId()+" li").first());return false;}});u.addBottomSpace();}},_scrollToGroupByName:function(c,e,d){var g=this.getView().getModel().getProperty("/groups"),G=d.groupName,l=sap.ushell.Container.getService('LaunchPage');jQuery.each(g,function(n,o){if(l.getGroupTitle(o)===G){this._scrollToGroup(c,e,{groupId:o.groupId,iDuration:0});}}.bind(this));},_scrollToGroup:function(c,e,d){var g,i=d.iDuration==undefined?500:d.iDuration,v=this.getView(),m=v.getModel(),M=m.getProperty('/animationMode')==='minimal',t=this;if(M){i=0;}if(d.group){g=d.group.getGroupId();}else{g=d.groupId;}t.iAnimationDuration=i;if(this.oView.oDashboardGroupsBox.getGroups()){jQuery.each(this.oView.oDashboardGroupsBox.getGroups(),function(n,G){if(G.getGroupId()===g){var y;setTimeout(function(){y=-1*(document.getElementById('dashboardGroups').getBoundingClientRect().top)+document.getElementById(G.sId).getBoundingClientRect().top;var a=jQuery(document.getElementById(G.sId)).find(".sapUshellTileContainerHeader").height();var b=jQuery(document.getElementById(G.sId)).find(".sapUshellTileContainerBeforeContent").height();var I=G.getModel().getProperty('/tileActionModeActive');y=a>0&&!I?y+48:y+b+8;jQuery('.sapUshellDashboardView section').stop().animate({scrollTop:y},t.iAnimationDuration,function(){if(d.groupChanged){if(!d.restoreLastFocusedTile){sap.ushell.components.flp.ComponentKeysHandler.setTileFocus(jQuery("#"+G.getId()+" li").first());}}if(d.restoreLastFocusedTile){var s="#"+G.getId();var l=false;if(d.restoreLastFocusedTileContainerById){s="#"+d.restoreLastFocusedTileContainerById;l=true;}sap.ushell.components.flp.ComponentKeysHandler.goToLastVisitedTile(jQuery(s),l);}});if(d.isInEditTitle){G.setEditMode(true);}},0);if(d.groupId||d.groupChanged){t._addBottomSpace();}u.handleTilesVisibility();return false;}});}},_handleDrop:function(e,a){var t=sap.ushell.Layout.getLayoutEngine().layoutEndCallback(),E=sap.ui.getCore().getEventBus(),n,b;if(!t.tileMovedFlag){E.publish("launchpad","sortableStop");return;}n=true;b=true;if((t.srcGroup!==t.dstGroup)){n=b=false;}else if(t.tile!==t.dstGroup.getTiles()[t.dstTileIndex]){b=false;}t.srcGroup.removeAggregation('tiles',t.tile,n);t.dstGroup.insertAggregation('tiles',t.tile,t.dstTileIndex,b);E.publish("launchpad","movetile",{sTileId:t.tile.getUuid(),toGroupId:t.dstGroup.getGroupId(),toIndex:t.dstTileIndex});if(jQuery(a)){sap.ushell.components.flp.ComponentKeysHandler.setTileFocus(jQuery(a));}if(this.getView().getModel()){this.getView().getModel().setProperty('/draggedTileLinkPersonalizationSupported',true);}E.publish("launchpad","sortableStop");},_handleDrag:function(e,a){var t=sap.ushell.Layout.getLayoutEngine().layoutEndCallback(),p=sap.ushell.Container.getService("LaunchPage"),o=t.tile.getBindingContext().getObject().object,i=p.isLinkPersonalizationSupported(o);if(this.getView().getModel()){this.getView().getModel().setProperty('/draggedTileLinkPersonalizationSupported',i);}},_handleAnchorItemPress:function(e){var v=this.getView(),m=v.getModel();if(sap.ui.Device.system.phone&&e.getParameter("manualPress")){e.oSource.openOverflowPopup();}var g=m.getProperty("/groups");for(var i=0;i<g.length;i++){m.setProperty("/groups/"+i+"/isGroupSelected",false);}m.setProperty("/groups/"+e.getParameter("group").getIndex()+"/isGroupSelected",true);if(m.getProperty("/homePageGroupDisplay")&&m.getProperty("/homePageGroupDisplay")==="tabs"&&!m.getProperty("/tileActionModeActive")){var s=e.getParameter("group").getIndex(),h=0;for(var i=0;i<s;i++){if(!g[i].isGroupVisible||!g[i].visibilityModes[0]){h++;}}var f=s-h;v.oDashboardGroupsBox.getBinding("groups").filter([v.oFilterSelectedGroup]);v.oAnchorNavigationBar.adjustItemSelection(f);v.oAnchorNavigationBar.setSelectedItemIndex(f);}else{if(!m.getProperty("/tileActionModeActive")){v.oDashboardGroupsBox.getBinding("groups").filter([new sap.ui.model.Filter("isGroupVisible",sap.ui.model.FilterOperator.EQ,true)]);}else{v.oDashboardGroupsBox.getBinding("groups").filter([]);}this._scrollToGroup("launchpad","scrollToGroup",{group:e.getParameter('group'),groupChanged:true,focus:(e.getParameter("action")==="sapenter")});}},_addGroupHandler:function(d){var i,p=d.getSource().getBindingContext().getPath(),a=p.split("/");i=window.parseInt(a[a.length-1],10);if(d.getSource().sParentAggregationName==="afterContent"){i=i+1;}sap.ui.getCore().getEventBus().publish("launchpad","createGroupAt",{title:sap.ushell.resources.i18n.getText("new_group_name"),location:i,isRendered:true});},_notificationsUpdateCallback:function(){var t=this,r=5,a=0,R=this.getView().getModel().getProperty("/previewNotificationItems"),n=[],N=[],b,c,d,e,f,i,o,g=false,m=r-R.length-1;sap.ushell.Container.getService("Notifications").getNotifications().done(function(h){if(!h){return;}var j=sap.ui.getCore().byId("notifications-preview-container"),v;if(!this.isNotificationPreviewLoaded){j.setEnableBounceAnimations(true);}if(R&&R.length){for(f=0;f<R.length;f++){var O=R[f].originalItemId,k=false;for(i=0;i<h.length;i++){if(h[i].Id===O){k=true;break;}if(R[f].originalTimestamp>h[i].CreatedAt){break;}}if(!k){R.splice(f,1);g=true;f--;}}}if(R&&R.length>0){b=R[0].originalTimestamp;c=sap.ushell.Container.getService("Notifications")._formatAsDate(b);}for(f=0;(f<h.length)&&(a<r);f++){d=h[f].CreatedAt;e=sap.ushell.Container.getService("Notifications")._formatAsDate(d);if((c?e>c:true)){n[a]=h[f];a++;}}var l=n.length;if(R&&R.length>0&&R.length<r&&h.length>R.length){b=R[R.length-1].originalTimestamp;c=sap.ushell.Container.getService("Notifications")._formatAsDate(b);a=0;for(f=0;(f<h.length)&&(a<=m);f++){d=h[f].CreatedAt;e=sap.ushell.Container.getService("Notifications")._formatAsDate(d);if(e<c){n[l+a]=h[f];a++;}}}if(n.length===0&&!g){this._disableNotificationPreviewBouncingAnimation(j);return;}for(i=0;i<n.length;i++){o=new sap.m.NotificationListItem({hideShowMoreButton:true,title:n[i].SensitiveText?n[i].SensitiveText:n[i].Text,description:n[i].SubTitle,datetime:u.formatDate(n[i].CreatedAt),priority:sap.ui.core.Priority[n[i].Priority.charAt(0)+n[i].Priority.substr(1).toLowerCase()],press:function(E){var s=this.getBindingContext().getPath(),p=s.split("/"),P="/"+p[1]+"/"+p[2],q=this.getModel().getProperty(P),S=q.NavigationTargetObject,A=q.NavigationTargetAction,w=q.NavigationTargetParams,x=q.originalItemId,y=sap.ushell.Container.getService("Notifications");u.toExternalWithParameters(S,A,w);var z=y.markRead(x);z.fail(function(){sap.ushell.Container.getService('Message').error(sap.ushell.resources.i18n.getText('notificationsFailedMarkRead'));});},close:function(E){var s=this.getBindingContext().getPath(),p=s.split("/"),P="/"+p[1]+"/"+p[2],q=this.getModel().getProperty(P),w=q.originalItemId,R=t.getView().getModel().getProperty("/previewNotificationItems"),x=sap.ushell.Container.getService("Notifications"),y=x.dismissNotification(w);y.done(function(){var i;for(i=0;i<R.length;i++){if(R[i].originalItemId===w){break;}}R.splice(i,1);t.getView().getModel().setProperty("/previewNotificationItems",R);});y.fail(function(){sap.ushell.Container.getService('Message').error(sap.ushell.resources.i18n.getText('notificationsFailedDismiss'));t.getView().getModel().setProperty("/previewNotificationItems",R);});}}).addStyleClass("sapUshellNotificationsListItem");N.push({previewItemId:o.getId(),originalItemId:n[i].Id,originalTimestamp:n[i].CreatedAt,NavigationTargetObject:n[i].NavigationTargetObject,NavigationTargetAction:n[i].NavigationTargetAction,NavigationTargetParams:n[i].NavigationTargetParams});v=sap.ui.getCore().byId('viewPortContainer');if(v.getCurrentState()==="RightCenter"){o.addStyleClass("sapUshellRightFloatingContainerItemBounceOut");}}if(R.length===0){t.getView().getModel().setProperty("/previewNotificationItems",N);this._disableNotificationPreviewBouncingAnimation(j);return;}for(f=N.length-1;f>-1;f--){if(R.length>=r){setTimeout(function(){R.pop();t.getView().getModel().setProperty("/previewNotificationItems",R);},1000);}if(N[f].originalTimestamp>R[0].originalTimestamp){R.unshift(N[f]);}else{R.push(N[f]);}}t.getView().getModel().setProperty("/previewNotificationItems",R);this._disableNotificationPreviewBouncingAnimation(j);}.bind(this)).fail(function(){});},_disableNotificationPreviewBouncingAnimation:function(n){if(!this.isNotificationPreviewLoaded){this.isNotificationPreviewLoaded=true;n.setEnableBounceAnimations(false);}},_publishAsync:function(c,e,d){var b=sap.ui.getCore().getEventBus();window.setTimeout(jQuery.proxy(b.publish,b,c,e,d),1);},_changeGroupVisibility:function(g){var b=g.getPath(),m=g.getModel(),G=m.getProperty(b+'/isGroupVisible'),v=this.getView();m.setProperty(b+'/isGroupVisible',!G);v.oAnchorNavigationBar.updateVisibility();},_handleGroupVisibilityChanges:function(c,e,o){var l=sap.ushell.Container.getService('LaunchPage'),m=this.getView().getModel(),C=u.getCurrentHiddenGroupIds(m),s=C.length===o.length,i=s,p;C.some(function(h,I){if(!i){return true;}i=jQuery.inArray(h,o)!==-1;return!i;});if(!i){p=l.hideGroups(C);p.done(function(){m.updateBindings('groups');}.bind(this));p.fail(function(){var a=sap.ushell.Container.getService('Message');a.error(sap.ushell.resources.i18n.getText('hideGroups_error'));});}},_updateShellHeader:function(){if(!this.oShellUIService){this._initializeShellUIService();}else{this.oShellUIService.setTitle();this.oShellUIService.setHierarchy();}},_initializeShellUIService:function(){return sap.ui.require(["sap/ushell/ui5service/ShellUIService"],function(S){this.oShellUIService=new S({scopeObject:this.getOwnerComponent(),scopeType:"component"});this.oShellUIService.setTitle();this.oShellUIService.setHierarchy();return this.oShellUIService;}.bind(this));},_deactivateActionModeInTabsState:function(){var v=this.getView(),m=v.getModel();var g=m.getProperty("/groups");for(var i=0;i<g.length;i++){m.setProperty("/groups/"+i+"/isGroupSelected",false);}var s=v.oAnchorNavigationBar.getSelectedItemIndex();var h=0;if(!this._isGroupVisible(s)){for(var i=0;i<g.length;i++){if(!this._isGroupVisible(i)){h++;}else{s=i;break;}}}else{for(var i=0;i<s;i++){if(!this._isGroupVisible(i)){h++;}}}var f=s-h;v.oAnchorNavigationBar.adjustItemSelection(f);v.oAnchorNavigationBar.setSelectedItemIndex(f);m.setProperty("/groups/"+s+"/isGroupSelected",true);v.oDashboardGroupsBox.getBinding("groups").filter([v.oFilterSelectedGroup]);},_isGroupVisible:function(g){var G=this.getView().getModel().getProperty("/groups");return(G[g].isGroupVisible&&G[g].visibilityModes[0]);}});},false);
