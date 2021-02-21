//wrapper to use wegmans api
//by roshan nunna
const key = "b9144087445642548997f02c574886f9";
var rit_store_number = 62;

    async function findlocation(sku, store) {

        let location = await makeGetRequest(`https://api.wegmans.io/products/${sku}/locations/${store}?api-version=2018-10-18&subscription-key=${key}`)
        var stringystring = location.shelfNumber;
        console.log(stringystring);
        return stringystring;
    }

    async function makeGetRequest(url) {
        let res = await axios.get(url);
        let data = res.data.locations[0];
        return data;
    }
