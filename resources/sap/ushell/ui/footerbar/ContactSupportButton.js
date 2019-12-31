/*!
 * ${copyright}
 */
sap.ui.define(['sap/ushell/library','sap/ushell/resources','sap/ushell/ui/launchpad/AccessibilityCustomData','sap/ushell/ui/launchpad/ActionItem'],function(l,r,A,a){"use strict";var C=a.extend("sap.ushell.ui.footerbar.ContactSupportButton",{metadata:{library:"sap.ushell"}});C.prototype.init=function(){if(a.prototype.init){a.prototype.init.apply(this,arguments);}this.setIcon('sap-icon://email');this.setText(r.i18n.getText("contactSupportBtn"));this.attachPress(this.showContactSupportDialog);this.setEnabled();};C.prototype.showContactSupportDialog=function(){sap.ui.require(['sap/ushell/services/Container','sap/ui/layout/form/SimpleForm','sap/ui/layout/form/SimpleFormLayout','sap/m/TextArea','sap/m/Link','sap/m/Label','sap/m/Text','sap/m/Dialog','sap/m/Button','sap/ushell/UserActivityLog'],function(b,S,c,T,L,d,e,D,B,U){var f="",u="",g="",h=[],o,i;i=function(){this.oDialog.removeContent(this.oBottomSimpleForm.getId());this.oBottomSimpleForm.destroy();if(this.oClientContext.navigationData.applicationInformation){f=this.oClientContext.navigationData.applicationInformation.applicationType;u=this.oClientContext.navigationData.applicationInformation.url;g=this.oClientContext.navigationData.applicationInformation.additionalInformation;}h.push(new e({text:this.translationBundle.getText("loginDetails")}).addStyleClass('sapUshellContactSupportHeaderInfoText'));h.push(new d({text:this.translationBundle.getText("userFld")}));h.push(new e({text:this.oClientContext.userDetails.fullName||''}));h.push(new d({text:this.translationBundle.getText("serverFld")}));h.push(new e({text:window.location.host}));if(this.oClientContext.userDetails.eMail&&this.oClientContext.userDetails.eMail!==''){h.push(new d({text:this.translationBundle.getText("eMailFld")}));h.push(new e({text:this.oClientContext.userDetails.eMail||''}));}h.push(new d({text:this.translationBundle.getText("languageFld")}));h.push(new e({text:this.oClientContext.userDetails.Language||''}));if(this.oClientContext.shellState==="app"||this.oClientContext.shellState==="standalone"){h.push(new e({text:''}));h.push(new e({text:this.translationBundle.getText("navigationDataFld")}).addStyleClass('sapUshellContactSupportHeaderInfoText'));h.push(new d({text:this.translationBundle.getText("hashFld")}));h.push(new e({text:this.oClientContext.navigationData.navigationHash||''}));h.push(new e({text:''}));h.push(new e({text:this.translationBundle.getText("applicationInformationFld")}).addStyleClass('sapUshellContactSupportHeaderInfoText'));h.push(new d({text:this.translationBundle.getText("applicationTypeFld")}));h.push(new e({text:f}));h.push(new d({text:this.translationBundle.getText("urlFld")}));h.push(new e({text:u}));h.push(new d({text:this.translationBundle.getText("additionalInfoFld")}));h.push(new e({text:g}));}this.oBottomSimpleForm=new sap.ui.layout.form.SimpleForm('technicalInfoBox',{layout:sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout,content:h}).addStyleClass("sapUshellTechnicalInfoBox");if(sap.ui.Device.os.ios&&sap.ui.Device.system.phone){this.oBottomSimpleForm.addStyleClass("sapUshellContactSupportFixWidth");}o=this.oBottomSimpleForm.onAfterRendering;this.oBottomSimpleForm.onAfterRendering=function(){o.apply(this,arguments);var n=jQuery(this.getDomRef());n.attr("tabIndex",0);jQuery.sap.delayedCall(700,n,function(){this.focus();});};this.oDialog.addContent(this.oBottomSimpleForm);}.bind(this);this._embedLoginDetailsInBottomForm=i;this.translationBundle=r.i18n;this.oClientContext=U.getMessageInfo();this.oLink=new L({text:this.translationBundle.getText("technicalDataLink")});this.oBottomSimpleForm=new S("bottomForm",{editable:false,content:[this.oLink]});this.sendButton=new B("contactSupportSendBtn",{text:this.translationBundle.getText("sendBtn"),enabled:false,press:function(){var s=sap.ushell.Container.getService("SupportTicket"),t=this.oTextArea.getValue(),j={text:t,clientContext:this.oClientContext},p=s.createTicket(j);p.done(function(){sap.ushell.Container.getService("Message").info(this.translationBundle.getText("supportTicketCreationSuccess"));}.bind(this));p.fail(function(){sap.ushell.Container.getService("Message").error(this.translationBundle.getText("supportTicketCreationFailed"));}.bind(this));this.oDialog.close();}.bind(this)});this.cancelButton=new B("contactSupportCancelBtn",{text:this.translationBundle.getText("cancelBtn"),press:function(){this.oDialog.close();}.bind(this)});this.oTextArea=new T("textArea",{rows:7,liveChange:function(){if(/\S/.test(this.oTextArea.getValue())){this.sendButton.setEnabled(true);}else{this.sendButton.setEnabled(false);this.oTextArea.setValue("");}}.bind(this)});this.oTopSimpleForm=new S("topForm",{editable:false,content:[this.oTextArea],layout:c.ResponsiveGridLayout});this.oDialog=new D({id:"ContactSupportDialog",title:this.translationBundle.getText("contactSupportBtn"),contentWidth:"29.6rem",leftButton:this.sendButton,rightButton:this.cancelButton,initialFocus:"textArea",afterOpen:function(){jQuery("#textArea").on("focusout",function(){window.scrollTo(0,0);});},afterClose:function(){this.oDialog.destroy();}.bind(this)}).addStyleClass("sapUshellContactSupportDialog");this.oTextArea.setPlaceholder(this.translationBundle.getText("txtAreaPlaceHolderHeader"));this.oLink.attachPress(i.bind(this));this.oDialog.addCustomData(new A({key:"aria-label",value:this.translationBundle.getText("ContactSupportArialLabel"),writeToDom:true}));this.oDialog.addContent(this.oTopSimpleForm);this.oDialog.addContent(this.oBottomSimpleForm);this.oDialog.open();}.bind(this));};C.prototype.setEnabled=function(e){if(!sap.ushell.Container){if(this.getEnabled()){jQuery.sap.log.warning("Disabling 'Contact Support' button: unified shell container not initialized",null,"sap.ushell.ui.footerbar.ContactSupportButton");}e=false;}a.prototype.setEnabled.call(this,e);};return C;},true);
