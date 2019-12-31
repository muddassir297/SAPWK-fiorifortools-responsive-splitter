// @copyright@
sap.ui.define(['sap/m/Text','sap/ushell/resources','sap/ui/model/resource/ResourceModel','sap/m/GenericTile','sap/m/ImageContent','sap/m/TileContent','sap/m/NumericContent','sap/m/Link','sap/m/GenericTileMode'],function(T,r,R,G,I,a,N,L,b){"use strict";var c=function(u,p,A){var C=jQuery.extend(true,[],A.config.groups),d=A.config.catalogs||[],f=0,g=10,m=10,M=10,h,j,k,l;for(k=0;k<C.length;k++){if(C[k].isDefaultGroup===true){l=C[k];break;}}if(!l&&C.length>0){l=C[0];l.isDefaultGroup=true;}this.translationBundle=r.i18n;this.TileType={Tile:"tile",Link:"link"};if(!h&&A.config.pathToLocalizedContentResources){sap.ui.require(['sap/ui/model/resource/ResourceModel'],function(R){h=new sap.ui.model.resource.ResourceModel({bundleUrl:A.config.pathToLocalizedContentResources,bundleLocale:sap.ui.getCore().getConfiguration().getLanguage()});j=h.getResourceBundle();});}function _(K){if(j){return j.getText(K);}return K;}jQuery.each(d,function(i,e){if(j){e.title=_(e.title);}jQuery.each(e.tiles,function(i,n){n.getTitle=function(){return n.title;};});});jQuery.each(C,function(i,e){if(j){e.title=_(e.title);}jQuery.each(e.tiles,function(i,n){x(n,true);});});function o(){return(100*Math.random())<f;}function q(){return(100*Math.random())<g;}function s(){return m+M*Math.random();}function t(e,i){var n;for(n=0;n<e.tiles.length;n=n+1){if(i.id===e.tiles[n].id){return n;}}return-1;}function v(e,i){var n;for(n=0;n<e.length;n=n+1){if(i.id===e[n].id){return n;}}return-1;}function w(e){var D=jQuery.Deferred();window.setTimeout(function(){D.resolve(e);},s());return D.promise();}function x(e,n){if(e.tileType!=='sap.ushell.ui.tile.DynamicTile'||!e.properties||!e.properties.serviceUrl){return;}if(e.intervalTimer){clearInterval(e.intervalTimer);e.intervalTimer=undefined;}if(n){var i=e.serviceRefreshInterval;if(i){i=i*1000;}else{i=10000;}e.intervalTimer=setInterval(function(){OData.read(e.properties.serviceUrl+'?id='+e.id+'&t='+new Date().getTime(),function(y){jQuery.sap.log.debug('Dynamic tile service call succeed for tile '+e.id);},function(y){jQuery.sap.log.debug('Dynamic tile service call failed for tile '+e.id+', error message:'+y);});},i);}}this.getGroups=function(){var D=jQuery.Deferred();window.setTimeout(function(){D.resolve(C.slice(0));},s());return D.promise();};this.getDefaultGroup=function(){var D=new jQuery.Deferred();D.resolve(l);return D.promise();};this.addGroup=function(e){var D=jQuery.Deferred(),F=o(),i=this;window.setTimeout(function(){if(!F){var n={id:"group_"+C.length,title:e,tiles:[]};C.push(n);D.resolve(n);}else{i.getGroups().done(function(E){D.reject(E);}).fail(function(){D.reject();});}},s());return D.promise();};this.getGroupTitle=function(e){return e.title;};this.setGroupTitle=function(e,n){var D=jQuery.Deferred(),F=o();window.setTimeout(function(){if(!F){e.title=n;D.resolve();}else{w(e).done(function(E){D.reject(E.title);}).fail(function(){D.reject();});}},s());return D.promise();};this.getGroupId=function(e){return e.id;};this.hideGroups=function(H){if(H&&C){for(var i=0;i<C.length;i++){if(H.indexOf(C[i].id)!=-1){C[i].isVisible=false;}else{C[i].isVisible=true;}}}return jQuery.Deferred().resolve();};this.isGroupVisible=function(e){return e&&(e.isVisible===undefined?true:e.isVisible);};this.moveGroup=function(e,n){var D=jQuery.Deferred(),F=o(),i=this;window.setTimeout(function(){if(!F){C.splice(n,0,C.splice(v(C,e),1)[0]);D.resolve();}else{i.getGroups().done(function(E){D.reject(E);}).fail(function(){D.reject();});}},s());return D.promise();};this.removeGroup=function(e){var D=jQuery.Deferred(),F=o(),i=this;window.setTimeout(function(){if(!F){C.splice(v(C,e),1);jQuery.each(e.tiles,function(n,y){x(y,false);});D.resolve();}else{i.getGroups().done(function(E){D.reject(E);}).fail(function(){D.reject();});}},s());return D.promise();};this.resetGroup=function(e){var D=jQuery.Deferred(),F=o(),i=this;window.setTimeout(function(){if(!F){jQuery.each(e.tiles,function(n,y){x(y,false);});e=jQuery.extend(true,{},A.config.groups[v(A.config.groups,e)]);C.splice(v(C,e),1,e);jQuery.each(e.tiles,function(n,y){x(y,true);});D.resolve(e);}else{i.getGroups().done(function(E){D.reject(E);}).fail(function(){D.reject();});}},s());return D.promise();};this.isGroupRemovable=function(e){return e&&!e.isPreset;};this.isGroupLocked=function(e){return e.isGroupLocked;};this.getGroupTiles=function(e){return e.tiles;};this.getLinkTiles=function(e){return e.links;};this.getTileTitle=function(e){return e.title;};this.getTileType=function(e){if(e.isLink){return this.TileType.Link;}return this.TileType.Tile;};this.getTileId=function(e){return e.id;};this.getTileSize=function(e){return e.size;};this.getTileTarget=function(e){var U;if(e.properties){U=e.properties.href||e.properties.targetURL;}return e.target_url||U||"";};this.isTileIntentSupported=function(e){if(e&&e.formFactor){var i=e.formFactor;var S=sap.ui.Device.system;var n;if(S.desktop){n="Desktop";}else if(S.tablet){n="Tablet";}else if(S.phone){n="Phone";}if(i.indexOf(n)===-1){return false;}}return true;};this.isLinkPersonalizationSupported=function(e){if(e){return(window.location.search.indexOf("new_links_container=true")!==-1)&&e.isLinkPersonalizationSupported;}return(window.location.search.indexOf("new_links_container=true")!==-1);};this.getTileView=function(e){var D=jQuery.Deferred(),F=o(),i=this;if(q()){window.setTimeout(function(){if(!F){i._getTileView(e).done(function(n){D.resolve(n);});}else{D.reject();}},s());}else{if(!F){i._getTileView(e).done(function(n){D.resolve(n);});}else{D.reject();}}return D.promise();};this._getTileView=function(i){var E='unknown error',n,y,z=this.getTileType(i)==="link",D=jQuery.Deferred(),B=this;this._translateTileProperties(i);if(i.namespace&&i.path&&i.moduleType){jQuery.sap.registerModulePath(i.namespace,i.path);if(i.moduleType==="UIComponent"){n=new sap.ui.core.ComponentContainer({component:sap.ui.getCore().createComponent({componentData:{properties:i.properties},name:i.moduleName}),height:'100%',width:'100%'});}else{n=sap.ui.view({viewName:i.moduleName,type:sap.ui.core.mvc.ViewType[i.moduleType],viewData:{properties:i.properties},height:'100%'});}D.resolve(n);return D.promise();}else if(i.tileType){y=z?"Link":i.tileType;if(y){var F=i.properties.targetURL||i.properties.href;try{if(F){delete i.properties.targetURL;this._createTileInstance(i,y).done(function(H){n=H;if(z&&window.location.search.indexOf("new_links_container=true")===-1){n.setHref(F);if(F[0]!=='#'){n.setTarget('_blank');}}else{if(typeof(n.setTargetURL)==='function'){n.setTargetURL(F);}i.properties.targetURL=F;}B._handleTilePress(n);B._applyDynamicTileIfoState(n);D.resolve(n);});return D.promise();}else{this._createTileInstance(i,y).done(function(H){n=H;B._handleTilePress(n);B._applyDynamicTileIfoState(n);D.resolve(n);});return D.promise();}}catch(e){D.resolve(new G({header:e&&(e.name+": "+e.message)||this.translationBundle.getText("failedTileCreationMsg"),frameType:this._parseTileSizeToGenericTileFormat(i.size)}));return D.promise();}}else{E='TileType: '+i.tileType+' not found!';}}else{E='No TileType defined!';}D.resolve(new G({header:E,frameType:this._parseTileSizeToGenericTileFormat(i.size)}));return D.promise();};this._getCatalogTileView=function(i){var E='unknown error',n,y,z=this.getTileType(i)==="link";this._translateTileProperties(i);if(i.namespace&&i.path&&i.moduleType){jQuery.sap.registerModulePath(i.namespace,i.path);if(i.moduleType==="UIComponent"){n=new sap.ui.core.ComponentContainer({component:sap.ui.getCore().createComponent({componentData:{properties:i.properties},name:i.moduleName}),height:'100%',width:'100%'});}else{n=sap.ui.view({viewName:i.moduleName,type:sap.ui.core.mvc.ViewType[i.moduleType],viewData:{properties:i.properties},height:'100%'});}return n;}else if(i.tileType){y=z?"Link":i.tileType;if(y){var B=i.properties.targetURL||i.properties.href;try{if(B){delete i.properties.targetURL;n=this._createCatalogTileInstance(i,y);if(z&&window.location.search.indexOf("new_links_container=true")===-1){n.setHref(B);if(B[0]!=='#'){n.setTarget('_blank');}}else{if(typeof(n.setTargetURL)==='function'){n.setTargetURL(B);}i.properties.targetURL=B;}}else{n=this._createCatalogTileInstance(i,y);}this._handleTilePress(n);this._applyDynamicTileIfoState(n);return n;}catch(e){return new G({header:e&&(e.name+": "+e.message)||this.translationBundle.getText("failedTileCreationMsg"),frameType:this._parseTileSizeToGenericTileFormat(i.size)});}}else{E='TileType: '+i.tileType+' not found!';}}else{E='No TileType defined!';}return new G({header:E,frameType:this._parseTileSizeToGenericTileFormat(i.size)});};this._createTileInstance=function(e,i){var n,D=jQuery.Deferred(),y=new I({src:e.properties.icon});y.addStyleClass("sapUshellFullWidth");switch(i){case'sap.ushell.ui.tile.DynamicTile':n=new G({header:e.properties.title,subheader:e.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(e.size),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(e.size),footer:e.properties.info,unit:e.properties.numberUnit,content:new N({scale:e.properties.numberFactor,value:e.properties.numberValue,truncateValueTo:5,indicator:e.properties.stateArrow,valueColor:this._parseTileValueColor(e.properties.numberState),icon:e.properties.icon,width:"100%"})}),press:function(E){this._genericTilePressHandler(e,E);}.bind(this)});D.resolve(n);break;case'sap.ushell.ui.tile.StaticTile':n=new G({header:e.properties.title,subheader:e.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(e.size),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(e.size),footer:e.properties.info,content:y}),press:function(E){this._genericTilePressHandler(e,E);}.bind(this)});D.resolve(n);break;case'Link':if(window.location.search.indexOf("new_links_container=true")===-1){n=new L({text:e.properties.title});}else{n=new G({mode:b.LineMode,subheader:e.properties.subtitle,header:e.properties.title,press:function(E){this._genericTilePressHandler(e,E);}.bind(this)});}D.resolve(n);break;default:var z=e.tileType.replace(/\./g,'/');sap.ui.require([z],function(){var B=jQuery.sap.getObject(e.tileType);n=new B(e.properties||{});D.resolve(n);});}return D.promise();};this._createCatalogTileInstance=function(e,i){var n,y=new I({src:e.properties.icon});y.addStyleClass("sapUshellFullWidth");switch(i){case'sap.ushell.ui.tile.DynamicTile':n=new G({header:e.properties.title,subheader:e.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(e.size),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(e.size),footer:e.properties.info,unit:e.properties.numberUnit,content:new N({scale:e.properties.numberFactor,value:e.properties.numberValue,truncateValueTo:5,indicator:e.properties.stateArrow,valueColor:this._parseTileValueColor(e.properties.numberState),icon:e.properties.icon,width:"100%"})}),press:function(E){this._genericTilePressHandler(e,E);}.bind(this)});break;case'sap.ushell.ui.tile.StaticTile':n=new G({header:e.properties.title,subheader:e.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(e.size),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(e.size),footer:e.properties.info,content:y}),press:function(E){this._genericTilePressHandler(e,E);}.bind(this)});break;case'Link':if(window.location.search.indexOf("new_links_container=true")===-1){n=new L({text:e.properties.title});}else{n=new G({mode:b.LineMode,subheader:e.properties.subtitle,header:e.properties.title,press:function(E){this._genericTilePressHandler(e,E);}.bind(this)});}break;default:jQuery.sap.require(e.tileType);var z=jQuery.sap.getObject(e.tileType);n=new z(e.properties||{});}return n;};this._genericTilePressHandler=function(e,E){if(window.location.search.indexOf("new_links_container=true")===-1||(E.getSource().getScope&&E.getSource().getScope()==="Display")){if(e.properties.targetURL){if(e.properties.targetURL[0]==='#'){hasher.setHash(e.properties.targetURL);}else{window.open(e.properties.targetURL,'_blank');}}}};this._parseTileSizeToGenericTileFormat=function(e){return e==="1x2"?"TwoByOne":"OneByOne";};this._parseTileValueColor=function(e){var i=e;switch(e){case"Positive":i="Good";break;case"Negative":i="Critical";break;}return i;};this._applyDynamicTileIfoState=function(e){var O=e.onAfterRendering;e.onAfterRendering=function(){if(O){O.apply(this,arguments);}var i=this.getModel(),D=i.getProperty('/data/display_info_state'),n=this.getDomRef(),y=n.getElementsByClassName('sapMTileCntFtrTxt')[0];switch(D){case'Negative':y.classList.add('sapUshellTileFooterInfoNegative');break;case'Neutral':y.classList.add('sapUshellTileFooterInfoNeutral');break;case'Positive':y.classList.add('sapUshellTileFooterInfoPositive');break;case'Critical':y.classList.add('sapUshellTileFooterInfoCritical');break;default:return;}};};this._handleTilePress=function(e){if(typeof e.attachPress==='function'){e.attachPress(function(){if(typeof e.getTargetURL==='function'){var i=e.getTargetURL();if(i){if(i[0]==='#'){hasher.setHash(i);}else{window.open(i,'_blank');}}}});}};this._translateTileProperties=function(e){if(this.translationBundle){if(!e.properties.isTranslated){e.properties.title=_(e.properties.title);e.properties.subtitle=_(e.properties.subtitle);e.properties.info=_(e.properties.info);if(e.keywords){for(var i=0;i<e.keywords.length;i++){e.keywords[i]=_(e.keywords[i]);}}e.properties.isTranslated=true;}}};this.refreshTile=function(e){};this.setTileVisible=function(e,n){x(e,n);};this.addTile=function(e,i){if(!i){i=l;}var D=jQuery.Deferred(),F=o(),n=this;window.setTimeout(function(){if(!F){var y=jQuery.extend(true,{title:"A new tile was added",size:"1x1"},e,{id:"tile_0"+e.chipId});i.tiles.push(y);x(y,true);D.resolve(y);}else{n.getGroups().done(function(E){D.reject(E);}).fail(function(){D.reject();});}},s());return D.promise();};this.removeTile=function(e,i){var D=jQuery.Deferred(),F=o(),n=this;window.setTimeout(function(){if(!F){e.tiles.splice(t(e,i),1);x(i,false);D.resolve();}else{n.getGroups().done(function(E){D.reject(E);}).fail(function(){D.reject();});}},s());return D.promise();};this.moveTile=function(e,i,n,S,y,z){var D=jQuery.Deferred(),F=o(),B=this;window.setTimeout(function(){if(!F){if(y===undefined){y=S;}e.isLink=z?(z===B.TileType.Link):e.isLink;S.tiles.splice(i,1);y.tiles.splice(n,0,e);D.resolve(e);}else{B.getGroups().done(function(E){D.reject(E);}).fail(function(){D.reject();});}},s());return D.promise();};this.getTile=function(S,e){var D=jQuery.Deferred();return D.promise();};this.getCatalogs=function(){var D=jQuery.Deferred();d.forEach(function(e){window.setTimeout(function(){D.notify(e);},300);});window.setTimeout(function(){D.resolve(d);},1500);return D.promise();};this.isCatalogsValid=function(){return true;};this.getCatalogError=function(e){return;};this.getCatalogId=function(e){return e.id;};this.getCatalogTitle=function(e){return e.title;};this.getCatalogTiles=function(e){var D=jQuery.Deferred();window.setTimeout(function(){D.resolve(e.tiles);},s());return D.promise();};this.getCatalogTileId=function(e){if(e.chipId){return e.chipId;}else{return"UnknownCatalogTileId";}};this.getCatalogTileTitle=function(e){return e.title;};this.getCatalogTileSize=function(e){return e.size;};this.getCatalogTileView=function(e){return this._getCatalogTileView(e);};this.getCatalogTileTargetURL=function(e){return(e.properties&&e.properties.targetURL)||null;};this.getCatalogTilePreviewTitle=function(e){return(e.properties&&e.properties.title)||null;};this.getCatalogTilePreviewSubtitle=function(e){return(e.properties&&e.properties.subtitle)||null;};this.getCatalogTilePreviewIcon=function(e){return(e.properties&&e.properties.icon)||null;};this.getCatalogTileKeywords=function(e){return jQuery.merge([],jQuery.grep(jQuery.merge([e.title,e.properties&&e.properties.subtitle,e.properties&&e.properties.info],(e&&e.keywords)||[]),function(n,i){return n!==""&&n;}));};this.getCatalogTileTags=function(e){return(e&&e.tags)||[];};this.addBookmark=function(P,e){var e=e?e:l,D=jQuery.Deferred(),F=o(),i=this,n=P.title,y=P.subtitle,z=P.info,B=P.url;window.setTimeout(function(){if(!F){var E={title:n,size:"1x1",chipId:"tile_0"+e.tiles.length,tileType:"sap.ushell.ui.tile.StaticTile",id:"tile_0"+e.tiles.length,keywords:[],properties:{icon:"sap-icon://time-entry-request",info:z,subtitle:y,title:n,targetURL:B}};e.tiles.push(E);x(E,true);D.resolve(E);}else{i.getGroups().done(function(H){D.reject(H);}).fail(function(){D.reject();});}},s());return D.promise();};this.updateBookmarks=function(U,P){var D=new jQuery.Deferred(),e=this.getGroups();e.done(function(i){i.forEach(function(n){n.tiles.forEach(function(y){if(y.properties&&y.properties.targetURL===U){for(var z in P){if(P.hasOwnProperty(z)){y.properties[z]=P[z];}}}});});D.resolve();});e.fail(function(){D.reject();});return D.promise();};this.countBookmarks=function(U){var D=jQuery.Deferred();var i=0;var e,n,y,z;for(y=0;y<C.length;y++){e=C[y];for(z=0;z<e.tiles.length;z++){n=e.tiles[z];if(n.properties.targetURL===U){i++;}}}D.resolve(i);return D.promise();};this.onCatalogTileAdded=function(e){};this.getTileActions=function(e){return(e&&e.actions)||null;};};return c;},true);