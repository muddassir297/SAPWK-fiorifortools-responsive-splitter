/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control','sap/ushell/library','sap/ushell/override'],function(C,l,o){"use strict";var D=C.extend("sap.ushell.ui.launchpad.DashboardGroupsContainer",{metadata:{library:"sap.ushell",properties:{accessibilityLabel:{type:"string",defaultValue:null},displayMode:{type:"string",defaultValue:null}},aggregations:{groups:{type:"sap.ui.core.Control",multiple:true,singularName:"group"}},events:{afterRendering:{}}}});D.prototype.updateGroups=o.updateAggregatesFactory("groups");D.prototype.onAfterRendering=function(){this.fireAfterRendering();};D.prototype.getGroupControlByGroupId=function(g){try{var a=this.getGroups();for(var i=0;i<a.length;i++){if(a[i].getGroupId()==g){return a[i];}}}catch(e){}return null;};return D;});
