sap.ui.define([], function() {
	"use strict";
	/* Templating helper functions that are specific to the ListReport Template */
	var AnnotationHelper = {
		resolveMetaModelPath: function(oContext) {
			var sPath = oContext.getObject();
			var oModel = oContext.getModel();
			var oMetaModel = oModel.getProperty("/metaModel");
			return oMetaModel.createBindingContext(sPath);
		},
		/* The context definition for the ListReport
			1. only check if there is a default presentation variant for now. If it exists we
			   need to check if it has a LineItem annotation and use this one rather than the default LineItem annotation
			Compare with similar function in AnalyticalListReport
		*/
		createWorkingContext: function(oContext) {
			var oParameter = oContext.getObject(),
				oModel = oContext.getModel(),
				oMetaModel = oModel.getProperty("/metaModel"),
				oEntitySet = oMetaModel.getODataEntitySet(oParameter.entitySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				sAnnotationPath = "",
				oWorkingContext = {};
			/* Find default PresentationVariant */
			sAnnotationPath = oEntityType.$path + "/com.sap.vocabularies.UI.v1.PresentationVariant";
			oWorkingContext.presentationVariantQualifier = "";
			oWorkingContext.presentationVariant = oMetaModel.getObject(sAnnotationPath);
			oWorkingContext.presentationVariantPath = sAnnotationPath;
			/* Determine LineItem and Chart via PV */
			if (oWorkingContext.presentationVariant && oWorkingContext.presentationVariant.Visualizations) {
				oWorkingContext.presentationVariant.Visualizations.forEach(function(visualization) {
					/* get rid of the @ and put a / in front */
					var sPath = "/" + visualization.AnnotationPath.slice(1);
					if (sPath.indexOf("com.sap.vocabularies.UI.v1.LineItem") > -1) {
						sAnnotationPath = oEntityType.$path + sPath;
						oWorkingContext.lineItem = oMetaModel.getObject(sAnnotationPath);
						oWorkingContext.lineItemPath = sAnnotationPath;
						oWorkingContext.lineItemQualifier = sAnnotationPath.split("#")[1] || "";
					}
				});
			}
			/* Fall back to defaults without qualifier */
			if (!oWorkingContext.lineItem) {
				sAnnotationPath = oEntityType.$path + "/com.sap.vocabularies.UI.v1.LineItem";
				oWorkingContext.lineItem = oMetaModel.getObject(sAnnotationPath);
				oWorkingContext.lineItemPath = sAnnotationPath;
				oWorkingContext.lineItemQualifier = "";
			}

			oModel.setProperty("/workingContext", oWorkingContext);
			return "/workingContext";
		}
	};

	return AnnotationHelper;
}, /* bExport= */ true);
