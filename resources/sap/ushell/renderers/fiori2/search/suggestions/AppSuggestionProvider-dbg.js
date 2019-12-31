/* global jQuery, sap*/

(function() {
    "use strict";

    // =======================================================================
    // import packages
    // =======================================================================
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.SuggestionProvider');
    var SuggestionProvider = sap.ushell.renderers.fiori2.search.suggestions.SuggestionProvider;

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypeProps');
    var SuggestionTypeProps = sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypeProps;

    // =======================================================================
    // declare package
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider');

    // =======================================================================
    // apps suggestions provider
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = jQuery.extend(new SuggestionProvider(), {

        init: function(params) {
            // call super constructor
            SuggestionProvider.prototype.init.apply(this, arguments);
            // decorate suggestion methods (decorator prevents request overtaking)
            this.suggestApplications = SearchHelper.refuseOutdatedRequests(this.suggestApplications);
        },

        abortSuggestions: function() {
            this.suggestApplications.abort();
        },

        combineSuggestionsWithIdenticalTitle: function(suggestions) {

            function JSONStringifyReplacer(key, value) {
                if (key === "sina") {
                    return undefined;
                }
                return value;
            }

            // collect suggestions in suggestionsTitleDict + create combined suggestions
            var suggestion;
            var suggestionsTitleDict = {};
            for (var i = 0; i < suggestions.length; i++) {
                suggestion = suggestions[i];
                var firstAppSuggestion = suggestionsTitleDict[suggestion.title + suggestion.icon];
                if (firstAppSuggestion) {

                    if (!firstAppSuggestion.combinedSuggestionExists) {
                        var combinedSuggestion = {
                            title: 'combinedAppSuggestion' + i,
                            sortIndex: firstAppSuggestion.sortIndex,
                            url: "#Action-search&/searchterm=" + suggestion.title + "&datasource=" + JSON.stringify(this.model.appDataSource, JSONStringifyReplacer),
                            label: sap.ushell.resources.i18n.getText("suggestion_in_apps", suggestion.label),
                            icon: ""
                        };
                        var inApps = sap.ushell.resources.i18n.getText("suggestion_in_apps", [""]);
                        combinedSuggestion.label = combinedSuggestion.label.replace(inApps, "<i>" + inApps + "</i>");
                        suggestionsTitleDict[combinedSuggestion.title + combinedSuggestion.icon] = combinedSuggestion;
                        firstAppSuggestion.combinedSuggestionExists = true;
                    }

                } else {
                    suggestion.sortIndex = i;
                    suggestionsTitleDict[suggestion.title + suggestion.icon] = suggestion;
                }
            }

            // filter out combined suggestions
            suggestions = [];
            for (var suggestionTitle in suggestionsTitleDict) {
                if (suggestionsTitleDict.hasOwnProperty(suggestionTitle)) {
                    suggestion = suggestionsTitleDict[suggestionTitle];
                    if (!suggestion.combinedSuggestionExists) {
                        suggestions.push(suggestion);
                    }
                }
            }
            suggestions.sort(function(s1, s2) {
                return s1.sortIndex - s2.sortIndex;
            });

            return suggestions;

        },

        createShowMoreSuggestion: function(totalResults) {
            var title = sap.ushell.resources.i18n.getText("showAllNApps", totalResults);
            title = title.replace(/"/g, ""); //remove trailing ""
            var tooltip = title;
            var label = "<i>" + title + "</i>";
            return {
                title: title,
                tooltip: tooltip,
                label: label,
                dataSource: this.model.appDataSource,
                labelRaw: this.model.getProperty("/uiFilter/searchTerms"),
                type: window.sinabase.SuggestionType.OBJECTDATA
            };
        },

        getSuggestions: function() {
            var that = this;

            // check that datasource is all or apps
            var dataSource = that.model.getDataSource();
            if (!dataSource.equals(that.model.allDataSource) &&
                !dataSource.equals(that.model.appDataSource)) {
                return jQuery.when([]);
            }

            // get suggestions
            var suggestionTerm = that.model.getProperty('/uiFilter/searchTerms');
            return that.suggestApplications(suggestionTerm)
                .then(function(resultset) {

                    // combine suggestions with identical title
                    var appSuggestions = resultset.getElements();
                    appSuggestions = that.combineSuggestionsWithIdenticalTitle(appSuggestions);

                    // set type, datasource and position
                    jQuery.each(appSuggestions, function(index, appSuggestion) {
                        appSuggestion.type = window.sinabase.SuggestionType.APPS;
                        appSuggestion.dataSource = that.model.appDataSource;
                        appSuggestion.position = SuggestionTypeProps[window.sinabase.SuggestionType.APPS].position;
                    });

                    // limit app suggestions
                    var appSuggestionLimit;
                    if (that.model.isAllCategory()) {
                        appSuggestionLimit = SuggestionTypeProps[window.sinabase.SuggestionType.APPS].limitDsAll;
                    } else {
                        appSuggestionLimit = SuggestionTypeProps[window.sinabase.SuggestionType.APPS].limitDsApps;
                    }
                    appSuggestions = appSuggestions.slice(0, appSuggestionLimit);

                    // if there are more apps available, add a "show all apps" suggestion at the end
                    // but only if datasource is apps (nestle changes)
                    if (resultset.totalResults > appSuggestionLimit && dataSource.equals(that.model.appDataSource)) {
                        appSuggestions.push(that.createShowMoreSuggestion(resultset.totalResults));
                    }

                    return appSuggestions;
                });
        },

        suggestApplications: function(searchTerm) {
            return sap.ushell.Container.getService("Search").queryApplications({
                searchTerm: searchTerm,
                searchInKeywords: true,
                bSuggestion: true
            });
        }

    });

})();
