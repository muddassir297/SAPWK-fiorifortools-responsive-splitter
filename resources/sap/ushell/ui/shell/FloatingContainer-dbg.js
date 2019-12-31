/*!
 * ${copyright}
 */
/**
 * An invisible container, located (i.e. floats) at the top right side of the shell and can host any <code>sap.ui.core.Control</code> object.<br>
 * Extends <code>sap.ui.core.Control</code>
 */

/*global jQuery, sap */
sap.ui.define(['jquery.sap.global', 'jquery.sap.storage', 'sap/ushell/library', 'sap/ui/Device'],
    function (jQuery, storage, library, Device) {
        "use strict";
        var FloatingContainer = sap.ui.core.Control.extend("sap.ushell.ui.shell.FloatingContainer", {

                metadata: {
                    properties: {
                    },
                    aggregations: {
                        content : {type : "sap.ui.core.Control", multiple : true}
                    }
                },
                renderer: {
                    render: function (rm, oContainer) {
                        rm.write("<div");
                        rm.writeControlData(oContainer);
                        rm.addClass("sapUshellFloatingContainer");
                        rm.writeClasses();
                        rm.write(">");

                        if (oContainer.getContent() && oContainer.getContent().length) {
                            rm.renderControl(oContainer.getContent()[0]);
                        }
                        rm.write("</div>");
                    }
                }
            });

        FloatingContainer.prototype.init = function () {
            sap.ui.Device.resize.attachHandler(FloatingContainer.prototype._handleResize, this);
        };

        FloatingContainer.prototype._getWindowHeight = function () {
            return jQuery(window).height();
        };
        FloatingContainer.prototype._setContainerHeight = function (oContainer, iFinalHeight) {
            oContainer.css("max-height", iFinalHeight);
        };

        FloatingContainer.prototype._handleResize = function (oEvent) {

            if (jQuery(".sapUshellFloatingContainer").parent()[0]) {
                this.oWrapper = jQuery(".sapUshellFloatingContainer").parent()[0];
                this.oWrapper.setAttribute("style", this.oStorage.get("floatingContainerStyle"));
                var bIsSSize = window.matchMedia ? window.matchMedia("(max-width: 417px)").matches : false;
                this.adjustPosition(oEvent, bIsSSize);
            }

        };

        FloatingContainer.prototype.adjustPosition = function (oEvent, bIsSSize) {
            var iWindowCurrentWidth = oEvent ? oEvent.width : jQuery(window).width(),
                iWindowCurrentHeight = oEvent ? oEvent.height : jQuery(window).height(),
                iContainerWidth = this.oContainer.width(),
                iContainerHeight = this.oContainer.height(),
                bContainerPosExceedWindowWidth,
                bContainerPosExceedWindowHeight,
                iLeftPos,
                iTopPos,
                isRTL = sap.ui.getCore().getConfiguration().getRTL();

            bIsSSize = bIsSSize !== undefined ? bIsSSize : false;

            if (this.oWrapper) {
                iLeftPos = this.oWrapper.style.left.replace("%", "");
                iLeftPos = iWindowCurrentWidth * iLeftPos / 100;
                iTopPos = this.oWrapper.style.top.replace("%", "");
                iTopPos = iWindowCurrentHeight * iTopPos / 100;


                //If we are in the S size screen defined as 417 px, then there is a css class applied to  the container
                //And we want to preserve the position before going into S size in case the screen is resized back.
                if (!isNaN(iLeftPos) && !isNaN(iTopPos) && !bIsSSize) { //check if iTopPos or iLeftPos is NaN
                    if (isRTL) {
                        bContainerPosExceedWindowWidth = (iLeftPos < iContainerWidth) || (iLeftPos > iWindowCurrentWidth);
                        if (bContainerPosExceedWindowWidth) {
                            iLeftPos = iLeftPos < iContainerWidth ? iContainerWidth : iWindowCurrentWidth;
                        }
                    } else {
                        bContainerPosExceedWindowWidth = (iLeftPos < 0) || (iWindowCurrentWidth < (iLeftPos + iContainerWidth));
                        if (bContainerPosExceedWindowWidth) {
                            iLeftPos = iLeftPos < 0 ? 0 : (iWindowCurrentWidth - iContainerWidth);
                        }
                    }
                    bContainerPosExceedWindowHeight = (iTopPos < 0) || (iWindowCurrentHeight < (iTopPos + iContainerHeight));

                    if (bContainerPosExceedWindowHeight) {
                        iTopPos = iTopPos < 0 ? 0 : (iWindowCurrentHeight - iContainerHeight);
                    }

                    if (!bContainerPosExceedWindowWidth && !bContainerPosExceedWindowHeight) {
                        this.oWrapper.setAttribute("style", "left:" + iLeftPos * 100 / iWindowCurrentWidth + "%;top:" + iTopPos * 100 / iWindowCurrentHeight + "%;position:absolute;");
                        return;
                    }
                    this.oWrapper.setAttribute("style", "left:" + iLeftPos * 100 / iWindowCurrentWidth + "%;top:" + iTopPos * 100 / iWindowCurrentHeight + "%;position:absolute;");
                }
            }
        };
        FloatingContainer.prototype.handleDrop = function () {

            if (this.oWrapper) {
                this.adjustPosition();
                this.oStorage.put("floatingContainerStyle", this.oWrapper.getAttribute("style"));
            }

        };
        FloatingContainer.prototype.setContent = function (aContent) {
            if (this.getDomRef()) {
                var rm = sap.ui.getCore().createRenderManager();
                rm.renderControl(aContent);
                rm.flush(this.getDomRef());
                rm.destroy();
            }
            this.setAggregation("content", aContent, true);
        };
        FloatingContainer.prototype.onAfterRendering = function () {
            this.oStorage = this.oStorage || jQuery.sap.storage(jQuery.sap.storage.Type.local, "com.sap.ushell.adapters.local.FloatingContainer");
            this.oContainer = jQuery(".sapUshellFloatingContainer");
            this.oWrapper = jQuery(".sapUshellFloatingContainer").parent()[0];

        };
        FloatingContainer.prototype.exit = function () {
            sap.ui.Device.resize.detachHandler(FloatingContainer.prototype._resizeHandler, this);
        };

        return FloatingContainer;
    }, true);