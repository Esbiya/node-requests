import * as http from 'http';
import * as fs from "fs";
import * as tough from "tough-cookie";
import * as cheerio from "cheerio";
import { Url } from 'url';
import * as iconv from 'iconv-lite';
import { Request } from "./request"
import * as utils from "./utils"
import * as types from "./types"

export class Response<T> {
    request: Request<T>;
    message: http.IncomingMessage;
    private body: T;
    private buffer: Buffer;

    constructor(request: Request<T>, message: http.IncomingMessage, body: T) {
        this.request = request;
        this.message = message;
        this.body = body;
        switch (typeof this.body) {
            case "object":
                if (this.body instanceof Buffer)
                    this.buffer = this.body;
                else {
                    this.buffer = ((): Buffer => {
                        return Buffer.from(JSON.stringify(this.body));
                    })();
                }
                break;
            case "string":
                this.buffer = ((): Buffer => {
                    return Buffer.from(this.body);
                })();
                break;
        }
    }

    /**
     * 编码转换
     * @param encodeing 编码
     * @returns 
     */
    setEncoding(encodeing: string) {
        this.buffer = Buffer.from(iconv.decode(this.buffer, encodeing));
    }

    json(): object {
        try {
            return JSON.parse(this.text);
        } catch(err) {
            return {
                errorMsg: err.message,
                body: this.body
            } 
        }
    }

    /**
     * 获取 callback json 响应
     * @param cb 回调函数名
     * @returns 
     */
    callbackJSON(cb?: string): object {
        if (cb) {
            return eval(`var ${cb} = new Function('return arguments[0]'); ${this.text}`);
        } else {
            try {
                let ret = this.text.match(/{.*}/);
                return JSON.parse(ret[0]);
            } catch(err) {
                return {
                    errorMsg: err.message,
                    body: this.body
                } 
            }
        }
    }

    saveFile(fileName: string, mode?: 0 | 1): void {
        let data = mode === 1 ? this.text : this.buffer;
        return fs.writeFileSync(fileName, data);
    }

    /**
     * 获取重定向 url
     * @returns 
     */
    location(): string {
        return this.headers["Location"] || this.headers["location"]
    }

    /**
     * 计算请求耗时
     * @returns 
     */
    cost(): number {
        return 0;
    }

    cookieString(): string {
        return this.cookies ? this.cookies.map(cookie => {
            return cookie.cookieString();
        }).join("; ") : "";
    }

    cookieMap(): object {
        let cookies = {};
        this.cookies && this.cookies.forEach(cookie => {
            cookies[cookie.key] = cookie.value;
        });
        return cookies;
    }

    cookieArrayMap(): Array<object> {
        let cookies = [];
        this.cookies && this.cookies.forEach(cookie => {
            cookies.push(cookie.toJSON());
        });
        return cookies;
    }

    /**
     * html 解析
     * @returns html css 解析对象
     */
    document(): cheerio.Root {
        return cheerio.load(this.text);
    }

    inputForm(id: string): object {
        let data = {}, $ = this.document();
        $(`#${id}`).find('input').map((index: number, element: cheerio.Element) => {
            let name = $(element).attr('name'), value = $(element).attr('value');
            name && value && (data[name] = value);
            return null;
        });
        return data;
    }

    parseJSON(): object {
        let ret = this.text.match(/JSON.parse\('.*?'\);/)[0].replace("JSON.parse('", '').replace("');", '').replace(/\\/g, '');
        return JSON.parse(unescape(ret));
    }

    get bytes(): Buffer {
        return this.buffer
    }

    get text(): string {
        return this.buffer.toString();
    }

    get charset(): string { return utils.parseContentType(<string>this.message.headers['content-type']).charset; }
    get content(): T {
        return <T>this.body;
    }
    get contentLength(): number {
        if ('content-length' in this.message.headers)
            return parseInt(<string>this.message.headers['content-length']);
        else if (typeof this.body === 'string')
            return (<any>this.body).length;
    }
    get contentType(): string { return utils.parseContentType(<string>this.message.headers['content-type']).contentType; }
    get cookies(): tough.Cookie[] {
        if (typeof this.request.options.jar === 'object') {
            var jar = <tough.CookieJar>this.request.options.jar;
            return jar.getCookiesSync(this.request.options.uri);
        }
    }
    get headers(): types.Headers { return this.message.headers; }
    get httpVersion(): string { return this.message.httpVersion; }
    get lastModified(): Date { return new Date(this.message.headers['last-modified']); }
    get method(): string { return this.message.method || (<any>this.message).request.method; }
    get server(): string { return <string>this.message.headers['server']; }
    get statusCode(): number { return this.message.statusCode; }
    get statusMessage(): string { return this.message.statusMessage; }
    get uri(): Url { return (<any>this.message).request.uri; }
}

export class ResponseError<T> extends Error {
    response: Response<T>;
    statusCode: number;
    constructor(response: Response<T>) {
        super(response.statusMessage);
        this.response = response;
        this.statusCode = response.statusCode;
    }
}