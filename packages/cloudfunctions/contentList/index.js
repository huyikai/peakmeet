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

// contentList/index.ts
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

// ../shared/dist/content/filters.js
var LIST_FILTER_KEYS = {
  actions: ["difficulty", "primaryScene"],
  equipment: ["type", "primaryScene", "difficulty"],
  training_plans: ["goal", "scene", "difficulty", "category", "hot"],
  foods: ["category", "recommendGrade"]
};
function isAllowedFilterKey(collection, key) {
  return LIST_FILTER_KEYS[collection].includes(key);
}

// ../shared/dist/content/validateQuery.js
var DEFAULT_LIMIT = 20;
var MAX_LIMIT = 100;
function isFilterValue(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean";
}
function validateListQuery(input) {
  if (!isPublicCollection(input.collection)) {
    return {
      ok: false,
      code: "INVALID_COLLECTION",
      message: "\u96C6\u5408\u4E0D\u5728\u767D\u540D\u5355"
    };
  }
  let limit = DEFAULT_LIMIT;
  if (input.limit !== void 0 && input.limit !== null) {
    if (typeof input.limit !== "number" || !Number.isInteger(input.limit) || input.limit < 1 || input.limit > MAX_LIMIT) {
      return {
        ok: false,
        code: "INVALID_PAGINATION",
        message: `limit \u987B\u4E3A 1\u2013${MAX_LIMIT} \u7684\u6574\u6570`
      };
    }
    limit = input.limit;
  }
  let skip = 0;
  if (input.skip !== void 0 && input.skip !== null) {
    if (typeof input.skip !== "number" || !Number.isInteger(input.skip) || input.skip < 0) {
      return {
        ok: false,
        code: "INVALID_PAGINATION",
        message: "skip \u987B\u4E3A \u22650 \u7684\u6574\u6570"
      };
    }
    skip = input.skip;
  }
  const filter = {};
  if (input.filter !== void 0 && input.filter !== null) {
    if (typeof input.filter !== "object" || Array.isArray(input.filter)) {
      return {
        ok: false,
        code: "INVALID_FILTER",
        message: "filter \u987B\u4E3A\u5BF9\u8C61"
      };
    }
    for (const [key, value] of Object.entries(input.filter)) {
      if (!isAllowedFilterKey(input.collection, key)) {
        return {
          ok: false,
          code: "INVALID_FILTER",
          message: `\u4E0D\u5141\u8BB8\u7684\u8FC7\u6EE4\u5B57\u6BB5: ${key}`
        };
      }
      if (!isFilterValue(value)) {
        return {
          ok: false,
          code: "INVALID_FILTER",
          message: `\u8FC7\u6EE4\u503C\u7C7B\u578B\u975E\u6CD5: ${key}`
        };
      }
      filter[key] = value;
    }
  }
  return {
    ok: true,
    value: {
      collection: input.collection,
      limit,
      skip,
      filter
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

// contentList/index.ts
var cloud = require("wx-server-sdk");
cloud.init();
var db = cloud.database();
async function main(event = {}) {
  try {
    const parsed = validateListQuery({
      collection: event.collection,
      limit: event.limit,
      skip: event.skip,
      filter: event.filter
    });
    if (!parsed.ok) {
      return contentErr(parsed.code, parsed.message);
    }
    const { collection, limit, skip, filter } = parsed.value;
    let query = db.collection(collection);
    if (Object.keys(filter).length > 0) {
      query = query.where(filter);
    }
    const res = await query.orderBy("sortWeight", "desc").orderBy("_id", "asc").skip(skip).limit(limit).get();
    return contentOk({ items: res.data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "\u5185\u90E8\u9519\u8BEF";
    return contentErr("INTERNAL", message);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
