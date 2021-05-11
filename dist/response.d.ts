/// <reference types="node" />
import * as http from 'http';
import * as tough from "tough-cookie";
import { Url } from 'url';
import { Request } from "./request";
import * as types from "./types";
export declare class Response<T> {
    request: Request<T>;
    message: http.IncomingMessage;
    private body;
    private buffer;
    constructor(request: Request<T>, message: http.IncomingMessage, body: T);
    setEncoding(encodeing: string): void;
    json(): object;
    callbackJSON(cb?: string): object;
    saveFile(fileName: string, mode?: 0 | 1): void;
    location(): string;
    cost(): number;
    cookieString(): Promise<string>;
    cookieMap(): Promise<object>;
    cookieArrayMap(): Promise<Array<object>>;
    document(): cheerio.Root;
    inputForm(id: string): object;
    parseJSON(): object;
    get bytes(): Buffer;
    get text(): string;
    get charset(): string;
    get content(): T;
    get contentLength(): number;
    get contentType(): string;
    cookies(): Promise<tough.Cookie[]>;
    get headers(): types.Headers;
    get httpVersion(): string;
    get lastModified(): Date;
    get method(): string;
    get server(): string;
    get statusCode(): number;
    get statusMessage(): string;
    get uri(): Url;
}
export declare class ResponseError<T> extends Error {
    response: Response<T>;
    statusCode: number;
    constructor(response: Response<T>);
}
