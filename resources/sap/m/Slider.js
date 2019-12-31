/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control','sap/ui/core/EnabledPropagator','./Input','sap/ui/core/InvisibleText'],function(q,l,C,E,I,a){"use strict";var S=C.extend("sap.m.Slider",{metadata:{library:"sap.m",properties:{width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"100%"},enabled:{type:"boolean",group:"Behavior",defaultValue:true},name:{type:"string",group:"Misc",defaultValue:""},min:{type:"float",group:"Data",defaultValue:0},max:{type:"float",group:"Data",defaultValue:100},step:{type:"float",group:"Data",defaultValue:1},progress:{type:"boolean",group:"Misc",defaultValue:true},value:{type:"float",group:"Data",defaultValue:0},showHandleTooltip:{type:"boolean",group:"Appearance",defaultValue:true},showAdvancedTooltip:{type:"boolean",group:"Appearance",defaultValue:false},inputsAsTooltips:{type:"boolean",group:"Appearance",defaultValue:false},enableTickmarks:{type:"boolean",group:"Appearance",defaultValue:false}},defaultAggregation:"scale",aggregations:{scale:{type:"sap.m.IScale",multiple:false,singularName:"scale"}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{change:{parameters:{value:{type:"float"}}},liveChange:{parameters:{value:{type:"float"}}}},designTime:true}});S.prototype._CONSTANTS={CHARACTER_WIDTH_PX:8,INPUT_STATE_NONE:"None",INPUT_STATE_ERROR:"Error",TICKMARKS:{MAX_POSSIBLE:100,MIN_SIZE:{SMALL:8,WITH_LABEL:80}}};E.apply(S.prototype,[true]);S.prototype._convertValueToRtlMode=function(v){return this.getMax()-v+this.getMin();};S.prototype._recalculateStyles=function(){var s=this.$();this._fSliderWidth=s.width();this._fSliderPaddingLeft=parseFloat(s.css("padding-left"));this._fSliderOffsetLeft=s.offset().left;this._fHandleWidth=this.$("handle").width();this._fTooltipHalfWidthPercent=((this._fSliderWidth-(this._fSliderWidth-(this._iLongestRangeTextWidth/2+this._CONSTANTS.CHARACTER_WIDTH_PX)))/this._fSliderWidth)*100;};S.prototype._validateProperties=function(){var m=this.getMin(),M=this.getMax(),s=this.getStep(),b=false,e=false;if(m>=M){b=true;e=true;q.sap.log.warning("Warning: "+"Property wrong min: "+m+" >= max: "+M+" on ",this);}if(s<=0){q.sap.log.warning("Warning: "+"The step could not be negative on ",this);}if(s>(M-m)&&!b){e=true;q.sap.log.warning("Warning: "+"Property wrong step: "+s+" > max: "+M+" - "+"min: "+m+" on ",this);}return e;};S.prototype._getPercentOfValue=function(v){var m=this.getMin(),p=((v-m)/(this.getMax()-m))*100;return p;};S.prototype._getValueOfPercent=function(p){var m=this.getMin();var v=(p*(this.getMax()-m)/100)+m;var b=(""+this.getStep()).split(".")[1];b=b?b.length:0;return Number(v.toFixed(b));};S.prototype._validateStep=function(s){if(typeof s==="undefined"){return 1;}if(typeof s!=="number"){q.sap.log.warning('Warning: "iStep" needs to be a number',this);return 0;}if((Math.floor(s)===s)&&isFinite(s)){return s;}q.sap.log.warning('Warning: "iStep" needs to be a finite interger',this);return 0;};S.prototype._handleTickmarksResponsiveness=function(){var L,o,O,h,s=this.getAggregation("scale"),t=this.$().find(".sapMSliderTick"),i=this.$().find(".sapMSliderTickmarks").width(),b=(i/t.size())>=this._CONSTANTS.TICKMARKS.MIN_SIZE.SMALL;if(this._bTickmarksLastVisibilityState!==b){t.toggle(b);this._bTickmarksLastVisibilityState=b;}L=this.$().find(".sapMSliderTickLabel").toArray();o=parseFloat(L[1].style.left);O=i*o/100;h=s.getHiddenTickmarksLabels(i,L.length,O,this._CONSTANTS.TICKMARKS.MIN_SIZE.WITH_LABEL);L.forEach(function(e,c){e.style.display=h[c]?"none":"inline-block";});};S.prototype.getDecimalPrecisionOfNumber=function(v){if(Math.floor(v)===v){return 0;}var V=v.toString(),i=V.indexOf("."),b=V.indexOf("e-"),c=b!==-1,d=i!==-1;if(c){var e=+V.slice(b+2);if(d){return e+V.slice(i+1,b).length;}return e;}if(d){return V.length-i-1;}return 0;};S.prototype.toFixed=function(n,d){if(d===undefined){d=this.getDecimalPrecisionOfNumber(n);}if(d>20){d=20;}else if(d<0){d=0;}return n.toFixed(d)+"";};S.prototype.setDomValue=function(n){var d=this.getDomRef();if(!d){return;}var p=Math.max(this._getPercentOfValue(+n),0)+"%",h=this.getDomRef("handle");if(!!this.getName()){this.getDomRef("input").setAttribute("value",n);}if(this.getProgress()){this.getDomRef("progress").style.width=p;}h.style[sap.ui.getCore().getConfiguration().getRTL()?"right":"left"]=p;if(this.getShowAdvancedTooltip()){this._updateAdvancedTooltipDom(n);}if(this.getShowHandleTooltip()&&!this.getShowAdvancedTooltip()){h.title=n;}h.setAttribute("aria-valuenow",n);};S.prototype._updateAdvancedTooltipDom=function(n){var i=this.getInputsAsTooltips(),t=this.getDomRef("TooltipsContainer"),T=i&&this._oInputTooltip?this._oInputTooltip.tooltip:this.getDomRef("Tooltip"),A=sap.ui.getCore().getConfiguration().getRTL()?"right":"left";if(!i){T.innerHTML=n;}else if(i&&T.getValue()!==n){T.setValueState(this._CONSTANTS.INPUT_STATE_NONE);T.setValue(n);T.$("inner").attr("value",n);}t.style[A]=this._getTooltipPosition(n);};S.prototype._getTooltipPosition=function(n){var p=this._getPercentOfValue(+n);if(p<this._fTooltipHalfWidthPercent){return 0+"%";}else if(p>100-this._fTooltipHalfWidthPercent){return(100-this._fTooltipHalfWidthPercent*2)+"%";}else{return p-this._fTooltipHalfWidthPercent+"%";}};S.prototype.getClosestHandleDomRef=function(){return this.getDomRef("handle");};S.prototype._increaseValueBy=function(i){var v,n;if(this.getEnabled()){v=this.getValue();this.setValue(v+(i||1));n=this.getValue();if(v<n){this._fireChangeAndLiveChange({value:n});}}};S.prototype._decreaseValueBy=function(d){var v,n;if(this.getEnabled()){v=this.getValue();this.setValue(v-(d||1));n=this.getValue();if(v>n){this._fireChangeAndLiveChange({value:n});}}};S.prototype._getLongStep=function(){var m=this.getMin(),M=this.getMax(),s=this.getStep(),L=(M-m)/10,i=(M-m)/s;return i>10?L:s;};S.prototype._fireChangeAndLiveChange=function(p){this.fireChange(p);this.fireLiveChange(p);};S.prototype._hasFocus=function(){return document.activeElement===this.getFocusDomRef();};S.prototype._createInputField=function(s,A){var i=new I(this.getId()+"-"+s,{value:this.getMin(),width:this._iLongestRangeTextWidth+(2*this._CONSTANTS.CHARACTER_WIDTH_PX)+"px",type:"Number",textAlign:sap.ui.core.TextAlign.Center,ariaLabelledBy:A});i.attachChange(this._handleInputChange.bind(this,i));i.addEventDelegate({onfocusout:function(e){if(e.target.value!==undefined){e.srcControl.fireChange({value:e.target.value});}}});return i;};S.prototype._handleInputChange=function(i,e){var n=parseFloat(e.getParameter("value"));if(isNaN(n)||n<this.getMin()||n>this.getMax()){i.setValueState(this._CONSTANTS.INPUT_STATE_ERROR);return;}i.setValueState(this._CONSTANTS.INPUT_STATE_NONE);this.setValue(n);i.focus();this._fireChangeAndLiveChange({value:this.getValue()});};S.prototype.init=function(){this._iActiveTouchId=-1;this._bSetValueFirstCall=true;this._iLongestRangeTextWidth=0;this._fTooltipHalfWidthPercent=0;this._oResourceBundle=sap.ui.getCore().getLibraryResourceBundle("sap.m");};S.prototype.exit=function(){if(this._oInputTooltip){this._oInputTooltip.label.destroy();this._oInputTooltip.label=null;this._oInputTooltip.tooltip.destroy();this._oInputTooltip.tooltip=null;this._oInputTooltip=null;}if(this._oResourceBundle){this._oResourceBundle=null;}if(this._parentResizeHandler){sap.ui.core.ResizeHandler.deregister(this._parentResizeHandler);this._parentResizeHandler=null;}};S.prototype.onBeforeRendering=function(){var e=this._validateProperties(),A=[Math.abs(this.getMin()),Math.abs(this.getMax())],r=A[0]>A[1]?0:1;if(!e){this.setValue(this.getValue());this._sProgressValue=Math.max(this._getPercentOfValue(this.getValue()),0)+"%";}if(!this._hasFocus()){this._fInitialFocusValue=this.getValue();}if(this.getShowAdvancedTooltip()){this._iLongestRangeTextWidth=((A[r].toString()).length+this.getDecimalPrecisionOfNumber(this.getStep())+1)*this._CONSTANTS.CHARACTER_WIDTH_PX;}if(this.getInputsAsTooltips()&&!this._oInputTooltip){var s=new a({text:this._oResourceBundle.getText("SLIDER_HANDLE")});this._oInputTooltip={tooltip:this._createInputField("Tooltip",s),label:s};}if(this.getEnableTickmarks()&&!this.getAggregation("scale")){this.setAggregation("scale",new sap.m.ResponsiveScale());}};S.prototype.onAfterRendering=function(){if(this.getShowAdvancedTooltip()){this._recalculateStyles();this._updateAdvancedTooltipDom(this.getValue());}if(this.getEnableTickmarks()){q.sap.delayedCall(0,this,function(){this._parentResizeHandler=sap.ui.core.ResizeHandler.register(this,this._handleTickmarksResponsiveness.bind(this));});}};S.prototype.ontouchstart=function(e){var m=this.getMin(),t=e.targetTouches[0],n,b=this.getRenderer().CSS_CLASS,s="."+b;e.setMarked();if(sap.m.touch.countContained(e.touches,this.getId())>1||!this.getEnabled()||e.button||(e.srcControl!==this)){return;}this._iActiveTouchId=t.identifier;q(document).on("touchend"+s+" touchcancel"+s+" mouseup"+s,this._ontouchend.bind(this)).on(e.originalEvent.type==="touchstart"?"touchmove"+s:"touchmove"+s+" mousemove"+s,this._ontouchmove.bind(this));var N=this.getClosestHandleDomRef();if(t.target!==N){q.sap.delayedCall(0,N,"focus");}if(!this._hasFocus()){this._fInitialFocusValue=this.getValue();}this._recalculateStyles();this._fDiffX=this._fSliderPaddingLeft;this._fInitialValue=this.getValue();this.$("inner").addClass(b+"Pressed");if(t.target===this.getDomRef("handle")){this._fDiffX=(t.pageX-q(N).offset().left)+this._fSliderPaddingLeft-(this._fHandleWidth/2);}else{n=(((t.pageX-this._fSliderPaddingLeft-this._fSliderOffsetLeft)/this._fSliderWidth)*(this.getMax()-m))+m;if(sap.ui.getCore().getConfiguration().getRTL()){n=this._convertValueToRtlMode(n);}this.setValue(n);n=this.getValue();if(this._fInitialValue!==n){this.fireLiveChange({value:n});}}};S.prototype._ontouchmove=function(e){e.setMarked();e.preventDefault();if(e.isMarked("delayedMouseEvent")||!this.getEnabled()||e.button){return;}var m=this.getMin(),v=this.getValue(),t=sap.m.touch.find(e.changedTouches,this._iActiveTouchId),p=t?t.pageX:e.pageX,n=(((p-this._fDiffX-this._fSliderOffsetLeft)/this._fSliderWidth)*(this.getMax()-m))+m;if(sap.ui.getCore().getConfiguration().getRTL()){n=this._convertValueToRtlMode(n);}this.setValue(n);n=this.getValue();if(v!==n){this.fireLiveChange({value:n});}};S.prototype._ontouchend=function(e){var b=this.getRenderer().CSS_CLASS,s="."+b;e.setMarked();if(e.isMarked("delayedMouseEvent")||!this.getEnabled()||e.button){return;}q(document).off(s);var v=this.getValue();this.$("inner").removeClass(b+"Pressed");if(this._fInitialValue!==v){this.fireChange({value:v});}};S.prototype.onfocusin=function(e){this.$("TooltipsContainer").addClass(this.getRenderer().CSS_CLASS+"HandleTooltipsShow");if(!this._hasFocus()){this._fInitialFocusValue=this.getValue();}};S.prototype.onfocusout=function(e){if(this.getInputsAsTooltips()&&q.contains(this.getDomRef(),e.relatedTarget)){return;}this.$("TooltipsContainer").removeClass(this.getRenderer().CSS_CLASS+"HandleTooltipsShow");};S.prototype.onsapincrease=function(e){var v,n;if(e.srcControl!==this){return;}e.preventDefault();e.setMarked();if(this.getEnabled()){v=this.getValue();this.stepUp(1);n=this.getValue();if(v<n){this._fireChangeAndLiveChange({value:n});}}};S.prototype.onsapincreasemodifiers=function(e){if(e.srcControl!==this){return;}e.preventDefault();e.setMarked();this._increaseValueBy(this._getLongStep());};S.prototype.onsapdecrease=function(e){var v,n;if(e.srcControl!==this){return;}e.preventDefault();e.setMarked();if(this.getEnabled()){v=this.getValue();this.stepDown(1);n=this.getValue();if(v>n){this._fireChangeAndLiveChange({value:n});}}};S.prototype.onsapdecreasemodifiers=function(e){if(e.srcControl!==this){return;}e.preventDefault();e.setMarked();this._decreaseValueBy(this._getLongStep());};S.prototype.onsapplus=function(e){var v,n;if(e.srcControl!==this){return;}e.setMarked();if(this.getEnabled()){v=this.getValue();this.stepUp(1);n=this.getValue();if(v<n){this._fireChangeAndLiveChange({value:n});}}};S.prototype.onsapminus=function(e){var v,n;if(e.srcControl!==this){return;}e.setMarked();if(this.getEnabled()){v=this.getValue();this.stepDown(1);n=this.getValue();if(v>n){this._fireChangeAndLiveChange({value:n});}}};S.prototype.onsappageup=S.prototype.onsapincreasemodifiers;S.prototype.onsappagedown=S.prototype.onsapdecreasemodifiers;S.prototype.onsaphome=function(e){if(e.srcControl!==this){return;}e.setMarked();var m=this.getMin();e.preventDefault();if(this.getEnabled()&&this.getValue()>m){this.setValue(m);this._fireChangeAndLiveChange({value:m});}};S.prototype.onsapend=function(e){if(e.srcControl!==this){return;}e.setMarked();var m=this.getMax();e.preventDefault();if(this.getEnabled()&&this.getValue()<m){this.setValue(m);this._fireChangeAndLiveChange({value:m});}};S.prototype.onsaptabnext=function(){this._fInitialFocusValue=this.getValue();};S.prototype.onsaptabprevious=function(){this._fInitialFocusValue=this.getValue();};S.prototype.onsapescape=function(){this.setValue(this._fInitialFocusValue);};S.prototype.getFocusDomRef=function(){return this.getDomRef("handle");};S.prototype.stepUp=function(s){return this.setValue(this.getValue()+(this._validateStep(s)*this.getStep()),{snapValue:false});};S.prototype.stepDown=function(s){return this.setValue(this.getValue()-(this._validateStep(s)*this.getStep()),{snapValue:false});};S.prototype.setValue=function(n,o){if(this._bSetValueFirstCall){this._bSetValueFirstCall=false;return this.setProperty("value",n,true);}var m=this.getMin(),M=this.getMax(),s=this.getStep(),v=this.getValue(),N,b=true,f;if(o){b=!!o.snapValue;}if(typeof n!=="number"||!isFinite(n)){q.sap.log.error("Error:",'"fNewValue" needs to be a finite number on ',this);return this;}f=Math.abs((n-m)%s);if(b&&(f!==0)){n=f*2>=s?n+s-f:n-f;}if(n<m){n=m;}else if(n>M){n=M;}N=this.toFixed(n,this.getDecimalPrecisionOfNumber(s));n=Number(N);this.setProperty("value",n,true);if(v!==this.getValue()){this.setDomValue(N);}return this;};return S;},true);
