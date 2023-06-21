sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/base/Log",
    "sap/m/MessageBox",
    "sap/m/MessagePopover",
    "sap/ui/core/Fragment",
    "sap/m/MessageItem",
    "sap/ui/core/message/Message",
  ],
  function (
    Controller,
    History,
    Log,
    MessageBox,
    MessagePopover,
    _Fragment,
    MessageItem,
    Message
  ) {
    "use strict";

    return Controller.extend(
      "at.clouddna.besprechungsprotokolle.controller.BaseController",
      {
        _sContentDensityClass: "",

        setDirtyState: function (bState) {
          if (sap.ushell) {
            sap.ushell.Container.setDirtyFlag(bState);

            let sState = bState ? "true" : "false";
            this.logInfo("Dirty Flag set to: " + sState);
          }
          this.logWarning("Cant set Dirty Flag: Not in Launchpad Mode!");
        },

        getRouter: function () {
          this.setContentDensity();

          return sap.ui.core.UIComponent.getRouterFor(this);
        },
        addMessage: function (sTitle, sType, sDescription) {
          sap.ui
            .getCore()
            .getMessageManager()
            .addMessages(
              new Message({
                message: sTitle,
                type: sType,
                description: sDescription,
              })
            );
        },

        onMessagePopoverPress: function (oEvent) {
          let oPopover = new MessagePopover({
            items: {
              path: "messageModel>/",
              template: new MessageItem({
                type: "{messageModel>type}",
                title: "{messageModel>message}",
                description: "{messageModel>description}",
              }),
            },
          });

          this.getView().addDependent(oPopover);
          oPopover.openBy(oEvent.getSource());
        },

        removeMessage: function (sTitle) {
          let oMessageManager = sap.ui.getCore().getMessageManager(),
            oModel = oMessageManager.getMessageModel();

          oModel.getData().forEach(function (oMessage) {
            if (oMessage.message === sTitle) {
              oMessageManager.removeMessages(oMessage);
            }
          });
        },

        setContentDensity: function () {
          this.getView().addStyleClass(this._getContentDensityClass());
        },

        _getContentDensityClass: function () {
          if (!this._sContentDensityClass) {
            if (!sap.ui.Device.support.touch) {
              this._sContentDensityClass = "sapUiSizeCompact";
            } else {
              this._sContentDensityClass = "sapUiSizeCozy";
            }
          }
          return this._sContentDensityClass;
        },

        onNavBack: function () {
          let oPreviousHash = History.getInstance().getPreviousHash();

          if (oPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.getRouter().navTo("Master", {}, true);
          }
        },

        logDebug: function (sMessage) {
          let oLogger = Log.getLogger(this.getView().getControllerName());
          oLogger.debug("DEBUG - " + sMessage);
        },

        logError: function (sMessage) {
          let oLogger = Log.getLogger(this.getView().getControllerName());
          oLogger.error("ERROR - " + sMessage);
        },

        logFatal: function (sMessage) {
          let oLogger = Log.getLogger(this.getView().getControllerName());
          oLogger.fatal("FATAL - " + sMessage);
        },

        logInfo: function (sMessage) {
          let oLogger = Log.getLogger(this.getView().getControllerName());
          oLogger.info("INFO - " + sMessage);
        },

        logTrace: function (sMessage) {
          let oLogger = Log.getLogger(this.getView().getControllerName());
          oLogger.trace("TRACE - " + sMessage);
        },

        logWarning: function (sMessage) {
          let oLogger = Log.getLogger(this.getView().getControllerName());
          oLogger.warning("WARNING - " + sMessage);
        },

        getModel: function (sName) {
          return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        geti18nText: function (sId, aParams) {
          let oBundle = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle();

          return oBundle.getText(sId, aParams);
        },
      }
    );
  }
);
