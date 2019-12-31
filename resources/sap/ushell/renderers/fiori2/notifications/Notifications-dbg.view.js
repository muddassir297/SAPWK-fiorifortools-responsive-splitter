// @copyright@

/**
 * User notifications View.<br>
 * Located at the right pane of the ViewPortContainer.<br>
 * Includes the list of notifications that can be sorted according to different criteria.<br><br>
 *
 * The main UI controls in the view are:<br>
 *  sap.m.ScrollContainer {id: "notificationsScrollContainer"}<br>
 *  that includes sap.m.Panel {id: "notificationsSorter"} that contains the sorting header bar and the notifications list:<br>
 *    Panel header:  sap.m.Toolbar {id: "sortingToolbar"} that contains sap.m.Button objects, one for each sorting criterion.<br>
 *    Panel content: sap.m.List{id: "notificationsList"} that contains sap.m.NotificationListItem object for each notification object<br>
 */

sap.ui.define(['sap/m/NotificationListItem'],
    function (NotificationListItem) {
        "use strict";

        /*global jQuery, sap, document */
        /*jslint plusplus: true, nomen: true */

         sap.ui.jsview("sap.ushell.renderers.fiori2.notifications.Notifications", {
            createContent: function (oController) {
                var that = this;
                this.oBusyIndicator = new sap.m.BusyIndicator('notificationsByTypeBusyIndicator', {size: "1rem"});
                this.oPreviousTabKey = "sapUshellNotificationIconTabByDate";
                this.oPreviousByDateSorting = undefined;
                // Define notification action button template
                this.oActionListItemTemplate = new sap.m.Button({
                    text: "{ActionText}",
                    type: {
                        parts: ["Nature"],
                        formatter: function (nature) {
                            switch (nature) {
                            case "POSITIVE":
                                return "Accept";
                            case "NEGATIVE":
                                return "Reject";
                            default:
                                return "Default";
                            }
                        }
                    },
                    press: function (oEvent) {
                        that.actionButtonPressHandler(oEvent);
                    }
                });

                this.actionButtonPressHandler = function (oEvent) {
                    var sNotificationPathInModel = oEvent.getSource().getBindingContext().getPath(),
                        oNotificationModelPart = this.getModel().getProperty(sNotificationPathInModel),
                        aPathParts = sNotificationPathInModel.split("/"),
                        oTabBarSelectedKey = that.oIconTabBar.getSelectedKey(),
                        sPathToNotification = oTabBarSelectedKey === 'sapUshellNotificationIconTabByType' ? "/" + aPathParts[1] + "/" + aPathParts[2] + "/" + aPathParts[3] + "/" + aPathParts[4] : "/" + aPathParts[1] + "/" + aPathParts[2] + "/" + aPathParts[3],
                        oNotificationModelEntry = this.getModel().getProperty(sPathToNotification),
                        sNotificationId = oNotificationModelEntry.Id;

                    this.oPressActionEventPath = sNotificationPathInModel;
                    this.getModel().setProperty(sPathToNotification + "/Busy", true);

                    oController.executeAction(sNotificationId, oNotificationModelPart.ActionId).done(function (responseAck) {
                        if (responseAck && responseAck.isSucessfull) {
                            if (responseAck.message && responseAck.message.length) {
                                sap.m.MessageToast.show(responseAck.message, {duration: 4000});
                            } else {
                                var sActionModelPath = this.oPressActionEventPath,
                                    oActionModelObject = this.getModel().getProperty(sActionModelPath),
                                    sActionText = oActionModelObject.ActionText;

                                sap.m.MessageToast.show(sap.ushell.resources.i18n.getText("ActionAppliedToNotification", sActionText), {duration: 4000});
                            }

                            // Notification should remain in the UI (after action executed) only if DeleteOnReturn flag exists, and equals false
                            if (responseAck.DeleteOnReturn !== false) {
                                oController.removeNotificationFromModel(sNotificationId);

                                //There is need to load again the other 2 tabs, therefore we need to "clean"  other models.
                                oController.cleanModel();
                            }
                        } else {
                            sap.ushell.Container.getService('Message').error(responseAck.message);
                        }
                        this.getModel().setProperty(sPathToNotification + "/Busy", false);
                    }.bind(this)).fail(function () {
                        this.getModel().setProperty(sPathToNotification + "/Busy", false);
                        sap.ushell.Container.getService('Message').error(sap.ushell.resources.i18n.getText('notificationsFailedExecuteAction'));
                    }.bind(this));
                };

                this.oActionGroupItemTemplate = new sap.m.Button({
                    text: "{GroupActionText}",
                    type: {
                        parts: ["Nature"],
                        formatter: function (nature) {
                            return nature === "POSITIVE" ? "Accept" : "Reject";
                        }
                    },
                    press: function (oEvent) {
                        var sNotificationPathInModel = this.getBindingContext().getPath(),
                            oNotificationModelPart = this.getModel().getProperty(sNotificationPathInModel),
                            aPathParts = sNotificationPathInModel.split("/"),
                            sPathToNotification = "/" + aPathParts[1] + "/" + aPathParts[2],
                            oNotificationModelEntry = this.getModel().getProperty(sPathToNotification),
                            aNotificationIdsInGroup = [];

                        oNotificationModelEntry.notifications.forEach(function (item, index) {
                            aNotificationIdsInGroup.push(item.Id);
                            //display busy for the notification items.
                            this.getModel().setProperty(sPathToNotification + "/Busy", true);
                        }.bind(this));

                        //mark the notification group as busy
                        this.getModel().setProperty(sNotificationPathInModel + "/Busy", true);
                        oController.executeBulkAction(aNotificationIdsInGroup, oNotificationModelPart.ActionId, this.getProperty("text"), oNotificationModelEntry, sNotificationPathInModel, sPathToNotification);
                    }
                });
                this.addStyleClass('sapUshellNotificationsView');

                // Define notification list item template
                this.oNotificationListItemTemplate = new NotificationListItem({
                    press: function (oEvent) {
                        var oBindingContext = this.getBindingContext(),
                            oModelPath = oBindingContext.sPath,
                            oModelPart = this.getModel().getProperty(oModelPath),
                            sSemanticObject = oModelPart.NavigationTargetObject,
                            sAction = oModelPart.NavigationTargetAction,
                            aParameters = oModelPart.NavigationTargetParams,
                            sNotificationId = oModelPart.Id;
                        oController.onListItemPress(sNotificationId, sSemanticObject, sAction, aParameters).bind(oController);
                    },
                    datetime: {
                        path: "CreatedAt",
                        formatter: sap.ushell.utils.formatDate.bind(oController)
                    },
                    description: "{SubTitle}",
                    title: {
                        parts: ["SensitiveText", "Text"],
                        formatter: function (sensitiveText, text) {
                            return sensitiveText ? sensitiveText : text;
                        }
                    },
                    buttons: {
                        path: "Actions",
                        templateShareable: true,
                        sorter: new sap.ui.model.Sorter('Nature', true),
                        template: this.oActionListItemTemplate
                    },
                    unread: {
                        parts: ["IsRead"],
                        formatter: function (isRead) {
                            return !isRead;
                        }
                    },
                    close: function (oEvent) {
                        var sNotificationPathInModel = this.getBindingContext().getPath(),
                            oNotificationModelEntry = this.getModel().getProperty(sNotificationPathInModel),
                            sNotificationId = oNotificationModelEntry.Id;
                        oController.dismissNotification(sNotificationId);
                    },
                    busy: {
                        parts: ["Busy"],
                        formatter: function (busy) {
                            if (busy) {
                                return busy;
                            }

                            return false;
                        }
                    },
                    priority: {
                        parts: ["Priority"],
                        formatter: function (priority) {
                            if (priority) {
                                priority = priority.charAt(0) + priority.substr(1).toLowerCase();
                                return sap.ui.core.Priority[priority];
                            }
                        }
                    }
                }).addStyleClass("sapUshellNotificationsListItem").addStyleClass('sapContrastPlus').addStyleClass('sapContrast');

                this.oNotificationGroupTemplate = new sap.m.NotificationListGroup({
                    title: "{GroupHeaderText}",
                    collapsed: true,
                    showEmptyGroup: true,
                    datetime: {
                        path: "CreatedAt",
                        formatter: sap.ushell.utils.formatDate.bind(oController)
                    },
                    buttons: {
                        path: "Actions",
                        templateShareable: true,
                        sorter: new sap.ui.model.Sorter('Nature', true),
                        template: this.oActionGroupItemTemplate
                    },
                    items: {
                        //path: "aNotifications",
                        path: "notifications",
                        template: this.oNotificationListItemTemplate
                    },
                    onCollapse: function (oEvent) {
                        var group = oEvent.getSource(),
                            groupId = group.getId();
                        if (!group.getCollapsed()) {
                            oController.collapseOtherGroups(groupId);
                        }
                    },
                    close: function (oEvent) {
                        var sNotificationPathInModel = this.getBindingContext().getPath(),
                            aPathParts = sNotificationPathInModel.split("/"),
                            sPathToNotification = "/" + aPathParts[1] + "/" + aPathParts[2],
                            oNotificationModelEntry = this.getModel().getProperty(sPathToNotification),
                            aNotificationIdsInGroup = [];

                        oNotificationModelEntry.notifications.forEach(function (item, index) {
                            aNotificationIdsInGroup.push(item.Id);
                        });

                        oController.dismissBulkNotifications(aNotificationIdsInGroup, oNotificationModelEntry);
                    },
                    priority: {
                        parts: ["Priority"],
                        formatter: function (priority) {
                            if (priority) {
                                priority = priority.charAt(0) + priority.substr(1).toLowerCase();
                                return sap.ui.core.Priority[priority];
                            }
                        }
                    },
                    busy: {
                        parts: ["Busy"],
                        formatter: function (busy) {
                            if (busy) {
                                return busy;
                            }

                            return false;
                        }
                    }
                });
                this.oNotificationsListDate = new sap.m.List({
                    id: "sapUshellNotificationsListDate",
                    mode: sap.m.ListMode.None,
                    noDataText: sap.ushell.resources.i18n.getText('noNotificationsMsg'),
                    items: {
                        path: "/notificationsByDateDescending/aNotifications",
                        template: this.oNotificationListItemTemplate,
                        templateShareable: true
                    },
                    growing: true,
                    growingThreshold: 400,
                    growingScrollToLoad: true
                }).addStyleClass("sapUshellNotificationsList");

                this.oNotificationsListDate.onAfterRendering = function () {
                    oController.handleEmptyList();
                    this.oNotificationsListDate.$().parent().parent().scroll(this._triggerRetrieveMoreData.bind(that));

                    if (oController._oTopNotificationData) {
                        oController.scrollToItem(oController._oTopNotificationData);
                    }
                }.bind(this);

                this.oNotificationsListPriority = new sap.m.List({
                    id: "sapUshellNotificationsListPriority",
                    mode: sap.m.ListMode.None,
                    noDataText: sap.ushell.resources.i18n.getText('noNotificationsMsg'),
                    items: {
                        path: "/notificationsByPriorityDescending/aNotifications",
                        template: this.oNotificationListItemTemplate,
                        templateShareable: true
                    },
                    growing: true,
                    growingThreshold: 400,
                    growingScrollToLoad: true
                }).addStyleClass("sapUshellNotificationsList");

                this.oNotificationsListPriority.onAfterRendering = function () {
                    oController.handleEmptyList();
                    this.oNotificationsListPriority.$().parent().parent().scroll(this._triggerRetrieveMoreData.bind(that));

                    if (oController._oTopNotificationData) {
                        oController.scrollToItem(oController._oTopNotificationData);
                    }
                }.bind(this);


                /**
                 * Decides when to issue a request for more items (request next buffer) during scrolling.
                 *
                 * This function is called (repeatedly) during scroll, and calculated whether the top item on the screen
                 * is the item located two thirds of basicBuffer (meaning: two screens) from the end of the list.
                 * if so - then a request for the nect buffer is issued.
                 *
                 * @param path
                 */
                this.triggerRetrieveMoreData = function (path) {
                    if (!this.getModel().getProperty("/" + path + "/inUpdate")) {
                        var notificationsInModel = this.getController().getItemsFromModel(path),
                            numberOfNotificationsInModel = notificationsInModel ? notificationsInModel.length : 0,
                            bufferSize = numberOfNotificationsInModel ? this.getController().getBasicBufferSize() : 0,
                            numberOfItemsInTwoPage = bufferSize * 2 / 3,
                            indexOfElementInList = Math.floor(numberOfNotificationsInModel - numberOfItemsInTwoPage),
                            listItem = path === "notificationsByPriorityDescending" ? this.oNotificationsListPriority.getItems()[indexOfElementInList] : this.oNotificationsListDate.getItems()[indexOfElementInList],
                            topOffSet = this.getController().getTopOffSet();

                        if (listItem && listItem.getDomRef() && jQuery(listItem.getDomRef()).offset().top <= topOffSet) {
                            this.getController().getNextBuffer(path);
                        }
                    }
                };

                this._triggerRetrieveMoreData = function () {
                    this.triggerRetrieveMoreData(oController.sCurrentSorting);
                };

                this.oNotificationsListType = new sap.m.List({
                    id: "sapUshellNotificationsListType",
                    mode: sap.m.ListMode.SingleSelect,
                    noDataText: sap.ushell.resources.i18n.getText('noNotificationsMsg'),
                    items: {
                        //path: "/notificationsByTypeDescending/aGroupHeaders",
                        path: "/aNotificationsByType",
                        template: that.oNotificationGroupTemplate,
                        templateShareable: true,
                        growing: true,
                        growingThreshold: 400,
                        growingScrollToLoad: true
                    }
                }).addStyleClass("sapUshellNotificationsList")
                    .addStyleClass('sapContrastPlus')
                    .addStyleClass('sapContrast');


                var oIconTabFilterbByDate = new sap.m.IconTabFilter({
                    id: "sapUshellNotificationIconTabByDate",
                    key: "sapUshellNotificationIconTabByDate",
                    text: sap.ushell.resources.i18n.getText('notificationsSortByDate'),
                    tooltip: sap.ushell.resources.i18n.getText('notificationsSortByDateDescendingTooltip')
                });

                var oIconTabFilterbByType = new sap.m.IconTabFilter({
                    id: "sapUshellNotificationIconTabByType",
                    key: "sapUshellNotificationIconTabByType",
                    text: sap.ushell.resources.i18n.getText('notificationsSortByType'),
                    tooltip: sap.ushell.resources.i18n.getText('notificationsSortByTypeTooltip'),
                    content: this.oNotificationsListType
                });
                var oIconTabFilterbByPrio = new sap.m.IconTabFilter({
                    id: "sapUshellNotificationIconTabByPrio",
                    key: "sapUshellNotificationIconTabByPrio",
                    text: sap.ushell.resources.i18n.getText('notificationsSortByPriority'),
                    tooltip: sap.ushell.resources.i18n.getText('notificationsSortByPriorityTooltip')
                });

                this.oIconTabBar = new sap.m.IconTabBar('notificationIconTabBar', {
                    backgroundDesign: sap.m.BackgroundDesign.Transparent,
                    expandable: false,
                    selectedKey: "sapUshellNotificationIconTabByDate",
                    items: [
                        oIconTabFilterbByDate,
                        oIconTabFilterbByType,
                        oIconTabFilterbByPrio
                    ],
                    select: function (evt) {
                        var key = evt.getParameter("key"),
                            tabFilter = evt.getParameter("item");

                        if (key === "sapUshellNotificationIconTabByDate") {
                            // If the previous tab was ByDate descending
                            // or if the last time ByDate was visited (i.e. oPreviousTabKey is not ByDate) - it was ByDate ascending
                            // - then it should now be ascending
                            if (((that.oPreviousTabKey === "sapUshellNotificationIconTabByDate") && ((that.oPreviousByDateSorting === that.oController.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING) || that.oPreviousByDateSorting === undefined)) ||
                                    ((that.oPreviousTabKey !== "sapUshellNotificationIconTabByDate") && (that.oPreviousByDateSorting === that.oController.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING))) {
                                that.oController.sCurrentSorting = that.oController.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING;
                                tabFilter.setTooltip(sap.ushell.resources.i18n.getText('notificationsSortByDateAscendingTooltip'));
                                that.oNotificationsListDate.bindItems("/notificationsByDateAscending/aNotifications", that.oNotificationListItemTemplate);
                                if (oController.getItemsFromModel(oController.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING).length === 0) {
                                    oController.getNextBuffer(oController.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING);
                                }
                                that.oPreviousByDateSorting = that.oController.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING;
                            } else {
                                that.oController.sCurrentSorting = that.oController.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING;
                                tabFilter.setTooltip(sap.ushell.resources.i18n.getText('notificationsSortByDateDescendingTooltip'));
                                that.oNotificationsListDate.bindItems("/notificationsByDateDescending/aNotifications", that.oNotificationListItemTemplate);
                                if (oController.getItemsFromModel(oController.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING).length === 0) {
                                    oController.getNextBuffer(oController.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING);
                                }
                                that.oPreviousByDateSorting = that.oController.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING;
                            }
                            that.oPreviousTabKey = "sapUshellNotificationIconTabByDate";
                        } else if (key === "sapUshellNotificationIconTabByType" && that.oPreviousTabKey !== "sapUshellNotificationIconTabByType") {
                            that.oController.sCurrentSorting = that.oController.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING;
                            that.getController().getNotificationsByTypeWithGroupHeaders();
                            tabFilter.removeAllContent();
                            tabFilter.addContent(that.oBusyIndicator);
                            that.oIconTabBar.addStyleClass('sapUshellNotificationIconTabByTypeWithBusyIndicator');
                            that.oPreviousTabKey = "sapUshellNotificationIconTabByType";
                        } else { //by Priority
                            that.oController.sCurrentSorting = that.oController.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING;
                            if (oController.getItemsFromModel(oController.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING).length === 0) {
                                oController.getNextBuffer(oController.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING);
                            }
                            that.oPreviousTabKey = "sapUshellNotificationIconTabByPrio";
                        }
                        that.oPreviousTabKey = key;
                    }
                }).addStyleClass('sapUshellNotificationTabBar');
                this.oIconTabBar.addEventDelegate({
                    onsaptabprevious: function (oEvent) {
                        var oOriginalElement = oEvent.originalEvent,
                            oSourceElement = oOriginalElement.srcElement,
                            aClassList = oSourceElement.classList,
                            bIncludesClass;

                        bIncludesClass = jQuery.inArray('sapMITBFilter', aClassList) > -1;
                        if (bIncludesClass === true) {
                            oEvent.preventDefault();
                            sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                            sap.ushell.renderers.fiori2.AccessKeysHandler.sendFocusBackToShell(oEvent);
                        }
                    }
                });

                var origTabBarAfterRendering = this.oIconTabBar.onAfterRendering;
                this.oIconTabBar.onAfterRendering = function () {
                    if (origTabBarAfterRendering) {
                        origTabBarAfterRendering.apply(this, arguments);
                    }
                    var oTabBarHeader = sap.ui.getCore().byId('notificationIconTabBar--header');
                    if (oTabBarHeader) {
                        oTabBarHeader.addStyleClass('sapContrastPlus');
                        oTabBarHeader.addStyleClass('sapUshellTabBarHeader');
                    }
                };

                return [this.oIconTabBar];
            },
            getMoreCircle: function (sType) {
                var oMoreText = new sap.m.Text({text: sap.ushell.resources.i18n.getText('moreNotifications')}),
                    oNotificationCountText = new sap.m.Text({text: ""}).addStyleClass("sapUshellNotificationsMoreCircleCount"),
                    oMoreCircle = new sap.m.VBox({
                        items: [oNotificationCountText, oMoreText],
                        alignItems: sap.m.FlexAlignItems.Center
                    }).addStyleClass("sapUshellNotificationsMoreCircle"),
                    oBelowCircleTextPart1 = new sap.m.Text({
                        text: sap.ushell.resources.i18n.getText('moreNotificationsAvailable_message'),
                        alignItems: "Center"
                    }).addStyleClass("sapUshellNotificationsMoreHelpingText"),
                    oBelowCircleTextPart2 = new sap.m.Text({
                        text: sap.ushell.resources.i18n.getText('processNotifications_message'),
                        alignItems: "Center"
                    }).addStyleClass("sapUshellNotificationsMoreHelpingText"),
                    oVBox = new sap.m.VBox({
                        items: [oMoreCircle, oBelowCircleTextPart1, oBelowCircleTextPart2]
                    }).addStyleClass("sapUshellNotificationsMoreVBox"),
                    oListItem = new sap.m.CustomListItem({
                        type: sap.m.ListType.Inactive,
                        content: oVBox
                    }).addStyleClass("sapUshellNotificationsMoreListItem").addStyleClass('sapContrastPlus');

                oNotificationCountText.setModel(this.getModel());
                oNotificationCountText.bindText("/" + sType + "/moreNotificationCount");
                this.oMoreListItem = oListItem;
                return oListItem;
            },
            getControllerName: function () {
                return "sap.ushell.renderers.fiori2.notifications.Notifications";
            }
        });
    }, /* bExport= */ true);
