/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define('sap/ui/comp/smartmicrochart/SmartMicroChartCommons',['jquery.sap.global','sap/ui/comp/library','sap/ui/comp/providers/ChartProvider','sap/m/ValueColor','sap/ui/core/format/NumberFormat','sap/ui/core/format/DateFormat','sap/ui/model/type/Date'],function(q,l,C,V,N,D,a){"use strict";var b={};b._MINIMIZE="com.sap.vocabularies.UI.v1.ImprovementDirectionType/Minimize";b._MAXIMIZE="com.sap.vocabularies.UI.v1.ImprovementDirectionType/Maximize";b._TARGET="com.sap.vocabularies.UI.v1.ImprovementDirectionType/Target";b._initializeMetadata=function(){if(!this._bIsInitialized){var m=this.getModel();if(m&&(m instanceof sap.ui.model.odata.v2.ODataModel||m instanceof sap.ui.model.odata.ODataModel)){if(!this._bMetaModelLoadAttached){m.getMetaModel().loaded().then(b._onMetadataInitialized.bind(this));this._bMetaModelLoadAttached=true;}}else if(m){b._onMetadataInitialized.call(this);}}};b._onMetadataInitialized=function(){this._bMetaModelLoadAttached=false;if(this._bIsInitialized){return;}b._createChartProvider.call(this);this._oChartViewMetadata=this._oChartProvider.getChartViewMetadata();this._oDataPointMetadata=this._oChartProvider.getChartDataPointMetadata();this._bIsInitialized=true;this.fireInitialize();if(this.getEnableAutoBinding()){if(this.getChartBindingPath()){this.bindElement(this.getChartBindingPath());}else{q.sap.log.error("The property chartBindingPath needs to be set in order for property enableAutoBinding to be applied.");}}if(b._checkChartMetadata.call(this)){var Q=b._getDataPointQualifier.call(this);if(Q){this._oDataPointAnnotations=this._oDataPointMetadata.additionalAnnotations[Q];}else{this._oDataPointAnnotations=this._oDataPointMetadata.primaryAnnotation;}if(b._checkDataPointAnnotation(this._oDataPointAnnotations)){this._createAndBindInnerChart();}}else{q.sap.log.error("Created annotations not valid. Please review the annotations and metadata.");}};b._cleanup=function(){if(this._oDateType){this._oDateType.destroy();this._oDateType=null;}};b._createChartProvider=function(){var m,e;e=this.getEntitySet();m=this.getModel();if(m&&e){this._oChartProvider=new C({entitySet:e,model:m,chartQualifier:this.data("chartQualifier")});}else{q.sap.log.error("Property entitySet is not set or no model has been attached to the control.");}};b._checkChartMetadata=function(){if(q.isEmptyObject(this._oChartViewMetadata)&&q.isEmptyObject(this._oDataPointMetadata)){q.sap.log.error("The Chart or DataPoint annotation is empty.");return false;}if(!this._oChartViewMetadata.fields||this._oChartViewMetadata.fields.length===0){q.sap.log.error("No fields exist in the metadata.");return false;}if(b._hasMember(this,"_oChartViewMetadata.annotation.ChartType")){var c=this.getChartType();if(this._oChartViewMetadata.annotation.ChartType.EnumMember==="com.sap.vocabularies.UI.v1.ChartType/"+c){return true;}else{q.sap.log.error("The ChartType property in the Chart annotation is not \""+c+"\".");return false;}}else{q.sap.log.error("The Chart annotation is invalid.");return false;}};b._getDataPointQualifier=function(){var m;if(!b._hasMember(this,"_oChartViewMetadata.annotation.MeasureAttributes.length")||!this._oChartViewMetadata.annotation.MeasureAttributes.length){return"";}m=this._oChartViewMetadata.annotation.MeasureAttributes[0];if(b._hasMember(m,"DataPoint.AnnotationPath")){return(m.DataPoint.AnnotationPath.match(/\#([^\#]*)$/)||[])[1]||"";}};b._checkDataPointAnnotation=function(d){if(q.isEmptyObject(d)){q.sap.log.error("The DataPoint annotation is empty. Please check it!");return false;}if(b._hasMember(d,"Value.Path")){if(q.isEmptyObject(d.Criticality)){b._checkCriticalityMetadata(d.CriticalityCalculation);}return true;}else{q.sap.log.error("The Value property does not exist in the DataPoint annotation. This property is essential for creating the smart chart.");return false;}};b._checkCriticalityMetadata=function(c){if(q.isEmptyObject(c)){q.sap.log.warning("The CriticalityCalculation property in DataPoint annotation is not provided.");return false;}if(b._hasMember(c,"ImprovementDirection.EnumMember")){var i=c.ImprovementDirection.EnumMember;switch(i){case b._MINIMIZE:return b._checkCriticalityMetadataForMinimize(c);case b._MAXIMIZE:return b._checkCriticalityMetadataForMaximize(c);case b._TARGET:return b._checkCriticalityMetadataForTarget(c);default:q.sap.log.warning("The improvement direction in DataPoint annotation must be either Minimize, Maximize or Target.");}}else{q.sap.log.warning("The ImprovementDirection property in DataPoint annotation is not provided.");}return false;};b._checkCriticalityMetadataForMinimize=function(c){if(!b._hasMember(c,"ToleranceRangeHighValue.Path")){q.sap.log.warning("The ToleranceRangeHighValue property in DataPoint annotation is missing for Minimize improvement direction.");return false;}if(!b._hasMember(c,"DeviationRangeHighValue.Path")){q.sap.log.warning("The DeviationRangeHighValue property in DataPoint annotation is missing for Minimize improvement direction.");return false;}return true;};b._checkCriticalityMetadataForMaximize=function(c){if(!b._hasMember(c,"ToleranceRangeLowValue.Path")){q.sap.log.warning("The ToleranceRangeLowValue property in DataPoint annotation is missing for Minimize improvement direction.");return false;}if(!b._hasMember(c,"DeviationRangeLowValue.Path")){q.sap.log.warning("The DeviationRangeLowValue property in DataPoint annotation is missing for Minimize improvement direction.");return false;}return true;};b._checkCriticalityMetadataForTarget=function(c){if(!b._hasMember(c,"ToleranceRangeLowValue.Path")){q.sap.log.warning("The DeviationRangeLowValue property in DataPoint annotation is missing for Target improvement direction.");return false;}if(!b._hasMember(c,"ToleranceRangeHighValue.Path")){q.sap.log.warning("The ToleranceRangeHighValue property in DataPoint annotation is missing for Target improvement direction.");return false;}if(!b._hasMember(c,"DeviationRangeLowValue.Path")){q.sap.log.warning("The ToleranceRangeLowValue property in DataPoint annotation is missing for Target improvement direction.");return false;}if(!b._hasMember(c,"DeviationRangeHighValue.Path")){q.sap.log.warning("The DeviationRangeHighValue property in DataPoint annotation is missing for Target improvement direction.");return false;}return true;};b._mapCriticalityTypeWithColor=function(t){var T;if(!t){return V.Neutral;}else{T=t.toString();}T=(T.match(/(?:CriticalityType\/)?([^\/]*)$/)||[])[1]||"";switch(T){case'Negative':case'1':return V.Error;case'Critical':case'2':return V.Critical;case'Positive':case'3':return V.Good;default:return V.Neutral;}};b._getThresholdValues=function(c){var t={},o=this.getBindingContext();for(var k in c){if(c.hasOwnProperty(k)&&k!=="ImprovementDirection"){t[k]=c[k].Path&&o&&o.getProperty(c[k].Path)||c[k].Decimal||0;}}return t;};b._getValueColorForMinimize=function(v,t,d){if(v<=t){return b._mapCriticalityTypeWithColor("Positive");}else if(v>t&&v<=d){return b._mapCriticalityTypeWithColor("Critical");}else if(v>d){return b._mapCriticalityTypeWithColor("Negative");}};b._getValueColorForMaximize=function(v,t,d){if(v>=t){return b._mapCriticalityTypeWithColor("Positive");}else if(v<t&&v>=d){return b._mapCriticalityTypeWithColor("Critical");}else if(v<d){return b._mapCriticalityTypeWithColor("Negative");}};b._getValueColorForTarget=function(v,t,d,T,i){if(v>=t&&v<=T){return b._mapCriticalityTypeWithColor("Positive");}else if((v>=d&&v<t)||(v>T&&v<=i)){return b._mapCriticalityTypeWithColor("Critical");}else if(v<d||v>i){return b._mapCriticalityTypeWithColor("Negative");}};b._getValueColor=function(v,c){var o=this._oDataPointAnnotations.CriticalityCalculation,t,s;v=parseFloat(v)||0;if(typeof c==="string"){s=b._mapCriticalityTypeWithColor(c);}else if(o&&typeof v!=="undefined"&&v!==null){t=b._getThresholdValues.call(this,o);s=b._criticalityCalculation(v,o.ImprovementDirection.EnumMember,t);}return s||b._mapCriticalityTypeWithColor();};b._getTopLabelColor=function(v,d){var c=this._oDataPointAnnotations.CriticalityCalculation,i=parseFloat(v)||0,t={},s;for(var k in c){if(c.hasOwnProperty(k)&&k!=="ImprovementDirection"){t[k]=d[c[k].Path];}}if(c&&typeof i!=="undefined"&&i!==null){s=b._criticalityCalculation(i,c.ImprovementDirection.EnumMember,t);}return s;};b._criticalityCalculation=function(v,i,t){var c;switch(i){case b._MINIMIZE:c=b._getValueColorForMinimize(v,t.ToleranceRangeHighValue,t.DeviationRangeHighValue);break;case b._MAXIMIZE:c=b._getValueColorForMaximize(v,t.ToleranceRangeLowValue,t.DeviationRangeLowValue);break;case b._TARGET:c=b._getValueColorForTarget(v,t.ToleranceRangeLowValue,t.DeviationRangeLowValue,t.ToleranceRangeHighValue,t.DeviationRangeHighValue);break;default:q.sap.log.warning("The improvement direction in DataPoint annotation must be either Minimize, Maximize or Target.");}return c;};b._ASSOCIATIONS=["chartTitle","chartDescription","unitOfMeasure","freeText"];b._ASSOCIATIONS_ANNOTATIONS_MAP={"chartDescription":"Description","chartTitle":"Title","unitOfMeasure":{propertyAnnotationPath:"Value",propertyAnnotationProperties:["ISOCurrency","Unit"]},"freeText":{propertyAnnotationPath:"Value",propertyAnnotationProperties:["Label"]}};b._getAnnotation=function(c){var A=b._ASSOCIATIONS_ANNOTATIONS_MAP[c];if(!A){q.sap.log.warning("No annotation connected to association \""+c+"\".");return{};}if(!q.isEmptyObject(this._oChartViewMetadata)&&typeof A==="string"){return this._oChartViewMetadata.annotation[A];}if(!q.isEmptyObject(this._oDataPointAnnotations)&&b._hasMember(A,"propertyAnnotationPath")&&b._hasMember(A,"propertyAnnotationProperties")){var p;if(b._hasMember(this._oDataPointAnnotations,A.propertyAnnotationPath+".Path")){p=b._getPropertyAnnotation.call(this,this._oDataPointAnnotations[A.propertyAnnotationPath].Path);}if(p){return b._getValueFromPropertyAnnotation(p,A.propertyAnnotationProperties);}}return{};};b._getValueFromPropertyAnnotation=function(p,P){for(var s in p){for(var i=0;i<P.length;i++){if(s.indexOf(P[i])>-1){return p[s];}}}return{};};b._updateAssociation=function(c,d){var A,o;if(this.getMetadata().hasAssociation(c)){A=sap.ui.getCore().byId(this.getAssociation(c));if(A&&A.getMetadata().hasProperty("text")){o=b._getAnnotation.call(this,c);b._setAssociationText(A,o,d);}}};b._updateAssociations=function(d){var n=b._ASSOCIATIONS.length;for(var i=0;i<n;i++){b._updateAssociation.call(this,b._ASSOCIATIONS[i],d);}};b._updateChartLabels=function(d,p){switch(p){case"first":b._updateTopLabel.call(this,this._getLabelsMap()["leftTop"],d);b._updateBottomLabel.call(this,this._getLabelsMap()["leftBottom"],d);break;case"last":b._updateTopLabel.call(this,this._getLabelsMap()["rightTop"],d);b._updateBottomLabel.call(this,this._getLabelsMap()["rightBottom"],d);break;}};b._updateTopLabel=function(c,d){var L=this.getAggregation("_chart").getAggregation(c),v=d[this._oDataPointAnnotations.Value.Path],s=b._getTopLabelColor.call(this,v,d),f=b._getLabelNumberFormatter.call(this,this._oDataPointAnnotations.Value.Path),F;F=f.format(v);L.setProperty("label",F,true);L.setProperty("color",s,true);};b._updateBottomLabel=function(c,d){var A,o,L,v,f;A=this._oChartViewMetadata.dimensionFields[0];if(A){v=d[A];L=this.getAggregation("_chart").getAggregation(c);o=b._getPropertyAnnotation.call(this,this._oChartViewMetadata.dimensionFields[0]);if(o.hasOwnProperty("sap:text")||o.hasOwnProperty("com.sap.vocabularies.Common.v1.Text")){var p=o["sap:text"]||o["com.sap.vocabularies.Common.v1.Text"].Path;f=d[p];}else{f=b._formatBottomLabel.call(this,v,o);}if(f){L.setProperty("label",f,true);}}};b._formatBottomLabel=function(v,c){var p=b._getSemanticsPattern.call(this,c);if(p){return b._formatSemanticsValue.call(this,v,p);}p=b._getCalendarPattern.call(this,c);if(p){return b._formatSemanticsValue.call(this,v,p);}return b._formatDateAndNumberValue.call(this,v);};b._formatSemanticsValue=function(v,p){if(p){if(this._oDateType){this._oDateType.setFormatOptions({style:"short",source:{pattern:p}});}else{this._oDateType=new a({style:"short",source:{pattern:p}});}return this._oDateType.formatValue(v,"string");}return null;};b._formatDateAndNumberValue=function(v){if(v instanceof Date){return b._getLabelDateFormatter.call(this).format(v);}else if(!isNaN(v)){return b._getLabelNumberFormatter.call(this,this._oChartViewMetadata.dimensionFields[0]).format(v);}else{return null;}};b._getSemanticsPattern=function(c){if(c.hasOwnProperty("sap:semantics")){switch(c['sap:semantics']){case"yearmonthday":return"yyyyMMdd";case"yearmonth":return"yyyyMM";case"year":return"yyyy";default:return null;}}return null;};b._CALENDAR_TERMS_PATTERNS={"com.sap.vocabularies.Common.v1.IsCalendarYear":"yyyy","com.sap.vocabularies.Common.v1.IsCalendarQuarter":"Q","com.sap.vocabularies.Common.v1.IsCalendarMonth":"MM","com.sap.vocabularies.Common.v1.IsCalendarWeek":"ww","com.sap.vocabularies.Common.v1.IsCalendarDate":"yyyyMMdd","com.sap.vocabularies.Common.v1.IsCalendarYearMonth":"yyyyMM"};b._getCalendarPattern=function(c){for(var s in b._CALENDAR_TERMS_PATTERNS){if(c.hasOwnProperty(s)){return b._CALENDAR_TERMS_PATTERNS[s];}}return null;};b._getLabelNumberFormatter=function(p){var P=b._getPropertyAnnotation.call(this,p).precision||null;return N.getInstance({style:"short",showScale:true,precision:P});};b._getLabelDateFormatter=function(){return D.getInstance({style:"short"});};b._setAssociationText=function(c,d,e){if(!d){return;}if(d.Path&&e){c.setProperty("text",e[d.Path],false);}else if(d.Path){c.bindProperty("text",{path:d.Path});c.invalidate();}else if(d.String){if(d.String.indexOf("{")===0){var p=d.String.split(">");c.bindProperty("text",{path:p[1].substr(0,p[1].length-1),model:p[0].substr(1)});c.invalidate();}else{c.setProperty("text",d.String,false);}}};b._getPropertyAnnotation=function(p){var m,e,E,P;m=this.getModel().getMetaModel();e=this._oChartProvider._oMetadataAnalyser.getEntityTypeNameFromEntitySetName(this.getEntitySet());E=m.getODataEntityType(e);P=m.getODataProperty(E,p);return P;};b._hasMember=function(o,p){var d=".",P=p.split(d),m=P.shift();return!!o&&((P.length>0)?b._hasMember(o[m],P.join(d)):o.hasOwnProperty(m));};return b;},true);
