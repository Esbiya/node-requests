import * as requests from "./src/index"

(async function () {
    const session = requests.session();
    const resp = await session.get(`http://127.0.0.1:3000/api/v1/download-test`);
    resp.saveFile(`demo.jpg`)
    console.log(resp.size);
})();
