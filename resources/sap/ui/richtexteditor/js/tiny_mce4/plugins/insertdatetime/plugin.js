tinymce.PluginManager.add('insertdatetime',function(e){var d="Sun Mon Tue Wed Thu Fri Sat Sun".split(' ');var a="Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(' ');var m="Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(' ');var b="January February March April May June July August September October November December".split(' ');var c=[],l,f;function g(j,k){function n(v,o){v=""+v;if(v.length<o){for(var i=0;i<(o-v.length);i++){v="0"+v;}}return v;}k=k||new Date();j=j.replace("%D","%m/%d/%Y");j=j.replace("%r","%I:%M:%S %p");j=j.replace("%Y",""+k.getFullYear());j=j.replace("%y",""+k.getYear());j=j.replace("%m",n(k.getMonth()+1,2));j=j.replace("%d",n(k.getDate(),2));j=j.replace("%H",""+n(k.getHours(),2));j=j.replace("%M",""+n(k.getMinutes(),2));j=j.replace("%S",""+n(k.getSeconds(),2));j=j.replace("%I",""+((k.getHours()+11)%12+1));j=j.replace("%p",""+(k.getHours()<12?"AM":"PM"));j=j.replace("%B",""+e.translate(b[k.getMonth()]));j=j.replace("%b",""+e.translate(m[k.getMonth()]));j=j.replace("%A",""+e.translate(a[k.getDay()]));j=j.replace("%a",""+e.translate(d[k.getDay()]));j=j.replace("%%","%");return j;}function h(i){var j=g(i);if(e.settings.insertdatetime_element){var k;if(/%[HMSIp]/.test(i)){k=g("%Y-%m-%dT%H:%M");}else{k=g("%Y-%m-%d");}j='<time datetime="'+k+'">'+j+'</time>';var t=e.dom.getParent(e.selection.getStart(),'time');if(t){e.dom.setOuterHTML(t,j);return;}}e.insertContent(j);}e.addCommand('mceInsertDate',function(){h(e.getParam("insertdatetime_dateformat",e.translate("%Y-%m-%d")));});e.addCommand('mceInsertTime',function(){h(e.getParam("insertdatetime_timeformat",e.translate('%H:%M:%S')));});e.addButton('insertdatetime',{type:'splitbutton',title:'Insert date/time',onclick:function(){h(l||f);},menu:c});tinymce.each(e.settings.insertdatetime_formats||["%H:%M:%S","%Y-%m-%d","%I:%M:%S %p","%D"],function(i){if(!f){f=i;}c.push({text:g(i),onclick:function(){l=i;h(i);}});});e.addMenuItem('insertdatetime',{icon:'date',text:'Insert date/time',menu:c,context:'insert'});});