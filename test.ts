import * as requests from "./src/index"

(async function () {
    const session = requests.session({ proxy: 'http://127.0.0.1:8888' })
    const resp = await session.get(`http://127.0.0.1:3000/api/v1/redirect-test`, {
        params: {
            redirectUrl: `http://www.baidu.com`
        },
        followRedirect: false,
    });
    console.log(resp.location());
})();
