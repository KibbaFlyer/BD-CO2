// Given a model loaded from Autodesk Platform Services
var RoomCO2e = {};
var TypeName = "";
var RoomName = "";

async function getCO2RoomInfo(){
    
    var leaves = [];
    new Promise((resolve, reject) => {
        NOP_VIEWER.model.getObjectTree(tree => {
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
            NOP_VIEWER.model.getBulkProperties2(leaves, { "propFilter": ["Type Name","Room Name"] },
                output => {
                    RoomCO2e = {};
                    output.forEach(element => {
                        try {
                            TypeName = element.properties[0].displayValue;
                            RoomName = element.properties[1].displayValue;
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
                            if(RoomName != "" && RoomCO2e.hasOwnProperty(RoomName)){
                                RoomCO2e[RoomName] += SQL_values;
                            }else if(RoomName != "" ){
                                RoomCO2e[RoomName] = SQL_values;
                            }else{
                                console.log("Object has no room connection");
                            }
                        } catch (error) {
                            //console.log(error);
                        }
                    });
                    resolve(output);
                }, 
            null);
    }).then(() => {
    })
    });
    return RoomCO2e;
}

