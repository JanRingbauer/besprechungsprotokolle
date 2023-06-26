sap.ui.define(
  [
    "at/clouddna/besprechungsprotokolle/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/Token",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController, MessageBox, Token) {
    "use strict";

    return BaseController.extend(
      "at.clouddna.besprechungsprotokolle.controller.Protokoll",
      {
        onInit: function () {
          let oRouter = this.getRouter();
          oRouter
            .getRoute("Protokoll")
            .attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched: function (oEvent) {
          this.protocolID = oEvent.getParameter("arguments").entityID;
          this.getView().bindElement({
            path: `/Protocols(${this.protocolID})`,
            parameters: { expand: "node,fields,todo" },
          });
        },

        onTokenSubmit: function (oEvent, aTags) {
          let name = oEvent.getParameters().value;
          let sPath = oEvent.getSource().getBindingContext().getPath();

          this.getModel().read("/Tags", {
            success: (oData, response) => {
              debugger;
            },
            filter: new sap.ui.model.Filter({
              path: "name",
              operator: "EQ",
              value1: name,
            }),
          });

          debugger;
        },

        onNewButtonPressed: function (oEvent) {
          let oModel = new sap.ui.model.json.JSONModel({ label: "" });
          this.getView().setModel(oModel, "testModel");
          if (!this.oCreateTitleDialog) {
            this.oCreateTitleDialog = new sap.m.Dialog({
              id: "dialog_neueDaten",
              type: sap.m.DialogType.Message,
              title: "Bitte geben Sie einen neuen Titel ein!",
              content: new sap.m.Input({
                value: "{testModel>/label}",
                placeholder: "Bitte geben Sie einen neuen Titel ein!",
              }),
              buttons: [
                new sap.m.Button({
                  type: sap.m.ButtonType.Emphasized,
                  text: "Erstellen",
                  press: function () {
                    console.log(oEvent);
                    this.getView()
                      .getModel()
                      .create("/ProtocolFields", {
                        label: this.getView()
                          .getModel("testModel")
                          .getProperty("/label"),
                        dataType: "String",
                        controlType: "Input",
                        value: "",
                        protocol_ID: this.protocolID
                          .replace("guid'", "")
                          .replace("'", ""),
                      });
                    this.oCreateTitleDialog.close();
                  }.bind(this),
                }),
                new sap.m.Button({
                  text: "Abbrechen",
                  press: function () {
                    this.oCreateTitleDialog.close();
                  }.bind(this),
                }),
              ],
            });

            this.getView().addDependent(this.oCreateTitleDialog);
          }

          this.oCreateTitleDialog.bindElement({
            path: "/daten",
            model: "protokollModel",
          });
          this.oCreateTitleDialog.open();
        },

        onDeletePressed: function (oEvent) {
          let sPath = oEvent.getSource().getBindingContext().getPath();
          MessageBox.warning("Wollen Sie den Eintrag wirklich löschen?", {
            title: "Löschen",
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.YES,
            onClose: function (oAction) {
              if (MessageBox.Action.YES === oAction) {
                this.getView().getModel().remove(sPath);
              }
            }.bind(this),
          });
        },

        onButtonPressed: function () {
          let length = this.getView().byId("idVBox").getItems().length;
          this.getView()
            .getModel()
            .create("/Tagesthemen", {
              title: "",
              inhalt: "",
              index: length,
              protocol_ID: this.protocolID
                .replace("guid'", "")
                .replace("'", ""),
            });
        },

        onToDoButtonPressed: function () {
          this.getView()
            .getModel()
            .create("/ToDo", {
              aufgabe: "",
              erledigt: false,
              protocol_ID: this.protocolID
                .replace("guid'", "")
                .replace("'", ""),
            });
        },

        onCheckboxClicked: function () {
          this.getView().getModel().submitChanges();
        },

        onTopPressed: function (oEvent) {
          debugger;
          let aElements = this.getView().byId("idVBox").getItems(),
            iSelectedIndex = oEvent
              .getSource()
              .getBindingContext()
              .getProperty("index"),
            iTargetIndex = iSelectedIndex - 1,
            oSelectedContext = aElements[iSelectedIndex].getBindingContext(),
            oTargetContext = aElements[iTargetIndex].getBindingContext();

          this.getView()
            .getModel()
            .update(oSelectedContext.getPath(), { index: iTargetIndex });
          this.getView()
            .getModel()
            .update(oTargetContext.getPath(), { index: iSelectedIndex });

          this.getView().getModel().submitChanges();
        },
        /* Verschiebe-Funktion (Backend) + Acion in "service.cds"
        this.getModel().callFunction("/downShift", {urlParameters: {
          target:  oEvent.getSource().getBindingContext().getProperty("ID")
        }})
        */
        onBottomPressed: function (oEvent) {
          let aElements = this.getView().byId("idVBox").getItems(),
            iSelectedIndex = oEvent
              .getSource()
              .getBindingContext()
              .getProperty("index"),
            iTargetIndex = iSelectedIndex + 1,
            oSelectedContext = aElements[iSelectedIndex].getBindingContext(),
            oTargetContext = aElements[iTargetIndex].getBindingContext();
          this.getView()
            .getModel()
            .update(oSelectedContext.getPath(), { index: iTargetIndex });
          this.getView()
            .getModel()
            .update(oTargetContext.getPath(), { index: iSelectedIndex });
        },

        onSavePressed: function () {
          this.getView().getModel().submitChanges();
          this.onNavBack();
        },
      }
    );
  }
);
