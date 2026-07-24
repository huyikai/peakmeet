import type {
  Action,
  ActionEnrichment,
  ActionMedia,
  ActionSource,
  ActionTaxonomy,
  Difficulty,
  ReviewStatus,
} from './types';
import {
  ENRICHMENT_VERSION,
  LOCALIZATION_VERSION,
  MEDIA_ATTRIBUTION,
  TRANSFORM_VERSION,
  inferDifficulty,
  inferGoals,
  inferScenes,
  mapSecondaryMuscle,
  mapTargetToPrimaryMuscle,
  resolveEquipment,
  stableExerciseId,
} from './exerciseTaxonomy';

export type UpstreamExercise = {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  instructions: Record<string, string>;
  instruction_steps: Record<string, string[]>;
  muscle_group: string;
  secondary_muscles: string[];
  target: string;
  media_id: string;
  image: string;
  gif_url: string;
  attribution: string;
  created_at: string;
};

const NAME_GLOSSARY: Array<[RegExp, string]> = [
  [/\b3\/4\b/gi, '四分之三'],
  [/\bsit-?ups?\b/gi, '仰卧起坐'],
  [/\bcrunches?\b/gi, '卷腹'],
  [/\bplanks?\b/gi, '平板支撑'],
  [/\bpush-?ups?\b/gi, '俯卧撑'],
  [/\bpull-?ups?\b/gi, '引体向上'],
  [/\bchin-?ups?\b/gi, '反手引体向上'],
  [/\bdips?\b/gi, '双杠臂屈伸'],
  [/\bsquat(s)?\b/gi, '深蹲'],
  [/\blunge(s)?\b/gi, '弓步'],
  [/\bdeadlift(s)?\b/gi, '硬拉'],
  [/\bbench press(es)?\b/gi, '卧推'],
  [/\bpress(es)?\b/gi, '推举'],
  [/\brow(s)?\b/gi, '划船'],
  [/\bcurl(s)?\b/gi, '弯举'],
  [/\bextension(s)?\b/gi, '伸展'],
  [/\bfly(es)?\b/gi, '飞鸟'],
  [/\braise(s)?\b/gi, '平举'],
  [/\bshrug(s)?\b/gi, '耸肩'],
  [/\bbridge(s)?\b/gi, '桥式'],
  [/\bhip thrust(s)?\b/gi, '臀推'],
  [/\bleg raise(s)?\b/gi, '抬腿'],
  [/\bleg press(es)?\b/gi, '腿举'],
  [/\bleg curl(s)?\b/gi, '腿弯举'],
  [/\bleg extension(s)?\b/gi, '腿伸展'],
  [/\bcalf raise(s)?\b/gi, '提踵'],
  [/\bjump(s)?\b/gi, '跳跃'],
  [/\brun(s|ning)?\b/gi, '跑'],
  [/\bwalk(s|ing)?\b/gi, '走'],
  [/\bkick(s)?\b/gi, '踢腿'],
  [/\btwist(s)?\b/gi, '转体'],
  [/\brotation(s)?\b/gi, '旋转'],
  [/\bstretch(es)?\b/gi, '拉伸'],
  [/\bmountain climber(s)?\b/gi, '登山者'],
  [/\bburpee(s)?\b/gi, '波比跳'],
  [/\bjack(s)?\b/gi, '开合跳'],
  [/\bfarmer('?s)? walk(s)?\b/gi, '农夫行走'],
  [/\bswing(s)?\b/gi, '摆动'],
  [/\bsnatch(es)?\b/gi, '抓举'],
  [/\bclean(s)?\b/gi, '翻举'],
  [/\bjerk(s)?\b/gi, '挺举'],
  [/\bthruster(s)?\b/gi, '推举深蹲'],
  [/\bgoblet\b/gi, '高脚杯'],
  [/\bbulgarian\b/gi, '保加利亚'],
  [/\bromanian\b/gi, '罗马尼亚'],
  [/\bsumo\b/gi, '相扑'],
  [/\bincline\b/gi, '上斜'],
  [/\bdecline\b/gi, '下斜'],
  [/\bseated\b/gi, '坐姿'],
  [/\bstanding\b/gi, '站姿'],
  [/\blying\b/gi, '躺姿'],
  [/\bprone\b/gi, '俯卧'],
  [/\bsupine\b/gi, '仰卧'],
  [/\bkneeling\b/gi, '跪姿'],
  [/\bsingle[- ]arm\b/gi, '单臂'],
  [/\bsingle[- ]leg\b/gi, '单腿'],
  [/\bone[- ]arm\b/gi, '单臂'],
  [/\bone[- ]leg\b/gi, '单腿'],
  [/\balternating\b/gi, '交替'],
  [/\breverse\b/gi, '反向'],
  [/\bclose[- ]grip\b/gi, '窄握'],
  [/\bwide[- ]grip\b/gi, '宽握'],
  [/\bhammer\b/gi, '锤式'],
  [/\bcable\b/gi, '绳索'],
  [/\bdumbbell\b/gi, '哑铃'],
  [/\bbarbell\b/gi, '杠铃'],
  [/\bkettlebell\b/gi, '壶铃'],
  [/\bband\b/gi, '弹力带'],
  [/\bmachine\b/gi, '器械'],
  [/\bsmith\b/gi, '史密斯'],
  [/\bleverage\b/gi, '杠杆'],
  [/\bbodyweight\b/gi, '自重'],
  [/\bbody weight\b/gi, '自重'],
  [/\bassisted\b/gi, '助力'],
  [/\bweighted\b/gi, '负重'],
  [/\bwith\b/gi, '配'],
  [/\bon\b/gi, '于'],
  [/\band\b/gi, '与'],
  [/\bthe\b/gi, ''],
  [/\ba\b/gi, ''],
];

export type LocalizedName = {
  nameZh: string;
  aliases: string[];
  status: ReviewStatus;
  version: string;
};

export function localizeExerciseName(englishName: string): LocalizedName {
  let translated = englishName.trim();
  for (const [pattern, replacement] of NAME_GLOSSARY) {
    translated = translated.replace(pattern, replacement);
  }
  translated = translated
    .replace(/[^0-9A-Za-z\u4e00-\u9fff]+/g, '')
    .replace(/\s+/g, '');
  if (!/[\u4e00-\u9fff]/.test(translated)) {
    translated = `${englishName.trim()}（待审校）`;
  }
  return {
    nameZh: translated,
    aliases: [englishName.trim()],
    status: 'pending_review',
    version: LOCALIZATION_VERSION,
  };
}

function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function buildActionSource(raw: UpstreamExercise): ActionSource {
  return {
    dataset: 'exercises-dataset',
    commit: '7455efae41b330c265e7cd4b78dfa848e7ce5ebd',
    sourceId: raw.id,
    nameEn: raw.name,
    bodyPart: raw.body_part,
    category: raw.category,
    equipmentRaw: raw.equipment,
    target: raw.target,
    muscleGroup: raw.muscle_group,
    secondaryMusclesRaw: [...raw.secondary_muscles],
    instructionsZh: raw.instructions.zh ?? '',
    instructionsEn: raw.instructions.en ?? '',
    stepsZh: [...(raw.instruction_steps.zh ?? [])],
    stepsEn: [...(raw.instruction_steps.en ?? [])],
    mediaId: raw.media_id,
    imagePath: raw.image,
    gifPath: raw.gif_url,
    attribution: raw.attribution || MEDIA_ATTRIBUTION,
    createdAt: raw.created_at,
  };
}

export function buildActionTaxonomy(raw: UpstreamExercise): ActionTaxonomy {
  const primaryMuscle = mapTargetToPrimaryMuscle(raw.target);
  const secondary = uniqueNonEmpty(
    raw.secondary_muscles.map(mapSecondaryMuscle),
  ).filter((id) => id !== primaryMuscle);
  const { equipmentIds } = resolveEquipment(raw.equipment);
  return {
    version: TRANSFORM_VERSION,
    primaryMuscles: [primaryMuscle],
    secondaryMuscles: secondary,
    equipmentIds,
    bodyPart: raw.body_part,
    target: raw.target,
  };
}

export function buildActionMedia(raw: UpstreamExercise): ActionMedia {
  return {
    thumbnailPath: raw.image,
    gifPath: raw.gif_url,
    thumbnailUri: `vendor://exercises-dataset/${raw.image}`,
    gifUri: `vendor://exercises-dataset/${raw.gif_url}`,
    cover: `vendor://exercises-dataset/${raw.image}`,
    coverJpg: `vendor://exercises-dataset/${raw.image}`,
    demoGif: `vendor://exercises-dataset/${raw.gif_url}`,
    attribution: raw.attribution || MEDIA_ATTRIBUTION,
    licenseStatus: 'provisional_third_party',
    width: 180,
    height: 180,
  };
}

export function buildActionEnrichment(raw: UpstreamExercise): ActionEnrichment {
  const difficulty = inferDifficulty(raw.name, raw.equipment);
  const goals = inferGoals(raw.body_part, raw.target, raw.equipment);
  const { scenes, primaryScene } = inferScenes(raw.equipment, raw.body_part);
  return {
    version: ENRICHMENT_VERSION,
    status: 'pending_review',
    generatedBy: 'rule',
    difficulty,
    goals,
    scenes,
    primaryScene,
    cues: [],
    mistakes: [],
    substituteIds: [],
  };
}

export function transformUpstreamExercise(raw: UpstreamExercise): Action {
  if (!raw.instruction_steps?.zh?.length) {
    throw new Error(`missing zh steps for ${raw.id}`);
  }
  const localized = localizeExerciseName(raw.name);
  const source = buildActionSource(raw);
  const taxonomy = buildActionTaxonomy(raw);
  const media = buildActionMedia(raw);
  const enrichment = buildActionEnrichment(raw);
  const sortWeight = 2000 - Number(raw.id);

  return {
    _id: stableExerciseId(raw.id),
    name: localized.nameZh,
    aliases: localized.aliases,
    difficulty: enrichment.difficulty as Difficulty,
    goals: enrichment.goals,
    primaryMuscles: taxonomy.primaryMuscles,
    secondaryMuscles: taxonomy.secondaryMuscles,
    equipment: taxonomy.equipmentIds,
    scenes: enrichment.scenes,
    primaryScene: enrichment.primaryScene,
    cover: media.cover,
    coverJpg: media.coverJpg,
    demoGif: media.demoGif,
    mediaAttribution: media.attribution,
    steps: source.stepsZh,
    cues: [],
    mistakes: [],
    substituteIds: [],
    sortWeight,
    updatedAt: '2026-07-24T00:00:00.000Z',
    schemaVersion: 1,
    source,
    localized: {
      nameZh: localized.nameZh,
      aliases: localized.aliases,
      status: localized.status,
      version: localized.version,
    },
    taxonomy,
    media,
    enrichment,
  };
}

export function transformUpstreamExercises(
  records: UpstreamExercise[],
): Action[] {
  if (records.length !== 1324) {
    throw new Error(`expected 1324 exercises, got ${records.length}`);
  }
  const ids = new Set<string>();
  const actions = records.map((raw) => {
    const action = transformUpstreamExercise(raw);
    if (ids.has(action._id)) {
      throw new Error(`duplicate action id ${action._id}`);
    }
    ids.add(action._id);
    return action;
  });
  return actions;
}
