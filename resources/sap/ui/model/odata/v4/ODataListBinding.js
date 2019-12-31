/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/ui/model/Binding","sap/ui/model/ChangeReason","sap/ui/model/FilterOperator","sap/ui/model/FilterType","sap/ui/model/ListBinding","sap/ui/model/Sorter","sap/ui/model/odata/OperationMode","./Context","./lib/_Cache","./lib/_Helper","./lib/_SyncPromise","./ODataParentBinding"],function(q,B,C,F,a,L,S,O,b,_,c,d,e){"use strict";var s="sap.ui.model.odata.v4.ODataListBinding",m={change:true,dataReceived:true,dataRequested:true,refresh:true};var f=L.extend("sap.ui.model.odata.v4.ODataListBinding",{constructor:function(M,p,o,v,g,P){L.call(this,M,p);if(p.slice(-1)==="/"){throw new Error("Invalid path: "+p);}this.aApplicationFilters=c.toArray(g);this.oCachePromise=d.resolve();this.sChangeReason=undefined;this.oDiff=undefined;this.aFilters=[];this.mPreviousContextsByPath={};this.aPreviousData=[];this.sRefreshGroupId=undefined;this.aSorters=c.toArray(v);this.applyParameters(q.extend(true,{},P));this.setContext(o);M.bindingCreated(this);}});e(f.prototype);f.prototype._delete=function(g,E,o){var t=this;if(!o.isTransient()&&this.hasPendingChanges()){throw new Error("Cannot delete due to pending changes");}return this.deleteFromCache(g,E,String(o.iIndex),function(I){var i,n;if(I===-1){o.destroy();delete t.aContexts[-1];}else{for(i=I;i<t.aContexts.length;i+=1){o=t.aContexts[i];n=t.aContexts[i+1];if(o&&!n){t.mPreviousContextsByPath[o.getPath()]=o;delete t.aContexts[i];}else if(!o&&n){t.aContexts[i]=b.create(t.oModel,t,t.sPath+"/"+i,i);}else{o.checkUpdate();}}t.aContexts.pop();}t.iMaxLength-=1;t._fireChange({reason:C.Remove});});};f.prototype.applyParameters=function(p,g){var o=this.oModel.buildBindingParameters(p,["$$groupId","$$operationMode","$$updateGroupId"]),h;h=o.$$operationMode||this.oModel.sOperationMode;if(!h&&(this.aSorters.length||this.aApplicationFilters.length)){throw new Error("Unsupported operation mode: "+h);}this.sOperationMode=h;this.sGroupId=o.$$groupId;this.sUpdateGroupId=o.$$updateGroupId;this.mQueryOptions=this.oModel.buildQueryOptions(undefined,p,true);this.mParameters=p;this.mCacheByContext=undefined;this.oCachePromise=this.makeCache(this.oContext);this.reset(g);};f.prototype.attachEvent=function(E){if(!(E in m)){throw new Error("Unsupported event '"+E+"': v4.ODataListBinding#attachEvent");}return L.prototype.attachEvent.apply(this,arguments);};f.prototype.buildOrderbyOption=function(g,o){var h=[],t=this;g.forEach(function(i){if(i instanceof S){h.push(i.sPath+(i.bDescending?" desc":""));}else{throw new Error("Unsupported sorter: "+i+" - "+t);}});if(o){h.push(o);}return h.join(',');};f.prototype.checkUpdate=function(){var t=this;function u(){t._fireChange({reason:C.Change});t.oModel.getDependentBindings(t).forEach(function(D){D.checkUpdate();});}if(arguments.length>0){throw new Error("Unsupported operation: v4.ODataListBinding#checkUpdate "+"must not be called with parameters");}this.oCachePromise.then(function(o){if(o&&t.bRelative&&t.oContext.fetchCanonicalPath){t.oContext.fetchCanonicalPath().then(function(g){if(o.$canonicalPath!==g){t.refreshInternal();}else{u();}})["catch"](function(E){t.oModel.reportError("Failed to update "+t,s,E);});}else{u();}});};f.prototype.create=function(i){var o=this.oCachePromise.getResult(),g,h,r,t=this;if(this.aContexts[-1]){throw new Error("Must not create twice");}if(!o||!this.oCachePromise.isFulfilled()){throw new Error("Create on this binding is not supported");}r=this.oModel.resolve(this.sPath,this.oContext);h=r.slice(1);g=b.create(this.oModel,this,r+"/-1",-1,o.create(this.getUpdateGroupId(),h,"",i,function(){g.destroy();delete t.aContexts[-1];t._fireChange({reason:C.Remove});},function(E){t.oModel.reportError("POST on '"+h+"' failed; will be repeated automatically",s,E);}));this.aContexts[-1]=g;g.created().then(function(){t.iMaxLength+=1;});this._fireChange({reason:C.Add});return g;};f.prototype.createContexts=function(r,R,g){var h=false,o=this.oContext,i,l=this.bLengthFinal,M=this.oModel,p=M.resolve(this.sPath,o),P,t=this;for(i=r.start;i<r.start+R;i+=1){if(this.aContexts[i]===undefined){h=true;P=p+"/"+i;if(P in this.mPreviousContextsByPath){this.aContexts[i]=this.mPreviousContextsByPath[P];delete this.mPreviousContextsByPath[P];this.aContexts[i].checkUpdate();}else{this.aContexts[i]=b.create(M,this,P,i);}}}if(Object.keys(this.mPreviousContextsByPath).length){sap.ui.getCore().addPrerenderingTask(function(){Object.keys(t.mPreviousContextsByPath).forEach(function(p){t.mPreviousContextsByPath[p].destroy();delete t.mPreviousContextsByPath[p];});});}if(g!==undefined){if(this.aContexts.length>g){this.aContexts.length=g;}this.iMaxLength=g;this.bLengthFinal=true;}else{if(this.aContexts.length>this.iMaxLength){this.iMaxLength=Infinity;}if(R<r.length){this.iMaxLength=r.start+R;if(this.aContexts.length>this.iMaxLength){this.aContexts.length=this.iMaxLength;}}this.bLengthFinal=this.aContexts.length===this.iMaxLength;}if(this.bLengthFinal!==l){h=true;}return h;};f.prototype.deleteFromCache=function(g,E,p,h){var o=this.oCachePromise.getResult();if(!this.oCachePromise.isFulfilled()){throw new Error("DELETE request not allowed");}if(o){g=g||this.getUpdateGroupId();if(g!=="$auto"&&g!=="$direct"){throw new Error("Illegal update group ID: "+g);}return o._delete(g,E,p,h);}return this.oContext.getBinding().deleteFromCache(g,E,c.buildPath(this.oContext.iIndex,this.sPath,p),h);};f.prototype.deregisterChange=function(p,l,i){var o=this.oCachePromise.getResult();if(!this.oCachePromise.isFulfilled()){return;}if(o){o.deregisterChange(c.buildPath(i,p),l);}else if(this.oContext){this.oContext.deregisterChange(c.buildPath(this.sPath,i,p),l);}};f.prototype.destroy=function(){this.aContexts.forEach(function(o){o.destroy();});if(this.aContexts[-1]){this.aContexts[-1].destroy();}this.oModel.bindingDestroyed(this);this.oCachePromise=undefined;L.prototype.destroy.apply(this);};f.prototype.enableExtendedChangeDetection=function(D,k){if(k!==undefined){throw new Error("Unsupported property 'key' with value '"+k+"' in binding info for "+this);}return L.prototype.enableExtendedChangeDetection.apply(this,arguments);};f.prototype.fetchAbsoluteValue=function(p){var t=this;return this.oCachePromise.then(function(o){var i,P,r;if(o){r=t.oModel.resolve(t.sPath,t.oContext)+"/";if(p.lastIndexOf(r)===0){p=p.slice(r.length);i=parseInt(p,10);P=p.indexOf("/");p=P>0?p.slice(P+1):"";return t.fetchValue(p,undefined,i);}}if(t.oContext&&t.oContext.fetchAbsoluteValue){return t.oContext.fetchAbsoluteValue(p);}});};f.prototype.fetchFilter=function(o,A,g,h){var n=[],t=this;function i(p,r){var u=p.join(r);return p.length>1?"("+u+")":u;}function j(p,E){var r,v=c.formatLiteral(p.oValue1,E),u=decodeURIComponent(p.sPath);switch(p.sOperator){case F.BT:r=u+" ge "+v+" and "+u+" le "+c.formatLiteral(p.oValue2,E);break;case F.EQ:case F.GE:case F.GT:case F.LE:case F.LT:case F.NE:r=u+" "+p.sOperator.toLowerCase()+" "+v;break;case F.Contains:case F.EndsWith:case F.StartsWith:r=p.sOperator.toLowerCase()+"("+u+","+v+")";break;default:throw new Error("Unsupported operator: "+p.sOperator);}return r;}function k(p,r){var u=[],v={};p.forEach(function(w){v[w.sPath]=v[w.sPath]||[];v[w.sPath].push(w);});p.forEach(function(w){var x;if(w.aFilters){u.push(k(w.aFilters,w.bAnd).then(function(y){return"("+y+")";}));return;}x=v[w.sPath];if(!x){return;}delete v[w.sPath];u.push(l(x));});return d.all(u).then(function(w){return w.join(r?" and ":" or ");});}function l(G){var M=t.oModel.oMetaModel,p=M.getMetaContext(t.oModel.resolve(t.sPath,o)),P=M.fetchObject(G[0].sPath,p);return P.then(function(r){var u;if(!r){throw new Error("Type cannot be determined, no metadata for path: "+p.getPath());}u=G.map(function(v){return j(v,r.$Type);});return i(u," or ");});}return d.all([k(A,true),k(g,true)]).then(function(p){if(p[0]){n.push(p[0]);}if(p[1]){n.push(p[1]);}if(h){n.push(h);}return i(n,") and (");});};f.prototype.fetchValue=function(p,l,i){var t=this;return this.oCachePromise.then(function(o){if(o){return o.fetchValue(undefined,c.buildPath(i,p),undefined,l);}if(t.oContext){return t.oContext.fetchValue(c.buildPath(t.sPath,i,p),l);}});};f.prototype.filter=function(v,g){if(this.sOperationMode!==O.Server){throw new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server");}if(this.hasPendingChanges()){throw new Error("Cannot filter due to pending changes");}if(g===a.Control){this.aFilters=c.toArray(v);}else{this.aApplicationFilters=c.toArray(v);}this.mCacheByContext=undefined;this.oCachePromise=this.makeCache(this.oContext);this.reset(C.Filter);return this;};f.prototype.getContexts=function(i,l,M){var g,o=this.oContext,h,D=false,j=false,G,p,r,R=!!this.sChangeReason,k,t=this;q.sap.log.debug(this+"#getContexts("+i+", "+l+", "+M+")",undefined,s);if(i!==0&&this.bUseExtendedChangeDetection){throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"+" first parameter must be 0 if extended change detection is enabled, but is "+i);}if(M!==undefined&&this.bUseExtendedChangeDetection){throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"+" third parameter must not be set if extended change detection is enabled");}if(this.bRelative&&!o){return[];}g=this.sChangeReason||C.Change;this.sChangeReason=undefined;i=i||0;l=l||this.oModel.iSizeLimit;if(!M||M<0){M=0;}k=this.aContexts[-1]?i-1:i;if(!this.bUseExtendedChangeDetection||!this.oDiff){r=this.getReadRange(k,l,M);p=this.oCachePromise.then(function(n){if(n){G=t.sRefreshGroupId||t.getGroupId();t.sRefreshGroupId=undefined;return n.read(r.start,r.length,G,function(){D=true;t.fireDataRequested();});}else{return o.fetchValue(t.sPath).then(function(u){var v;u=u||[];v=u.$count;u=u.slice(r.start,r.start+r.length);u.$count=v;return{value:u};});}});if(p.isFulfilled()&&R){p=Promise.resolve(p);}p.then(function(n){var u;if(!t.bRelative||t.oContext===o){u=t.createContexts(r,n.value.length,n.value.$count);if(t.bUseExtendedChangeDetection){t.oDiff={aDiff:t.getDiff(n.value,k),iLength:l};}if(j&&u){t._fireChange({reason:g});}}if(D){t.fireDataReceived();}},function(E){if(D){t.fireDataReceived(E.canceled?undefined:{error:E});}throw E;})["catch"](function(E){t.oModel.reportError("Failed to get contexts for "+t.oModel.sServiceUrl+t.oModel.resolve(t.sPath,t.oContext).slice(1)+" with start index "+i+" and length "+l,s,E);});j=true;}this.iCurrentBegin=k;this.iCurrentEnd=k+l;if(k===-1){h=this.aContexts.slice(0,k+l);h.unshift(this.aContexts[-1]);}else{h=this.aContexts.slice(k,k+l);}if(this.bUseExtendedChangeDetection){if(this.oDiff&&l!==this.oDiff.iLength){throw new Error("Extended change detection protocol violation: Expected "+"getContexts(0,"+this.oDiff.iLength+"), but got getContexts(0,"+l+")");}h.dataRequested=!this.oDiff;h.diff=this.oDiff?this.oDiff.aDiff:[];}this.oDiff=undefined;return h;};f.prototype.getCurrentContexts=function(){var g,l=Math.min(this.iCurrentEnd,this.iMaxLength)-this.iCurrentBegin;if(this.iCurrentBegin===-1){g=this.aContexts.slice(0,this.iCurrentBegin+l);g.unshift(this.aContexts[-1]);}else{g=this.aContexts.slice(this.iCurrentBegin,this.iCurrentBegin+l);}while(g.length<l){g.push(undefined);}return g;};f.prototype.getDiff=function(r,g){var D,n,t=this;n=r.map(function(E,i){return t.bDetectUpdates?JSON.stringify(E):t.aContexts[g+i].getPath();});D=q.sap.arraySymbolDiff(this.aPreviousData,n);this.aPreviousData=n;return D;};f.prototype.getDistinctValues=function(){throw new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues");};f.prototype.getLength=function(){var l=this.bLengthFinal?this.iMaxLength:this.aContexts.length+10;if(this.aContexts[-1]){l+=1;}return l;};f.prototype.getReadRange=function(g,l,M){var h=this.aContexts;function j(g,E){var i;for(i=g;i<E;i+=1){if(h[i]===undefined){return true;}}return false;}if(j(g+l,g+l+M/2)){l+=M;}if(j(Math.max(g-M/2,0),g)){l+=M;g-=M;if(g<0){l+=g;g=0;}}return{length:l,start:g};};f.prototype.isLengthFinal=function(){return this.bLengthFinal;};f.prototype.makeCache=function(o){var v,g,Q,t=this;function h(p,i){var j=t.buildOrderbyOption(t.aSorters,Q&&Q.$orderby);return _.create(t.oModel.oRequestor,c.buildPath(p,t.sPath).slice(1),t.mergeQueryOptions(Q,j,i));}if(this.bRelative){if(!o||o.fetchCanonicalPath&&!Object.keys(this.mParameters).length&&!this.aSorters.length&&!this.aFilters.length&&!this.aApplicationFilters.length){return d.resolve();}}else{o=undefined;}Q=this.getQueryOptions(o);v=o&&(o.fetchCanonicalPath?o.fetchCanonicalPath():o.getPath());g=this.fetchFilter(o,this.aApplicationFilters,this.aFilters,Q&&Q.$filter);return this.createCache(h,v,g);};f.prototype.mergeQueryOptions=function(Q,o,g){var r;function h(p,v){if(v&&(!Q||Q[p]!==v)){if(!r){r=Q?JSON.parse(JSON.stringify(Q)):{};}r[p]=v;}}h("$orderby",o);h("$filter",g);return r||Q;};f.prototype.refreshInternal=function(g){var t=this;this.sRefreshGroupId=g;this.oCachePromise.then(function(o){if(o){t.mCacheByContext=undefined;t.oCachePromise=t.makeCache(t.oContext);}t.reset(C.Refresh);t.oModel.getDependentBindings(t).forEach(function(D){if(!D.getContext().created()){D.refreshInternal(g);}});});};f.prototype.reset=function(g){var t=this;if(this.aContexts){this.aContexts.forEach(function(o){t.mPreviousContextsByPath[o.getPath()]=o;});}this.aContexts=[];this.iCurrentBegin=this.iCurrentEnd=0;this.iMaxLength=Infinity;this.bLengthFinal=false;if(g){this.sChangeReason=g;this._fireRefresh({reason:g});}};f.prototype.setContext=function(o){if(this.oContext!==o){if(this.bRelative){this.reset();this.oCachePromise=this.makeCache(o);B.prototype.setContext.call(this,o);}else{this.oContext=o;}}};f.prototype.sort=function(v){if(this.sOperationMode!==O.Server){throw new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server");}if(this.hasPendingChanges()){throw new Error("Cannot sort due to pending changes");}this.aSorters=c.toArray(v);this.mCacheByContext=undefined;this.oCachePromise=this.makeCache(this.oContext);this.reset(C.Sort);return this;};f.prototype.toString=function(){return s+": "+(this.bRelative?this.oContext+"|":"")+this.sPath;};return f;},true);
