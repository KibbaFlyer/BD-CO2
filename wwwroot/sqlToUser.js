async function getSQLdata() {
    try {
        var response = await fetch(`/sql/connectAndQuery`);
        var data = await response.json();
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
    }
}
