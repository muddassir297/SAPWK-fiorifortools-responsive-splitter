// @copyright@

sap.ui.define(['sap/ushell/ui5service/UserStatus'],
	function(UserStatus) {
	"use strict";

    /*global jQuery, sap, setTimeout, clearTimeout */
    /*jslint plusplus: true, nomen: true */
    sap.ui.controller("sap.ushell.renderers.fiori2.userAccount.UserAccountSelector", {

        onInit: function () {
            var that = this;
            if (this.isServiceEnable()) {
                this.originalEnableStatus = null;
                this.originalUserStatus = null;
                var oService = sap.ui.core.service.ServiceFactoryRegistry.get("sap.ushell.ui5service.UserStatus");
                var oServiceInstance = oService.createInstance();
                oServiceInstance.then(
                    function (oService) {
                        that.oUserStatusService = oService;
                        var promise = that.oUserStatusService.getUserStatusSetting();
                        promise.then(function (oUserStatusSetting) {
                            var bStatus = oUserStatusSetting && oUserStatusSetting.userStatusEnabled ? oUserStatusSetting.userStatusEnabled : false;
                            var sDefaultStatus = oUserStatusSetting && oUserStatusSetting.userStatusDefault ? oUserStatusSetting.userStatusDefault : undefined;

                            this.originalEnableStatus = bStatus;
                            this.originalUserStatus = sDefaultStatus;

                            that.userStatusButton = that.oUserStatusService.getOnlineStatusPopOver(this.originalUserStatus);
                            that.addUserStatusDropdown();
                            that.addUserEnableSwitch(bStatus);

                        }.bind(that));
                    },
                    function (oError) {

                    }
                );
            }
        },

        getContent: function () {
            var oDfd = jQuery.Deferred();
            var oResourceModel = sap.ushell.resources.getTranslationModel();
            this.getView().setModel(oResourceModel, "i18n");
            this.getView().setModel(this.getConfigurationModel(), "config");

            oDfd.resolve(this.getView());
            return oDfd.promise();
        },

        getValue: function () {
            var oDfd = jQuery.Deferred();
            oDfd.resolve(sap.ushell.Container.getUser().getFullName());
            return oDfd.promise();
        },

        onCancel: function () {
            if (this.isServiceEnable()) {
                this.oUserEnableOnlineStatusSwitch.setState(this.originalEnableStatus);
                this.userStatusButton.setStatus(sap.ushell.ui.launchpad.UserStatusItem.prototype.STATUS_ENUM[this.originalUserStatus]);
            }
        },

        onSave: function () {
            var oDfd = jQuery.Deferred(),
                userStatusDefault;
            if (this.isServiceEnable()) {
                if (this.originalEnableStatus !== this.oUserEnableOnlineStatusSwitch.getState() ||
                    this.originalUserStatus !== this.userStatusButton.getStatus().status) {
                    if (!this.oUserEnableOnlineStatusSwitch.getState()) {
                        userStatusDefault = null;
                        this.oUserStatusService.setStatus(null);
                    } else {
                        userStatusDefault = this.userStatusButton.getStatus() ? this.userStatusButton.getStatus().status : "AVAILABLE" ;

                    }

                    this.oUserStatusService.writeUserStatusSettingToPersonalization({
                        userStatusEnabled: this.oUserEnableOnlineStatusSwitch.getState(),
                        userStatusDefault: userStatusDefault
                    });

                    if ( !this.originalEnableStatus && this.oUserEnableOnlineStatusSwitch.getState()) {
                        this.oUserStatusService.setStatus(userStatusDefault);
                    }

                    this.originalEnableStatus = this.oUserEnableOnlineStatusSwitch.getState();
                    this.originalUserStatus = userStatusDefault;
                }
            }
            oDfd.resolve();
            return oDfd.promise();
        },
        addUserStatusDropdown: function () {
            var oUserStatusDropDownFlexBox = sap.ui.getCore().byId("UserAccountSelector--userStatusDropDownFlexBox");
            oUserStatusDropDownFlexBox.addItem(this.userStatusButton);
        },
        addUserEnableSwitch: function (bEnable) {
            var oUserStatusEnableFlexBox = sap.ui.getCore().byId("UserAccountSelector--userStatusEnableFlexBox");
            this.oUserEnableOnlineStatusSwitch = new sap.m.Switch({
                type: sap.m.SwitchType.Default,
                state: bEnable,
                change: function (oEvent) {
                    this.userStatusButton.setEnabled(oEvent.mParameters.state);
                    jQuery("#" + this.userStatusButton.getId()).attr("tabindex", oEvent.mParameters.state ? 0 : -1);
                }.bind(this)
            });
            this.userStatusButton.setEnabled(bEnable);
            jQuery("#" + this.userStatusButton.getId()).attr("tabindex", bEnable ? 0 : -1);
            oUserStatusEnableFlexBox.addItem(this.oUserEnableOnlineStatusSwitch);
        },
        isServiceEnable: function () {
            return UserStatus ? UserStatus.prototype.isEnabled : false;
        },
        getConfigurationModel: function () {
            var oConfModel = new sap.ui.model.json.JSONModel({});
            var oUser = sap.ushell.Container.getUser();
            oConfModel.setData({
                isRTL: sap.ui.getCore().getConfiguration().getRTL(),
                sapUiContentIconColor: sap.ui.core.theming.Parameters.get('sapUiContentIconColor'),
                isStatusEnable: this.originalEnableStatus ? this.originalEnableStatus : false,
                flexAlignItems: sap.ui.Device.system.phone ? 'Stretch' : 'Center',
                textAlign: sap.ui.Device.system.phone ? 'Left' : 'Right',
                textDirection: sap.ui.Device.system.phone ? 'Column' : 'Row',
                labelWidth: sap.ui.Device.system.phone ? "auto" : "12rem",
                name: oUser.getFullName(),
                mail: oUser.getEmail(),
                server: window.location.host
            });
            return oConfModel;
        }
    });


}, /* bExport= */ true);
