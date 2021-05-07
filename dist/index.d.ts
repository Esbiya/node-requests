import * as utils from "./utils";
import * as types from "./types";
import * as _request from "request";
import { Request, RequestOptions } from "./request";
import { Response } from "./response";
declare const _default: {
    utils: typeof utils;
    types: typeof types;
};
export default _default;
export declare function randomUserAgent(): string;
export declare var throwResponseError: boolean;
export declare function create<T>(uri: string, options?: RequestOptions, content?: any): Request<T>;
export declare function stream(uri: string, options?: RequestOptions, content?: any): Request<void>;
export interface SessionOption {
    uri?: string;
    jar?: _request.CookieJar;
    proxy?: string;
    timeout?: number;
    headers?: types.Headers;
}
export declare class Session {
    uri?: string;
    jar?: _request.CookieJar;
    timeout?: number;
    headers?: types.Headers;
    initOption?: object;
    constructor(opt?: SessionOption);
    get(uri: string, options?: RequestOptions): Promise<Response<string>>;
    post(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>>;
    put(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>>;
    patch(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>>;
    head(uri: string, options?: RequestOptions): Promise<Response<void>>;
    del(uri: string, options?: RequestOptions): Promise<Response<string>>;
    delete(uri: string, options?: RequestOptions): Promise<Response<string>>;
    json<T>(uri: string, options?: RequestOptions): Promise<T>;
    get cookies(): _request.Cookie[];
    processCookies(cookies: string | object | Array<object> | Array<_request.Cookie>, uri?: string): Array<_request.Cookie>;
    setCookies(cookies: string | object | Array<_request.Cookie>, uri?: string): void;
    updateCookie(cookie: string | _request.Cookie, uri?: string): void;
    updateCookies(cookies: string | object | Array<_request.Cookie>, uri?: string): void;
    getCookies(uri?: string): _request.Cookie[];
    getCookieStringSync(uri?: string): string;
    getCookieMapSync(uri?: string): object;
    getCookieArrayMap(uri?: string): Array<object>;
    cookiesString(uri?: string): string;
    cookiesMap(uri?: string): object;
    cookiesArrayMap(uri?: string): Array<object>;
}
export declare function session(opt?: SessionOption): Session;
export declare function get(uri: string, options?: RequestOptions): Promise<Response<string>>;
export declare function post(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>>;
export declare function put(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>>;
export declare function patch(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>>;
export declare function head(uri: string, options?: RequestOptions): Promise<Response<void>>;
export declare function del(uri: string, options?: RequestOptions): Promise<Response<string>>;
export declare function json<T>(uri: string, options?: RequestOptions): Promise<T>;
export { del as delete };
export declare function defaults(options: RequestOptions): void;
