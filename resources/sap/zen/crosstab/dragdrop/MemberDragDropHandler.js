jQuery.sap.declare("sap.zen.crosstab.dragdrop.MemberDragDropHandler");jQuery.sap.require("sap.zen.crosstab.dragdrop.DragDropUtils");jQuery.sap.require("sap.zen.crosstab.dragdrop.DragDropAreaRenderer");jQuery.sap.require("sap.zen.crosstab.dragdrop.DragDropHoverManager");jQuery.sap.require("sap.zen.crosstab.TextConstants");jQuery.sap.require("sap.zen.crosstab.utils.Utils");
sap.zen.crosstab.dragdrop.MemberDragDropHandler=function(c,d,D,o,a){"use strict";var t=this;var v;var V;var p;var I;var m={"sIdSuffix":"member_droparea_above","sCssClassName":"sapzencrosstab-rowAboveCellMemberDropArea"};var M={"sIdSuffix":"member_droparea_below","sCssClassName":"sapzencrosstab-rowBelowCellMemberDropArea"};var b={"sIdSuffix":"member_droparea_before","sCssClassName":"sapzencrosstab-columnBeforeCellMemberDropArea"};var f={"sIdSuffix":"member_droparea_after","sCssClassName":"sapzencrosstab-columnAfterCellMemberDropArea"};this.init=function(e){I=c.getPropertyBag().isRepeatTexts();p=e;v=D.getBoundingClientRect(c.getRowHeaderAreaDiv()[0]);V=D.getBoundingClientRect(c.getColHeaderAreaDiv()[0]);this.removeRowHeaderDropAreas();this.enableMemberDragDrop();};this.removeRowHeaderDropAreas=function(){var J;if(!c.getPropertyBag().isPixelScrolling()){J=c.getRenderSizeDiv();J.find(".sapzencrosstab-rowAboveCellMemberDropArea").remove();J.find(".sapzencrosstab-rowBelowCellMemberDropArea").remove();J.find(".sapzencrosstab-columnBeforeCellMemberDropArea").remove();J.find(".sapzencrosstab-columnAfterCellMemberDropArea").remove();}};this.getMemberCellHtml=function(C){var J;var e;var w;var H;J=$('#'+C.getId());e=$('#'+C.getId()+"_cellLayoutDiv");w=e.outerWidth();H="<td class=\""+J.attr("class")+" sapzencrosstab-DragHeaderCell"+"\">";H+="<div style=\"width: "+w+"px\">"+C.getText()+"</div></td>";return H;};this.createMemberCellDragObject=function(A,e){var H;var s;var C;var n;var q;var i;var L;var J;if(A.getArea().isRowHeaderArea()){C="sapzencrosstab-RowHeaderArea";}else if(A.getArea().isColHeaderArea()){C="sapzencrosstab-ColumnHeaderArea";}H="<table style=\"z-index: 9999;border-collapse: collapse\" class=\""+C+"\"><tbody>";L=e.length;H+=D.getDeleteDragGhostCellRowHtml(L);if(A.getArea().isRowHeaderArea()){n=e[0];q=$('#'+n.getId()).outerHeight();H+="<tr style=\"height: "+q+"px\">";for(i=0;i<L;i++){n=e[i];H+=this.getMemberCellHtml(n);}H+="</tr>";}else if(A.getArea().isColHeaderArea()){for(i=0;i<L;i++){n=e[i];q=$('#'+n.getId()).outerHeight();H+="<tr style=\"height: "+q+"px\">";H+=this.getMemberCellHtml(n);H+="</tr>";}}H+="</tbody></table>";J=$(H);c.setDragAction(true);return J;};this.restrictDropIndexLimitsForHierarchyMember=function(C,e,A){var r=c.getRowHeaderArea();var i=c.getColumnHeaderArea();var R;var n;var T;var F=-1;var L=-1;var q=null;var s=null;if(C.getAlignment()==="TOP"||C.getAlignment==="DEFAULT"){if(A==="ROWS"){for(R=e.iMinIndex;R<=e.iMaxIndex;R++){T=r.getCellWithRowSpan(R,C.getCol(),true);if(T&&T.getLevel()===C.getLevel()&&T.getParentMemberId()===C.getParentMemberId()){if(F<0){F=R;}else{q=T;}}}if(F>-1){e.iMinIndex=F;}if(q){e.iMaxIndex=q.getRow()+q.getRowSpan()-1;}}else if(A==="COLS"){for(n=e.iMinIndex;n<=e.iMaxIndex;n++){T=i.getCellWithColSpan(C.getRow(),n,true);if(T&&T.getLevel()===C.getLevel()&&T.getParentMemberId()===C.getParentMemberId()){if(F<0){F=n;}else{q=T;}}}if(F>-1){e.iMinIndex=F;}if(q){e.iMaxIndex=q.getCol()+q.getColSpan()-1;}}}else{if(A==="ROWS"){for(R=e.iMaxIndex;R>=e.iMinIndex;R--){T=r.getCellWithRowSpan(R,C.getCol(),true);if(T&&T.getLevel()===C.getLevel()&&T.getParentMemberId()===C.getParentMemberId()){if(L<0){L=R;}else{s=T;}}}if(s){e.iMinIndex=s.getRow();}if(L>-1){e.iMaxIndex=L;}}else if(A==="COLS"){for(n=e.iMaxIndex;n>=e.iMinIndex;n--){T=i.getCellWithColSpan(C.getRow(),n,true);if(T&&T.getLevel()===C.getLevel()&&T.getParentMemberId()===C.getParentMemberId()){if(L<0){L=n;}else{s=T;}}}if(s){e.iMinIndex=s.getCol();}if(L>-1){e.iMaxIndex=L;}}}return e;};this.filterResultCellsFromDropIndexLimits=function(e,C,A){var T;var r=c.getRowHeaderArea();var i=c.getColumnHeaderArea();var R;var n;if(A==="ROWS"){R=e.iMinIndex;T=r.getCellWithRowSpan(R,C.getCol());if(!T){T=r.getCellWithColSpan(R,C.getCol());}while(T&&T.isResult()&&R<e.iMaxIndex){e.iMinIndex=T.getRow()+T.getRowSpan();R++;T=r.getCellWithColSpan(R,C.getCol());}R=e.iMaxIndex;T=r.getCellWithRowSpan(R,C.getCol());if(!T){T=r.getCellWithColSpan(R,C.getCol());}while(T&&T.isResult()&&R>e.iMinIndex){e.iMaxIndex=T.getRow()-1;R--;T=r.getCellWithColSpan(R,C.getCol());}}else if(A==="COLS"){n=e.iMinIndex;T=i.getCellWithColSpan(C.getRow(),n);if(!T){T=i.getCellWithRowSpan(R,C.getCol());}while(T&&T.isResult()&&n<e.iMaxIndex){e.iMinIndex=T.getCol()+T.getColSpan();n++;T=i.getCellWithRowSpan(C.getRow(),n);}n=e.iMaxIndex;T=i.getCellWithColSpan(C.getRow(),n);if(!T){T=i.getCellWithRowSpan(R,C.getCol());}while(T&&T.isResult()&&R>e.iMinIndex){e.iMaxIndex=T.getCol()-1;n--;T=i.getCellWithRowSpan(C.getRow(),n);}}return e;};this.determineDropIndexLimitsFromPeerCell=function(P,A){var i=0;var B;var e;var n;var C;var q={};q.iMinIndex=-1;q.iMaxIndex=-1;if(I&&P.getMergeKey()&&P.getMergeKey().length>0){if(A==="COLS"){n=c.getColHeaderArea();B=n.getRenderStartCol();e=B+n.getRenderColCnt();for(i=B;(i<e)&&(q.iMaxIndex===-1);i++){C=n.getCell(P.getRow(),i);if(C.getMergeKey()===P.getMergeKey()&&q.iMinIndex===-1){q.iMinIndex=i;}if(C.getMergeKey()!==P.getMergeKey()&&q.iMinIndex>-1){q.iMaxIndex=i-1;}}}else{n=c.getRowHeaderArea();B=n.getRenderStartRow();e=B+n.getRenderRowCnt();for(i=B;(i<e)&&(q.iMaxIndex===-1);i++){C=n.getCell(i,P.getCol());if(C.getMergeKey()===P.getMergeKey()&&q.iMinIndex===-1){q.iMinIndex=i;}if(C.getMergeKey()!==P.getMergeKey()&&q.iMinIndex>-1){q.iMaxIndex=i-1;}}}if(q.iMaxIndex===-1){q.iMaxIndex=e;}}else{if(A==="COLS"){q.iMinIndex=P.getCol();q.iMaxIndex=P.getCol()+P.getColSpan()-1;}else{q.iMinIndex=P.getRow();q.iMaxIndex=P.getRow()+P.getRowSpan()-1;}}return q;};this.findDropIndexLimits=function(C,e){var i={};var n;var P;n=c.getHeaderInfo().findStartIndexOfPreviousDimension(e.sDimensionName,e.sAxisName);if(e.sAxisName==="ROWS"){if(!c.getHeaderInfo().isFirstDimensionOnAxis(e)){P=c.getRowHeaderArea().getCellWithRowSpan(C.getRow(),n);i=this.determineDropIndexLimitsFromPeerCell(P,e.sAxisName);}else{i.iMinIndex=c.getRowHeaderArea().getRenderStartRow();i.iMaxIndex=i.iMinIndex+c.getRowHeaderArea().getRenderRowCnt()-1;}}else if(e.sAxisName==="COLS"){if(!c.getHeaderInfo().isFirstDimensionOnAxis(e)){P=c.getColumnHeaderArea().getCellWithColSpan(n,C.getCol());i=this.determineDropIndexLimitsFromPeerCell(P,e.sAxisName);}else{i.iMinIndex=c.getColumnHeaderArea().getRenderStartCol();i.iMaxIndex=i.iMinIndex+c.getColumnHeaderArea().getRenderColCnt()-1;}}i=this.filterResultCellsFromDropIndexLimits(i,C,e.sAxisName);if(C.getLevel()>-1){i=this.restrictDropIndexLimitsForHierarchyMember(C,i,e.sAxisName);}return i;};this.findPreviousPeerCell=function(C,A,i){var r=c.getRowHeaderArea();var e=c.getColumnHeaderArea();var T;var R;var n;var P=null;if(C.getAlignment()==="TOP"||C.getAlignment==="DEFAULT"){if(A==="ROWS"){for(R=C.getRow();R>=i.iMinIndex&&!P;R--){T=r.getCellWithRowSpan(R,C.getCol(),true);if(T&&T.getId()!==C.getId()&&T.getLevel()===C.getLevel()){P=T;}}}else if(A==="COLS"){for(n=C.getCol();n>=i.iMinIndex&&!P;n--){T=e.getCellWithColSpan(C.getRow(),n,true);if(T&&T.getId()!==C.getId()&&T.getLevel()===C.getLevel()){P=T;}}}}else{if(A==="ROWS"){for(R=C.getRow();R<=i.iMaxIndex&&!P;R++){T=r.getCellWithRowSpan(R,C.getCol(),true);if(T&&T.getId()!==C.getId()&&T.getLevel()===C.getLevel()){P=T;}}}else if(A==="COLS"){for(n=C.getCol();n<=i.iMaxIndex&&!P;n++){T=e.getCellWithColSpan(C.getRow(),n,true);if(T&&T.getId()!==C.getId()&&T.getLevel()===C.getLevel()){P=T;}}}}if(P){if(P.getParentMemberId()!==C.getParentMemberId()){P=null;}}return P;};function g(e){var C;var n;var H;var q;var J;var P;var r;var s;var i;var u;H=c.getHeaderInfo();n=a.getCellFromJqCell(this);C=D.getEffectiveCell(n);if(C){D.setCurrentJqDragCell($('#'+C.getId()));if(I){q=D.getAllMemberCellsInRowOrCol(C);}else{q=H.getMemberCellsForSameDimension(C);}D.saveRevertCellPosInfo(n,q);J=t.createMemberCellDragObject(C,q);D.setCursorAt(n,J);r=H.getDimensionInfoForMemberCell(C);P=sap.zen.Dispatcher.instance.createDragDropPayload(c.getId());P.oDragDropInfo=D.buildDimensionDragDropInfo(r);u=t.findDropIndexLimits(C,r);P.oDragDropInfo.oDropIndexLimits=u;if(C.getLevel()>-1){P.oDragDropInfo.bIsHierarchyMember=true;}P.oDragDropInfo.bIsMemberDrag=true;s=c.getUtils().translateCellCoordinatesForBackend(C);if(s){P.oDragDropInfo.iMemberRow=s.row;P.oDragDropInfo.iMemberCol=s.col;}sap.zen.Dispatcher.instance.setDragDropPayload(P);}return J;}this.checkBasicMemberDropAccept=function(P,s){if(!P){return false;}if(P.oDragDropInfo.sAxisName!==s){return false;}if(D.isDragFromOtherCrosstab(P)){return false;}if(D.isInterComponentDrag(P)){return false;}if(!P.oDragDropInfo.bIsMemberDrag){return false;}return true;};this.returnFromMemberCellAcceptCheck=function(C,A){C.setRevertDrop(!A);sap.zen.Dispatcher.instance.setDropAccepted(C.getId(),A);return A;};this.checkDropLimitsAgainstCells=function(e,i,n,A){var q;var r;if(n.iMinIndex===-1&&n.iMaxIndex===-1){return true;}if(n.iMinIndex===n.iMaxIndex){return false;}q=true;if(A==="ROWS"){if(e.getRow()===i.getRow()){q=false;}else{if(e.getCol()>0){r=i.getRow()+i.getRowSpan()-1;q=n.iMinIndex<=r&&n.iMaxIndex>=r;}}}else if(A==="COLS"){if(e.getCol()===i.getCol()){q=false;}else{if(e.getRow()>0){r=i.getCol()+i.getColSpan()-1;q=n.iMinIndex<=r&&n.iMaxIndex>=r;}}}else{q=false;}return q;};this.checkMatchingHierarchyLevels=function(e,i){if(i.getLevel()>-1&&e.getLevel()>-1){return(i.getLevel()===e.getLevel()&&i.getParentMemberId()===e.getParentMemberId());}return true;};function h(e){var i;var n;var P;var q;var A;var r;var s;if(!c.isDragAction()||c.isBlocked()){return false;}P=sap.zen.Dispatcher.instance.getDragDropPayload();r=P.oDragDropInfo;i=a.getCellFromJqCell($(this));i=D.getEffectiveCell(i);s=c.getHeaderInfo().getDimensionInfoForMemberCell(i);if(!t.checkBasicMemberDropAccept(P,s.sAxisName)){return t.returnFromMemberCellAcceptCheck(i,false);}q=P.oDragDropInfo.oDropIndexLimits;n=a.getCellFromJqCell(e);n=D.getEffectiveCell(n);A=t.checkDropLimitsAgainstCells(n,i,q,r.sAxisName);if(!A){return t.returnFromMemberCellAcceptCheck(i,false);}A=t.checkMatchingHierarchyLevels(n,i);if(!A){return t.returnFromMemberCellAcceptCheck(i,false);}return t.returnFromMemberCellAcceptCheck(i,true);}this.returnFromMemberAreaAcceptCheck=function(J,A){J.data("xtabrevertdrop",!A);sap.zen.Dispatcher.instance.setDropAccepted(J.attr("id"),A);return A;};this.checkDropAreaDropLimits=function(e,i,n,A,q){var r;var s;if(n.iMinIndex!==n.iMaxIndex&&!q){if(i.isResult()){if(A==="ROWS"){if(i.getRow()+i.getRowSpan()-1===n.iMaxIndex){return false;}}else if(A==="COLS"){if(i.getCol()+i.getColSpan()-1===n.iMaxIndex){return false;}}}r={"iMinIndex":Math.max(0,n.iMinIndex-1),"iMaxIndex":n.iMaxIndex};}else{r=n;}s=this.checkDropLimitsAgainstCells(e,i,r,A);return s;};this.getDropCellFromAnchorCell=function(A,e,s,n){var q=null;var i;if(s==="ROWS"){q=c.getRowHeaderArea().getCellWithColSpan(A.getRow(),e.getCol(),true);if(!q){q=c.getRowHeaderArea().getCellWithRowSpan(A.getRow(),e.getCol(),true);}if(q&&!n){if((A.getRow()+A.getRowSpan())!==(q.getRow()+q.getRowSpan())){q=null;}}}else if(s==="COLS"){q=c.getColumnHeaderArea().getCellWithRowSpan(e.getRow(),A.getCol(),true);if(!q){q=c.getColumnHeaderArea().getCellWithColSpan(e.getRow(),A.getCol(),true);}if(q&&!n){if((A.getCol()+A.getColSpan())!==(q.getCol()+q.getColSpan())){q=null;}}}return q;};this.checkAreaMoveOnPreviousCell=function(e,i,A,s,n){if(s==="ROWS"){if(i.getRow()===e.getRow()||(A.getRow()+A.getRowSpan())===e.getRow()){if(!n){return false;}}}else if(s==="COLS"){if(i.getCol()===e.getCol()||(A.getCol()+A.getColSpan())===e.getCol()){if(!n){return false;}}}return true;};this.isDropCellOneBelowOrBeforeBlock=function(e,i,A){var n;if(A==="ROWS"){n=e.getRow()+e.getRowSpan()-1;}else if(A==="COLS"){n=e.getCol()+e.getColSpan()-1;}return(Math.max(0,n)===Math.max(0,(i.iMinIndex-1)));};this.getNextCell=function(C,A){var F;if(A==="ROWS"){F=c.getRowHeaderArea().getCellWithRowSpan(C.getRow()+C.getRowSpan(),C.getCol());}else if(A==="COLS"){F=c.getColumnHeaderArea().getCellWithColSpan(C.getRow(),C.getCol()+C.getColSpan());}return F;};this.checkAreaMoveOnPreviousHierarchyPeerOrBeginOfFollowing=function(e,i,n,A,q){var P;var r;var F;var C=i;if(e.getLevel()>-1&&i.getLevel()>-1){P=this.findPreviousPeerCell(e,A,n);if(P){if(i.getId()===P.getId()){return false;}if((A==="ROWS"&&(i.getRow()+i.getRowSpan()-1)===(P.getRow()-1))||(A==="COLS"&&(i.getCol()+i.getColSpan()-1)===(P.getCol()-1))){if(e.getLevel()!==i.getLevel()&&q){return false;}}else{if(!this.isDropCellOneBelowOrBeforeBlock(i,n,A)){if(!this.checkMatchingHierarchyLevels(e,i)){return false;}}}}else{if(!this.isDropCellOneBelowOrBeforeBlock(i,n,A)){if(!q&&i.getLevel()!==e.getLevel()){F=this.getNextCell(i,A);if(F){P=this.findPreviousPeerCell(F,A,n);if(P&&P.getId()===e.getId()){return false;}C=F;}}if(!this.checkMatchingHierarchyLevels(e,C)){return false;}}}}return true;};function j(e){var P;var J;var i;var n;var A;var s;var q;var r;var u;var w;var x;var y;if(!c.isDragAction()||c.isBlocked()){return false;}P=sap.zen.Dispatcher.instance.getDragDropPayload();J=$(this);A=D.getDropAreaTypeFromDropAreaId(J.attr("id"));s=(A==="droparea_above"||A==="droparea_below")?"ROWS":"COLS";u=(A==="droparea_above"||A==="droparea_before");if(!t.checkBasicMemberDropAccept(P,s)){return t.returnFromMemberAreaAcceptCheck(J,false);}n=D.getCrosstabHeaderCellFromDraggable(e);n=D.getEffectiveCell(n);q=n.getArea().isRowHeaderArea()?"ROWS":"COLS";if(q!==s){return t.returnFromMemberAreaAcceptCheck(J,false);}y=sap.ui.getCore().getControl(J.data("xtabcellid"));i=t.getDropCellFromAnchorCell(y,n,q,u);i=D.getEffectiveCell(i);if(!i||(i&&(i.getId()===n.getId()))){return t.returnFromMemberAreaAcceptCheck(J,false);}x=P.oDragDropInfo;w=x.oDropIndexLimits;r=t.checkDropAreaDropLimits(n,i,w,q,u);if(!r){return t.returnFromMemberAreaAcceptCheck(J,false);}r=t.checkAreaMoveOnPreviousCell(n,i,y,q,u);if(!r){return t.returnFromMemberAreaAcceptCheck(J,false);}r=t.checkAreaMoveOnPreviousHierarchyPeerOrBeginOfFollowing(n,i,w,q,u);if(!r){return t.returnFromMemberAreaAcceptCheck(J,false);}return t.returnFromMemberAreaAcceptCheck(J,true);}this.getCommonDropCommand=function(C,s){var e;var n;e=sap.zen.Dispatcher.instance.getDragDropPayload().oDragDropInfo;if(e.sAxisName==="ROWS"){n=C.row;}else if(e.sAxisName==="COLS"){n=C.col;}s=s.replace("__AXIS__",e.sAxisName);s=s.replace("__ROW__",e.iMemberRow);s=s.replace("__COL__",e.iMemberCol);s=s.replace("__NEW_INDEX__",n);return s;};function k(e,u){var i;var C;var s;if(D.checkDropAllowedOnCrosstabElement(e)){i=a.getCellFromJqCell($(this));i=D.getEffectiveCell(i);C=c.getUtils().translateCellCoordinatesForBackend(i);s=t.getCommonDropCommand(C,d.swapmemberscommand);c.getUtils().executeCommandAction(s);D.resetDragDrop();}else if(!D.checkMouseInRenderSizeDiv(e)){sap.zen.Dispatcher.instance.onUnhandledDrop(e,u);}}function l(e,u){var A;var i;var n;var C;var s;var q;var r;var w;var x;var B=false;if(D.checkDropAllowedOnCrosstabElement(e)){q=sap.zen.Dispatcher.instance.getDragDropPayload().oDragDropInfo;r=q.oDropIndexLimits;w=q.sAxisName;A=sap.ui.getCore().getControl($(this).data("xtabcellid"));i=D.getCrosstabHeaderCellFromDraggable($(u.draggable));i=D.getEffectiveCell(i);s=D.getDropAreaTypeFromDropAreaId($(this).attr("id"));if(s==="droparea_above"||s==="droparea_before"){B=true;}n=t.getDropCellFromAnchorCell(A,i,w,B);n=D.getEffectiveCell(n);if(t.isDropCellOneBelowOrBeforeBlock(n,r,w)){B=true;if(w==="ROWS"){n=c.getRowHeaderArea().getCellWithRowSpan(r.iMinIndex,n.getCol());}else if(w==="COLS"){n=c.getColumnHeaderArea().getCellWithColSpan(n.getRow(),r.iMinIndex);}}if(i.getLevel()!==n.getLevel()){n=t.getNextCell(n,w);B=true;}C=c.getUtils().translateCellCoordinatesForBackend(n);x=t.getCommonDropCommand(C,d.insertmembercommand);x=x.replace("__INSERT_BEFORE__",B);c.getUtils().executeCommandAction(x);D.resetDragDrop();}else if(!D.checkMouseInRenderSizeDiv(e)){sap.zen.Dispatcher.instance.onUnhandledDrop(e,u);}}this.getLeftOfBeginCellInRowHeader=function(r,C){var s;var R;var i;var T=C;var e;s=C.getCol();i=s;R=C.getRow();if(R<r.getRenderStartRow()+r.getRenderRowCnt()-1){R++;}while(T&&i>=0){T=r.getCellWithColSpan(R,i);if(T){C=T;i=T.getCol()-1;}}e=D.getBoundingClientRect($('#'+C.getId())[0]);return e.begin;};this.getTopOfBeginCellInColHeader=function(C,e){var s;var r;var i;var T=e;var R;s=e.getRow();r=s;i=e.getCol();if(i<C.getRenderStartCol()+C.getRenderColCnt()-1){i++;}while(T&&r>=0){T=C.getCellWithRowSpan(r,i);if(T){e=T;r=T.getRow()-1;}}R=D.getBoundingClientRect($('#'+e.getId())[0]);return R.top;};this.isRowContainsResultCell=function(r,R){var i=0;var C=null;for(i=0;i<r.getColCnt();i++){C=r.getCellWithColSpan(R,i);if(C&&C.isResult()){return true;}}return false;};this.isColContainsResultCell=function(C,e){var i=0;var n=null;for(i=0;i<C.getRowCnt();i++){n=C.getCellWithRowSpan(i,e);if(n&&n.isResult()){return true;}}return false;};this.enableRowHeaderCellsAndAreas=function(){var C=0;var r=0;var s=0;var e=0;var R;var i;var n;var J;var q;var F;var O=false;var u=null;var w=false;var x=false;R=c.getRowHeaderArea();if(!c.hasRowHeaderArea()||(R&&R.getRenderRowCnt()<2)){O=true;}if(p){F=p.getTableCol()+p.getColSpan()-1;if(!p.isSplitPivotCell()&&p.sScalingAxis==="ROWS"){F--;}}else{F=0;}s=R.getRenderStartRow();e=s+R.getRenderRowCnt()-1;for(r=s;r<=e;r++){if(I){w=this.isRowContainsResultCell(R,r);}for(C=0;C<=F;C++){i=R.getCellWithColSpan(r,C);if(!i&&r===s){i=R.getCellWithRowSpan(r,C);}if(i){if(O){u=c.getHeaderInfo().getDimensionInfoByCol(i.getTableCol());if(!u){return;}}q=$('#'+i.getId());n=D.getBoundingClientRect(q[0]);if(C===F&&!O){if(r===s&&n.top>=v.top){m.iEnd=0;J=o.createAboveDropArea(i,m);D.makeDropAreaDroppable(J,"sapzencrosstab-rowAboveCellMemberDropArea",j,l);}if(n.bottom<=v.bottom){M.iEnd=0;M.iBegin=this.getLeftOfBeginCellInRowHeader(R,i);J=o.createBelowDropArea(i,M);D.makeDropAreaDroppable(J,"sapzencrosstab-rowBelowCellMemberDropArea",j,l);}}if(I){x=w;}else{x=i.isResult();}if(!x&&n.top<v.bottom){D.makeCellDraggable(q,g);if(!O){D.makeCellDroppable(q,h,k);}}}}}};this.enableColHeaderCellsAndAreas=function(){var C=0;var r=0;var s=0;var e;var i;var R;var J;var E=0;var n;var F;var O=false;var q=null;var u=false;var w=false;var x={};e=c.getColumnHeaderArea();if(!c.hasColHeaderArea()||(e&&e.getRenderColCnt()<2)){O=true;}if(p){F=p.getTableRow()+p.getRowSpan()-1;if(!p.isSplitPivotCell()&&p.sScalingAxis==="COLS"){F--;}}else{F=0;}s=e.getRenderStartCol();E=s+e.getRenderColCnt()-1;for(r=0;r<=F;r++){for(C=s;C<=E;C++){if(I){if(typeof x[C]!="undefined"){u=x[C];}else{u=this.isColContainsResultCell(e,C);x[C]=u;}}i=e.getCellWithRowSpan(r,C);if(!i&&C===s){i=e.getCellWithColSpan(r,C);}if(i){if(O){q=c.getHeaderInfo().getDimensionInfoByRow(i.getTableRow());if(!q){return;}}n=$('#'+i.getId());R=D.getBoundingClientRect(n[0]);if(r===F&&!O){if(C===s&&R.begin>=V.begin){b.iBottom=0;J=o.createBeforeDropArea(i,b);D.makeDropAreaDroppable(J,"sapzencrosstab-columnBeforeCellMemberDropArea",j,l);}if(R.end<=V.end){f.iBottom=0;f.iTop=this.getTopOfBeginCellInColHeader(e,i);J=o.createAfterDropArea(i,f);D.makeDropAreaDroppable(J,"sapzencrosstab-columnAfterCellMemberDropArea",j,l);}}if(I){w=u;}else{w=i.isResult();}if(!w&&R.begin<V.end){D.makeCellDraggable(n,g);if(!O){D.makeCellDroppable(n,h,k);}}}}}};this.enableMemberDragDrop=function(){this.enableRowHeaderCellsAndAreas();this.enableColHeaderCellsAndAreas();};this.removeMember=function(e,u,i){if(i.bIsMemberDrag&&i.iMemberRow>-1&&i.iMemberCol>-1&&!i.bIsHierarchyMember){var C=d.removemembercommand.replace("__AXIS__",i.sAxisName);C=C.replace("__ROW__",i.iMemberRow);C=C.replace("__COL__",i.iMemberCol);c.getUtils().executeCommandAction(C);}else{sap.zen.Dispatcher.instance.setDragDropCanceled(true);}};};
