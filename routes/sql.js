const express = require('express');
const sql = require('mssql');
let router = express.Router();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: process.env.PORT,
    database: process.env.DB_NAME,
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}

router.get('/sql/connectAndQuery', async function (req, res, next) {
    try {
        var sql_data = await connectAndQuery();
        return res.json(sql_data);
    } catch (err) {
        next(err);
    }
});

async function connectAndQuery() {
    try {
        var poolConnection = await sql.connect(config);

        console.log("Reading rows from the Table...");
        var resultSet = await poolConnection.request().query(`SELECT * FROM component_co2e_data`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        // Convert recordset to JSON object
        var jsonString = JSON.stringify(resultSet.recordset);
        var jsonObject = JSON.parse(jsonString);
          
        const result = jsonObject.reduce((obj, item) => {
        obj[item.Type] = obj[item.Type] || [];
        obj[item.Type].push(item);
        return obj;
        }, {});
    
        // close connection only when we're certain application is finished
        poolConnection.close();
        return(result);
    } catch (err) {
        return(err);
    }; 
}

module.exports = router;