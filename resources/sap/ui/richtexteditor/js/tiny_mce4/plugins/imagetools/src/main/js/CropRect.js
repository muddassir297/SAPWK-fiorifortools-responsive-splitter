define("tinymce/imagetoolsplugin/CropRect",["global!tinymce.dom.DomQuery","global!tinymce.ui.DragHelper","global!tinymce.geom.Rect","global!tinymce.util.Tools","global!tinymce.util.Observable","global!tinymce.util.VK"],function($,D,R,T,O,V){var c=0;return function(a,v,b,d,f){var i,g,j,k,p='mce-',l=p+'crid-'+(c++);g=[{name:'move',xMul:0,yMul:0,deltaX:1,deltaY:1,deltaW:0,deltaH:0,label:'Crop Mask'},{name:'nw',xMul:0,yMul:0,deltaX:1,deltaY:1,deltaW:-1,deltaH:-1,label:'Top Left Crop Handle'},{name:'ne',xMul:1,yMul:0,deltaX:0,deltaY:1,deltaW:1,deltaH:-1,label:'Top Right Crop Handle'},{name:'sw',xMul:0,yMul:1,deltaX:1,deltaY:0,deltaW:-1,deltaH:1,label:'Bottom Left Crop Handle'},{name:'se',xMul:1,yMul:1,deltaX:0,deltaY:0,deltaW:1,deltaH:1,label:'Bottom Right Crop Handle'}];k=["top","right","bottom","left"];function m(e,h){return{x:h.x+e.x,y:h.y+e.y,w:h.w,h:h.h};}function n(e,h){return{x:h.x-e.x,y:h.y-e.y,w:h.w,h:h.h};}function o(){return n(b,a);}function q(e,E,F,G){var x,y,w,h,H;x=E.x;y=E.y;w=E.w;h=E.h;x+=F*e.deltaX;y+=G*e.deltaY;w+=F*e.deltaW;h+=G*e.deltaH;if(w<20){w=20;}if(h<20){h=20;}H=a=R.clamp({x:x,y:y,w:w,h:h},b,e.name=='move');H=n(b,H);i.fire('updateRect',{rect:H});A(H);}function r(){function h(w){var x;return new D(l,{document:d.ownerDocument,handle:l+'-'+w.name,start:function(){x=a;},drag:function(e){q(w,x,e.deltaX,e.deltaY);}});}$('<div id="'+l+'" class="'+p+'croprect-container"'+' role="grid" aria-dropeffect="execute">').appendTo(d);T.each(k,function(e){$('#'+l,d).append('<div id="'+l+'-'+e+'"class="'+p+'croprect-block" style="display: none" data-mce-bogus="all">');});T.each(g,function(e){$('#'+l,d).append('<div id="'+l+'-'+e.name+'" class="'+p+'croprect-handle '+p+'croprect-handle-'+e.name+'"'+'style="display: none" data-mce-bogus="all" role="gridcell" tabindex="-1"'+' aria-label="'+e.label+'" aria-grabbed="false">');});j=T.map(g,h);s(a);$(d).on('focusin focusout',function(e){$(e.target).attr('aria-grabbed',e.type==='focus');});$(d).on('keydown',function(e){var w;T.each(g,function(y){if(e.target.id==l+'-'+y.name){w=y;return false;}});function x(y,E,F,G,H){y.stopPropagation();y.preventDefault();q(w,F,G,H);}switch(e.keyCode){case V.LEFT:x(e,w,a,-10,0);break;case V.RIGHT:x(e,w,a,10,0);break;case V.UP:x(e,w,a,0,-10);break;case V.DOWN:x(e,w,a,0,10);break;case V.ENTER:case V.SPACEBAR:e.preventDefault();f();break;}});}function t(e){var h;h=T.map(g,function(w){return'#'+l+'-'+w.name;}).concat(T.map(k,function(w){return'#'+l+'-'+w;})).join(',');if(e){$(h,d).show();}else{$(h,d).hide();}}function s(e){function h(w,e){if(e.h<0){e.h=0;}if(e.w<0){e.w=0;}$('#'+l+'-'+w,d).css({left:e.x,top:e.y,width:e.w,height:e.h});}T.each(g,function(w){$('#'+l+'-'+w.name,d).css({left:e.w*w.xMul+e.x,top:e.h*w.yMul+e.y});});h('top',{x:v.x,y:v.y,w:v.w,h:e.y-v.y});h('right',{x:e.x+e.w,y:e.y,w:v.w-e.x-e.w+v.x,h:e.h});h('bottom',{x:v.x,y:e.y+e.h,w:v.w,h:v.h-e.y-e.h+v.y});h('left',{x:v.x,y:e.y,w:e.x-v.x,h:e.h});h('move',e);}function u(e){a=e;s(a);}function z(e){v=e;s(a);}function A(e){u(m(b,e));}function B(e){b=e;s(a);}function C(){T.each(j,function(h){h.destroy();});j=[];}r(d);i=T.extend({toggleVisibility:t,setClampRect:B,setRect:u,getInnerRect:o,setInnerRect:A,setViewPortRect:z,destroy:C},O);return i;};});
