sap.ui.define(
  [
    "at/clouddna/besprechungsprotokolle/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController, JSONModel, MessageBox, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend(
      "at.clouddna.besprechungsprotokolle.controller.Main",
      {
        onInit: function () {
          let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter
            .getRoute("RouteMain")
            .attachPatternMatched(this._onPatternMatched, this);
        },
        // _onPatternMatched: function () {
        // },

        onListItemPressed: function (oEvent) {
          let sPath = oEvent.getSource().getBindingContext().getPath();
          let oRouter = this.getRouter();
          oRouter.navTo("Protokoll", {
            entityID: sPath.split("(")[1].split(")")[0],
          });
        },

        onSearch: function (oEvent) {
          let aFilters = [];
          let sQuery = oEvent.getSource().getValue();
          if (sQuery && sQuery.length > 0) {
            let filter = new Filter("name", FilterOperator.Contains, sQuery);
            aFilters.push(filter);
          }
          var oTreeTable = this.byId("treeTable");
          var oBinding = oTreeTable.getBinding("rows");
          oBinding.filter(aFilters);
        },

        onNeuesVerzeichnisPressed: function (oEvent) {
          let oModel = new sap.ui.model.json.JSONModel({ name: "" });
          this.getView().setModel(oModel, "labelModel");
          if (!this.oCreateVerzeichnisDialog) {
            this.oCreateVerzeichnisDialog = new sap.m.Dialog({
              id: "dialog_neuesVerzeichnis",
              type: sap.m.DialogType.Message,
              title: "neues Verzeichnis erstellen",
              content: new sap.m.Input({
                value: "{labelModel>/name}",
                placeholder: "Bitte geben Sie den Verzeichnis Namen ein!",
              }),
              buttons: [
                new sap.m.Button({
                  type: sap.m.ButtonType.Emphasized,
                  text: "Erstellen",
                  press: function () {
                    this.getView()
                      .getModel()
                      .create(
                        "/Categories",
                        {
                          name: this.getView()
                            .getModel("labelModel")
                            .getProperty("/name"),
                          hierarchyLevel: 0,
                          isNoteItem: false,
                          drillState: "expanded",
                        },
                        {
                          success: () => {
                            this.getView()
                              .byId("treeTable")
                              .getBinding("rows")
                              .refresh(true);
                          },
                        }
                      );
                    this.oCreateVerzeichnisDialog.close();
                    this.getView().getModel("labelModel>name").delete();
                  }.bind(this),
                }),
                new sap.m.Button({
                  text: "Abbrechen",
                  press: function () {
                    this.oCreateVerzeichnisDialog.close();
                  }.bind(this),
                }),
              ],
            });

            this.getView().addDependent(this.oCreateVerzeichnisDialog);
          }

          this.oCreateVerzeichnisDialog.bindElement({
            path: "/categories",
            model: "testdatenModel",
          });

          this.oCreateVerzeichnisDialog.open();
        },

        onNewPressed: function (oEvent, typ) {
          let sPath = oEvent
            .getSource()
            .getBindingContext()
            .getPath()
            .split("'")[1];
          this.openNamingDialog((oEvent) => {
            let sName = oEvent
              .getSource()
              .getParent()
              .getContent()[0]
              .getValue();

            this.getView()
              .getModel()
              .create(
                "/Categories",
                {
                  name: sName,
                  parentNode_nodeID: sPath,
                  hierarchyLevel: 1,
                  isNoteItem: false,
                  drillState: "expanded",
                },
                {
                  success: (oData, response) => {
                    this.getView()
                      .byId("treeTable")
                      .getBinding("rows")
                      .refresh(true);
                  },
                }
              );
          }, "neues Unterverzeichnis erstellen");
        },

        onNewProtokollPressed: function (oEvent, typ) {
          let sPath = oEvent
            .getSource()
            .getBindingContext()
            .getPath()
            .split("'")[1];
          this.openNamingDialog((oEvent) => {
            let sName = oEvent
              .getSource()
              .getParent()
              .getContent()[0]
              .getValue();

            this.getView()
              .getModel()
              .create(
                "/Protocols",
                {
                  name: sName,
                  node_nodeID: sPath,
                },
                {
                  success: (oData, response) => {
                    // let sID = oData.ID;
                    // let oRouter = this.getOwnerComponent().getRouter();
                    // oRouter.navTo("Protokoll", {
                    //   entityID: sID,
                    //
                    this.getView()
                      .byId("treeTable")
                      .getBinding("rows")
                      .refresh(true);
                  },
                }
              );
          }, "neues Protokoll erstellen");
        },

        onDeletePressed: function (oEvent) {
          let Node = oEvent.getSource().getBindingContext().getObject();
          MessageBox.warning("Wollen Sie den Eintrag wirklich löschen?", {
            title: "Löschen",
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.YES,
            onClose: function (oAction) {
              if (MessageBox.Action.YES === oAction) {
                let sPath = `/${
                  Node.isNoteItem ? "Protocols" : "Categories"
                }(guid'${Node.nodeID}')`;
                this.getView().getModel().remove(sPath);
                this.getView()
                  .byId("treeTable")
                  .getBinding("rows")
                  .refresh(true);
              }
            }.bind(this),
          });
        },

        openNamingDialog: function (fnOnOkPressed, title) {
          if (!this._oNamingDialog) {
            this._oNamingDialog = new sap.m.Dialog({
              type: sap.m.DialogType.Message,
              title: "",
              content: new sap.m.Input({
                value: "{testdatenModel>/newProtokollName}",
                placeholder: "Bitte geben Sie den Namen ein!",
              }),
              buttons: [
                new sap.m.Button({
                  type: sap.m.ButtonType.Emphasized,
                  text: "Erstellen",
                  press: (oEvent) => {
                    fnOnOkPressed(oEvent);
                    this._oNamingDialog.close();
                  },
                }),
                new sap.m.Button({
                  text: "Abbrechen",
                  press: function () {
                    this._oNamingDialog.close();
                  }.bind(this),
                }),
              ],
            });
          } else {
            this._oNamingDialog.removeAllButtons();
            this._oNamingDialog.addButton(
              new sap.m.Button({
                type: sap.m.ButtonType.Emphasized,
                text: "Erstellen",
                press: (oEvent) => {
                  fnOnOkPressed(oEvent);
                  this._oNamingDialog.close();
                  this.getView()
                    .getModel("testdatenModel>/newProtokollName")
                    .delete();
                },
              })
            );
          }
          this._oNamingDialog.setTitle(title);
          this._oNamingDialog.open();
        },
      }
    );
  }
);
