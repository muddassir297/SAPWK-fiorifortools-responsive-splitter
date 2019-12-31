/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/dt/plugin/ElementMover','sap/ui/dt/OverlayUtil','sap/ui/dt/ElementUtil','sap/ui/fl/Utils','sap/ui/rta/Utils','sap/ui/rta/command/CommandFactory','sap/ui/rta/plugin/Plugin','sap/ui/dt/OverlayRegistry'],function(E,O,a,F,U,C,P,b){"use strict";var R=E.extend("sap.ui.rta.plugin.RTAElementMover",{metadata:{library:"sap.ui.rta",properties:{commandFactory:{type:"any",defaultValue:C},movableTypes:{type:"string[]",defaultValue:["sap.ui.core.Element"]}},associations:{},events:{}}});function g(o,I){var r;if(o.isInHiddenTree()&&o.getPublicParentElementOverlay()){r=o.getPublicParentElementOverlay().getElementInstance();}else if(!o.isInHiddenTree()){var e=o.getElementInstance();var d=o.getDesignTimeMetadata();if(I&&!d.getData().getRelevantContainer){r=e;}else{r=d.getRelevantContainer(e);}}return r;}function i(o){var v=false;var d=o.getDesignTimeMetadata();if(!d){return false;}var r=g(o);var p;var c=sap.ui.dt.OverlayRegistry.getOverlay(r);if(c){p=c.getDesignTimeMetadata();}if(!p){return false;}if(!v){v=P.prototype.checkAggregations(o,c,"move");}if(v){if(!o.isInHiddenTree()){v=P.prototype.hasStableId(o)&&P.prototype.hasStableId(c)&&P.prototype.hasStableId(o.getParentElementOverlay());}else{v=P.prototype.hasStableId(o)&&P.prototype.hasStableId(c);}}return v;}function h(A,e){var p=A.getDesignTimeMetadata();return!!p.getMoveAction(e);}function H(o,e){var p=o.getPublicParentAggregationOverlay();if(p){return h(p,e);}return false;}E.prototype.isMovableType=function(e){return true;};R.prototype.checkMovable=function(o){return i(o);};R.prototype.checkTargetZone=function(A){var t=E.prototype.checkTargetZone.call(this,A);var v,m=false;var M,T;var o,c,d,e;if(t){M=this.getMovedOverlay();T=A.getParent();d=g(M,false);e=g(T,true);if(!d||!e){return false;}else{o=M.getElementInstance();c=T.getElementInstance();v=i(M);if(c===e){m=h(A,o);}else{m=H(T,o);}t=(d===e)&&v&&m;}}return t;};R.prototype.buildMoveCommand=function(){var m=this.getMovedOverlay();var M=m.getElementInstance();var s=this._getSource();var p=s.publicParent;var S=b.getOverlay(p);var t=O.getParentInformation(m);var c=s.index;var T=t.index;var d=this._compareSourceAndTarget(s,t);if(d){return undefined;}delete s.index;delete t.index;var o=this.getCommandFactory().getCommandFor(p,"Move",{movedElements:[{element:M,sourceIndex:c,targetIndex:T}],source:s,target:t},S.getDesignTimeMetadata());return o;};return R;},true);