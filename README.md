<h1 align="center">Welcome to @esbiya/requests 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> a network requests lib

## Install

```sh
npm install -g @esbiya/requests
```

## Author

👤 **esbiya**

## Usage

```javascript
const requests = require("@esbiya/requests");

(async function() {
    const resp = await requests.get(`https://www.baidu.com/`);
    console.log(resp.text);
})();
```

### 使用 headers

```javascript
async function headerTest() {
    const resp = (await requests.get(`http://127.0.0.1:3000/api/v1/header-test`, {
        headers: {
            "hello": "world",
        }
    })).json();
    return resp["hello"] === "world"
}
```

### 使用代理

```javascript
async function proxyTest() {
    const resp = (await requests.get("http://127.0.0.1:3000/api/v1/proxy-test", {
        proxy: "http://127.0.0.1:8888",
        verify: false
    })).text;
    return resp === "127.0.0.1"
}
```

```
支持 s5/http/https 代理：
s5: socks5://{username}:{password}@{ip}:{port}
http: http://{ip}:{port}
https: https://{ip}:{port}
```

### 使用 cookie

```javascript
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
```

### 禁止重定向

```javascript
async function redirectTest() {
    const resp = await requests.get("http://127.0.0.1:3000/api/v1/redirect-test", {
        params: {
            "redirectUrl": "http://test.demo.com/redirect",
        },
        followRedirect: false
    });
    return resp.statusCode === 302 && resp.location() === "http://test.demo.com/redirect"
}
```

### get params 示例

```javascript
async function paramsTest() {
    let params = {
        "hello": "world"
    }
    const resp = (await requests.get("http://127.0.0.1:3000/api/v1/params-test", {
        params: params
    })).json();
    return resp["hello"] === params["hello"];
}
```

### post form 表单示例

```javascript
async function formTest() {
    let form = {
        hello: 'world'
    }
    const resp = (await requests.post("http://127.0.0.1:3000/api/v1/form-test", {
        form: form  // 或者 hello=world
    })).json();
    return resp["hello"] === form["hello"];
}
```

### post payload 示例

```javascript
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
```

### post 二进制 示例

```javascript
async function jsonTest() {
    let body = fs.readFileSync(`test.jpg`);
    const resp = await requests.post("http://127.0.0.1:3000/api/v1/binary-test", {
        body: body,
    });
    return resp.text === calculateFileHash("./test.jpg")
}
```

### post 多表单示例

```javascript
async function formDataTest() {
    const resp = await requests.post("http://127.0.0.1:3000/api/v1/formdata-test", {
        headers : { 'Content-Type' : 'multipart/form-data' },
        formData: {
            img: fs.createReadStream("./test.jpg")
        }
    });
    return resp.text === calculateFileHash("./test.jpg")
}
```

### 文件下载示例

```javascript
async function downloadTest() {
    (await requests.get("http://127.0.0.1:3000/api/v1/download-test")).saveFile("test1.jpg");
    return calculateFileHash("test1.jpg") === calculateFileHash("test.jpg")
}
```

### session 代理示例

```javascript
async function sessionProxyTest() {
    const session = requests.session({
        proxy: "http://127.0.0.1:8888"
    });
    const resp = await session.get("http://127.0.0.1:3000/api/v1/proxy-test", { verify: false });
    return resp.text === "127.0.0.1"
}
```

### session 设置 cookies 示例


```javascript
// 用法 1
const session = requests.session();
session.setCookies(`hello=world`, `http://www.baidu.com`);
session.setCookies({
    "hello": "word"
}, `http://www.baidu.com`);
session.setCookies([{
    key: "hello",
    value: "world",
    domain: "www.baidu.com"
}]);

// 用法 2
// const session = requests.session({
//     cookies: `xxx=yyy`
//     cookies: {
//         'xxx': 'yyy'
//     }
//     cookies: [{
//         key: 'xxx',
//         value: 'yyy'
//     }]
// });

const resp = await session.get("http://wwww.baidu.com/");
console.log(resp.text)
```

### 获取响应 html 解析对象(使用 cheerio, 具体用法请查看 cheerio 文档: https://github.com/cheeriojs/cheerio)

```javascript
async function downloadTest() {
    const session = requests.session();
    const resp = await session.get("http://127.0.0.1:3000/api/v1/input-form-test");
    console.log(resp.document())
}
```

### 获取响应 html 中的 input form 表单

```javascript
async function downloadTest() {
    const session = requests.session();
    const resp = await session.get("http://127.0.0.1:3000/api/v1/input-form-test");
    console.log(resp.inputForm('payForm'))
}
```

### 自动获取响应中的 ```<script>var data = JSON.parse('{\"error\":\"\"}'); </script>``` 并转化为标准 json 格式

```javascript
async function downloadTest() {
    const session = requests.session();
    const resp = await session.get("http://127.0.0.1:3000/api/v1/parse-json-test");
    console.log(resp.parseJSON())
}
```
### 响应接口说明

|   接口    |   说明  |  
|---    |   --- | 
|   resp.bytes  |   响应字节流   | 
|   resp.text  |   响应文本   | 
|   resp.json()  |   获取标准 json 格式响应   | 
|   resp.callbackJSON()  |   自动处理 callback({"1": "2"}) 类型数据为标准 json 格式   | 
|   resp.cost()  |   请求耗时: 毫秒(ms)   | 
|   resp.setEncoding('gbk')  |  设置响应编码格式  | 
|   resp.saveFile('test.jpg')  |   响应存入本地文件   |
|   resp.location()  |   获取重定向地址   |
|   await resp.cookies()  |   获取响应 cookie, touch.Cookie 数组   |
|   await resp.cookieString()  |   获取响应 cookie 字符串, "111=222; 333=444"   |
|   await resp.cookieMap()  |   获取响应 cookie 标准 json 格式, {"111": "222"}   |
|   await resp.cookieArrayMap()  |   获取响应标准 cookie 格式数组, [{key: "111", value: "222", domain: "xxx"}]   |
|   resp.content  |   响应内容   |
|   resp.charset  |   响应字符编码   |
|   resp.contentType  |   响应类型   |
|   resp.contentLength  |   响应长度   |
|   resp.headers  |   响应头   |
|   resp.uri  |   响应 url   |
|   resp.httpVersion  |   请求 http 版本   |


## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_