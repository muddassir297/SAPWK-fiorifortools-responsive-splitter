// @copyright@

sap.ui.define(function() {
	"use strict";

    /*global jQuery, sap, window */
    /*jslint nomen: true */

    sap.ui.controller("sap.ushell.components.flp.launchpad.appfinder.GroupListPopover", {
        onInit: function () {
            var oView = this.getView();
            var groupData = oView.getViewData().groupData;
            this.oPopoverModel = new sap.ui.model.json.JSONModel({userGroupList: groupData});
            oView.oPopover.setModel(this.oPopoverModel);
        },

        okButtonHandler: function (oEvent) {
            oEvent.preventDefault();
            oEvent._bIsStopHandlers = true;
            var oView = this.getView();
            var userGroupList = this.oPopoverModel.getProperty("/userGroupList");
            var returnChanges = {
              addToGroups: [],
              removeFromGroups: [],
              newGroups: [],
              allGroups: userGroupList
            };
            userGroupList.forEach(function (group) {
                if (group.selected === group.initiallySelected) {
                    return;
                }
                if (group.selected) {
                    returnChanges.addToGroups.push(group.oGroup);
                } else {
                    returnChanges.removeFromGroups.push(group.oGroup);
                }
            });
            if (oView.newGroupInput && oView.newGroupInput.getValue().length) {
                returnChanges.newGroups.push(oView.newGroupInput.getValue());
            }
            oView.oPopover.close();
            oView.deferred.resolve(returnChanges);
        },

        _cancelButtonHandler: function (oEvent) {
            oEvent.preventDefault();
            oEvent._bIsStopHandlers = true;
            var oView = this.getView();
            oView.oPopover.close();
            oView.deferred.reject();
        },

        _navigateToCreateNewGroupPane: function () {
            var oView = this.getView();
            if (!oView.headBarForNewGroup) {
                oView.headBarForNewGroup = oView._createHeadBarForNewGroup();
            }
            if (!oView.newGroupInput) {
                oView.newGroupInput = oView._createNewGroupInput();
            }
            oView.oPopover.removeAllContent();
            oView.oPopover.addContent(oView.newGroupInput);
            oView.oPopover.setCustomHeader(oView.headBarForNewGroup);
            oView.oPopover.setContentHeight("");
            if (oView.getViewData().singleGroupSelection){
                this._setFooterVisibility(true);
            }
            setTimeout(function () {
                oView.newGroupInput.focus();
            }, 0);
        },

        _afterCloseHandler: function () {
            var oView = this.getView();
            oView.oGroupsContainer.destroy();
            if (oView.headBarForNewGroup) {
                oView.headBarForNewGroup.destroy();
            }
            if (oView.newGroupInput) {
                oView.newGroupInput.destroy();
            }
            oView.oPopover.destroy();
            oView.destroy();
        },

        _backButtonHandler: function () {
            var oView = this.getView();
            oView.oPopover.removeAllContent();
            if (oView.getViewData().singleGroupSelection){
                this._setFooterVisibility(false);
            }

            if (!sap.ui.Device.system.phone) {
                oView.oPopover.setContentHeight(oView.iPopoverDataSectionHeight + "px");
            } else {
                oView.oPopover.setContentHeight("100%");
            }

            oView.oPopover.setVerticalScrolling(true);
            oView.oPopover.setHorizontalScrolling(false);
            oView.oPopover.addContent(oView.oGroupsContainer);
            oView.oPopover.setTitle(sap.ushell.resources.i18n.getText("addTileToGroups_popoverTitle"));
            oView.oPopover.setCustomHeader();
            oView.newGroupInput.setValue('');
        },

        _setFooterVisibility: function(bVisible){
            //as there is not public API to control the footer we get the control by its id
            //and set its visibility
            var oFooter = sap.ui.getCore().byId("groupsPopover-footer");
            if (oFooter){
                oFooter.setVisible(bVisible);
            }
        }
    });


}, /* bExport= */ false);
