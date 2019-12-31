jQuery.sap.require("sap.ui.core.UIComponent");jQuery.sap.declare("sap.zen.dsh.fioriwrapper.Component");sap.ui.core.UIComponent.extend("sap.zen.dsh.fioriwrapper.Component",{metadata:{"manifest":"json"}});
sap.zen.dsh.fioriwrapper.Component.prototype.createContent=function(){jQuery.sap.require("sap.zen.dsh.Dsh");jQuery.sap.require("sap.ui.generic.app.navigation.service.NavigationHandler");sap.zen.dsh.scriptLoaded=true;var a="";var c=this.getMetadata().getConfig();var m={};var r;var n={};var t;function b(M,v,V){if(Array.isArray(M)){for(var e in M){v[M[e]]=V;}}else{v[M]=V;}}if(c){if(c.semanticObjectMappings){m=c.semanticObjectMappings;r={};for(var k in m){if(m.hasOwnProperty(k)){b(m[k],r,k);}}}if(c.appName){a=c.appName;}if(c.systemAlias){t=c.systemAlias;}}if(this.getComponentData().startupParameters){if(this.getComponentData().startupParameters.appName)a=this.getComponentData().startupParameters.appName;if(this.getComponentData().startupParameters["sap-system"]){t=this.getComponentData().startupParameters["sap-system"];}}var d=new sap.zen.dsh.Dsh({height:"100%",width:"100%",deployment:"bw",dshAppName:a,repoPath:c.repoPath||"",semanticMappings:m,appComponent:this,systemAlias:t,deferCreation:true});if(this.getComponentData().startupParameters){var p=null;for(param in this.getComponentData().startupParameters){if(this.getComponentData().startupParameters.hasOwnProperty(param)&&param!=="newBW"){p=this.getComponentData().startupParameters[param][0];d.addParameter(param,p);if(m&&m.hasOwnProperty(param)){b(m[param],n,p);}else{n[param]=p;}}}}var N=new sap.ui.generic.app.navigation.service.NavigationHandler(this);var P=N.parseNavigation();P.always(function(s,u,e){d.initializeAppStateData.call(d,s,n);if(c.navigationSourceObjects){d.addParameter("NAV_SOURCES",JSON.stringify(c.navigationSourceObjects));}if(r){d.addParameter("NAV_SEMANTIC_MAPPINGS",JSON.stringify(r));}d.createPage();});return d;}