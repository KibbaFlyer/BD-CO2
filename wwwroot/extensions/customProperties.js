/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

// *******************************************
// Custom Property Panel
// *******************************************

class CustomPropertyPanel extends Autodesk.Viewing.Extensions.ViewerPropertyPanel {
    constructor(viewer, options) {
        super(viewer, options);
        this.properties = options.properties || {};
        this.nodeId = -1; // dbId of the current element showing properties
    }

    async setAggregatedProperties(propertySet) {
        Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype.setAggregatedProperties.call(this, propertySet);
        // add your custom properties here, for example,
        const dbids = propertySet.getDbIds();
        dbids.forEach(id => {
            var propsForObject = this.properties[id.toString()];
            if (propsForObject) {
                for (const groupName in propsForObject) {
                    const group = propsForObject[groupName];
                    for (const propName in group) {
                        const prop = group[propName];
                        this.addProperty(propName, prop, groupName);
                    }
                }
            }
        });

        // We are here getting the dbid of the selected object, and its properties in order to find related properties in the SQL database.
        const search_blob_promise = new Promise((resolveOuter,rejectOuter) => {
            var propertyValue = "";
            // Using the function within viewer
            this.viewer.getProperties(this.propertyNodeId,
                function(props){
                    // For each property, we need to iterate to find our property (in current case "Type Name")
                    const search_prop_dispvalue_promise = new Promise((resolveInner,rejectInner) => {
                        props.properties.forEach(prop => {
                            if (prop.attributeName.startsWith("Type Name")) {
                                
                                propertyValue = prop.displayValue;
                            }
                        });
                        resolveInner(propertyValue);
                    }).then((value) => {
                        
                        }, (error) => {
                            console.log(error)
                    });
                resolveOuter(propertyValue);
                },null);
        });

        search_blob_promise.then((value) => {
            this.addProperty('dbId', this.propertyNodeId, "dbid");
            // CO2 data (from SQL database)
            this.addProperty('CO2e Total [kg]',
            SQL_data[value][0].CO2e_installation +
            SQL_data[value][0].CO2e_installation_trans_to_site +
            SQL_data[value][0].CO2e_maintenance +
            SQL_data[value][0].CO2e_manufacturing +
            SQL_data[value][0].CO2e_manufacturing_trans_to_stor +
            SQL_data[value][0].CO2e_operation +
            SQL_data[value][0].CO2e_rawmaterial +
            SQL_data[value][0].CO2e_rawmaterial_trans_to_manu +
            SQL_data[value][0].CO2e_recycling
            ,"Emission Data");
            this.addProperty('CO2e Raw Material [kg]', SQL_data[value][0].CO2e_rawmaterial, "Emission Data");
            this.addProperty('CO2e Raw Material Transport [kg]', SQL_data[value][0].CO2e_rawmaterial_trans_to_manu, "Emission Data");
            this.addProperty('CO2e Manufacturing [kg]', SQL_data[value][0].CO2e_manufacturing, "Emission Data");
            this.addProperty('CO2e Manufacturing Transport [kg]', SQL_data[value][0].CO2e_manufacturing_trans_to_stor, "Emission Data");
            this.addProperty('CO2e Installation [kg]', SQL_data[value][0].CO2e_installation, "Emission Data");
            this.addProperty('CO2e Installation transport [kg]', SQL_data[value][0].CO2e_installation_trans_to_site, "Emission Data");
            this.addProperty('CO2e Operation [kg]', SQL_data[value][0].CO2e_operation, "Emission Data");
            this.addProperty('CO2e Maintenance[kg]', SQL_data[value][0].CO2e_maintenance, "Emission Data");
            this.addProperty('CO2e Recycling [kg]', SQL_data[value][0].CO2e_recycling, "Emission Data");
        }, (error) => {console.log(error)});
        if (!this.hasProperties()) return;
    }
};

// *******************************************
// Custom Properties Extension
// *******************************************
class CustomProperties extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.panel = new CustomPropertyPanel(viewer, options);
    }

    async load() {
        console.log('CustomProperties is being loaded...');
        var _this = this;
        this.viewer.addEventListener(
            Autodesk.Viewing.EXTENSION_LOADED_EVENT,
            function (e) {
                if (e.extensionId !== 'Autodesk.PropertiesManager') return;
                var ext = _this.viewer.getExtension('Autodesk.PropertiesManager');
                ext.setPanel(_this.panel);
            }
        );
        return true;
    }

    async unload() {
        if (this.panel == null) return;
        var ext = await this.viewer.getExtension('Autodesk.PropertiesManager');
        ext.setDefaultPanel();
        console.log('CustomProperties has been unloaded');
        return true;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('CustomProperties', CustomProperties);


