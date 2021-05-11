var request = require('request');
import * as http from 'http';
import * as utils from "./utils";
import * as types from "./types";
import * as _request from "request";
import * as tough from "tough-cookie";
import { Request, RequestOptions, RequestError } from "./request";
import { Response, ResponseError } from "./response";

export default { utils, types };

export function randomUserAgent(): string {
    return utils.UserAgents.random();
}

export var throwResponseError = false;

export function create<T>(uri: string, options?: RequestOptions, content?: any): Request<T> {
    options = Object.assign(options, { uri: uri });
    if (options.jar === true)
        options.jar = request.jar();
    if (content !== undefined)
        options.body = content;
    var throwEnabled = throwResponseError;
    if (options.throwResponseError !== undefined)
        throwEnabled = options.throwResponseError;

    options.encoding = null;
    options.params != null && (options.qs = options.params);
    !options.verify && (options.strictSSL = options.verify);
    !options.headers && (options.headers = { "User-Agent": utils.UserAgents.random() });
    options.cookies && (options.headers["Cookie"] = utils.parseCookies(options.cookies));
    options.keepAlive && (options.headers["Connection"] = "keep-alive");
    !options.headers.hasOwnProperty("User-Agent") 
      && !options.headers.hasOwnProperty("user-agent") 
      && (options.headers["User-Agent"] = utils.UserAgents.random());

    var instance: Request<T>;

    var startTime = new Date().getTime();
    var promise = new Promise<Response<T>>((resolve, reject) => {
        instance = request(options, (err: Error, message: http.IncomingMessage, body: T) => {
            if (!err) {
                var response = new Response<T>(instance, message, body);
                var endTime = new Date().getTime();
                response.cost = () => {
                    return endTime - startTime;
                };
                if (message.statusCode < 400 || !throwEnabled)
                    resolve(response);
                else
                    reject(new ResponseError(response));
            }
            else {
                reject(new RequestError(err, instance));
            }
        });
    });

    instance.options = options;
    instance.response = promise;

    return instance;
}

export function stream(uri: string, options?: RequestOptions, content?: any): Request<void> {
    options = Object.assign(options, { uri: uri });
    if (options.jar === true)
        options.jar = request.jar();
    if (content !== undefined)
        options.body = content;

    options.encoding = null;
    options.params != null && (options.qs = options.params);
    !options.verify && (options.strictSSL = options.verify);
    !options.headers && (options.headers = { "User-Agent": utils.UserAgents.random() });
    options.cookies && (options.headers["Cookie"] = utils.parseCookies(options.cookies));

    options.headers &&
        (!options.headers.hasOwnProperty("User-Agent") && !options.headers.hasOwnProperty("user-agent")) &&
        (() => { options.headers["User-Agent"] = utils.UserAgents.random() })();

    var instance: Request<void> = request(options);
    instance.options = options;

    var startTime = new Date().getTime();
    instance.response = new Promise<Response<void>>((resolve, reject) =>
        instance.on('complete', message => {
            var response = new Response<void>(instance, message, null);
            var endTime = new Date().getTime();
            response.cost = () => {
                return endTime - startTime;
            };
            if (message.statusCode < 400 || !throwResponseError)
                resolve(response);
            else
                reject(new ResponseError<void>(response));
        }).on('error', err => reject(new RequestError(err, instance))));

    return instance;
}

export interface SessionOption {
    uri?: string;
    jar?: _request.CookieJar;
    proxy?: string;
    keepAlive?: boolean;
    timeout?: number;
    headers?: types.Headers;
}

export class Session {
    uri?: string;
    jar?: _request.CookieJar;
    timeout?: number;
    headers?: types.Headers;
    initOption?: object;
    constructor(opt?: SessionOption) {
        this.uri = (opt && opt.uri) ? opt.uri : "";
        this.jar = (opt && opt.jar) ? opt.jar : request.jar();
        this.initOption = { jar: this.jar };
        opt && (() => {
            opt.headers && Object.assign(this.initOption, { headers: opt.headers });
            opt.timeout && Object.assign(this.initOption, { timeout: opt.timeout });
            opt.keepAlive && Object.assign(this.initOption, { keepAlive: true });
            opt.proxy && (() => {
                let proxyOpt = utils.parseProxy(opt.proxy);
                for (const [key, value] of Object.entries(proxyOpt)) {
                    this.initOption[key] = value;
                }
            })();
        })();

    }

    async get(uri: string, options?: RequestOptions): Promise<Response<string>> { return await create<string>(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'GET' })).response; }
    async post(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>> { return await create<string>(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'POST' }), content).response; }
    async put(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>> { return await create<string>(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'PUT' }), content).response; }
    async patch(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>> { return await create<string>(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'PATCH' }), content).response; }
    async head(uri: string, options?: RequestOptions): Promise<Response<void>> { return await create<void>(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'HEAD' })).response; }
    async del(uri: string, options?: RequestOptions): Promise<Response<string>> { return await create<string>(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'DELETE' })).response; }
    async delete(uri: string, options?: RequestOptions): Promise<Response<string>> { return await create<string>(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'DELETE' })).response; }
    async json<T>(uri: string, options?: RequestOptions): Promise<T> { return (await create<T>(uri, utils.processReqOpts(uri, this.initOption, options, { json: true })).response).content; }

    get cookies(): _request.Cookie[] {
        return this.jar.getCookies(this.uri);
    }

    setProxy(proxy: string) {
        let proxyOpt = utils.parseProxy(proxy);
        for (const [key, value] of Object.entries(proxyOpt)) {
            this.initOption[key] = value;
        }
    }

    processCookies(cookies: string | object | Array<object> | Array<_request.Cookie>, uri?: string): Array<_request.Cookie> {
        var _cookies: Array<_request.Cookie>;
        uri = uri ? uri : this.uri;
        const domain = uri.split("/")[2].split(".").slice(1).join(".");
        switch (typeof cookies) {
            case "string":
                _cookies = cookies.split("; ").map(cookie => {
                    let cookieSplit = cookie.split("=");
                    let c = new tough.Cookie({
                        key: cookieSplit[0],
                        value: cookieSplit[1],
                        domain: domain,
                    });
                    return c;
                });
                break;
            case "object":
                !(cookies instanceof Array) ? (() => {
                    _cookies = [];
                    for (const [key, value] of Object.entries(cookies)) {
                        _cookies.push(new tough.Cookie({
                            key: key,
                            value: value,
                            domain: domain,
                        }));
                    };
                })() : (() => {
                    _cookies = [];
                    cookies.forEach(cookie => {
                        cookie instanceof tough.Cookie ? _cookies.push(cookie) : _cookies.push(new tough.Cookie(cookie))
                    });
                })();
                break;
            default:
                _cookies = cookies;
                break;
        }
        return _cookies
    }

    setCookies(cookies: string | object | Array<_request.Cookie>, uri?: string) {
        uri = uri ? uri : this.uri;
        this.processCookies(cookies, uri).forEach(cookie => {
            this.jar.setCookie(cookie.toString(), uri);
        })
    }

    updateCookie(cookie: string | _request.Cookie, uri?: string) {
        uri = uri ? uri : this.uri;
        this.jar.setCookie(cookie.toString(), uri);
    }

    updateCookies(cookies: string | object | Array<_request.Cookie>, uri?: string) {

    }

    getCookies(uri?: string): _request.Cookie[] {
        uri = uri ? uri : this.uri;
        return this.jar.getCookies(uri);
    }

    getCookieString(uri?: string): string {
        let cookies = this.getCookies(uri);
        return cookies ? cookies.map(cookie => {
            return cookie.cookieString();
        }).join("; ") : "";
    }

    getCookieMap(uri?: string): object {
        let cookies = this.getCookies(uri), _cookies = {};
        cookies && cookies.forEach(cookie => {
            _cookies[cookie.key] = cookie.value;
        });
        return _cookies;
    }

    getCookieArrayMap(uri?: string): Array<object> {
        let cookies = this.getCookies(uri), _cookies = [];
        cookies && cookies.forEach(cookie => {
            _cookies.push(cookie.toJSON());
        });
        return cookies;
    }

    cookiesString(uri?: string) {
        var _cookies: Array<tough.Cookie>;
        if (uri) {
            _cookies = this.getCookies(uri)
        } else {
            _cookies = this.cookies;
        }
        return _cookies ? _cookies.map(cookie => {
            return cookie.cookieString();
        }).join("; ") : "";
    }

    cookiesMap(uri?: string): object {
        let cookies = {};
        var _cookies: Array<tough.Cookie>;
        if (uri) {
            _cookies = this.getCookies(uri)
        } else {
            _cookies = this.cookies;
        }
        _cookies && _cookies.forEach(cookie => {
            cookies[cookie.key] = cookie.value;
        });
        return cookies;
    }

    cookiesArrayMap(uri?: string): Array<object> {
        let cookies = [];
        var _cookies: Array<tough.Cookie>;
        if (uri) {
            _cookies = this.getCookies(uri)
        } else {
            _cookies = this.cookies;
        }
        this.cookies && this.cookies.forEach(cookie => {
            cookies.push(cookie.toJSON());
        });
        return cookies;
    }
}

export function session(opt?: SessionOption): Session {
    return new Session(opt);
}

export async function get(uri: string, options?: RequestOptions) { return new Session(utils.parseOpts(options)).get(uri, options) }
export async function post(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>> { return new Session(utils.parseOpts(options)).post(uri, options, content) }
export async function put(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>> { return new Session(utils.parseOpts(options)).put(uri, options, content) }
export async function patch(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>> { return new Session(utils.parseOpts(options)).patch(uri, options, content) }
export async function head(uri: string, options?: RequestOptions): Promise<Response<void>> { return new Session(utils.parseOpts(options)).head(uri, options) }
export async function del(uri: string, options?: RequestOptions): Promise<Response<string>> { return new Session(utils.parseOpts(options)).del(uri, options) }
export async function json<T>(uri: string, options?: RequestOptions): Promise<T> { return new Session(utils.parseOpts(options)).json(uri, options) }

export function defaults(options: RequestOptions): void {
    if (options.throwResponseError !== undefined)
        throwResponseError = options.throwResponseError;
    request.defaults(options);
}
