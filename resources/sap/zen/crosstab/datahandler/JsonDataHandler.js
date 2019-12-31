jQuery.sap.declare("sap.zen.crosstab.datahandler.JsonDataHandler");jQuery.sap.require("sap.zen.crosstab.TextConstants");jQuery.sap.require("sap.zen.crosstab.utils.Utils");jQuery.sap.require("sap.zen.crosstab.rendering.RenderingConstants");jQuery.sap.require("sap.zen.crosstab.CrosstabCellApi");
sap.zen.crosstab.datahandler.JsonDataHandler=function(c){var d=c.getDimensionHeaderArea();var C=c.getColumnHeaderArea();var r=c.getRowHeaderArea();var D=c.getDataArea();var f=0;var F=0;var t=0;var T=0;var b=false;var a=false;var e=false;var J=null;var o=null;var g=0;var R=0;var h={};var k={};function l(){if(!sap.zen.CrosstabTextCache){sap.zen.CrosstabTextCache={};sap.zen.CrosstabTextCache.filled=false;sap.zen.CrosstabTextCache.oTexts={};sap.zen.CrosstabTextCache.oSortingTextLookupTable={};sap.zen.CrosstabTextCache.defaultProvided=false;}var P=c.getPropertyBag();P.addText(sap.zen.crosstab.TextConstants.ROW_TEXT_KEY,"Row");P.addText(sap.zen.crosstab.TextConstants.COL_TEXT_KEY,"Column");P.addText(sap.zen.crosstab.TextConstants.COLWIDTH_ADJUST_TEXT_KEY,"Double Click to adjust Column Width");P.addText(sap.zen.crosstab.TextConstants.MOBILE_MENUITEM_COLWIDTH_ADJUST_TEXT_KEY,"Adjust Column Width");P.addText(sap.zen.crosstab.TextConstants.MEASURE_STRUCTURE_TEXT_KEY,"Measure Structure");p(P);sap.zen.CrosstabTextCache.defaultProvided=true;}function m(i){if(sap.zen.CrosstabTextCache.filled===false){var P=c.getPropertyBag();if(i){P.addText(sap.zen.crosstab.TextConstants.ROW_TEXT_KEY,i.rowtext||"Row");P.addText(sap.zen.crosstab.TextConstants.COL_TEXT_KEY,i.coltext||"Column");P.addText(sap.zen.crosstab.TextConstants.COLWIDTH_ADJUST_TEXT_KEY,i.colwidthtext||"Double Click to adjust Column Width");P.addText(sap.zen.crosstab.TextConstants.MOBILE_MENUITEM_COLWIDTH_ADJUST_TEXT_KEY,i.mobilemenuitemcolwidthtext||"Adjust Column Width");P.addText(sap.zen.crosstab.TextConstants.MEASURE_STRUCTURE_TEXT_KEY,i.measurestructtext||"Measure Structure");n(i,P);}sap.zen.CrosstabTextCache.filled=true;}}function p(P){var S={};S.alttext="Unsorted. Select to sort ascending";S.tooltipidx=0;P.addSortingTextLookup("0",S);S={};S.alttext="Sorted ascending. Select to sort descending";S.tooltipidx=1;P.addSortingTextLookup("1",S);S={};S.alttext="Sorted descending. Select to sort ascending";S.tooltipidx=2;P.addSortingTextLookup("2",S);}function n(j,P){var S=j.sorting;if(!S){p(P);}else{var i=0;var M=parseInt(S.length,10);for(i=0;i<M;i++){var N={};N.alttext=S[i].alttext;N.tooltipidx=S[i].tooltipidx;P.addSortingTextLookup(i+"",N);}}}this.determineBasicAreaData=function(i,j){if(!sap.zen.CrosstabTextCache||(sap.zen.CrosstabTextCache&&!sap.zen.CrosstabTextCache.defaultProvided)){l();}J=i;if(J.rootcause&&J.rootcause==="bookmark"){c.getPropertyBag().setBookmarkProcessing(true);}if(!J.rows){v(J);w();c.setHasData(false);}else{c.setHasData(true);if(j||J.changed){m(J.texts);h={};k={};f=J.fixedcolheaders;F=J.fixedrowheaders;if(!J.pixelscrolling){c.setHCutOff(false);c.setVCutOff(false);t=J.totaldatacols;T=J.totaldatarows;}else{c.setHCutOff(J.totaldatacols>J.sentdatacols);c.setVCutOff(J.totaldatarows>J.sentdatarows);t=J.sentdatacols;T=J.sentdatarows;}if(!f||!F){d.setRowCnt(0);d.setColCnt(0);if(!F){r.setRowCnt(0);r.setColCnt(0);if(f){C.setRowCnt(f);C.setColCnt(t);}}else if(!f){C.setRowCnt(0);C.setColCnt(0);if(F){r.setRowCnt(T);r.setColCnt(F);}}}else{d.setRowCnt(f);d.setColCnt(F);r.setRowCnt(T);r.setColCnt(F);C.setRowCnt(f);C.setColCnt(t);}D.setRowCnt(T);D.setColCnt(t);c.setTotalRows(f+T);c.setTotalCols(F+t);c.setOnSelectCommand(J.onselectcommand);c.getPropertyBag().setDisplayExceptions(J.displayexceptions);c.getPropertyBag().setEnableColResize(J.enablecolresize);c.setScrollNotifyCommand(J.scrollnotifier);s(i);var M=new sap.zen.crosstab.CrosstabCellApi(c,F,f,t,T);c.setCellApi(M);}q();if(!(c.getPropertyBag().isMobileMode()||c.getPropertyBag().isTestMobileMode())){if(J.transferdatacommand){c.setTransferDataCommand(J.transferdatacommand);}else{c.setTransferDataCommand(null);}if(J.callvaluehelpcommand){c.setCallValueHelpCommand(J.callvaluehelpcommand);}if(J.newlinescnt){c.setNewLinesCnt(J.newlinescnt);}if(J.newlinespos){c.setNewLinesPos(J.newlinespos);}}if(J.contextmenucmd){c.getPropertyBag().setContextMenuCommand(J.contextmenucmd);c.createContextMenu();}if(J.headerscrolling&&J.headerscrolling==true){c.setHeaderScrollingConfigured(true);if(J.userheaderresize){c.setUserHeaderResizeAllowed(J.userheaderresize);}if(J.userheaderwidthcommand){c.setUserHeaderWidthCommand(J.userheaderwidthcommand);}if(J.headerwidth){c.getPropertyBag().setMaxHeaderWidth(J.headerwidth);}else{c.getPropertyBag().setMaxHeaderWidth(0);}if(J.headerwidthcurrent){c.getPropertyBag().setUserHeaderWidth(J.headerwidthcurrent);}else{c.getPropertyBag().setUserHeaderWidth(0);}}else{c.setHeaderScrollingConfigured(false);c.setUserHeaderResizeAllowed(false);c.setUserHeaderWidthCommand(null);c.getPropertyBag().setMaxHeaderWidth(0);c.getPropertyBag().setUserHeaderWidth(0);}if(J.selectionmode){c.setSelectionProperties(J.selectionmode,J.selectionspace,J.disablehovering,J.singleonselectevent);}var S=c.getSelectionHandler();if(S){S.setSelection(J.selection);}if(J.headerinfo){c.initHeaderInfo(J.headerinfo);}if(J.repeattxt&&J.repeattxt===true){c.getPropertyBag().setRepeatTexts(true);}else{c.getPropertyBag().setRepeatTexts(false);}if(J.dragdropcommands){c.getPropertyBag().setDragDropEnabled(true);c.setDragDropCommands(J.dragdropcommands);}else{c.getPropertyBag().setDragDropEnabled(false);}if(J.zebra){c.getPropertyBag().setZebraMode(J.zebra);}else{c.getPropertyBag().setZebraMode(sap.zen.crosstab.rendering.RenderingConstants.ZEBRA_FULL);}}};function s(j){var M=j.usercolwidths;if(M){for(var i=0;i<M.length;i++){var N=M[i];var O=N.colid;if(isNaN(N.colwidth)){continue;}var P=Math.max(0,parseInt(N.colwidth,10));var Q=false;if(N.ignore!==undefined){Q=N.ignore;}if(O==='*'){if(f&&F){C.setColUserWidth(O,P,Q);D.setColUserWidth(O,P,Q);d.setColUserWidth(O,P,Q);r.setColUserWidth(O,P,Q);}else{if(!F){C.setColUserWidth(O,P,Q);}else if(!f){r.setColUserWidth(O,P,Q);}D.setColUserWidth(O,P,Q);}}else{if(f&&F){if(O>=F){C.setColUserWidth(O-F,P,Q);D.setColUserWidth(O-F,P,Q);}else{d.setColUserWidth(O,P,Q);r.setColUserWidth(O,P,Q);}}else{if(!F){C.setColUserWidth(O,P,Q);D.setColUserWidth(O,P,Q);}else if(!f){if(O>=F){D.setColUserWidth(O-F,P,Q);}else{r.setColUserWidth(O,P,Q);}}}}}}}function q(){var i=c.getRenderEngine().getCrossRequestManager();if(i){if(J.clienthpos!==undefined&&J.clientvpos!==undefined&&J.clienthscrolledtoend!==undefined&&J.clientvscrolledtoend!==undefined){if(J.clienthscrolledtoend===true){J.clienthpos=J.totaldatacols-1;}if(J.clientvscrolledtoend===true){J.clientvpos=J.totaldatarows-1;}if(!i.hasSavedVScrollInfo()&&!i.hasSavedHScrollInfo()){i.setScrollData(parseInt(J.clienthpos,10),J.clienthscrolledtoend,parseInt(J.clientvpos,10),J.clientvscrolledtoend);}}if(J.rootcause){i.setRootCause(J.rootcause);if(J.rootcause==="hierarchy"){i.setHierarchyAction(J.rootcause_hierarchy);i.setIsHierarchyDirectionDown(J.rootcause_hierarchy_directiondown);}i.handleRootCause();}else{if(J.changed===true){i.setScrollData(0,false,0,false);}}var S=false;if(J.rootcause&&c.getPropertyBag().isBookmarkProcessing()){S=true;}else{if(!J.dataproviderchanged){if(J.resultsetchanged){if(J.rootcause){S=J.rootcause==="sorting"||J.rootcause==="hierarchy"||J.rootcause==="plan"||J.rootcause==="dragdrop";}}else{S=true;}}}if(J.clientheaderhpos&&S){i.setHeaderScrollData({"iHPos":parseInt(J.clientheaderhpos,10)});}else{i.setHeaderScrollData({"iHPos":0});}}}this.jsonToDataModel=function(P){if(J.rows){o=P.oCrosstabAreasToBeFilled;g=P.iColOffset;R=P.iRowOffset;u();var M=J.rows;for(var i=0,N=M.length;i<N;i++){var O=M[i].row.rowidx;var Q=M[i].row.cells;for(var j=0,S=Q.length;j<S;j++){var U=Q[j].control;var V=U.colidx;x(U,O,V);}}}c.setColHeaderHierarchyLevels(h);c.setRowHeaderHierarchyLevels(k);};function u(){b=o[d.getAreaType()];a=o[r.getAreaType()];e=o[C.getAreaType()];}function v(J){d.setRowCnt(2);d.setColCnt(1);var i=G(d,0,0);i.setText(J.messagetitle);d.insertCell(i,0,0);i=G(d,1,0);i.setText(J.messagetext);d.insertCell(i,1,0);}function w(){var S=c.getSelectionHandler();if(S){S.setSelection(null);}}var x=function(j,i,M){var N=i-1;var O=M-1;if(M>F&&i>f){z(j,N+R,O+g);}else if(b&&M<=F&&i<=f){A(j,N,O);}else if(e&&i<=f&&M>F){E(j,N,O+g);}else if(a&&M<=F&&i>f){B(j,N+R,O);}};function y(i,j){var M=new sap.zen.crosstab.DataCell();M.setArea(D);M.setRow(i);M.setCol(j);M.addStyle(c.getPropertyBag().isCozyMode()?sap.zen.crosstab.rendering.RenderingConstants.STYLE_DATA_CELL_COZY:sap.zen.crosstab.rendering.RenderingConstants.STYLE_DATA_CELL);return M;}var z=function(j,M,i){var N=M-f;var O=i-F;var P=y(N,O);P.setTableRow(M);P.setTableCol(i);I(j,P);if(c.getPropertyBag().getZebraMode()!==sap.zen.crosstab.rendering.RenderingConstants.ZEBRA_OFF){if(N%2===1){P.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_ALTERNATING);}}D.insertCell(P,N,O);};var A=function(j,M,i){H(j,d,M,i,M,i);};var B=function(j,M,i){var N=M;if(j.axisidx!==undefined){N=j.axisidx+f;}H(j,r,M-f,i,N,i);};var E=function(j,M,i){var N=i;if(j.axisidx!==undefined){N=j.axisidx+F;}H(j,C,M,i-F,M,N);};function G(i,j,M){var N=new sap.zen.crosstab.HeaderCell();N.setArea(i);N.setRow(j);N.setCol(M);N.addStyle(c.getPropertyBag().isCozyMode()?sap.zen.crosstab.rendering.RenderingConstants.STYLE_HEADER_CELL_COZY:sap.zen.crosstab.rendering.RenderingConstants.STYLE_HEADER_CELL);return N;}var H=function(j,i,M,N,O,P){var Q=G(i,M,N);Q.setTableRow(O);Q.setTableCol(P);I(j,Q);K(j,Q,i);if(c.getPropertyBag().isRtl()&&Q.getRow()===c.getDimensionHeaderArea().getRowCnt()-1&&Q.getCol()===c.getDimensionHeaderArea().getColCnt()-1){Q.setText(sap.zen.crosstab.utils.Utils.swapPivotKeyText(Q.getText()));}i.insertCell(Q,M,N);};var I=function(j,M){var N=j._v;if(N){var P=sap.zen.crosstab.utils.Utils.prepareStringForRendering(N);M.setText(P.text);M.setNumberOfLineBreaks(P.iNumberOfLineBreaks);}var O=j.exceptionvisualizations;if(O){for(var Q in O){if(O.hasOwnProperty(Q)){var S=O[Q];if(S){sap.zen.crosstab.CellStyleHandler.setExceptionStylesOnCell(M,S.formattype,S.alertlevel);}}}}if(j.isemphasized){M.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_EMPHASIZED);}if(!(c.getPropertyBag().isMobileMode()||c.getPropertyBag().isTestMobileMode())){if(j.isdataentryenabled){M.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_DATA_ENTRY_ENABLED);M.setEntryEnabled(true);if(j.unit){M.setUnit(j.unit);}}if(j.hasinvalidvalue){M.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_INVALID_VALUE);}if(j.hasnewvalue){M.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_NEW_VALUE);}if(j.islocked){M.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_LOCKED);}}if(j.isresult){if(M.setResult){M.setResult(j.isresult);}M.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_TOTAL);}if(j.passivetype){M.setPassiveCellType(j.passivetype);}if(j.additionalstyles){for(var i=0;i<j.additionalstyles.length;i++){M.addStyle(j.additionalstyles[i].style.stylename);}}};var K=function(j,i,M){if(j.rowspan){i.setRowSpan(j.rowspan);}else{i.setRowSpan(1);}if(j.colspan){i.setColSpan(j.colspan);}else{i.setColSpan(1);}if(j.key){i.setMergeKey(j.key);}if(j.sort){i.setSort(j.sort);}if(j.sorttxtidx){i.setSortTextIndex(parseInt(j.sorttxtidx,10));}if(j.sortaction){i.setSortAction(j.sortaction);}if(j.alignment){i.setAlignment(j.alignment);}if(j.memberid){i.setMemberId(j.memberid);}if(j.parentmemberid){i.setParentMemberId(j.parentmemberid);}if(typeof(j.level)!="undefined"){i.setLevel(j.level);L(M,i,j.level);}else{i.setLevel(-1);}if(j.drillstate){if(j.drillstate!=="A"){i.setDrillState(j.drillstate);}}if(j.hierarchyaction){i.setHierarchyAction(j.hierarchyaction);}if(j.hierarchytooltip){i.setHierarchyTooltip(j.hierarchytooltip);}if(c.getPropertyBag().getZebraMode()===sap.zen.crosstab.rendering.RenderingConstants.ZEBRA_FULL){if(M.isRowHeaderArea()&&i.getRow()%2===1&&i.getRowSpan()===1){var N=c.getHeaderInfo();if(N){if((i.getCol()+i.getColSpan()-1)>=N.getStartColForInnermostDimension()){i.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_ALTERNATING);}}}}};var L=function(i,j,M){if(i.getAreaType()===sap.zen.crosstab.rendering.RenderingConstants.TYPE_COLUMN_HEADER_AREA){var N=j.getRow();if(h[N]!=undefined){if(h[N]<M){h[N]=M;}}else{h[N]=M;}}else if(i.getAreaType()===sap.zen.crosstab.rendering.RenderingConstants.TYPE_ROW_HEADER_AREA){var O=j.getCol();if(k[O]!=undefined){if(k[O]<M){k[O]=M;}}else{k[O]=M;}}};};
