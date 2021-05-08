import * as requests from "./src/index"

(async function () {
    const session = requests.session();

    for (let i = 0; i < 5; i++) {
        let resp = await session.get('https://www.baidu.com/');
        console.log(resp.text);
    }
})();
