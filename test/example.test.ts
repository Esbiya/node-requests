import * as requests from "../src/index"

const fs = require("fs");
const crypto = require('crypto');
function calculateFileHash(fileName: string) {
    const buffer = fs.readFileSync(fileName);
    let hash = crypto.createHash('md5');
    return hash.update(buffer, 'utf8').digest('hex');
}

/**
 * 请求头测试
 * @returns 
 */
async function headerTest() {
    const resp = (await requests.get(`http://127.0.0.1:3000/api/v1/header-test`, {
        headers: {
            "hello": "world",
        }
    })).json();
    return resp["hello"] === "world"
}

describe('common-use: header-test', () => {
    test('header-test: true', async () => {
        expect.assertions(1);
        const ret = await headerTest();
        expect(ret).toBe(true);
    })
});

/**
 * 代理测试
 * @returns 
 */
async function proxyTest() {
    const resp = (await requests.get("http://127.0.0.1:3000/api/v1/proxy-test", {
        proxy: "http://127.0.0.1:8888",
    })).text;
    return resp === "127.0.0.1"
}

describe('common-use: proxy-test', () => {
    test('proxy-test: true', async () => {
        expect.assertions(1);
        const ret = await proxyTest();
        expect(ret).toBe(true);
    })
});

/**
 * cookie 测试
 * @returns 
 */
async function cookieTest() {
    const resp = (await requests.get("http://127.0.0.1:3000/api/v1/cookie-test", {
        // 方式 1
        cookies: {
            "hello": "world",
            "test1": "test2",
        },
        // 方式 2
        // cookies: "hello=world; test1=test2",
    })).text;
    return resp == "hello=world; test1=test2"
}

describe('common-use: cookie-test', () => {
    test('cookie-test: true', async () => {
        expect.assertions(1);
        const ret = await cookieTest();
        expect(ret).toBe(true);
    })
});

/**
 * 重定向测试
 * @returns 
 */
async function redirectTest() {
    const resp = await requests.get("http://127.0.0.1:3000/api/v1/redirect-test", {
        params: {
            "redirectUrl": "http://test.demo.com/redirect",
        },
        followRedirect: false
    });
    return resp.statusCode === 302 && resp.location() === "http://test.demo.com/redirect"
}

describe('common-use: redirect-test', () => {
    test('redirect-test: true', async () => {
        expect.assertions(1);
        const ret = await redirectTest();
        expect(ret).toBe(true);
    })
});

/**
 * get 请求参数测试
 * @returns 
 */
async function paramsTest() {
    let params = {
        "hello": "world"
    }
    const resp = (await requests.get("http://127.0.0.1:3000/api/v1/params-test", {
        params: params
    })).json();
    return resp["hello"] === params["hello"];
}

describe('common-use: params-test', () => {
    test('params-test: true', async () => {
        expect.assertions(1);
        const ret = await paramsTest();
        expect(ret).toBe(true);
    })
});

/**
 * post 表单测试
 * @returns 
 */
async function formTest() {
    let form = {
        hello: 'world'
    }
    const resp = (await requests.post("http://127.0.0.1:3000/api/v1/form-test", {
        form: form  // 或者 hello=world
    })).json();
    return resp["hello"] === form["hello"];
}

describe('common-use: form-test', () => {
    test('form-test: true', async () => {
        expect.assertions(1);
        const ret = await formTest();
        expect(ret).toBe(true);
    })
});

/**
 * post payload 测试
 * @returns 
 */
async function jsonTest() {
    let payload = {
        hello: 'world'
    }
    const resp = (await requests.post("http://127.0.0.1:3000/api/v1/json-test", {
        json: payload,
        headers: { 'Content-Type': 'application/json' },
    })).json();
    return resp["hello"] === payload["hello"];
}

describe('common-use: json-test', () => {
    test('json-test: true', async () => {
        expect.assertions(1);
        const ret = await jsonTest();
        expect(ret).toBe(true);
    })
});

/**
 * 多表单文件上传测试
 *  * @returns 
 */
async function formDataTest() {
    const resp = await requests.post("http://127.0.0.1:3000/api/v1/formdata-test", {
        headers : { 'Content-Type' : 'multipart/form-data' },
        formData: {
            img: fs.createReadStream("./test.jpg")
        }
    });
    return resp.text === calculateFileHash("./test.jpg")
}

describe('common-use: formdata-test', () => {
    test('formdata-test: true', async () => {
        expect.assertions(1);
        const ret = await formDataTest();
        expect(ret).toBe(true);
    })
});

/**
 * 回调函数取 json 测试
 * @returns 
 */
async function callbackJSONTest() {
    let params = {
        hello: "world"
    };
    const resp = (await requests.get("http://127.0.0.1:3000/api/v1/callback-json-test", {
        params: params
    })).callbackJSON();
    return resp["hello"] === params["hello"];
}

describe('common-use: callback-json-test', () => {
    test('callback-json-test: true', async () => {
        expect.assertions(1);
        const ret = await callbackJSONTest();
        expect(ret).toBe(true);
    })
});

/**
 * 文件下载测试
 * @returns 
 */
async function downloadTest() {
    (await requests.get("http://127.0.0.1:3000/api/v1/download-test")).saveFile("test1.jpg");
    return calculateFileHash("test1.jpg") === calculateFileHash("test.jpg")
}

describe('common-use: download-test', () => {
    test('download-test: true', async () => {
        expect.assertions(1);
        const ret = await downloadTest();
        expect(ret).toBe(true);
    })
});

/**
 * session 代理测试
 * @returns 
 */
async function sessionProxyTest() {
    const session = requests.session({
        proxy: "http://127.0.0.1:8888"
    });
    const resp = await session.get("http://127.0.0.1:3000/api/v1/proxy-test", { verify: false });
    return resp.text === "127.0.0.1"
}

describe('common-use: session-proxy-test', () => {
    test('session-proxy-test: true', async () => {
        expect.assertions(1);
        const ret = await sessionProxyTest();
        expect(ret).toBe(true);
    })
});