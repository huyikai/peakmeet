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

// ../shared/dist/content/actionCatalogOptions.js
var BODYWEIGHT_EQUIPMENT_ID = "__bodyweight__";
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
var DEFAULT_LIMIT2 = 24;
var MAX_LIMIT2 = 100;
var MAX_SEARCH_LENGTH = 80;
var CURSOR_PREFIX = "action:";
var SAFE_TAXONOMY_ID = /^[\p{L}\p{N}_][\p{L}\p{N}_.:/ -]{0,63}$/u;
var SAFE_ACTION_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
var MUSCLE_IDS = new Set(ACTION_PRIMARY_MUSCLE_OPTIONS.map(({ id }) => id));
var GOAL_IDS = new Set(ACTION_GOAL_OPTIONS.map(({ id }) => id));
var DIFFICULTIES = new Set(ACTION_DIFFICULTY_OPTIONS.map(({ id }) => id));
function invalid(message) {
  return { ok: false, code: "INVALID_FILTER", message };
}
function nullableTaxonomyId(value, allowed, label) {
  if (value === void 0 || value === null || value === "") {
    return { ok: true, value: null };
  }
  if (typeof value !== "string" || !SAFE_TAXONOMY_ID.test(value) || allowed && !allowed.has(value)) {
    return invalid(`${label} \u4E0D\u5728\u767D\u540D\u5355`);
  }
  return { ok: true, value };
}
function normalizeTaxonomy(input) {
  if (input === void 0 || input === null) {
    return {
      ok: true,
      value: {
        primaryMuscle: null,
        equipmentId: null,
        difficulty: null,
        goal: null
      }
    };
  }
  if (typeof input !== "object" || Array.isArray(input)) {
    return invalid("taxonomy \u987B\u4E3A\u5BF9\u8C61");
  }
  const taxonomy = input;
  const allowedKeys = /* @__PURE__ */ new Set([
    "primaryMuscle",
    "equipmentId",
    "difficulty",
    "goal"
  ]);
  const unknownKey = Object.keys(taxonomy).find((key) => !allowedKeys.has(key));
  if (unknownKey)
    return invalid(`\u4E0D\u5141\u8BB8\u7684 taxonomy \u5B57\u6BB5: ${unknownKey}`);
  const primaryMuscle = nullableTaxonomyId(taxonomy.primaryMuscle, MUSCLE_IDS, "primaryMuscle");
  if (!primaryMuscle.ok)
    return primaryMuscle;
  const equipmentId = nullableTaxonomyId(taxonomy.equipmentId, null, "equipmentId");
  if (!equipmentId.ok)
    return equipmentId;
  const difficulty = nullableTaxonomyId(taxonomy.difficulty, DIFFICULTIES, "difficulty");
  if (!difficulty.ok)
    return difficulty;
  const goal = nullableTaxonomyId(taxonomy.goal, GOAL_IDS, "goal");
  if (!goal.ok)
    return goal;
  return {
    ok: true,
    value: {
      primaryMuscle: primaryMuscle.value,
      equipmentId: equipmentId.value === BODYWEIGHT_EQUIPMENT_ID ? BODYWEIGHT_EQUIPMENT_ID : equipmentId.value,
      difficulty: difficulty.value,
      goal: goal.value
    }
  };
}
function encodeActionListCursor(id) {
  if (!SAFE_ACTION_ID.test(id))
    return "";
  return `${CURSOR_PREFIX}${encodeURIComponent(id)}`;
}
function decodeActionListCursor(cursor) {
  if (!cursor.startsWith(CURSOR_PREFIX))
    return null;
  try {
    const id = decodeURIComponent(cursor.slice(CURSOR_PREFIX.length));
    return SAFE_ACTION_ID.test(id) && encodeActionListCursor(id) === cursor ? id : null;
  } catch {
    return null;
  }
}
function validateActionListQuery(input) {
  const limit = input.limit ?? DEFAULT_LIMIT2;
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT2) {
    return {
      ok: false,
      code: "INVALID_PAGINATION",
      message: `limit \u987B\u4E3A 1\u2013${MAX_LIMIT2} \u7684\u6574\u6570`
    };
  }
  const rawOffset = input.offset ?? 0;
  if (typeof rawOffset !== "number" || !Number.isSafeInteger(rawOffset) || rawOffset < 0) {
    return {
      ok: false,
      code: "INVALID_PAGINATION",
      message: "offset \u987B\u4E3A\u975E\u8D1F\u5B89\u5168\u6574\u6570"
    };
  }
  let cursor = null;
  if (input.cursor !== void 0 && input.cursor !== null && input.cursor !== "") {
    if (typeof input.cursor !== "string") {
      return {
        ok: false,
        code: "INVALID_PAGINATION",
        message: "cursor \u683C\u5F0F\u975E\u6CD5"
      };
    }
    cursor = decodeActionListCursor(input.cursor);
    if (!cursor) {
      return {
        ok: false,
        code: "INVALID_PAGINATION",
        message: "cursor \u683C\u5F0F\u975E\u6CD5"
      };
    }
  }
  const rawSearch = input.search ?? "";
  if (typeof rawSearch !== "string")
    return invalid("search \u987B\u4E3A\u5B57\u7B26\u4E32");
  const search = rawSearch.trim();
  if (search.length > MAX_SEARCH_LENGTH)
    return invalid("search \u6700\u957F 80 \u4E2A\u5B57\u7B26");
  const taxonomy = normalizeTaxonomy(input.taxonomy);
  if (!taxonomy.ok)
    return taxonomy;
  return {
    ok: true,
    value: {
      limit,
      offset: cursor ? 0 : rawOffset,
      cursor,
      search,
      taxonomy: taxonomy.value
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

// contentList/index.ts
var cloud = require("wx-server-sdk");
cloud.init();
var db = cloud.database();
var ACTION_SUMMARY_PROJECTION = {
  _id: true,
  name: true,
  aliases: true,
  difficulty: true,
  goals: true,
  primaryMuscles: true,
  equipment: true,
  cover: true,
  coverJpg: true
};
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function actionConditions(query) {
  const conditions = [];
  const { taxonomy, search, cursor } = query.value;
  if (taxonomy.primaryMuscle) {
    conditions.push({ primaryMuscles: taxonomy.primaryMuscle });
  }
  if (taxonomy.equipmentId === BODYWEIGHT_EQUIPMENT_ID) {
    conditions.push({ equipment: db.command.size(0) });
  } else if (taxonomy.equipmentId) {
    conditions.push({ equipment: taxonomy.equipmentId });
  }
  if (taxonomy.difficulty) {
    conditions.push({ difficulty: taxonomy.difficulty });
  }
  if (taxonomy.goal) {
    conditions.push({ goals: taxonomy.goal });
  }
  if (search) {
    const expression = db.RegExp({
      regexp: escapeRegExp(search),
      options: "i"
    });
    conditions.push(
      db.command.or([{ name: expression }, { aliases: expression }])
    );
  }
  if (cursor) {
    conditions.push({ _id: db.command.gt(cursor) });
  }
  return conditions;
}
function withConditions(query, conditions) {
  if (conditions.length === 0) return query;
  return query.where(
    conditions.length === 1 ? conditions[0] : db.command.and(conditions)
  );
}
function asActionSummary(record) {
  return record;
}
async function listActions(event) {
  const parsed = validateActionListQuery({
    limit: event.limit,
    offset: event.offset ?? event.skip,
    cursor: event.cursor,
    search: event.search,
    taxonomy: event.taxonomy
  });
  if (!parsed.ok) return null;
  const conditions = actionConditions(parsed);
  const base = withConditions(db.collection("actions"), conditions);
  const countResult = await base.count();
  const total = countResult.total ?? 0;
  const result = await base.orderBy("_id", "asc").skip(parsed.value.offset).limit(parsed.value.limit).field(ACTION_SUMMARY_PROJECTION).get();
  const items = (result.data ?? []).map(asActionSummary);
  const last = items[items.length - 1];
  const hasMore = parsed.value.cursor ? items.length === parsed.value.limit : parsed.value.offset + items.length < total;
  return {
    items,
    total,
    hasMore,
    nextCursor: hasMore && last ? encodeActionListCursor(last._id) || null : null
  };
}
async function main(event = {}) {
  try {
    const isActionCatalogQuery = event.collection === "actions" && (event.offset !== void 0 || event.cursor !== void 0 || event.search !== void 0 || event.taxonomy !== void 0);
    if (isActionCatalogQuery) {
      const data = await listActions(event);
      if (!data) {
        const invalid2 = validateActionListQuery({
          limit: event.limit,
          offset: event.offset ?? event.skip,
          cursor: event.cursor,
          search: event.search,
          taxonomy: event.taxonomy
        });
        if (!invalid2.ok) return contentErr(invalid2.code, invalid2.message);
        return contentErr("INTERNAL", "\u52A8\u4F5C\u67E5\u8BE2\u89E3\u6790\u5931\u8D25");
      }
      return contentOk(data);
    }
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
