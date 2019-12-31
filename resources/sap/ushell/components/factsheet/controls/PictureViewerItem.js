/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control','sap/ushell/library'],function(C,l){"use strict";var P=C.extend("sap.ushell.components.factsheet.controls.PictureViewerItem",{metadata:{deprecated:true,library:"sap.ushell",properties:{src:{type:"string",group:"Misc",defaultValue:null}},aggregations:{image:{type:"sap.m.Image",multiple:false}}}});
/*!
 * @copyright@
*/
P.prototype.setSrc=function(s){this.setProperty("src",s);var i=this.getImage();if(i==null){i=new sap.m.Image();}i.setSrc(s);this.setImage(i);return this;};P.prototype.exit=function(){var i=this.getImage();if(i){i.destroy();}};return P;});
