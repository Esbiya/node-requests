"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseError = exports.Response = void 0;
const fs = __importStar(require("fs"));
const cheerio = __importStar(require("cheerio"));
const iconv = __importStar(require("iconv-lite"));
const utils = __importStar(require("./utils"));
class Response {
    constructor(request, message, body) {
        this.request = request;
        this.message = message;
        this.body = body;
        switch (typeof this.body) {
            case "object":
                if (this.body instanceof Buffer)
                    this.buffer = this.body;
                else {
                    this.buffer = (() => {
                        return Buffer.from(JSON.stringify(this.body));
                    })();
                }
                break;
            case "string":
                this.buffer = (() => {
                    return Buffer.from(this.body);
                })();
                break;
        }
    }
    setEncoding(encodeing) {
        this.buffer = Buffer.from(iconv.decode(this.buffer, encodeing));
    }
    json() {
        try {
            return JSON.parse(this.text);
        }
        catch (err) {
            return {
                errorMsg: err.message,
                body: this.body
            };
        }
    }
    callbackJSON(cb) {
        if (cb) {
            return eval(`var ${cb} = new Function('return arguments[0]'); ${this.text}`);
        }
        else {
            try {
                let ret = this.text.match(/{.*}/);
                return JSON.parse(ret[0]);
            }
            catch (err) {
                return {
                    errorMsg: err.message,
                    body: this.body
                };
            }
        }
    }
    saveFile(fileName, mode) {
        let data = mode === 1 ? this.text : this.buffer;
        return fs.writeFileSync(fileName, data);
    }
    location() {
        return this.headers["Location"] || this.headers["location"];
    }
    cost() {
        return 0;
    }
    cookieString() {
        return this.cookies ? this.cookies.map(cookie => {
            return cookie.cookieString();
        }).join("; ") : "";
    }
    cookieMap() {
        let cookies = {};
        this.cookies && this.cookies.forEach(cookie => {
            cookies[cookie.key] = cookie.value;
        });
        return cookies;
    }
    cookieArrayMap() {
        let cookies = [];
        this.cookies && this.cookies.forEach(cookie => {
            cookies.push(cookie.toJSON());
        });
        return cookies;
    }
    document() {
        return cheerio.load(this.text);
    }
    inputForm(id) {
        let data = {}, $ = this.document();
        $(`#${id}`).find('input').map((index, element) => {
            let name = $(element).attr('name'), value = $(element).attr('value');
            name && value && (data[name] = value);
            return null;
        });
        return data;
    }
    parseJSON() {
        let ret = this.text.match(/JSON.parse\('.*?'\);/)[0].replace("JSON.parse('", '').replace("');", '').replace(/\\/g, '');
        return JSON.parse(unescape(ret));
    }
    get bytes() {
        return this.buffer;
    }
    get text() {
        return this.buffer.toString();
    }
    get charset() { return utils.parseContentType(this.message.headers['content-type']).charset; }
    get content() {
        return this.body;
    }
    get contentLength() {
        if ('content-length' in this.message.headers)
            return parseInt(this.message.headers['content-length']);
        else if (typeof this.body === 'string')
            return this.body.length;
    }
    get contentType() { return utils.parseContentType(this.message.headers['content-type']).contentType; }
    get cookies() {
        if (typeof this.request.options.jar === 'object') {
            var jar = this.request.options.jar;
            return jar.getCookiesSync(this.request.options.uri);
        }
    }
    get headers() { return this.message.headers; }
    get httpVersion() { return this.message.httpVersion; }
    get lastModified() { return new Date(this.message.headers['last-modified']); }
    get method() { return this.message.method || this.message.request.method; }
    get server() { return this.message.headers['server']; }
    get statusCode() { return this.message.statusCode; }
    get statusMessage() { return this.message.statusMessage; }
    get uri() { return this.message.request.uri; }
}
exports.Response = Response;
class ResponseError extends Error {
    constructor(response) {
        super(response.statusMessage);
        this.response = response;
        this.statusCode = response.statusCode;
    }
}
exports.ResponseError = ResponseError;
//# sourceMappingURL=response.js.map