import * as tough from "tough-cookie";
import { RequestOptions } from "./request";
import { SessionOption } from "./index";
export declare function parseKeyValue(text: string): {
    key: string;
    value: string;
};
export declare function parseContentType(text: string): {
    contentType: string;
    charset: string;
};
export declare function parseProxy(proxy: string): object;
export declare function parseCookies(cookies: string | object | Array<tough.Cookie>): string;
export declare function parseOpts(opts: RequestOptions): SessionOption;
export declare function processReqOpts(uri: string, initOpts: object, customOpts: RequestOptions, methodOpts: object): RequestOptions & object;
export declare class UserAgents {
    private static userAgents;
    private static randomUserAgentInArr;
    static random(): string;
    static filterByRegex(reg: string | RegExp): string[];
    static randomByRegex(reg: string | RegExp): string;
}
