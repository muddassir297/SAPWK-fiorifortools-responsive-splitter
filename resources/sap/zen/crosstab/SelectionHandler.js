jQuery.sap.declare("sap.zen.crosstab.SelectionHandler");jQuery.sap.require("sap.zen.crosstab.TouchHandler");jQuery.sap.require("sap.zen.crosstab.rendering.CrossRequestManager");jQuery.sap.require("sap.zen.crosstab.rendering.RenderingConstants");jQuery.sap.require("sap.zen.crosstab.utils.Utils");jQuery.sap.require("sap.zen.crosstab.keyboard.CrosstabKeyboardNavHandler");
sap.zen.crosstab.SelectionHandler=function(c){"use strict";var t=this;var r=c.getRenderEngine();var C=r.getCrossRequestManager();var d=c.getDataArea();var R=c.getRowHeaderArea();var o=c.getColumnHeaderArea();var D=c.getDimensionHeaderArea();var a={};var s=null;var b=null;var h=false;this.blockSelectionHovering=function(B){h=B;if(h&&b){this.removeSelection(b,true);b=null;}};this.removeAllSelections=function(){this.removeAllPreviousSelectionEffects();this.setSelection(null);};this.checkHeaderCellMerge=function(H,e){var A;var f;if(c.getPropertyBag().isRepeatTexts()===true){return false;}if(!H.isHeaderCell()||!e.isHeaderCell()){return false;}if(H.getId()===e.getId()){return true;}if(H.getMergeKey()===""||e.getMergeKey()===""){return false;}if(H.getMergeKey()!==e.getMergeKey()){return false;}if(H.getDrillState()!==e.getDrillState()){return false;}A=H.getArea();f=e.getArea();if(A.getAreaType()!==f.getAreaType()){return false;}if(A.isRowHeaderArea()){if(H.getCol()!==e.getCol()){return false;}}else if(A.isColHeaderArea()){if(H.getRow()!==e.getRow()){return false;}}return true;};this.provideSelectionForAllClickedCells=function(){$.each(a,function(e,f){t.selectCells(f);});};this.mapClickedCellsToModel=function(){var e=null;var m={};var f=[];var i=0;var g=null;$.each(a,function(j,k){e=k.getArea().getCell(k.getRow(),k.getCol());if(!e){if(k.isHeaderCell()){if(k.getArea().isRowHeaderArea()){e=k.getArea().getCellWithRowSpan(k.getRow(),k.getCol());}else if(k.getArea().isColHeaderArea()){e=k.getArea().getCellWithColSpan(k.getRow(),k.getCol());}if(e){if(t.checkHeaderCellMerge(e,k)===true){m[e.getId()]=e;}else{if(k.getArea().isRowHeaderArea()){f=k.getArea().getDataModel().getAllLoadedCellsByCol(k.getArea(),k.getCol());}else if(k.getArea().isColHeaderArea()){f=k.getArea().getDataModel().getAllLoadedCellsByRow(k.getArea,k.getRow());}for(i=0;i<f.length;i++){g=f[i];if(g){if(g.getMergeKey()===k.getMergeKey()&&g.getText()===k.getText()){m[g.getId()]=g;break;}}}}}}}else{m[e.getId()]=e;}});a=m;};this.addClickedCellsForSpannedHeaderCells=function(){var A=null;var e={};$.each(a,function(f,g){var i=null;if(g.isHeaderCell()){A=g.getArea();if(A.isRowHeaderArea()){i=A.getRenderedCellsByCol(g.getCol());$.each(i,function(I,j){if(t.checkHeaderCellMerge(j,g)===true){e[I]=j;}});}else if(A.isColHeaderArea()){i=A.getRenderedCellsByRow(g.getRow());$.each(i,function(I,j){if(t.checkHeaderCellMerge(j,g)===true){e[I]=j;}});}}});$.extend(a,e);};this.extractClickedCellsFromSelection=function(){var A="";var m;var e=0;var f=null;var S;var g;var j;var k;var m;if(s){A=s.axis;if(s.bFromBackend===true){var H=c.getHeaderInfo();if(c.getNewLinesPos()==="TOP"){e=c.getNewLinesCnt();}for(var i=0;i<s.length;i++){S=s[i];if(A==="ROWS"){g=c.getRowHeaderArea();j=S.row+e;k=H.getColForAbsoluteCol(S.col);}else if(A==="COLUMNS"){g=c.getColumnHeaderArea();j=H.getRowForAbsoluteRow(S.row)+e;k=S.col;}else if(A==="DATA"){g=c.getDataArea();j=S.row+e;k=S.col;}m=g.getCell(j,k);if(m){a[m.getId()]=m;}}}else{f=s[A];if(f){for(var i=0;i<f.length;i++){S=f[i];if(A==="ROW"){g=c.getRowHeaderArea();}else if(A==="COL"){g=c.getColumnHeaderArea();}else if(A==="DATA"){g=c.getDataArea();}m=g.getCell(S.row,S.col);if(m){a[m.getId()]=m;}}}}}};this.ensureCellsSelected=function(){a={};if(c.isPlanningMode()===true&&c.getSelectionMode()==="DATA"){s=null;}if(s){this.extractClickedCellsFromSelection();}if(a&&Object.keys(a).length>0){this.mapClickedCellsToModel();this.addClickedCellsForSpannedHeaderCells();this.provideSelectionForAllClickedCells();}};this.checkSingleCellClicked=function(m){var e=true;if(a&&(Object.keys(a).length===0)){return false;}if(a&&(Object.keys(a).length===1)&&a[m.getId()]){return true;}if(m.isHeaderCell()===true){$.each(a,function(f,g){if(!t.checkHeaderCellMerge(m,g)){e=false;return false;}});}else{e=false;}return e;};this.checkCellIsAlreadyClicked=function(m){var e=null;var f=false;if(!m.isHeaderCell()){e=a[m.getId()];if(e){return true;}}else{if((Object.keys(a).length===1)&&a[m.getId()]){return true;}$.each(a,function(g,i){if(c.getPropertyBag().isRepeatTexts()===true){if(g===m.getId()){f=true;return false;}}else{if(t.checkHeaderCellMerge(m,i)===true){f=true;return false;}}});}return f;};this.translateClick=function(m){var n=null;var A=m.getArea();var i=0;var N=0;var e=0;var f=0;var g="";var H=c.getHeaderInfo();n=m;if(A.isRowHeaderArea()){if(c.getPropertyBag().isRepeatTexts()===true){if(m.getCol()>0){n=A.getCell(m.getRow(),0);}else{n=m;}}else{i=m.getCol();g=H.getDimensionNameByCol(i);if(g&&g.length>0){N=H.getFirstColForDimension(g);if(N>=0&&N!==i){n=A.getCell(m.getRow(),N);}}}}else if(A.isColHeaderArea()){if(c.getPropertyBag().isRepeatTexts()===true){if(m.getRow()>0){n=A.getCell(0,m.getCol());}else{n=m;}}else{e=m.getRow();g=H.getDimensionNameByRow(e);if(g&&g.length>0){f=H.getFirstRowForDimension(g);if(f>=0&&f!==e){n=A.getCell(f,m.getCol());}}}}return n;};this.checkSelectionAllowed=function(m){var A=m.getArea();var i=0;if(A.isDimHeaderArea()){return false;}if(c.isPlanningMode()===true){if(c.getNewLinesCnt()>0){i=m.getRow();if(c.getNewLinesPos()==="TOP"){if(i<c.getNewLinesCnt()){return false;}}else{if(i>m.getArea().getRowCnt()-c.getNewLinesCnt()-1){return false;}}}if(c.getSelectionMode()==="DATA"){return false;}}if(c.getSelectionMode()==="DATA"){if(A.isRowHeaderArea()||A.isColHeaderArea()){return false;}}else{if(A.isDataArea()){return false;}}if(c.getSelectionSpace()==="ROW"){if(A.isColHeaderArea()){return false;}}else if(c.getSelectionSpace()==="COL"){if(A.isRowHeaderArea()){return false;}}if(c.getSelectionMode()==="SINGLE"){var i=0;var e=0;var f="";var g=0;var j=0;var k=0;var l=0;var H=c.getHeaderInfo();if(A.isRowHeaderArea()){return H.isColOfInnermostDimension(m.getCol());}else if(A.isColHeaderArea()){return H.isRowOfInnermostDimension(m.getRow());}}return true;};this.registerCtrlKeyUpListener=function(){if(c.getPropertyBag().isFireOnSelectedOnlyOnce()===true){if(!document.oSapCrosstabOnSelectHandlerReg){document.oSapCrosstabOnSelectHandlerReg={};}document.oSapCrosstabOnSelectHandlerReg[c.getId()]={"me":this,"fOnSelect":this.sendOnSelectCommand};if(!document.fSapCrosstabOnKeyUpHandler){document.fSapCrosstabOnKeyUpHandler=function(e){if(e.which===17){$(document).off("keyup");document.fSapCrosstabOnKeyUpHandler=null;$.each(document.oSapCrosstabOnSelectHandlerReg,function(i,H){H.fOnSelect.apply(H.me);});document.oSapCrosstabOnSelectHandlerReg=null;sap.zen.crosstab.utils.Utils.cancelEvent(e);sap.zen.crosstab.utils.Utils.stopEventPropagation(e);}};$(document).on("keyup",document.fSapCrosstabOnKeyUpHandler);}}};this.postSelectionToServer=function(e){var A=document.oSapCrosstabOnSelectHandlerReg&&document.oSapCrosstabOnSelectHandlerReg[c.getId()];if(!c.getPropertyBag().isFireOnSelectedOnlyOnce()||(c.getPropertyBag().isFireOnSelectedOnlyOnce()===true&&!A)){t.sendOnSelectCommand(e);}};this.handleCellClick=function(m,f){if(!this.checkSelectionAllowed(m)){this.removeAllSelections();this.sendJson("{}");return;}if(b){t.removeSelection(b,true);b=null;}m=this.translateClick(m);if(!f||f==="SHIFT"){if(this.checkSingleCellClicked(m)===true){this.removeSelection(m);return;}else{this.startNewSelection(m);}}else if(f==="CTRL"){this.registerCtrlKeyUpListener();if(this.checkCellIsAlreadyClicked(m)===true){this.removeSelection(m);return;}else{var i=this.checkMultiselectPossible(m);if(i){a[m.getId()]=m;}else{this.startNewSelection(m);}}}this.selectCells(m);this.updateSelectionState();};this.getCellsForSelectionState=function(){var e={};var f={};var g;var A="";var T=null;e=this.consolidateClickedCells();$.each(e,function(i,j){T=c.getUtils().translateCellCoordinatesForBackend(j);A=T.axisName;g={};if(!f[A]){f[A]=[];}g["row"]=T.row;g["col"]=T.col;f[A].push(g);});return{"axis":A,"oCells":f};};this.sendOnSelectCommand=function(e){var f;if(c.getOnSelectCommand()){if(e){f=e.oCells;}else{f=this.getCellsForSelectionState().oCells;}var g=JSON.stringify(f);t.sendJson(g);}};this.sendJson=function(j){var e=c.getOnSelectCommand();if(e){var f='"';var g=new RegExp(f,'g');var i=j.replace(g,"\\\"");e=e.replace("__CELLS__",i);c.getUtils().executeCommandAction(e);}};this.consolidateClickedCells=function(){var e={};var f={};var O={};var A="";var k="";if(c.getPropertyBag().isRepeatTexts()===true){return a;}$.each(a,function(i,g){A=g.getArea().getAxisName();if(A===sap.zen.crosstab.rendering.RenderingConstants.ROW_AXIS){k=g.getText()+" "+g.getMergeKey()+" "+g.getCol();if(!e[k]){e[k]=g;}}else if(A===sap.zen.crosstab.rendering.RenderingConstants.COL_AXIS){k=g.getText()+" "+g.getMergeKey()+" "+g.getRow();if(!f[k]){f[k]=g;}}else{O[i]=g;}});return $.extend(e,f,O);};this.selectCells=function(m,H){var S=this.getSelectedCells(m);$.each(S,function(e,f){var A=f.getArea();if(A.isRowHeaderArea()){t.selectRowHeaderCell(f,H);}else if(A.isColHeaderArea()){t.selectColHeaderCell(f,H);}else if(A.isDataArea()){t.selectDataCell(f,H);}});};this.getSelectedCells=function(m,e){var A=m.getArea();var f={};if(A.isRowHeaderArea()||A.isColHeaderArea()){var S=A.getSelectedCellsBySelectionCoordinates(m.getRow(),m.getCol());var g=c.getDataArea().getSelectedCellsByHeaderSelection(m,e);f=$.extend({},S,g);}else if(A.isDataArea()){var g={};g[m.getId()]=m;var i=c.getRowHeaderArea().getSelectedCellsByDataSelection(m);var j=c.getColumnHeaderArea().getSelectedCellsByDataSelection(m);f=$.extend({},g,i,j);}return f;};this.checkMultiselectPossible=function(m){var A=m.getArea();var e=true;var p="";var P=null;var i=0;var f=null;if(c.getSelectionMode()==="DATA"||c.getSelectionMode()==="SINGLE"){return false;}if(c.getPropertyBag().isRepeatTexts()===true){return true;}if(A.isRowHeaderArea()){f=A.getDataModel().getCellWithSpan(m.getRow(),Math.max(m.getCol()-1,0))}else if(A.isColHeaderArea()){f=A.getDataModel().getCellWithSpan(Math.max(m.getRow()-1,0),m.getCol())}p=f.getId();$.each(a,function(g,j){if(j.getArea().getAreaType()!==A.getAreaType()){e=false;return false;}if(A.isRowHeaderArea()){if(m.getCol()!==j.getCol()){e=false;return false;}if(m.getCol()!==0){P=A.getDataModel().getCellWithSpan(j.getRow(),Math.max(j.getCol()-1,0));if(p!==P.getId()){e=false;return false;}}}else if(A.isColHeaderArea()){if(m.getRow()!==j.getRow()){e=false;return false;}if(m.getRow()!==0){P=A.getDataModel().getCellWithSpan(Math.max(j.getRow()-1,0),j.getCol());if(p!==P.getId()){e=false;return false;}}}else if(A.isDataArea()){e=false;return false;}});return e;};this.startNewSelection=function(m){this.removeAllPreviousSelectionEffects();s=null;a={};a[m.getId()]=m;};this.updateSelectionState=function(){var e=this.getCellsForSelectionState();t.postSelectionToServer(e);s=e.oCells;s.axis=e.axis;};this.removeSelection=function(m,H){var e={};e[m.getId()]=m;if(m.isHeaderCell()===true){$.each(a,function(f,g){if(g.isHeaderCell()===true){if(t.checkHeaderCellMerge(g,m)===true){e[f]=g;}}});}$.each(e,function(f,g){if(!H){delete a[f];}t.removePreviousSelectionEffectsForCell(g,H);});if(!H){this.updateSelectionState();}};this.removeAllPreviousSelectionEffects=function(){$.each(a,function(k,v){t.removePreviousSelectionEffectsForCell(v,false);});};this.removePreviousSelectionEffectsForCell=function(m,H){var S=this.getSelectedCells(m,true);$.each(S,function(e,f){var A=f.getArea();if(A.isRowHeaderArea()){t.deselectRowHeaderCell(f,H);}else if(A.isColHeaderArea()){t.deselectColHeaderCell(f,H);}else if(A.isDataArea()){t.deselectDataCell(f,H);}});};this.selectRowHeaderCell=function(m,H){var e=null;if(H===true){e="sapzencrosstab-HeaderCellHoverRow";}else{m.addStyle('SelectRow');e="sapzencrosstab-HeaderCellSelectRow";}var f=($('#'+m.getId()));f.addClass(e);};this.deselectRowHeaderCell=function(m,H){var e=null;if(H===true){e="sapzencrosstab-HeaderCellHoverRow";}else{m.removeStyle('SelectRow');e="sapzencrosstab-HeaderCellSelectRow";}var f=($('#'+m.getId()));f.removeClass(e);};this.selectColHeaderCell=function(m,H){var e=null;if(H===true){e="sapzencrosstab-HeaderCellHoverCol";}else{m.addStyle('SelectCol');e="sapzencrosstab-HeaderCellSelectCol";}var f=($('#'+m.getId()));f.addClass(e);};this.deselectColHeaderCell=function(m,H){var e=null;if(H===true){e="sapzencrosstab-HeaderCellHoverCol";}else{m.removeStyle('SelectCol');e="sapzencrosstab-HeaderCellSelectCol";}var f=($('#'+m.getId()));f.removeClass(e);};this.selectDataCell=function(m,H){var e=null;if(H===true){e="sapzencrosstab-HoverDataCell";}else{m.addStyle('SelectData');e="sapzencrosstab-DataCellSelectData";}var f=($('#'+m.getId()));f.addClass(e);};this.deselectDataCell=function(m,H){var e=null;if(H===true){e="sapzencrosstab-HoverDataCell";}else{m.removeStyle('SelectData');e="sapzencrosstab-DataCellSelectData";}var f=($('#'+m.getId()));f.removeClass(e);};this.setSelection=function(p){a={};s=p;if(s){s.bFromBackend=true;}};this.hasSelection=function(){return sap.zen.crosstab.utils.Utils.getSizeOf(a)>0;};this.handleCellHoverEntry=function(m){if(h){return;}if(!this.checkSelectionAllowed(m)){if(b){t.removeSelection(b,true);b=null;}return;}m=this.translateClick(m);if(b&&(m!==b)){t.removeSelection(b,true);b=null;}if(!b){if(!m||m===undefined||m.hasStyle("SelectCol")||m.hasStyle("SelectData")||m.hasStyle("SelectRow")){return;}b=m;t.selectCells(m,true);}};this.handleCellHoverOut=function(e){if(b){var f=e.toElement||e.relatedTarget;var g=e.target;var F=null;var i=sap.ui.getCore().getControl(e.target.id);var j=null;var k=false;if(i){if(i===b){F=$(g).find($(f));if(!(F&&F.length>0)){k=true;}}}else{j=$('#'+b.getId());F=j.find($(g));if(F&&F.length>0){F=j.find($(f));if(!(F&&F.length>0)){k=true;}}}if(k===true){t.removeSelection(b,true);b=null;}}};};
