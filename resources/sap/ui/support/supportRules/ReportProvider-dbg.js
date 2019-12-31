/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/**
 * Creates a report from data.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/thirdparty/handlebars'], function(jQuery, Handlebars) {
	"use strict";

	// Private fields
	var reportTemplateUrl = jQuery.sap.getResourcePath('sap/ui/support/supportRules/ui/Report_template.html');

	/*
	 * Functions taken from core.support.plugins.TechInfo.js
	 */
	var techInfoRenderer = {
		line: function (buffer, right, border, label, content) {
			buffer.push("<tr><td ", right ? "align='right' " : "", "valign='top'>", "<label class='sapUiSupportLabel'>", jQuery.sap.escapeHTML(label || ""), "</label></td><td",
					border ? " class='sapUiSupportTechInfoBorder'" : "", ">");
			var ctnt = content;
			if (jQuery.isFunction(content)) {
				ctnt = content(buffer);
			}
			buffer.push(jQuery.sap.escapeHTML(ctnt || ""));
			buffer.push("</td></tr>");
		},
		multiline: function (buffer, right, border, label, content){
			var that = this;
			that.line(buffer, right, border, label, function(buffer){
				buffer.push("<table border='0' cellspacing='0' cellpadding='3'>");
				jQuery.each(content, function(i,v){
					var val = "";
					if (v) {
						if (typeof (v) === "string" || typeof (v) === "string" || typeof (v) === "boolean") {
							val = v;
						} else if ((jQuery.isArray(v) || jQuery.isPlainObject(v)) && window.JSON) {
							val = window.JSON.stringify(v);
						}
					}
					that.line(buffer, false, false, i, "" + val);
				});
				buffer.push("</table>");
			});
		}
	};

	function getFile(sUrl) {
		var sContent = "",
			bError = false;
		jQuery.ajax({
			type: "GET",
			url: sUrl,
			dataType: "text",
			success: function (sResult) {
				sContent = sResult;
			},
			error: function (sResult) {
				bError = true;
			},
			data: {},
			async: false
		});
		if (bError) {
			return "";
		}
		return sContent;
	}

	/*
	 * Modified version of the function onsapUiSupportTechInfoData from core.support.plugins.TechInfo.js
	 */
	function getTechnicalInformation(technicalInfo) {
		var content = '';

		if (!technicalInfo) {
			return new Handlebars.SafeString(content);
		}

		try {
			technicalInfo.modules.sort();
			var html = ["<div class='sapUiSupportToolbar'>",
						"<div><div class='sapUiSupportTechInfoCntnt'>",
						"<table border='0' cellpadding='3'>"];
			techInfoRenderer.line(html, true, true, "SAPUI5 Version", function(buffer){
				var sapUI5Version = technicalInfo.sapUi5Version;
				if (sapUI5Version && sapUI5Version.version) {
					var oVersionInfo = sapUI5Version.version;
					var sVersion = jQuery.sap.escapeHTML(oVersionInfo.version || "");
					buffer.push(sVersion, " (built at ", jQuery.sap.escapeHTML(oVersionInfo.buildTimestamp || ""), ", last change ", jQuery.sap.escapeHTML(oVersionInfo.scmRevision || ""), ")");
				} else {
					buffer.push("not available");
				}
			});
			techInfoRenderer.line(html, true, true, "Core Version", function(buffer){
				return technicalInfo.version + " (built at " + technicalInfo.build + ", last change " + technicalInfo.change + ")";
			});
			techInfoRenderer.line(html, true, true, "Loaded jQuery Version", function(buffer){
				return technicalInfo.jquery;
			});
			techInfoRenderer.line(html, true, true, "User Agent", function(buffer){
				return technicalInfo.useragent + (technicalInfo.docmode ? ", Document Mode '" + technicalInfo.docmode + "'" : "");
			});
			techInfoRenderer.line(html, true, true, "Application", technicalInfo.appurl);
			techInfoRenderer.multiline(html, true, true, "Configuration (bootstrap)", technicalInfo.bootconfig);
			techInfoRenderer.multiline(html, true, true, "Configuration (computed)", technicalInfo.config);
			if (!jQuery.isEmptyObject(technicalInfo.libraries)) {
				techInfoRenderer.multiline(html, true, true, "Libraries", technicalInfo.libraries);
			}
			techInfoRenderer.multiline(html, true, true, "Loaded Libraries", technicalInfo.loadedLibraries);
			techInfoRenderer.line(html, true, true, "Loaded Modules", function(buffer){
				jQuery.each(technicalInfo.modules, function(i,v){
					if (v.indexOf("sap.ui.core.support") < 0) {
						buffer.push("<span>", jQuery.sap.escapeHTML(v || ""), "</span>");
						if (i < technicalInfo.modules.length - 1) {
							buffer.push(", ");
						}
					}
				});
			});
			techInfoRenderer.multiline(html, true, true, "URI Parameters", technicalInfo.uriparams);

			html.push("</table></div>");
			content = html.join('');
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem extracting technical info.');
		}

		return new Handlebars.SafeString(content);
	}

	function getEscapedString(value) {
		if (value) {
			if (jQuery.isArray(value)) {
				return jQuery.sap.escapeHTML(value.join(', '));
			} else {
				return jQuery.sap.escapeHTML(value);
			}
		} else {
			return '';
		}
	}

	function groupIssues(issues) {
		var groupedIssues = {};

		for (var i = 0; i < issues.length; i++) {
			var issue = issues[i];

			if (!groupedIssues[issue.ruleLibName]) {
				groupedIssues[issue.ruleLibName] = {};
			}

			if (!groupedIssues[issue.ruleLibName][issue.ruleId]) {
				groupedIssues[issue.ruleLibName][issue.ruleId] = [];
			}

			groupedIssues[issue.ruleLibName][issue.ruleId].push(issue);
		}

		return groupedIssues;
	}

	function renderGroup(groupName, ruleGroup, groupId, groupNumber) {
		var content = '';
		var container = '';
		var ruleNumber = 1;
		var totalIssues = 0;

		for (var group in ruleGroup) {
			var issues = ruleGroup[group];
			totalIssues += issues.length;
			var issue = issues[0]; // Get the first issue from this rule group and add all common information.
			container += '<tr id="' + groupId + '_rule_' + ruleNumber + '" class="filterable" data-severity="' + getEscapedString(issue.severity) + '" data-numberOfIssues="' + issues.length + '">';
			container += '<td>';
			container += '<div class="expandable-control collapsed-content" data-expandableElement="' + groupId + '_rule_' + ruleNumber + '_content">';
			container += '<div class="expandable-title"> ' + ruleNumber + '. ' + getEscapedString(issue.name) + ' (' + issues.length + ' issues) ' + '</div></div>';
			container += '<div id="' + groupId + '_rule_' + ruleNumber + '_content">';
			container += '<div><span class="sapUiSupportLabel">Description: </span>' + getEscapedString(issue.description) + '</div>';
			container += '<div><span class="sapUiSupportLabel">Resolution: </span>' + getEscapedString(issue.resolution) + '</div>';
			container += '<div>';
			if (issue.resolutionUrls) {
				for (var k = 0; k < issue.resolutionUrls.length; k++) {
					container += '<div><a href="' + getEscapedString(issue.resolutionUrls[k].href) + '" target="_blank">' + getEscapedString(issue.resolutionUrls[k].text) + '</a></div>';
				}
			}
			container += '</div>';
			container += '<table class="sapUiTable"><tr><th></th><th>Element Id</th><th>Class</th><th>Details</th></tr>';
			for (var i = 0; i < issues.length; i++) {
				container += '<tr><td>' + (i + 1) + '</td><td>' + getEscapedString(issues[i].context.id) + '</td>';
				container += '<td>' + getEscapedString(issues[i].context.className) + '</td>';
				container += '<td>' + getEscapedString(issues[i].details) + '</td></tr>';
			}
			container += '</table>';
			container += '</div></td>';
			container += '<td class="' + getEscapedString(issue.severity) + '">' + getEscapedString(issue.severity) + '</td>';
			container += '<td>' + getEscapedString(issue.categories) + '</td>';
			container += '<td>' + getEscapedString(issue.audiences) + '</td>';
			container += '</tr>';

			ruleNumber++;
		}

		// Make the first group expanded.
		var expandedClass = 'collapsed-content';
		if (groupNumber === 1) {
			expandedClass = 'expanded-content';
		}

		content += '<tr>';
		content += '<td colspan="100" class="expandable-control ' + expandedClass + '" data-expandableElement="' + groupId + '" data-groupName="' + groupName + '" data-groupNumber="' + groupNumber + '">';
		content += '<span class="sapUiSupportLabel expandable-title"> ' + groupNumber + '. ' + groupName + ' (' + (ruleNumber - 1) + ' rules, ' + totalIssues + ' issues)</span>';
		content += '</td></tr><tbody id="' + groupId + '">';
		content += container;
		content += '</tbody>';

		return content;
	}

	function getIssues(issues) {
		var content = '';
		var groups = {};
		var groupNumber = 1;

		if (!issues) {
			return new Handlebars.SafeString(content);
		}

		try {
			groups = groupIssues(issues);

			content += '<table class="sapUiTable"><tr><th>Title</th><th>Status</th><th>Categories</th><th>Audiences</th></tr>';

			for (var group in groups) {
				content += renderGroup(group, groups[group], 'group' + groupNumber, groupNumber);
				groupNumber++;
			}

			content += '</table>';
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem extracting issues info.');
			content = '';
		}

		return new Handlebars.SafeString(content);
	}

	function getComponentPart(value) {
		var result = '<td>';
		if (value) {
			result += jQuery.sap.escapeHTML(value);
		}
		result += '</td>';
		return result;
	}

	function getAppInfo(appInfo) {
		var content = '';

		if (!appInfo) {
			return new Handlebars.SafeString(content);
		}

		content += '<table class="sapUiTable"><tr><th>Component ID</th><th>Type</th><th>Title</th><th>Subtitle</th><th>Application version</th><th>Description</th><th>BCP Component</th></tr>';

		try {
			for (var i = 0; i < appInfo.length; i++) {
				var component = appInfo[i];
				content += '<tr>';
				content += getComponentPart(component.id);
				content += getComponentPart(component.type);
				content += getComponentPart(component.title);
				content += getComponentPart(component.subTitle);
				if (component.applicationVersion) {
					content += getComponentPart(component.applicationVersion.version);
				} else {
					content += '<td></td>';
				}
				content += getComponentPart(component.description);
				content += getComponentPart(component.ach);
				content += '</tr>';
			}

			content += '</table>';
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem extracting app info.');
			content = '';
		}

		return new Handlebars.SafeString(content);
	}

	function getSeverityFilter(severity, count, isActive) {
		var activeClass = isActive ? 'filter-active' : '';
		return '<div data-severity="' + severity + '" class="filter ' + activeClass + ' ' + severity + '">' + severity + '(' + count + ')</div>' + ' | ';
	}

	function getSeverityFilters(issues) {
		var content = '';
		var severities = {};
		var severityProperty;
		var severity;

		if (!issues) {
			return new Handlebars.SafeString(content);
		}

		try {
			for (var i = 0; i < issues.length; i++) {
				severityProperty = issues[i].severity;
				if (severities[severityProperty]) {
					severities[severityProperty]++;
				} else {
					severities[severityProperty] = 1;
				}
			}
			content += getSeverityFilter('Total', issues.length, true);

			for (severity in severities) {
				content += getSeverityFilter(severity, severities[severity], false);
			}
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem creating severity filters.');
			content = '';
		}

		return new Handlebars.SafeString(content);
	}

	function getCoreScope(displaySettings) {
		var content = '';
		content += '<div><span class="sapUiSupportLabel">' + displaySettings.displayName + '</span>';
		content += '<span class="description"> (' + displaySettings.description + ')</span></div>';
		return content;
	}

	function getParentScope(parentId, displaySettings) {
		var content = '';
		content += '<div><span class="sapUiSupportLabel">' + displaySettings.displayName + ' with id:</span> ' + parentId;
		content += '<span class="description"> (' + displaySettings.description + ')</span></div>';
		return content;
	}

	function getComponentsScope(components, displaySettings) {
		var content = '';
		// Make components collapsable if they are too many.
		if (components.length > 5) {
			content += '<div class="expandable-control collapsed-content" data-expandableElement="execution-scope-components">';
			content += '<span class="expandable-title"><span class="sapUiSupportLabel">' + displaySettings.displayName + '</span>';
			content += '<span class="description"> (' + displaySettings.description + ')</span></span></div>';
		} else {
			content += '<div><span class="sapUiSupportLabel">' + displaySettings.displayName + '</span>';
			content += '<span class="description"> (' + displaySettings.description + ')</span></div>';
		}

		content += '<ol id="execution-scope-components" class="top-margin-xsmall">';
		for (var i = 0; i < components.length; i++) {
			content += '<li>' + components[i] + '</li>';
		}
		content += '</ol>';

		return content;
	}

	function getScope(scope) {
		var content = '';

		try {
			var scopeType = scope.executionScope._getType();
			var scopeDisplaySettings = scope.scopeDisplaySettings.executionScopes[scopeType];
			var scopeDisplayTitle = scope.scopeDisplaySettings.executionScopeTitle;
			content += '<div class="sapUiSupportLabel">' + scopeDisplayTitle + ': </div>';

			switch (scopeType) {
				case 'core':
					content += getCoreScope(scopeDisplaySettings);
					break;
				case 'parent':
					content += getParentScope(scope.executionScope._getContext().parentId, scopeDisplaySettings);
					break;
				case 'components':
					content += getComponentsScope(scope.executionScope._getContext().components, scopeDisplaySettings);
					break;
			}
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem extracting scope info.');
			content = '';
		}

		return new Handlebars.SafeString(content);
	}

	Handlebars.registerHelper('getTechnicalInformation', function (technicalInfo) {
		return getTechnicalInformation(technicalInfo);
	});
	Handlebars.registerHelper('getIssues', function (issues) {
		return getIssues(issues);
	});
	Handlebars.registerHelper('getAppInfo', function (appInfo) {
		return getAppInfo(appInfo);
	});
	Handlebars.registerHelper('getSeverityFilters', function (issues) {
		return getSeverityFilters(issues);
	});
	Handlebars.registerHelper('getScope', function (scope) {
		return getScope(scope);
	});

	// Public functions

	/**
	 * Creates an html string containing the whole report.
	 * @param {Object} oData
	 * @returns {String}
	 */
	function getReportHtml(oData) {
		var template = Handlebars.compile(getFile(reportTemplateUrl));

		var reportContext = {
			technicalInfo: oData.technical,
			issues: oData.issues,
			appInfo: oData.application,
			metadata: {
				title: 'SAPUI5 Check Results',
				title_TechnicalInfo: 'Technical Information',
				title_Issues: 'Issues',
				title_AppInfo: 'Application Information',
				timestamp: new Date(),
				scope: oData.scope,
				analysisDuration: oData.analysisDuration,
				analysisDurationTitle: oData.analysisDurationTitle
			}
		};

		return template(reportContext);
	}

	return {
		getReportHtml: getReportHtml
	};
}, true);