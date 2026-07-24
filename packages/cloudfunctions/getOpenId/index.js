"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// getOpenId/index.ts
var index_exports = {};
__export(index_exports, {
  main: () => main
});
module.exports = __toCommonJS(index_exports);
var cloud = require("wx-server-sdk");
cloud.init();
async function main(_event = {}) {
  try {
    const openid = cloud.getWXContext().OPENID;
    if (!openid || typeof openid !== "string") {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        message: "\u65E0\u6CD5\u83B7\u53D6\u7528\u6237\u8EAB\u4EFD"
      };
    }
    return { ok: true, data: { openid } };
  } catch (e) {
    const message = e instanceof Error ? e.message : "\u5185\u90E8\u9519\u8BEF";
    return { ok: false, code: "INTERNAL", message };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
