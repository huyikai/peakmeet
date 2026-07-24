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

// ../shared/dist/content/actionCatalogOptions.js
var ACTION_PRIMARY_MUSCLE_OPTIONS = [
  { id: "chest", labelZh: "\u80F8" },
  { id: "back", labelZh: "\u80CC" },
  { id: "shoulders", labelZh: "\u80A9" },
  { id: "biceps", labelZh: "\u80B1\u4E8C\u5934" },
  { id: "triceps", labelZh: "\u80B1\u4E09\u5934" },
  { id: "core", labelZh: "\u6838\u5FC3" },
  { id: "quads", labelZh: "\u80A1\u56DB\u5934" },
  { id: "hamstrings", labelZh: "\u8158\u7EF3" },
  { id: "glutes", labelZh: "\u81C0" },
  { id: "calves", labelZh: "\u5C0F\u817F" }
];
var ACTION_GOAL_OPTIONS = [
  { id: "strength", labelZh: "\u529B\u91CF" },
  { id: "hypertrophy", labelZh: "\u589E\u808C" },
  { id: "conditioning", labelZh: "\u4F53\u80FD" },
  { id: "mobility", labelZh: "\u7075\u6D3B" }
];
var ACTION_DIFFICULTY_OPTIONS = [
  { id: "beginner", labelZh: "\u521D\u7EA7" },
  { id: "intermediate", labelZh: "\u4E2D\u7EA7" },
  { id: "advanced", labelZh: "\u9AD8\u7EA7" }
];

// ../shared/dist/content/actionListQuery.js
var MUSCLE_IDS = new Set(ACTION_PRIMARY_MUSCLE_OPTIONS.map(({ id }) => id));
var GOAL_IDS = new Set(ACTION_GOAL_OPTIONS.map(({ id }) => id));
var DIFFICULTIES = new Set(ACTION_DIFFICULTY_OPTIONS.map(({ id }) => id));

// ../shared/dist/content/envelope.js
function contentOk(data) {
  return { ok: true, data };
}
function contentErr(code, message) {
  return { ok: false, code, message };
}

// ../shared/dist/content/exerciseTaxonomy.js
var EQUIPMENT_CATALOG = [
  {
    raw: "assisted",
    id: "equip_assisted",
    nameZh: "\u52A9\u529B\u5668\u68B0",
    type: "machine",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "band",
    id: "equip_band",
    nameZh: "\u5F39\u529B\u5E26",
    type: "accessory",
    scenes: ["home", "gym"],
    primaryScene: "home"
  },
  {
    raw: "barbell",
    id: "equip_barbell",
    nameZh: "\u6760\u94C3",
    type: "free_weight",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "body weight",
    id: "equip_body_weight",
    nameZh: "\u81EA\u91CD",
    type: "accessory",
    scenes: ["bodyweight", "home"],
    primaryScene: "bodyweight"
  },
  {
    raw: "bosu ball",
    id: "equip_bosu_ball",
    nameZh: "\u6CE2\u901F\u7403",
    type: "accessory",
    scenes: ["gym", "home"],
    primaryScene: "gym"
  },
  {
    raw: "cable",
    id: "equip_cable",
    nameZh: "\u7EF3\u7D22",
    type: "machine",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "dumbbell",
    id: "equip_dumbbell",
    nameZh: "\u54D1\u94C3",
    type: "free_weight",
    scenes: ["gym", "home"],
    primaryScene: "gym"
  },
  {
    raw: "elliptical machine",
    id: "equip_elliptical_machine",
    nameZh: "\u692D\u5706\u673A",
    type: "cardio",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "ez barbell",
    id: "equip_ez_barbell",
    nameZh: "EZ\u6760",
    type: "free_weight",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "hammer",
    id: "equip_hammer",
    nameZh: "\u9524\u94C3",
    type: "free_weight",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "kettlebell",
    id: "equip_kettlebell",
    nameZh: "\u58F6\u94C3",
    type: "free_weight",
    scenes: ["gym", "home"],
    primaryScene: "gym"
  },
  {
    raw: "leverage machine",
    id: "equip_leverage_machine",
    nameZh: "\u6760\u6746\u5668\u68B0",
    type: "machine",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "medicine ball",
    id: "equip_medicine_ball",
    nameZh: "\u836F\u7403",
    type: "accessory",
    scenes: ["gym", "home"],
    primaryScene: "gym"
  },
  {
    raw: "olympic barbell",
    id: "equip_olympic_barbell",
    nameZh: "\u5965\u6746",
    type: "free_weight",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "resistance band",
    id: "equip_resistance_band",
    nameZh: "\u963B\u529B\u5E26",
    type: "accessory",
    scenes: ["home", "gym"],
    primaryScene: "home"
  },
  {
    raw: "roller",
    id: "equip_roller",
    nameZh: "\u6CE1\u6CAB\u8F74",
    type: "accessory",
    scenes: ["home", "gym"],
    primaryScene: "home"
  },
  {
    raw: "rope",
    id: "equip_rope",
    nameZh: "\u7EF3\u7D22\u914D\u4EF6",
    type: "accessory",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "skierg machine",
    id: "equip_skierg_machine",
    nameZh: "\u6ED1\u96EA\u673A",
    type: "cardio",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "sled machine",
    id: "equip_sled_machine",
    nameZh: "\u96EA\u6A47\u673A",
    type: "machine",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "smith machine",
    id: "equip_smith_machine",
    nameZh: "\u53F2\u5BC6\u65AF\u673A",
    type: "machine",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "stability ball",
    id: "equip_stability_ball",
    nameZh: "\u7A33\u5B9A\u7403",
    type: "accessory",
    scenes: ["home", "gym"],
    primaryScene: "home"
  },
  {
    raw: "stationary bike",
    id: "equip_stationary_bike",
    nameZh: "\u56FA\u5B9A\u81EA\u884C\u8F66",
    type: "cardio",
    scenes: ["gym", "home"],
    primaryScene: "gym"
  },
  {
    raw: "stepmill machine",
    id: "equip_stepmill_machine",
    nameZh: "\u53F0\u9636\u673A",
    type: "cardio",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "tire",
    id: "equip_tire",
    nameZh: "\u8F6E\u80CE",
    type: "accessory",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "trap bar",
    id: "equip_trap_bar",
    nameZh: "\u516D\u89D2\u6760",
    type: "free_weight",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "upper body ergometer",
    id: "equip_upper_body_ergometer",
    nameZh: "\u4E0A\u80A2\u6D4B\u529B\u8BA1",
    type: "cardio",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "weighted",
    id: "equip_weighted",
    nameZh: "\u8D1F\u91CD\u914D\u4EF6",
    type: "accessory",
    scenes: ["gym"],
    primaryScene: "gym"
  },
  {
    raw: "wheel roller",
    id: "equip_wheel_roller",
    nameZh: "\u5065\u8179\u8F6E",
    type: "accessory",
    scenes: ["home", "gym"],
    primaryScene: "home"
  }
];
var EQUIPMENT_BY_RAW = new Map(EQUIPMENT_CATALOG.map((item) => [item.raw, item]));

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
