"use strict";var fnGetBootScript=require("./common.boot.script");var sBootPath;
module.exports=function getBootPath($){var b;if(!sBootPath){b=fnGetBootScript($);if(b){sBootPath=b.src.split("/").slice(0,-4).join("/");}else{}}return sBootPath;};
