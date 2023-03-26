// *******************************************
// Color Panel Extension
// *******************************************

// Sets variables for color (starting with green, orange and red). Also we declare our color picker that is used in the dropdown menu.
var colorpicker = ["No Color","Green","Orange","Red","Blue","Purple","Yellow"];
var colorpickerVector = [new THREE.Vector4(0,0,0,1),new THREE.Vector4(0,1,0,1),new THREE.Vector4(1,0.5,0,1),new THREE.Vector4(1,0,0,1),new THREE.Vector4(0,0,1,1),new THREE.Vector4(1,0,1,1),new THREE.Vector4(1,1,0,1)];
var chosenColor = [colorpickerVector[1],colorpickerVector[2],colorpickerVector[3]];
var firstlimit = 100;
var secondlimit = 200;
const checkboxOptions = [
    'Total',
    'Raw material',
    'Manufacturing',
    'Installation',
    'Operational',
    'End-of-life',
    'Emission per room',
    'Emission per room popup',
];

class Colorization extends Autodesk.Viewing.Extension {

    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._button = null;
        this._panel = null;
        this._panel_tab = null;
        this._panel_tab2 = null;
        
    }

    load() {
        console.log('Colorization is being loaded...');
        this.onSelectionBinded = this.onSelectionEvent.bind(this);
        return true;
    }

    unload() {
        if (this._group) {
            this._group.removeControl(this._button);
            this._group.removeControl(this._panel);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }
        this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionBinded);
        this.onSelectionBinded = null;
        console.log('Colorization has been unloaded');
        return true;
    }

    onToolbarCreated() {
        // Create a new toolbar group if it doesn't exist
        this._group = this.viewer.toolbar.getControl('ColorToolbar');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('ColorToolbar');
            this.viewer.toolbar.addControl(this._group);
        }
        // Add new Setting Panel
        //this._panel = new Autodesk.Viewing.UI.SettingsPanel('DGNSettingsPanel');
        //this._group.addControl(this._panel);

        // Add a new button to the toolbar group
        this._button = new Autodesk.Viewing.UI.Button('ColorButton');
        this._button.onClick = (ev) => {
            // Execute an action here
            this.populatePanel();
        };
        this._button.setToolTip('Colorization settings');
        this._button.addClass('ColorizationIcon');
        this._group.addControl(this._button);
    }

    populatePanel(){
        // Check if the panel is created or not
        if (this._panel == null) {
            this._panel = new Autodesk.Viewing.UI.SettingsPanel(this.viewer.container, 'emissionfiltering', 'Emission filtering' /*,options*/);
            this._panel.setGlobalManager(this.viewer.globalManager);
            this._panel.container.style.setProperty('background-color', 'white');
        }
        
        // Show/hide docking panel
        this._panel.setVisible(!this._panel.isVisible());

        // If panel is NOT visible, exit the function
        if (!this._panel.isVisible())
            return;

        if (this._panel_tab == null || this._panel_tab2 == null) {

            let tabId1 = 'filtertoggleTab';
            let tabId2 = 'colorizationsettingsTab';
            this._panel_tab = this._panel.addTab(tabId1, 'Filter toggle' /*,options*/);
            this._panel_tab2 = this._panel.addTab(tabId2, 'Color picker and grouping limits' /*,options*/);
            // The user starts with the first tab
            this._panel.selectTab(tabId1);
            // Add label to make sure the dropdowns shows in the window
            this._panel.addLabel(tabId2,'Options:'); 
            // Adds all the dropdowns for the user. Changes the value of a variable when a color is chosen

            this._panel.addSlider(tabId2, "First grouping upper limit (in kg)", 0, 13000, 100, function(valuechosen){
                firstlimit=valuechosen.detail.value},null);
            this._panel.addSlider(tabId2, "Second grouping upper limit (in kg)", 0, 13000, 300, function(valuechosen){
                secondlimit=valuechosen.detail.value},null);

            this._panel.addDropDownMenu(tabId2,'First grouping color',colorpicker,1,function(chosenvalue){
                chosenColor[0] = colorpickerVector[chosenvalue.detail.target.selectedIndex];
            });
            this._panel.addDropDownMenu(tabId2,'Second grouping color',colorpicker,2,function(chosenvalue){
                chosenColor[1] = colorpickerVector[chosenvalue.detail.target.selectedIndex];
            });
            this._panel.addDropDownMenu(tabId2,'Third grouping color',colorpicker,3,function(chosenvalue){
                chosenColor[2] = colorpickerVector[chosenvalue.detail.target.selectedIndex];
            });

            this._panel.addLabel(tabId1,'Options:'); 


            checkboxOptions.forEach((option, index) => {
                this._panel.addCheckbox(
                    tabId1,
                    option,
                    false,
                    (checked) => this.changeSelectionBehaviour(checked, `${index}`),
                    `Colors the model according to the CO2e emissions of the object.`
                );
            });
            // REMEMBER TO TRY THESE TWO LATE ----------------------------------
            //this._panel.sizeToContent(this.viewer.container);
    

            this._panel.resizeToContent();
        }
    }

    changeSelectionBehaviour(checked, indexOfChecked) {
        if (checked) {
            // uncheck all other checkboxes when one is checked
            const checkboxes = this._panel.container.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked && checkbox.id !== checkboxOptions[indexOfChecked]+'_check') {
                    checkbox.checked = false;
                }
            });
            switch (indexOfChecked) {
                case "0":
                    console.log("Checked Total - Running filter");
                    var leaves = [];
                    new Promise((resolve, reject) => {
                        this.viewer.model.getObjectTree(tree => {
                            tree.enumNodeChildren(tree.getRootId(), dbId => {
                                if (tree.getChildCount(dbId) === 0) {
                                    leaves.push(dbId);
                                }
                            }, true);
                        })
                        resolve(leaves)
                    })
                    .then(() => {
                        new Promise((resolve, reject) => {
                            this.viewer.model.getBulkProperties2(leaves, { "propFilter": ["Category","Type Name"] },
                                output => {
                                    var firstgroup = [];
                                    var secondgroup = [];
                                    var thirdgroup = [];
                                    var hidegroup = [];

                                    output.forEach(element => {
                                        try {
                                            var TypeName = element.properties[1].displayValue;
                                            var SQL_values =
                                                SQL_data[TypeName][0].CO2e_installation +
                                                SQL_data[TypeName][0].CO2e_installation_trans_to_site +
                                                SQL_data[TypeName][0].CO2e_maintenance +
                                                SQL_data[TypeName][0].CO2e_manufacturing +
                                                SQL_data[TypeName][0].CO2e_manufacturing_trans_to_stor +
                                                SQL_data[TypeName][0].CO2e_operation +
                                                SQL_data[TypeName][0].CO2e_rawmaterial +
                                                SQL_data[TypeName][0].CO2e_rawmaterial_trans_to_manu +
                                                SQL_data[TypeName][0].CO2e_recycling
                                        } catch (error) {
                                            //console.log("Error at reading of SQL database: " + error)
                                        }
                                        if (SQL_values >= secondlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            thirdgroup.push(element.dbId);
                                        } else if (SQL_values > firstlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            secondgroup.push(element.dbId);
                                        } else if (SQL_values >= 0 && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms"){
                                            firstgroup.push(element.dbId);
                                        }else{
                                            hidegroup.push(element.dbId);
                                        }

                                    });
                                    for (var dbIds of firstgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[0], this.viewer.model, true);}
                                    for (var dbIds of secondgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[1], this.viewer.model, true);}
                                    for (var dbIds of thirdgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[2], this.viewer.model, true);}
                                    for (var dbIds of hidegroup) {
                                        this.viewer.hide(dbIds, this.viewer.model, true);}
                                    resolve(output);
                                }, 
                            null);
                        })
                    });
                    break;
                case "1":
                    console.log("Checked Rawmaterial - Running filter");
                    var leaves = [];
                    new Promise((resolve, reject) => {
                        this.viewer.model.getObjectTree(tree => {
                            tree.enumNodeChildren(tree.getRootId(), dbId => {
                                if (tree.getChildCount(dbId) === 0) {
                                    leaves.push(dbId);
                                }
                            }, true);
                        })
                        resolve(leaves)
                    })
                    .then(() => {
                        new Promise((resolve, reject) => {
                            this.viewer.model.getBulkProperties2(leaves, { "propFilter": ["Category","Type Name"] },
                                output => {
                                    var firstgroup = [];
                                    var secondgroup = [];
                                    var thirdgroup = [];
                                    var hidegroup = [];

                                    output.forEach(element => {
                                        try {
                                            var TypeName = element.properties[1].displayValue;
                                            var SQL_values =
                                                SQL_data[TypeName][0].CO2e_rawmaterial +
                                                SQL_data[TypeName][0].CO2e_rawmaterial_trans_to_manu
                                        } catch (error) {
                                            //console.log("Error at reading of SQL database: " + error)
                                        }
                                        if (SQL_values >= secondlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            thirdgroup.push(element.dbId);
                                        } else if (SQL_values > firstlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            secondgroup.push(element.dbId);
                                        } else if (SQL_values >= 0 && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms"){
                                            firstgroup.push(element.dbId);
                                        }else{
                                            hidegroup.push(element.dbId);
                                        }
                                    });
                                    for (var dbIds of firstgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[0], this.viewer.model, true);}
                                    for (var dbIds of secondgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[1], this.viewer.model, true);}
                                    for (var dbIds of thirdgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[2], this.viewer.model, true);}
                                    for (var dbIds of hidegroup) {
                                        this.viewer.hide(dbIds, this.viewer.model, true);}
                                    resolve(output);
                                }, 
                            null);
                        })
                    });
                    break;
                case "2":
                    console.log("Checked Manufacturing - Running filter");
                    var leaves = [];
                    new Promise((resolve, reject) => {
                        this.viewer.model.getObjectTree(tree => {
                            tree.enumNodeChildren(tree.getRootId(), dbId => {
                                if (tree.getChildCount(dbId) === 0) {
                                    leaves.push(dbId);
                                }
                            }, true);
                        })
                        resolve(leaves)
                    })
                    .then(() => {
                        new Promise((resolve, reject) => {
                            this.viewer.model.getBulkProperties2(leaves, { "propFilter": ["Category","Type Name"] },
                                output => {
                                    var firstgroup = [];
                                    var secondgroup = [];
                                    var thirdgroup = [];
                                    var hidegroup = [];

                                    output.forEach(element => {
                                        try {
                                            var TypeName = element.properties[1].displayValue;
                                            var SQL_values =
                                                SQL_data[TypeName][0].CO2e_manufacturing +
                                                SQL_data[TypeName][0].CO2e_manufacturing_trans_to_stor
                                        } catch (error) {
                                            //console.log("Error at reading of SQL database: " + error)
                                        }
                                        if (SQL_values >= secondlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            thirdgroup.push(element.dbId);
                                        } else if (SQL_values > firstlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            secondgroup.push(element.dbId);
                                        } else if (SQL_values >= 0 && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms"){
                                            firstgroup.push(element.dbId);
                                        }else{
                                            hidegroup.push(element.dbId);
                                        }
                                    });
                                    for (var dbIds of firstgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[0], this.viewer.model, true);}
                                    for (var dbIds of secondgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[1], this.viewer.model, true);}
                                    for (var dbIds of thirdgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[2], this.viewer.model, true);}
                                    for (var dbIds of hidegroup) {
                                        this.viewer.hide(dbIds, this.viewer.model, true);}
                                    resolve(output);
                                }, 
                            null);
                        })
                    });
                    break;
                case "3":
                    console.log("Checked Installation - Running filter");
                    var leaves = [];
                    new Promise((resolve, reject) => {
                        this.viewer.model.getObjectTree(tree => {
                            tree.enumNodeChildren(tree.getRootId(), dbId => {
                                if (tree.getChildCount(dbId) === 0) {
                                    leaves.push(dbId);
                                }
                            }, true);
                        })
                        resolve(leaves)
                    })
                    .then(() => {
                        new Promise((resolve, reject) => {
                            this.viewer.model.getBulkProperties2(leaves, { "propFilter": ["Category","Type Name"] },
                                output => {
                                    var firstgroup = [];
                                    var secondgroup = [];
                                    var thirdgroup = [];
                                    var hidegroup = [];

                                    output.forEach(element => {
                                        try {
                                            var TypeName = element.properties[1].displayValue;
                                            var SQL_values =
                                                SQL_data[TypeName][0].CO2e_installation +
                                                SQL_data[TypeName][0].CO2e_installation_trans_to_site
                                        } catch (error) {
                                            //console.log("Error at reading of SQL database: " + error)
                                        }
                                        if (SQL_values >= secondlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            thirdgroup.push(element.dbId);
                                        } else if (SQL_values > firstlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            secondgroup.push(element.dbId);
                                        } else if (SQL_values >= 0 && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms"){
                                            firstgroup.push(element.dbId);
                                        }else{
                                            hidegroup.push(element.dbId);
                                        }
                                    });
                                    for (var dbIds of firstgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[0], this.viewer.model, true);}
                                    for (var dbIds of secondgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[1], this.viewer.model, true);}
                                    for (var dbIds of thirdgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[2], this.viewer.model, true);}
                                    for (var dbIds of hidegroup) {
                                        this.viewer.hide(dbIds, this.viewer.model, true);}
                                    resolve(output);
                                }, 
                            null);
                        })
                    });
                    break;
                case "4":
                    console.log("Checked Operation - Running filter");
                    var leaves = [];
                    new Promise((resolve, reject) => {
                        this.viewer.model.getObjectTree(tree => {
                            tree.enumNodeChildren(tree.getRootId(), dbId => {
                                if (tree.getChildCount(dbId) === 0) {
                                    leaves.push(dbId);
                                }
                            }, true);
                        })
                        resolve(leaves)
                    })
                    .then(() => {
                        new Promise((resolve, reject) => {
                            this.viewer.model.getBulkProperties2(leaves, { "propFilter": ["Category","Type Name"] },
                                output => {
                                    var firstgroup = [];
                                    var secondgroup = [];
                                    var thirdgroup = [];
                                    var hidegroup = [];

                                    output.forEach(element => {
                                        try {
                                            var TypeName = element.properties[1].displayValue;
                                            var SQL_values =
                                                SQL_data[TypeName][0].CO2e_operation+
                                                SQL_data[TypeName][0].CO2e_maintenance
                                        } catch (error) {
                                            //console.log("Error at reading of SQL database: " + error)
                                        }
                                        if (SQL_values >= secondlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            thirdgroup.push(element.dbId);
                                        } else if (SQL_values > firstlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            secondgroup.push(element.dbId);
                                        } else if (SQL_values >= 0 && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms"){
                                            firstgroup.push(element.dbId);
                                        }else{
                                            hidegroup.push(element.dbId);
                                        }
                                    });
                                    for (var dbIds of firstgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[0], this.viewer.model, true);}
                                    for (var dbIds of secondgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[1], this.viewer.model, true);}
                                    for (var dbIds of thirdgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[2], this.viewer.model, true);}
                                    for (var dbIds of hidegroup) {
                                        this.viewer.hide(dbIds, this.viewer.model, true);}
                                    resolve(output);
                                }, 
                            null);
                        })
                    });
                    break;
                case "5":
                    console.log("Checked End of life - Running filter");
                    var leaves = [];
                    new Promise((resolve, reject) => {
                        this.viewer.model.getObjectTree(tree => {
                            tree.enumNodeChildren(tree.getRootId(), dbId => {
                                if (tree.getChildCount(dbId) === 0) {
                                    leaves.push(dbId);
                                }
                            }, true);
                        })
                        resolve(leaves)
                    })
                    .then(() => {
                        new Promise((resolve, reject) => {
                            this.viewer.model.getBulkProperties2(leaves, { "propFilter": ["Category","Type Name"] },
                                output => {
                                    var firstgroup = [];
                                    var secondgroup = [];
                                    var thirdgroup = [];
                                    var hidegroup = [];

                                    output.forEach(element => {
                                        try {
                                            var TypeName = element.properties[1].displayValue;
                                            var SQL_values =
                                                SQL_data[TypeName][0].CO2e_recycling
                                        } catch (error) {
                                            //console.log("Error at reading of SQL database: " + error)
                                        }
                                        if (SQL_values >= secondlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            thirdgroup.push(element.dbId);
                                        } else if (SQL_values > firstlimit && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms") {
                                            secondgroup.push(element.dbId);
                                        } else if (SQL_values >= 0 && element.properties[0].displayValue != "Revit Spaces" && element.properties[0].displayValue != "Revit Rooms"){
                                            firstgroup.push(element.dbId);
                                        }else{
                                            hidegroup.push(element.dbId);
                                        }
                                    });
                                    for (var dbIds of firstgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[0], this.viewer.model, true);}
                                    for (var dbIds of secondgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[1], this.viewer.model, true);}
                                    for (var dbIds of thirdgroup) {
                                        this.viewer.setThemingColor(dbIds, chosenColor[2], this.viewer.model, true);}
                                    for (var dbIds of hidegroup) {
                                        this.viewer.hide(dbIds, this.viewer.model, true);}
                                    resolve(output);
                                }, 
                            null);
                        })
                    });
                    break;
                case "6":
                    console.log("Checked Per Room - Running filter");
                    getCO2RoomInfo()
                    .then((dataoutput) => {
                        //createPopup(dataoutput, "Room CO2e");
                        var leaves = [];
                        new Promise((resolve, reject) => {
                            this.viewer.model.getObjectTree(tree => {
                                tree.enumNodeChildren(tree.getRootId(), dbId => {
                                    if (tree.getChildCount(dbId) === 0) {
                                        leaves.push(dbId);
                                    }
                                }, true);
                            })
                            resolve(leaves)
                    }).then((leaves) => {
                        this.viewer.model.getBulkProperties2(leaves, { "propFilter": ["Category","Room Name"]},
                        output => {
                            new Promise((resolve, reject) => {
                            var firstgroup = [];
                            var secondgroup = [];
                            var thirdgroup = [];
                            var hidegroup = [];
                            console.log(output);
                            output.forEach(element => {
                                try {
                                    var RoomName = element.properties[1].displayValue;
                                    var CategoryValue = element.properties[0].displayValue;
                                } catch (error) {
                                    //console.log("Error at reading of SQL database: " + error)
                                }
                                if (dataoutput[RoomName] >= secondlimit && (CategoryValue == "Revit Spaces" || CategoryValue ==  "Revit Rooms")) {
                                    thirdgroup.push(element.dbId);
                                } else if (dataoutput[RoomName] > firstlimit && (CategoryValue == "Revit Spaces" || CategoryValue ==  "Revit Rooms")) {
                                    secondgroup.push(element.dbId);
                                } else if (dataoutput[RoomName] >= 0 && (CategoryValue == "Revit Spaces" || CategoryValue ==  "Revit Rooms")){
                                    firstgroup.push(element.dbId);
                                }else{
                                    hidegroup.push(element.dbId);
                                }
                            });
                            for (var dbIds of firstgroup) {
                                this.viewer.setThemingColor(dbIds, chosenColor[0], this.viewer.model, true);}
                            for (var dbIds of secondgroup) {
                                this.viewer.setThemingColor(dbIds, chosenColor[1], this.viewer.model, true);}
                            for (var dbIds of thirdgroup) {
                                this.viewer.setThemingColor(dbIds, chosenColor[2], this.viewer.model, true);}
                            for (var dbIds of hidegroup) {
                                this.viewer.hide(dbIds, this.viewer.model, true);}
                            console.log(firstgroup);
                            console.log(secondgroup);
                            console.log(thirdgroup);
                            console.log(hidegroup);
                            resolve(output);
                            
                        }),
                        function(error) {
                            console.log(error);
                        };
                    })
                    });
                    })
                    .catch((error) => {
                        console.error("Error getting CO2 room info:", error);
                    });
                    break;
                case "7":
                    getCO2RoomInfo()
                    .then((dataoutput) => {
                        createPopup(dataoutput, "Room CO2e");
                        console.log("Done creating popup");
                        console.log(dataoutput);
                        var leaves = [];
                        new Promise((resolve, reject) => {
                            this.viewer.model.getObjectTree(tree => {
                                tree.enumNodeChildren(tree.getRootId(), dbId => {
                                    if (tree.getChildCount(dbId) === 0) {
                                        leaves.push(dbId);
                                    }
                                }, true);
                            })
                            resolve(leaves)
                        })
                    })
                }
        } else {
            console.log("Unchecked");
            this.viewer.clearThemingColors(this.viewer.model);
            this.viewer.showAll(this.viewer.model);
        }
    }
    onSelectionEvent(event,filterparameter){
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('Colorization', Colorization);