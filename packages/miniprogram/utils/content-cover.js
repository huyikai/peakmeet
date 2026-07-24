"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveContentCover = void 0;
exports.contentCoverSrc = contentCoverSrc;
const index_1 = require("./shared/index");
Object.defineProperty(exports, "resolveContentCover", { enumerable: true, get: function () { return index_1.resolveContentCover; } });
function contentCoverSrc(cover) {
    return (0, index_1.resolveContentCover)(cover);
}
