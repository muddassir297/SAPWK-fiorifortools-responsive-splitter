// @copyright@
sap.ui.define(['sap/ui/core/UIComponent'],function(U){"use strict";var F={I_DEFAULT_SEARCH_DEPTH:5,B_DEFAULT_LATE_ADAPTATION:false,S_FIORI20ADAPTER_URL_PARAM_NAME:"sap-ui-xx-fiori2Adaptation",S_FIORI20ADAPTER_METADATA_PARAM_NAME:"sapFiori2Adaptation",A_WHITELIST:["fin.*","ssuite.fin.*","fscm.*","sap.fin.*","cus.sd.*","cus.o2c.*","sap.apf.*","tl.ibp.*","ux.fnd.apf.o2c.*","fnd.apf.*","fcg.sll.*","ux.fnd.generic-apf-application.*","hpa.cei.*","query.viewbrowser.s1.*","ssuite.vdm.viewbrowser.s1.*","ssuite.smartbusiness.kpi.s1.*","ssuite.smartbusiness.evaluation.s1.*","ssuite.smartbusiness.association.s1.*","ssuite.smartbusiness.drilldown.s1.*","ssuite.smartbusiness.tile.s1.*","ssuite.smartbusiness.tile.ce.s1.*","ssuite.smartbusiness.workspace.s1.*","ssuite.smartbusiness.runtime.s1.*","gs.fin.customersummarycn.display.*","gs.fin.financialstatement.structure.manage.*","gs.fin.financialstatement.display.*","uipsm.*","publicservices.her.*"],getConfiguration:function(c){var C=this._getURLParamConfiguration();if(!C){C=this._getMetadataConfiguration(c);}if(!C){C=this._getDefaultConfiguration(c);}C.iSearchDepth=C.iSearchDepth||F.I_DEFAULT_SEARCH_DEPTH;if((typeof C.iSearchDepth==="string")&&!isNaN(C.iSearchDepth)){C.iSearchDepth=parseInt(C.iSearchDepth,10);}return C;},_getURLParamConfiguration:function(){if(typeof sap.ui.getCore().getConfiguration().getFiori2Adaptation!=="function"){return;}if(!this._isURLParameterSpecified(F.S_FIORI20ADAPTER_URL_PARAM_NAME)){return;}var u=sap.ui.getCore().getConfiguration().getFiori2Adaptation(),b,s;if(typeof(u)==="boolean"){b=u;}else if(u&&(u.length>=1)){s=u;}if(!s&&(b===undefined)){return;}return{bStylePage:s?s.indexOf("style")>-1:b,bMoveTitle:s?s.indexOf("title")>-1:b,bHideBackButton:s?s.indexOf("back")>-1:b,bCollapseHeader:s?s.indexOf("collapse")>-1:b,bHierarchy:s?s.indexOf("hierarchy")>-1:b};},_getMetadataConfiguration:function(c){var a=c.getMetadata("config").getConfig(F.S_FIORI20ADAPTER_METADATA_PARAM_NAME),A,b;if(typeof(a)==="boolean"){A=a;}else if((typeof a==="object")&&!jQuery.isEmptyObject(a)){b=a;}if(!b&&(A===undefined)){return;}return{bStylePage:b?this._isSgnTrue(b["style"]):A,bMoveTitle:b?this._isSgnTrue(b["title"]):A,bHideBackButton:b?this._isSgnTrue(b["back"]):A,bCollapseHeader:b?this._isSgnTrue(b["collapse"]):A,bHierarchy:b?this._isSgnTrue(b["hierarchy"]):A,bLateAdaptation:b?this._isSgnTrue(b["lateAdaptation"]):F.B_DEFAULT_LATE_ADAPTATION};},_getDefaultConfiguration:function(c){var e=this._hasMinVersionSmallerThan(c,"1.42")&&this._isWhitelisted(c);return{bStylePage:e,bMoveTitle:e,bHideBackButton:e,bCollapseHeader:e,bHierarchy:e};},_isURLParameterSpecified:function(p){var a=jQuery.sap.getUriParameters().mParams&&jQuery.sap.getUriParameters().mParams[p];return a&&(a.length>0);},_isWhitelisted:function(c){var C=c.getMetadata().getName();for(var i=0;i<F.A_WHITELIST.length;i++){var n=F.A_WHITELIST[i].substring(0,F.A_WHITELIST[i].length-2);if(this._isPrefixedString(C,n)){return true;}}return false;},_isAdaptationRequired:function(a){for(var o in a){if(a[o]===true){return true;}}return false;},_isPrefixedString:function(s,p){return s&&p&&(s.substring(0,p.length)===p);},_hasMinVersionSmallerThan:function(c,v){var i=c.getMetadata().getManifestEntry("sap.ui5"),m=true;if(i&&i.dependencies&&i.dependencies.minUI5Version){var M=new jQuery.sap.Version(i.dependencies.minUI5Version);m=M.compareTo(new jQuery.sap.Version(v))<0;}return m;},_isSgnTrue:function(v){return(v===true)||(v==="true");}};U._fnOnInstanceInitialized=function(c){var C=c.getAggregation("rootControl");if(!C||C.getId()==="navContainerFlp"||c.getId().indexOf("application-")!==0){return;}var o=F.getConfiguration(c);if(!F._isAdaptationRequired(o)){return;}if(!sap.ui.core.service||!sap.ui.core.service.ServiceFactoryRegistry||typeof sap.ui.core.service.ServiceFactoryRegistry.get!=="function"){jQuery.sap.log.warning("Fiori20Adapter not loaded because static FactoryRegistry is not available","sap.ui.core.service.ServiceFactoryRegistry should be a function","sap.ushell.Fiori20AdapterTest");return;}var d={onBeforeRendering:function(){C.removeEventDelegate(d);var s=sap.ui.core.service.ServiceFactoryRegistry.get("sap.ushell.ui5service.ShellUIService"),S=s&&s.createInstance();if(!s||!S){jQuery.sap.log.warning("Fiori20Adapter not loaded because ShellUIService is not available","sap.ushell.ui5service.ShellUIService should be declared by configuration","sap.ushell.Fiori20AdapterTest");return;}S.then(function(s){if(s&&(s.getUxdVersion()===2)){jQuery.sap.require("sap.ushell.Fiori20Adapter");sap.ushell.Fiori20Adapter.applyTo(C,c,o,s);}},function(e){jQuery.sap.log.warning("Fiori20Adapter not loaded as ShellUIService is not available",e,"sap.ushell.Fiori20AdapterTest");});}};C.addEventDelegate(d);};},false);