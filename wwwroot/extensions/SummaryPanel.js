export class SummaryPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(extension, id, title) {
        super(extension.viewer.container, id, title);
        this.extension = extension;
    }

    async update(model, dbids, propNames) {
        this.removeAllProperties();
        for (const propName of propNames) {
            // Flatten all sub-arrays into a single array
            const flattenedData = [].concat(...Object.values(SQL_data));
            
            // Summarize the data
            const summarizedData = flattenedData.reduce((accumulator, current) => {
                const keysToSum = [
                    "CO2e_installation",
                    "CO2e_installation_trans_to_site",
                    "CO2e_maintenance",
                    "CO2e_manufacturing",
                    "CO2e_manufacturing_trans_to_stor",
                    "CO2e_operation",
                    "CO2e_rawmaterial",
                    "CO2e_rawmaterial_trans_to_manu",
                    "CO2e_recycling"
                ];

                keysToSum.forEach(key => {
                    if (accumulator[key] || current[key]) {
                        accumulator[key] = (accumulator[key] || 0) + (current[key] || 0);
                    }
                });

                return accumulator;
            }, {});

            const category = propName;
            this.addProperty('Sum total [kg]', 
            (summarizedData.CO2e_installation+
            summarizedData.CO2e_installation_trans_to_site+
            summarizedData.CO2e_operation+
            summarizedData.CO2e_recycling+
            summarizedData.CO2e_rawmaterial+
            summarizedData.CO2e_rawmaterial_trans_to_manu).toLocaleString()
            , category);
            this.addProperty('Sum raw material [kg]', (summarizedData.CO2e_rawmaterial_trans_to_manu+summarizedData.CO2e_rawmaterial).toLocaleString(), category);
            this.addProperty('Sum manufacturing [kg]', (summarizedData.CO2e_manufacturing_trans_to_stor+summarizedData.CO2e_manufacturing).toLocaleString(), category);
            this.addProperty('Sum installation [kg]', (summarizedData.CO2e_installation+summarizedData.CO2e_installation_trans_to_site).toLocaleString(), category);
            this.addProperty('Sum operation [kg]', (summarizedData.CO2e_operation).toLocaleString(), category);
            this.addProperty('Sum recycling [kg]', (summarizedData.CO2e_recycling).toLocaleString(), category);

            

            // const initialValue = { sum: 0, count: 0, min: Infinity, max: -Infinity };
            // const aggregateFunc = (aggregate, value, property) => {
            //     return {
            //         count: aggregate.count + 1,
            //         sum: aggregate.sum + value,
            //         min: Math.min(aggregate.min, value),
            //         max: Math.max(aggregate.max, value),
            //         units: property.units,
            //         precision: property.precision
            //     };
            // };
            // const { sum, count, min, max, units, precision } = await this.aggregatePropertyValues(model, dbids, propName, aggregateFunc, initialValue);
            // if (count > 0) {
            //     const category = propName;
            //     //this.addProperty('Count', count, category);
            //     this.addProperty('Sum total [kg]', this.toDisplayUnits(function(){
            //         SQL_data.reduce().+

            //     }), category);
            //     this.addProperty('Sum raw material [kg]', this.toDisplayUnits(sum, units, precision), category);
            //     this.addProperty('Sum manufacturing [kg]', this.toDisplayUnits(sum, units, precision), category);
            //     this.addProperty('Sum installation [kg]', this.toDisplayUnits(sum, units, precision), category);
            //     this.addProperty('Sum operation [kg]', this.toDisplayUnits(sum, units, precision), category);
            //     this.addProperty('Sum recycling [kg]', this.toDisplayUnits(sum, units, precision), category);
            //     //this.addProperty('Avg', this.toDisplayUnits((sum / count), units, precision), category);
            //     //this.addProperty('Min', this.toDisplayUnits(min, units, precision), category);
            //     //this.addProperty('Max', this.toDisplayUnits(max, units, precision), category);
                
            }
        }
    //}

    /*
    async aggregatePropertyValues(model, dbids, propertyName, aggregateFunc, initialValue = 0) {
        return new Promise(function (resolve, reject) {
            let aggregatedValue = initialValue;
            model.getBulkProperties(dbids, { propFilter: [propertyName] }, function (results) {
                for (const result of results) {
                    if (result.properties.length > 0) {
                        const prop = result.properties[0];
                        aggregatedValue = aggregateFunc(aggregatedValue, prop.displayValue, prop);
                    }
                }
                resolve(aggregatedValue);
            }, reject);
        });
    } 

    toDisplayUnits(value, units, precision) {
        return Autodesk.Viewing.Private.formatValueWithUnits(value, units, 3, precision);
    } */
}