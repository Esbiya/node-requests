import * as requests from "./src/index"

(async function () {
    const session = requests.session({ proxy: 'http://127.0.0.1:8888' })
    const resp = await session.get(`https://www.baidu.com`);
    console.log(resp.text);
})();
