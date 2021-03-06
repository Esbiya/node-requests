import { Url } from 'url';
import * as http from 'http';
import * as _stream from 'stream';
import * as tough from "tough-cookie";
import * as types from "./types"
import { Response } from "./response"

export interface Request<T> extends _stream.Stream {
    headers: Headers;
    method: string;
    readable: boolean;
    uri: Url;
    writable: boolean;

    getAgent(): http.Agent;
    pipeDest(dest: any): void;
    setHeader(name: string, value: string, clobber?: boolean): this;
    setHeaders(headers: Headers): this;
    qs(q: Object, clobber?: boolean): this;
    form(): any; // FormData.FormData;
    form(form: any): this;
    multipart(multipart: types.RequestPart[]): this;
    json(val: any): this;
    aws(opts: types.AWSOptions, now?: boolean): this;
    auth(username: string, password: string, sendImmediately?: boolean, bearer?: string): this;
    oauth(oauth: types.OAuthOptions): this;
    jar(jar: tough.CookieJar): this;

    on(event: string, listener: Function): this;
    on(event: 'request', listener: (req: http.ClientRequest) => void): this;
    on(event: 'response', listener: (resp: http.IncomingMessage) => void): this;
    on(event: 'data', listener: (data: Buffer | string) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'complete', listener: (resp: http.IncomingMessage, body?: string | Buffer) => void): this;

    write(buffer: Buffer, cb?: Function): boolean;
    write(str: string, cb?: Function): boolean;
    write(str: string, encoding: string, cb?: Function): boolean;
    write(str: string, encoding?: string, fd?: string): boolean;
    end(): void;
    end(chunk: Buffer, cb?: Function): void;
    end(chunk: string, cb?: Function): void;
    end(chunk: string, encoding: string, cb?: Function): void;
    pause(): void;
    resume(): void;
    abort(): void;
    destroy(): void;
    toJSON(): Object;

    options: RequestOptions; // extension
    response: Promise<Response<T>>; // extension
}

export interface RequestOptions {
    baseUrl?: string;
    jar?: tough.CookieJar | boolean;
    cookies?: string | object | Array<tough.Cookie>;
    formData?: Object;
    form?: Object | string;
    auth?: types.AuthOptions;
    oauth?: types.OAuthOptions;
    aws?: { secret: string; bucket?: string; };
    hawk?: { credentials: any; };
    params?: any;
    qs?: any;
    json?: any;
    multipart?: types.RequestPart[] | types.Multipart;
    agentOptions?: any;
    agentClass?: any;
    forever?: any;
    host?: string;
    port?: number;
    method?: string;
    headers?: types.Headers;
    body?: any;
    followRedirect?: boolean | ((response: http.IncomingMessage) => boolean);
    followAllRedirects?: boolean;
    maxRedirects?: number;
    keepAlive?: boolean;
    encoding?: string | null;
    pool?: any;
    timeout?: number;
    proxy?: any;
    withoutProxy?: boolean;
    strictSSL?: boolean;
    verify?: boolean;
    rejectUnauthorized?: boolean;
    gzip?: boolean;
    preambleCRLF?: boolean;
    postambleCRLF?: boolean;
    key?: Buffer;
    cert?: Buffer;
    passphrase?: string;
    ca?: Buffer;
    har?: types.HttpArchiveRequest;
    useQuerystring?: boolean;
    uri?: string; // extension
    throwResponseError?: boolean; // extension
}

export class RequestError<T> extends Error {
    request: Request<T>;
    innerError: Error;
    constructor(err: Error, request: Request<T>) {
        super(err.message);
        this.request = request;
        this.innerError = err;
    }
}
