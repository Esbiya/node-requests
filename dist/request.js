"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestError = void 0;
class RequestError extends Error {
    constructor(err, request) {
        super(err.message);
        this.request = request;
        this.innerError = err;
    }
}
exports.RequestError = RequestError;
//# sourceMappingURL=request.js.map