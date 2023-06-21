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
          let oRouter = this.getOwnerComponent().getRouter();
          oRouter
            .getRoute("Protokoll")
            .attachPatternMatched(this._onPatternMatched, this);

          let oAllgemeinModel = new sap.ui.model.json.JSONModel([]);
          this.getView().setModel(oAllgemeinModel, "allgemeinModel");

          let oToDo = [
            {
              input: "Object Page einbauen",
              modelText: "",
            },
          ];
          let oToDoModel = new sap.ui.model.json.JSONModel([]);
          this.getView().setModel(oToDoModel, "todoModel");

          let oModel = new sap.ui.model.json.JSONModel([]);
          this.getView().setModel(oModel, "staticModel");

          let oMultiInput = this.getView().byId("multiInput");
          oMultiInput.setTokens([
            new Token({ text: "ABAP", key: "0001" }),
            new Token({ text: "JavaScript", key: "0002" }),
            new Token({ text: "Java", key: "0003" }),
            new Token({ text: "Hofer", key: "0004" }),
            new Token({ text: "Billa", key: "0005" }),
            new Token({ text: "Spar", key: "0006" }),
          ]);

          let fnValidator = function (args) {
            var text = args.text;

            return new Token({ key: text, text: text });
          };
          oMultiInput.addValidator(fnValidator);

          let oMultiInputModel = new sap.ui.model.json.JSONModel();
          this.getView().setModel(oMultiInputModel, "inputModel");

          let aProtokollDaten = {
            daten: [
              {
                label: "Anzahl an Personen",
                value: "4",
              },
              {
                label: "Hauptthema",
                value: "Frontend",
              },
            ],
          };
          let oDatenModel = new sap.ui.model.json.JSONModel(aProtokollDaten);
          this.getView().setModel(oDatenModel, "protokollModel");
        },

        _onPatternMatched: function (oEvent) {
          this.protocolID = oEvent.getParameter("arguments").entityID;
          this.getView().bindElement({
            path: `/Protocols(${this.protocolID})`,
            parameters: { expand: "node,fields,todo" },
          });
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

        onDeleteTitlePressed: function (oEvent) {
          let sPath = oEvent.getSource().getBindingContext().getPath();
          this.getView().getModel().remove(sPath);
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

        onToDoDeletePressed: function (oEvent) {
          let sPath = oEvent.getSource().getBindingContext().getPath();
          this.getView().getModel().remove(sPath);
        },

        onCheckboxClicked: function () {
          this.getView().getModel().submitChanges();
        },

        onDeletePressed: function (oEvent) {
          let sPath = oEvent.getSource().getBindingContext().getPath();
          this.getView().getModel().remove(sPath);
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
