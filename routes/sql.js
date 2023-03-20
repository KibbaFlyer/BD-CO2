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

/*
    //Use Azure VM Managed Identity to connect to the SQL database
    const config = {
        server: process.env["db_server"],
        port: process.env["db_port"],
        database: process.env["db_database"],
        authentication: {
            type: 'azure-active-directory-msi-vm'
        },
        options: {
            encrypt: true
        }
    }

    //Use Azure App Service Managed Identity to connect to the SQL database
    const config = {
        server: process.env["db_server"],
        port: process.env["db_port"],
        database: process.env["db_database"],
        authentication: {
            type: 'azure-active-directory-msi-app-service'
        },
        options: {
            encrypt: true
        }
    }
*/

router.get('/sql/connectAndQuery', async function (req, res, next) {
    try {
        res.json(await connectAndQuery());
    } catch (err) {
        next(err);
    }
});

console.log("Starting SQL connection...");
connectAndQuery();

async function connectAndQuery() {
    try {
        var poolConnection = await sql.connect(config);

        console.log("Reading rows from the Table...");
        var resultSet = await poolConnection.request().query(`SELECT * FROM component_co2e_data`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        // Convert recordset to JSON object
        var jsonString = JSON.stringify(resultSet.recordset);
        var jsonObject = JSON.parse(jsonString);

        console.log(jsonObject);
        // close connection only when we're certain application is finished
        poolConnection.close();
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = router;