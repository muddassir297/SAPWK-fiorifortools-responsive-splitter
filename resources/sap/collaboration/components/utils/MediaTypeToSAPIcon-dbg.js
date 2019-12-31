/**
 * ! @copyright@
 */

sap.ui.base.Object.extend("sap.collaboration.components.utils.MediaTypeToSAPIcon",{
	
});

/**
 * Returns an SAP icon for a media type
 * @param {String} sMediaType - Media Type
 * @returns {String} SAP icon
 */
sap.collaboration.components.utils.MediaTypeToSAPIcon.getSAPIconForMediaType = function(sMediaType){
	var DEFAULT_SAPICON = "sap-icon://document";
	var aTokens = sMediaType.split("/");
	var sType = aTokens[0];
	var sSuffix = aTokens[1];
	
	switch(sType){
		case "audio":
			return "sap-icon://attachment-audio";
		case "video":
			return "sap-icon://attachment-video";
		case "image":
			return "sap-icon://attachment-photo";
		case "text":
			return "sap-icon://document";
		case "application":
			switch(sSuffix){
			 	case "msword":
				case "vnd.openxmlformats-officedocument.wordprocessingml.document":
				case "vnd.openxmlformats-officedocument.wordprocessingml.template":
				case "vnd.ms-word.document.macroEnabled.12":
				case "vnd.ms-word.template.macroEnabled.12":
					return "sap-icon://doc-attachment";
				case "vnd.ms-excel":
				case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
				case "vnd.openxmlformats-officedocument.spreadsheetml.template":
				case "vnd.ms-excel.sheet.macroEnabled.12":
				case "vnd.ms-excel.template.macroEnabled.12":
				case "vnd.ms-excel.addin.macroEnabled.12":
				case "vnd.ms-excel.sheet.binary.macroEnabled.12":
					return "sap-icon://excel-attachment";
				case "vnd.ms-powerpoint":
				case "vnd.openxmlformats-officedocument.presentationml.presentation":
				case "vnd.openxmlformats-officedocument.presentationml.template":
				case "vnd.openxmlformats-officedocument.presentationml.slideshow":
				case "vnd.ms-powerpoint.addin.macroEnabled.12":
				case "vnd.ms-powerpoint.presentation.macroEnabled.12":
				case "vnd.ms-powerpoint.template.macroEnabled.12":
				case "vnd.ms-powerpoint.slideshow.macroEnabled.12":
					return "sap-icon://ppt-attachment";
				case "pdf":
					return "sap-icon://pdf-attachment";
				case "mp4":
					return "sap-icon://attachment-video";
				default:
					return DEFAULT_SAPICON;
			}
		default:
			return DEFAULT_SAPICON;
	}
};