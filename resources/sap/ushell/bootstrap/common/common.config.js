"use strict";var fn=require("./common.config.private");
ConfigUtil.prototype.createGlobalConfigs=function(x,s){var m=fn.readConfigItemsFromMeta(this.prefix,this.document,this.JSON);fn.createGlobalConfigs(m,x,s,this.window,this.JSON);};
function ConfigUtil(c,$,a,j){return Object.create(ConfigUtil.prototype,{JSON:{value:j},prefix:{value:c},window:{value:$},document:{value:a}});}
module.exports=ConfigUtil;
