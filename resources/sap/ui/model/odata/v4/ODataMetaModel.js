/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/ui/model/BindingMode","sap/ui/model/ContextBinding","sap/ui/model/Context","sap/ui/model/FilterProcessor","sap/ui/model/json/JSONListBinding","sap/ui/model/MetaModel","sap/ui/model/odata/OperationMode","sap/ui/model/PropertyBinding","sap/ui/thirdparty/URI","./lib/_Helper","./lib/_SyncPromise","./ValueListType"],function(q,B,C,a,F,J,M,O,P,U,_,b,V){"use strict";var D=q.sap.log.Level.DEBUG,c,d,o="sap.ui.model.odata.v4.ODataMetaModel",f,r=/\([^/]*|\/-?\d+/g,g=/^-?\d+$/,s={messageChange:true},u={"Edm.Boolean":{type:"sap.ui.model.odata.type.Boolean"},"Edm.Byte":{type:"sap.ui.model.odata.type.Byte"},"Edm.Date":{type:"sap.ui.model.odata.type.Date"},"Edm.DateTimeOffset":{constraints:{"$Precision":"precision"},type:"sap.ui.model.odata.type.DateTimeOffset"},"Edm.Decimal":{constraints:{"@Org.OData.Validation.V1.Minimum":"minimum","@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive":"minimumExclusive","@Org.OData.Validation.V1.Maximum":"maximum","@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive":"maximumExclusive","$Precision":"precision","$Scale":"scale"},type:"sap.ui.model.odata.type.Decimal"},"Edm.Double":{type:"sap.ui.model.odata.type.Double"},"Edm.Guid":{type:"sap.ui.model.odata.type.Guid"},"Edm.Int16":{type:"sap.ui.model.odata.type.Int16"},"Edm.Int32":{type:"sap.ui.model.odata.type.Int32"},"Edm.Int64":{type:"sap.ui.model.odata.type.Int64"},"Edm.SByte":{type:"sap.ui.model.odata.type.SByte"},"Edm.Single":{type:"sap.ui.model.odata.type.Single"},"Edm.String":{constraints:{"@com.sap.vocabularies.Common.v1.IsDigitSequence":"isDigitSequence","$MaxLength":"maxLength"},type:"sap.ui.model.odata.type.String"},"Edm.TimeOfDay":{constraints:{"$Precision":"precision"},type:"sap.ui.model.odata.type.TimeOfDay"}},v="@com.sap.vocabularies.Common.v1.ValueListMapping",m={},h="@com.sap.vocabularies.Common.v1.ValueListReference",j="@com.sap.vocabularies.Common.v1.ValueListWithFixedValues",W=q.sap.log.Level.WARNING;function k(t,e){if(t===e){return"";}if(t.indexOf(e)===0&&t[e.length]==="#"&&t.lastIndexOf("@")<e.length){return t.slice(e.length+1);}}c=C.extend("sap.ui.model.odata.v4.ODataMetaContextBinding",{constructor:function(e,p,i){C.call(this,e,p,i);},initialize:function(){var e=this.oModel.createBindingContext(this.sPath,this.oContext);this.bInitial=false;if(e!==this.oElementContext){this.oElementContext=e;this._fireChange();}},setContext:function(e){if(e!==this.oContext){this.oContext=e;if(!this.bInitial){this.initialize();}}}});d=J.extend("sap.ui.model.odata.v4.ODataMetaListBinding",{applyFilter:function(){var t=this;this.aIndices=F.apply(this.aIndices,this.aFilters.concat(this.aApplicationFilters),function(R,p){return p==="@sapui.name"?R:t.oModel.getProperty(p,t.oList[R]);});this.iLength=this.aIndices.length;},constructor:function(){J.apply(this,arguments);},enableExtendedChangeDetection:function(){throw new Error("Unsupported operation");}});f=P.extend("sap.ui.model.odata.v4.ODataMetaPropertyBinding",{constructor:function(){P.apply(this,arguments);this.vValue=this.oModel.getProperty(this.sPath,this.oContext,this.mParameters);},getValue:function(){return this.vValue;},setValue:function(){throw new Error("Unsupported operation: ODataMetaPropertyBinding#setValue");}});var l=M.extend("sap.ui.model.odata.v4.ODataMetaModel",{constructor:function(R,e,A,i){M.call(this);this.aAnnotationUris=A&&!Array.isArray(A)?[A]:A;this.sDefaultBindingMode=B.OneTime;this.oMetadataPromise=null;this.oModel=i;this.oRequestor=R;this.mSupportedBindingModes={"OneTime":true};this.sUrl=e;}});l.prototype._getObject=function(p,e){var i=false,I=p==="@"||p===""&&e.getPath().slice(-2)==="/@"||p.slice(-2)==="/@",K,n,R;if(I||p==="/"){n=p;}else if(p){n=p+"/";}else{n="./";}R=this.getObject(n,e);for(K in R){if(K[0]==="$"||I===(K[0]!=="@")){if(!i){R=q.extend({},R);i=true;}delete R[K];}}return R;};l.prototype._mergeMetadata=function(e){var R=e[0],t=this;function n(E){if(E.$kind==="Schema"&&E.$Annotations){Object.keys(E.$Annotations).forEach(function(T){if(!R.$Annotations[T]){R.$Annotations[T]=E.$Annotations[T];}else{q.extend(R.$Annotations[T],E.$Annotations[T]);}});delete E.$Annotations;}}R.$Annotations=R.$Annotations||{};Object.keys(R).forEach(function(E){n(R[E]);});e.slice(1).forEach(function(A,i){Object.keys(A).forEach(function(K){var E=A[K];if(E.$kind!==undefined||Array.isArray(E)){if(R[K]){throw new Error("Overwriting '"+K+"' with the value defined in '"+t.aAnnotationUris[i]+"' is not supported");}R[K]=E;n(E);}});});return R;};l.prototype.attachEvent=function(e){if(!(e in s)){throw new Error("Unsupported event '"+e+"': v4.ODataMetaModel#attachEvent");}return M.prototype.attachEvent.apply(this,arguments);};l.prototype.bindContext=function(p,e){return new c(this,p,e);};l.prototype.bindList=function(p,e,S,i){return new d(this,p,e,S,i);};l.prototype.bindProperty=function(p,e,i){return new f(this,p,e,i);};l.prototype.bindTree=function(){throw new Error("Unsupported operation: v4.ODataMetaModel#bindTree");};l.prototype.fetchCanonicalPath=function(n){return this.fetchEntityContainer().then(function(S){var p,E=S[S.$EntityContainer],t,w,x,y,z=n.getPath().split("/");function A(e,i){var L=n.getPath();if(i&&i!==L){e=e+" at "+i;}q.sap.log.error(e,L,o);throw new Error(L+": "+e);}function G(L){if(w.$kind==="Singleton"){return b.resolve(t);}return H(L).then(function(e){return t+e;});}function H(L){var e=z.slice(0,L).join("/");return n.fetchAbsoluteValue(e).then(function(i){return I(i,e);});}function I(i,L){try{return _.getKeyPredicate(x,i);}catch(e){A(e.message,L);}}function K(i){var N,e,L;if(i===z.length){if(p){return"/"+p;}if(w.$kind==="Singleton"){return"/"+t;}return n.fetchValue("").then(function(Q){return"/"+t+I(Q);});}L=z[i];if(g.test(L)){if(!w){return H(i+1).then(function(Q){p+=Q;return K(i+1);});}return K(i+1);}y=L.indexOf("(");e=decodeURIComponent(y>0?L.slice(0,y):L);N=x[e];if(!N||N.$kind!=="NavigationProperty"){A("Not a navigation property: "+e);}if(!w||(p&&N.$ContainsTarget)){p+="/"+L;x=S[N.$Type];w=undefined;return K(i+1);}if(N.$ContainsTarget){return G(i).then(function(Q){p=Q+"/"+L;w=undefined;x=S[N.$Type];return K(i+1);});}t=w.$NavigationPropertyBinding[e];w=E[t];x=S[N.$Type];t=encodeURIComponent(t);p=y>0?t+L.slice(y):undefined;return K(i+1);}y=z[1].indexOf("(");if(y>0){p=z[1];t=p.slice(0,y);}else{t=z[1];}w=E[decodeURIComponent(t)];x=S[w.$Type];return K(2);});};l.prototype.fetchEntityContainer=function(){var p,t=this;if(!this.oMetadataPromise){p=[b.resolve(this.oRequestor.read(this.sUrl))];if(this.aAnnotationUris){this.aAnnotationUris.forEach(function(A){p.push(b.resolve(t.oRequestor.read(A,true)));});}this.oMetadataPromise=b.all(p).then(function(e){return t._mergeMetadata(e);});}return this.oMetadataPromise;};l.prototype.fetchObject=function(p,n,t){var R=this.resolve(p,n),w=this;if(!R){q.sap.log.error("Invalid relative path w/o context",p,o);return b.resolve(null);}return this.fetchEntityContainer().then(function(S){var L,N,x=true,y,z,T,A=S;function E(i,p){var Q,X=i.indexOf("@",2);if(X>-1){return G(W,"Unsupported path after ",i.slice(0,X));}i=i.slice(2);Q=i[0]==="."?q.sap.getObject(i.slice(1),undefined,t.scope):q.sap.getObject(i);if(typeof Q!=="function"){return G(W,i," is not a function but: "+Q);}try{A=Q(A,{context:new a(w,p),schemaChildName:z});}catch(e){G(W,"Error calling ",i,": ",e);}return false;}function G(i){var e;if(q.sap.log.isLoggable(i,o)){e=Array.isArray(L)?L.join("/"):L;q.sap.log[i===D?"debug":"warning"](Array.prototype.slice.call(arguments,1).join("")+(e?" at /"+e:""),R,o);}A=undefined;return false;}function H(Q,e){if(!(Q in S)){L=L||T&&T+"/"+e;return G(W,"Unknown qualified name '",Q,"'");}T=N=z=Q;A=y=S[z];return true;}function I(e,i,Q){var X,Y;if(e==="$Annotations"){return G(W,"Invalid segment: $Annotations");}if(A!==S&&typeof A==="object"&&e in A){if(e[0]==="$"||g.test(e)){x=false;}}else{X=e.indexOf("@@");if(X<0){if(e.length>11&&e.slice(-11)==="@sapui.name"){X=e.length-11;}else{X=e.indexOf("@");}}if(X>0){if(!I(e.slice(0,X),i,Q)){return false;}e=e.slice(X);Y=true;}if(typeof A==="string"&&!(Y&&e[0]==="@"&&(e==="@sapui.name"||e[1]==="@"))&&!K(A,Q.slice(0,i))){return false;}if(x){if(e[0]==="$"||g.test(e)){x=false;}else if(!Y){if(e[0]!=="@"&&e.indexOf(".")>0){return H(e);}else if(A&&"$Type"in A){if(!H(A.$Type,"$Type")){return false;}}else if(A&&"$Action"in A){if(!H(A.$Action,"$Action")){return false;}}else if(A&&"$Function"in A){if(!H(A.$Function,"$Function")){return false;}}else if(i===0){T=N=z=z||S.$EntityContainer;A=y=y||S[z];if(e&&e[0]!=="@"&&!(e in y)){return G(W,"Unknown child '",e,"' of '",z,"'");}}if(Array.isArray(A)){if(A.length!==1){return G(W,"Unsupported overloads");}A=A[0].$ReturnType;T=T+"/0/$ReturnType";if(A){if(e==="value"&&!(S[A.$Type]&&S[A.$Type].value)){N=undefined;return true;}if(!H(A.$Type,"$Type")){return false;}}}}}if(!e){return i+1>=Q.length||G(W,"Invalid empty segment");}if(e[0]==="@"){if(e==="@sapui.name"){A=N;if(A===undefined){G(W,"Unsupported path before @sapui.name");}else if(i+1<Q.length){G(W,"Unsupported path after @sapui.name");}return false;}if(e[1]==="@"){if(i+1<Q.length){return G(W,"Unsupported path after ",e);}return E(e,"/"+Q.slice(0,i).join("/")+"/"+Q[i].slice(0,X));}}if(!A||typeof A!=="object"){return G(D,"Invalid segment: ",e);}if(x&&e[0]==="@"){A=(S.$Annotations||{})[T]||{};x=false;}}if(e!=="@"){N=x||e[0]==="@"?e:undefined;T=x?T+"/"+e:undefined;A=A[e];}return true;}function K(e,i){var Q;if(L){return G(W,"Invalid recursion");}L=i;x=true;A=S;Q=e.split("/").every(I);L=undefined;return Q;}K(R.slice(1));return A;});};l.prototype.fetchUI5Type=function(p){var e=this.getMetaContext(p),t=this;return this.fetchObject(undefined,e).then(function(i){var n,N,T=i["$ui5.type"],w,x="sap.ui.model.odata.type.Raw";function y(K,z){if(z!==undefined){n=n||{};n[K]=z;}}if(T){return T;}if(i.$isCollection){q.sap.log.warning("Unsupported collection type, using "+x,p,o);}else{w=u[i.$Type];if(w){x=w.type;for(N in w.constraints){y(w.constraints[N],N[0]==="@"?t.getObject(N,e):i[N]);}if(i.$Nullable===false){y("nullable",false);}}else{q.sap.log.warning("Unsupported type '"+i.$Type+"', using "+x,p,o);}}T=new(q.sap.getObject(x,0))(undefined,n);i["$ui5.type"]=T;return T;});};l.prototype.getMetaContext=function(p){return new a(this,p.replace(r,""));};l.prototype.getOrCreateValueListModel=function(e){var i,n;n=new U(e).absoluteTo(this.sUrl).filename("").toString();i=m[n];if(!i){i=new this.oModel.constructor({operationMode:O.Server,serviceUrl:n,synchronizationMode:"None"});i.setDefaultBindingMode(B.OneWay);m[n]=i;i.oRequestor.mHeaders["X-CSRF-Token"]=this.oModel.oRequestor.mHeaders["X-CSRF-Token"];}return i;};l.prototype.getOriginalProperty=function(){throw new Error("Unsupported operation: v4.ODataMetaModel#getOriginalProperty");};l.prototype.getObject=b.createGetMethod("fetchObject");l.prototype.getProperty=l.prototype.getObject;l.prototype.getUI5Type=b.createGetMethod("fetchUI5Type",true);l.prototype.getValueListType=function(p){var e=this.getMetaContext(p),i,t=this;i=this.fetchObject("",e).then(function(n){var A,T;if(!n){throw new Error("No metadata for "+p);}A=t.getObject("@",e);if(A[j]){return V.Fixed;}for(T in A){if(k(T,h)!==undefined){return V.Standard;}}return V.None;});if(i.isRejected()){throw i.getResult();}if(!i.isFulfilled()){throw new Error("Metadata not yet loaded");}return i.getResult();};l.prototype.isList=function(){throw new Error("Unsupported operation: v4.ODataMetaModel#isList");};l.prototype.refresh=function(){throw new Error("Unsupported operation: v4.ODataMetaModel#refresh");};l.prototype.requestObject=b.createRequestMethod("fetchObject");l.prototype.requestUI5Type=b.createRequestMethod("fetchUI5Type");l.prototype.requestValueListInfo=function(p){var e=this.getMetaContext(p),t=this;function n(N){var i=N.indexOf("/");if(i>=0){N=N.slice(0,i);}return N.slice(0,N.lastIndexOf("."));}return Promise.all([this.requestObject("/$EntityContainer"),this.requestObject("",e),this.requestObject("@",e)]).then(function(R){var A=R[2],i={},N=n(R[0]),w,x=R[1],y={};if(!x){throw new Error("No metadata for "+p);}w=Object.keys(A).filter(function(T){return k(T,h)!==undefined;}).map(function(T){var z=A[T],E=t.getOrCreateValueListModel(z.MappingUrl),G=E.getMetaModel();return G.fetchEntityContainer().then(function(H){var I=H.$Annotations;Object.keys(I).filter(function(K){if(n(K)===N){if(t.getObject("/"+K)===x){return true;}if(t!==G){throw new Error("Unexpected annotation target in value list metadata: "+K);}}return false;}).forEach(function(K){var A=I[K];Object.keys(A).forEach(function(T){var L=k(T,v);if(L!==undefined){if(y[L]){throw new Error("Duplicate qualifier '"+L+"' for "+p+" in "+i[L]+" and "+z.MappingUrl);}y[L]=q.extend(true,{$model:E},A[T]);i[L]=z.MappingUrl;}else if(t!==G){throw new Error("Unexpected annotation term in value list metadata: "+K+T);}});});});});if(!w.length){throw new Error("No value list info for "+p);}return Promise.all(w).then(function(){return y;});});};l.prototype.resolve=function(p,e){var i,n;if(!p){return e?e.getPath():undefined;}n=p[0];if(n==="/"){return p;}if(!e){return undefined;}if(n==="."){if(p[1]!=="/"){throw new Error("Unsupported relative path: "+p);}p=p.slice(2);}i=e.getPath();return n==="@"||i.slice(-1)==="/"?i+p:i+"/"+p;};l.prototype.setLegacySyntax=function(){throw new Error("Unsupported operation: v4.ODataMetaModel#setLegacySyntax");};l.prototype.toString=function(){return o+": "+this.sUrl;};return l;},true);