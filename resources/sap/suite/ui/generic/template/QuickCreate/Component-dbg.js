sap.ui.define(["../js/QuickTemplates/QuickTemplateComponentFactory", "../js/AnnotationHelper", "../js/QuickTemplates/AnnotationHelper", "sap/ca/ui/utils/Lessifier"], function(QuickTemplateComponentFactory, AnnotationHelper, QCAnnotationHelper, Lessifier) {
    "use strict";

    return QuickTemplateComponentFactory.createQuickTemplateComponent("sap.suite.ui.generic.template.QuickCreate.Component", {

            metadata: {
                library: "sap.suite.ui.generic.template",
                properties: {
                    "viewName": {
                        "type": "string",
                        "defaultValue": "sap.suite.ui.generic.template.QuickCreate.view.QuickCreate"
                    }
                },
                "manifest": "json",
                "includes": ["css/custom.css"]
            },

            init: function() {
              Lessifier.lessifyCSS("sap.suite.ui.generic.template.QuickCreate", "css/custom.css", true);

            }
        });

});
