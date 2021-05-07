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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaults = exports.delete = exports.json = exports.del = exports.head = exports.patch = exports.put = exports.post = exports.get = exports.session = exports.Session = exports.stream = exports.create = exports.throwResponseError = void 0;
var request = require('request');
const utils = __importStar(require("./utils"));
const types = __importStar(require("./types"));
const tough = __importStar(require("tough-cookie"));
const request_1 = require("./request");
const response_1 = require("./response");
exports.default = { utils, types };
exports.throwResponseError = false;
function create(uri, options, content) {
    options = Object.assign({}, options, { uri: uri });
    if (options.jar === true)
        options.jar = request.jar();
    if (content !== undefined)
        options.body = content;
    var throwEnabled = exports.throwResponseError;
    if (options.throwResponseError !== undefined)
        throwEnabled = options.throwResponseError;
    options.encoding = null;
    options.params != null && (options.qs = options.params);
    !options.verify && (options.strictSSL = options.verify);
    !options.headers && (options.headers = { "User-Agent": utils.UserAgents.random() });
    options.cookies && (options.headers["Cookie"] = utils.parseCookies(options.cookies));
    options.headers &&
        (!options.headers.hasOwnProperty("User-Agent") && !options.headers.hasOwnProperty("user-agent")) &&
        (options.headers["User-Agent"] = utils.UserAgents.random());
    var instance;
    var startTime = new Date().getTime();
    var promise = new Promise((resolve, reject) => {
        instance = request(options, (err, message, body) => {
            if (!err) {
                var response = new response_1.Response(instance, message, body);
                var endTime = new Date().getTime();
                response.cost = () => {
                    return endTime - startTime;
                };
                if (message.statusCode < 400 || !throwEnabled)
                    resolve(response);
                else
                    reject(new response_1.ResponseError(response));
            }
            else {
                reject(new request_1.RequestError(err, instance));
            }
        });
    });
    instance.options = options;
    instance.response = promise;
    return instance;
}
exports.create = create;
function stream(uri, options, content) {
    options = Object.assign({}, options, { uri: uri });
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
        (() => { options.headers["User-Agent"] = utils.UserAgents.random(); })();
    var instance = request(options);
    instance.options = options;
    var startTime = new Date().getTime();
    instance.response = new Promise((resolve, reject) => instance.on('complete', message => {
        var response = new response_1.Response(instance, message, null);
        var endTime = new Date().getTime();
        response.cost = () => {
            return endTime - startTime;
        };
        if (message.statusCode < 400 || !exports.throwResponseError)
            resolve(response);
        else
            reject(new response_1.ResponseError(response));
    }).on('error', err => reject(new request_1.RequestError(err, instance))));
    return instance;
}
exports.stream = stream;
class Session {
    constructor(opt) {
        this.uri = (opt && opt.uri) ? opt.uri : "";
        this.jar = (opt && opt.jar) ? opt.jar : request.jar();
        this.timeout = (opt && opt.timeout) ? opt.timeout : 3000;
        this.headers = (opt && opt.headers) ? opt.headers : null;
        this.initOption = {
            jar: this.jar,
            headers: this.headers,
            timeout: this.timeout,
        };
        (opt && opt.proxy) && (() => {
            let proxyOpt = utils.parseProxy(opt.proxy);
            for (const [key, value] of Object.entries(proxyOpt)) {
                this.initOption[key] = value;
            }
        })();
    }
    get(uri, options) {
        return __awaiter(this, void 0, void 0, function* () { return yield create(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'GET' })).response; });
    }
    post(uri, options, content) {
        return __awaiter(this, void 0, void 0, function* () { return yield create(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'POST' }), content).response; });
    }
    put(uri, options, content) {
        return __awaiter(this, void 0, void 0, function* () { return yield create(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'PUT' }), content).response; });
    }
    patch(uri, options, content) {
        return __awaiter(this, void 0, void 0, function* () { return yield create(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'PATCH' }), content).response; });
    }
    head(uri, options) {
        return __awaiter(this, void 0, void 0, function* () { return yield create(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'HEAD' })).response; });
    }
    del(uri, options) {
        return __awaiter(this, void 0, void 0, function* () { return yield create(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'DELETE' })).response; });
    }
    delete(uri, options) {
        return __awaiter(this, void 0, void 0, function* () { return yield create(uri, utils.processReqOpts(uri, this.initOption, options, { method: 'DELETE' })).response; });
    }
    json(uri, options) {
        return __awaiter(this, void 0, void 0, function* () { return (yield create(uri, utils.processReqOpts(uri, this.initOption, options, { json: true })).response).content; });
    }
    get cookies() {
        return this.jar.getCookies(this.uri);
    }
    processCookies(cookies, uri) {
        var _cookies;
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
                    }
                    ;
                })() : (() => {
                    _cookies = [];
                    cookies.forEach(cookie => {
                        cookie instanceof tough.Cookie ? _cookies.push(cookie) : _cookies.push(new tough.Cookie(cookie));
                    });
                })();
                break;
            default:
                _cookies = cookies;
                break;
        }
        return _cookies;
    }
    setCookies(cookies, uri) {
        uri = uri ? uri : this.uri;
        this.processCookies(cookies, uri).forEach(cookie => {
            this.jar.setCookie(cookie.toString(), uri);
        });
    }
    updateCookie(cookie, uri) {
        uri = uri ? uri : this.uri;
        this.jar.setCookie(cookie.toString(), uri);
    }
    updateCookies(cookies, uri) {
    }
    getCookies(uri) {
        uri = uri ? uri : this.uri;
        return this.jar.getCookies(uri);
    }
    getCookieStringSync(uri) {
        let cookies = this.getCookies(uri);
        return cookies ? cookies.map(cookie => {
            return cookie.cookieString();
        }).join("; ") : "";
    }
    getCookieMapSync(uri) {
        let cookies = this.getCookies(uri), _cookies = {};
        cookies && cookies.forEach(cookie => {
            _cookies[cookie.key] = cookie.value;
        });
        return _cookies;
    }
    getCookieArrayMap(uri) {
        let cookies = this.getCookies(uri), _cookies = [];
        cookies && cookies.forEach(cookie => {
            _cookies.push(cookie.toJSON());
        });
        return cookies;
    }
    cookiesString(uri) {
        var _cookies;
        if (uri) {
            _cookies = this.getCookies(uri);
        }
        else {
            _cookies = this.cookies;
        }
        return _cookies ? _cookies.map(cookie => {
            return cookie.cookieString();
        }).join("; ") : "";
    }
    cookiesMap(uri) {
        let cookies = {};
        var _cookies;
        if (uri) {
            _cookies = this.getCookies(uri);
        }
        else {
            _cookies = this.cookies;
        }
        _cookies && _cookies.forEach(cookie => {
            cookies[cookie.key] = cookie.value;
        });
        return cookies;
    }
    cookiesArrayMap(uri) {
        let cookies = [];
        var _cookies;
        if (uri) {
            _cookies = this.getCookies(uri);
        }
        else {
            _cookies = this.cookies;
        }
        this.cookies && this.cookies.forEach(cookie => {
            cookies.push(cookie.toJSON());
        });
        return cookies;
    }
}
exports.Session = Session;
function session(opt) {
    return new Session(opt);
}
exports.session = session;
function get(uri, options) {
    return __awaiter(this, void 0, void 0, function* () { return new Session(utils.parseOpts(options)).get(uri, options); });
}
exports.get = get;
function post(uri, options, content) {
    return __awaiter(this, void 0, void 0, function* () { return new Session(utils.parseOpts(options)).post(uri, options, content); });
}
exports.post = post;
function put(uri, options, content) {
    return __awaiter(this, void 0, void 0, function* () { return new Session(utils.parseOpts(options)).put(uri, options, content); });
}
exports.put = put;
function patch(uri, options, content) {
    return __awaiter(this, void 0, void 0, function* () { return new Session(utils.parseOpts(options)).patch(uri, options, content); });
}
exports.patch = patch;
function head(uri, options) {
    return __awaiter(this, void 0, void 0, function* () { return new Session(utils.parseOpts(options)).head(uri, options); });
}
exports.head = head;
function del(uri, options) {
    return __awaiter(this, void 0, void 0, function* () { return new Session(utils.parseOpts(options)).del(uri, options); });
}
exports.del = del;
exports.delete = del;
function json(uri, options) {
    return __awaiter(this, void 0, void 0, function* () { return new Session(utils.parseOpts(options)).json(uri, options); });
}
exports.json = json;
function defaults(options) {
    if (options.throwResponseError !== undefined)
        exports.throwResponseError = options.throwResponseError;
    request.defaults(options);
}
exports.defaults = defaults;
//# sourceMappingURL=index.js.map