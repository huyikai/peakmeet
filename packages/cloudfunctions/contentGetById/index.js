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

// contentGetById/index.ts
var index_exports = {};
__export(index_exports, {
  main: () => main
});
module.exports = __toCommonJS(index_exports);

// ../shared/dist/content/collections.js
var PUBLIC_COLLECTIONS = [
  "actions",
  "equipment",
  "training_plans",
  "foods"
];
function isPublicCollection(value) {
  return typeof value === "string" && PUBLIC_COLLECTIONS.includes(value);
}

// ../shared/dist/content/validateQuery.js
function validateGetByIdQuery(input) {
  if (!isPublicCollection(input.collection)) {
    return {
      ok: false,
      code: "INVALID_COLLECTION",
      message: "\u96C6\u5408\u4E0D\u5728\u767D\u540D\u5355"
    };
  }
  if (typeof input.id !== "string" || input.id.trim() === "") {
    return {
      ok: false,
      code: "INVALID_ID",
      message: "id \u4E0D\u80FD\u4E3A\u7A7A"
    };
  }
  return {
    ok: true,
    value: {
      collection: input.collection,
      id: input.id.trim()
    }
  };
}

// ../shared/dist/content/envelope.js
function contentOk(data) {
  return { ok: true, data };
}
function contentErr(code, message) {
  return { ok: false, code, message };
}

// contentGetById/index.ts
var cloud = require("wx-server-sdk");
cloud.init();
var db = cloud.database();
async function main(event = {}) {
  try {
    const parsed = validateGetByIdQuery({
      collection: event.collection,
      id: event.id
    });
    if (!parsed.ok) {
      return contentErr(parsed.code, parsed.message);
    }
    const { collection, id } = parsed.value;
    const res = await db.collection(collection).doc(id).get();
    const raw = res.data;
    const item = Array.isArray(raw) ? raw[0] : raw;
    if (!item || typeof item !== "object") {
      return contentErr("NOT_FOUND", "\u672A\u627E\u5230\u6587\u6863");
    }
    return contentOk({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "\u5185\u90E8\u9519\u8BEF";
    if (/not exist|does not exist|找不到|DOCUMENT_NOT_EXIST/i.test(message)) {
      return contentErr("NOT_FOUND", "\u672A\u627E\u5230\u6587\u6863");
    }
    return contentErr("INTERNAL", message);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
