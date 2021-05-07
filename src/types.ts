export interface AuthOptions {
    user?: string;
    username?: string;
    pass?: string;
    password?: string;
    sendImmediately?: boolean;
    bearer?: string;
}

export interface AWSOptions {
    secret: string;
    bucket?: string;
}

export interface Headers {
    [key: string]: any;
}

export interface HttpArchiveRequest {
    url?: string;
    method?: string;
    headers?: NameValuePair[];
    postData?: {
        mimeType?: string;
        params?: NameValuePair[];
    }
}

export interface Multipart {
    chunked?: boolean;
    data?: {
        'content-type'?: string,
        body: string
    }[];
}

export interface NameValuePair {
    name: string;
    value: string;
}

export interface RequestPart {
    headers?: Headers;
    body: any;
}

export interface OAuthOptions {
    callback?: string;
    consumer_key?: string;
    consumer_secret?: string;
    token?: string;
    token_secret?: string;
    verifier?: string;
}
