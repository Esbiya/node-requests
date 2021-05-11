import * as requests from "./src/index"

(async function () {
    const resp = await requests.get(`http://tunnel-api.apeyun.com/d?id=2021031900230401052&secret=SsdmW2MlXXUE9rLs&limit=1&format=txt&auth_mode=hand&min=1`);
    console.log(resp.text);
})();
