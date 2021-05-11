import * as requests from "./src/index"

(async function () {
    const session = requests.session({
        // proxy: "http://127.0.0.1:8888",
        keepAlive: true,
    });

    let headers = {
        "kkk": "vvv",
    }
    let resp = await session.get('http://127.0.0.1:3000/api/v1/parse-json-test', { headers: headers });
    console.log(resp.parseJSON());
})();
