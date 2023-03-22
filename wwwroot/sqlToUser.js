
async function getSQLdata() {
    try {
        var response = await fetch(`/sql/connectAndQuery`);
        var data = await response.json();
        SQL_data = data;
        console.log("SQL data loaded");
        return data;
    } catch (err) {
        console.error(err);
    }
}
