/* global $ */
(function() {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchShellHelper');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchConfiguration');

    var SearchShellHelper = sap.ushell.renderers.fiori2.search.SearchShellHelper;
    var SearchConfiguration = sap.ushell.renderers.fiori2.search.SearchConfiguration;

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchNoResultScreen", {


        metadata: {
            properties: {
                searchBoxTerm: "string"
            }
        },

        renderer: function(oRm, oControl) {

            var searchInput = SearchShellHelper.getSearchInput();
            var ariaDescriptionIdForNoResults = searchInput.getAriaDescriptionIdForNoResults();

            var escapedSearchTerm = $('<div>').text(oControl.getSearchBoxTerm()).html();
            oRm.write('<div class="sapUshellSearch-no-result"');
            oRm.writeControlData(oControl);
            oRm.write('>');
            oRm.write('<div class="sapUshellSearch-no-result-icon">');
            oRm.writeIcon(sap.ui.core.IconPool.getIconURI("travel-request"));
            oRm.write('</div><div class="sapUshellSearch-no-result-text" role="alert">');

            oRm.write('<div ');
            if (ariaDescriptionIdForNoResults) {
                oRm.write('id="' + ariaDescriptionIdForNoResults + '" ');
            }
            oRm.write('class="sapUshellSearch-no-result-info">' + sap.ushell.resources.i18n.getText("no_results_info", escapedSearchTerm));
            oRm.write('</div>');

            oControl.renderAppFinderLink(oRm, oControl);

            oRm.write('<div class="sapUshellSearch-no-result-tips">' + sap.ushell.resources.i18n.getText("no_results_tips") + '</div> ');

            oRm.write('</div></div>');
        },

        renderAppFinderLink: function(oRm, oControl) {

            if (!SearchConfiguration.getInstance().isLaunchpad()) {
                return;
            }

            var model = oControl.getModel();
            if (!model.getDataSource().equals(model.appDataSource)) {
                return;
            }

            var linkText = sap.ushell.resources.i18n.getText('no_results_link_appfinder', 'xxxx');
            var index = linkText.indexOf('xxxx');
            var prefix = linkText.slice(0, index);
            var suffix = linkText.slice(index + 4);

            oRm.write('<div class="sapUshellSearch-no-result-info">');
            oRm.write(prefix);
            var link = new sap.m.Link({
                text: sap.ushell.resources.i18n.getText('appFinderTitle'),
                press: function() {
                    var oCrossAppNavigator = sap.ushell.Container.getService('CrossApplicationNavigation');
                    oCrossAppNavigator.toExternal({
                        target: {
                            shellHash: '#Shell-home&/appFinder/catalog'
                        }
                    });
                }
            });
            oRm.renderControl(link);
            oRm.write(suffix);
            oRm.write('</div>');

        }
    });
})();
