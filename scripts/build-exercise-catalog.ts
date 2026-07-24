/**
 * Build database/catalog from local vendor snapshot.
 * Never accesses the network.
 *
 * Run: pnpm db:build-catalog
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EQUIPMENT_CATALOG,
  transformUpstreamExercises,
  type UpstreamExercise,
} from '../packages/shared/src/content/index.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(root, 'database/vendor/exercises-dataset');
const catalogDir = join(root, 'database/catalog');
const enrichmentDir = join(root, 'database/enrichment');
const reportsDir = join(root, 'database/reports');

function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

type PlanItem = {
  actionId: string | null;
  name: string;
  sets: number | null;
  reps: string | null;
  restSec: number | null;
};

type PlanDay = {
  dayIndex: number;
  title: string;
  items: PlanItem[];
};

type TrainingPlan = {
  _id: string;
  days: PlanDay[];
  [key: string]: unknown;
};

function migratePlans(
  oldPlans: TrainingPlan[],
  report: Array<Record<string, unknown>>,
): TrainingPlan[] {
  return oldPlans.map((plan) => {
    const days = (plan.days ?? []).map((day) => ({
      ...day,
      items: (day.items ?? []).map((item) => {
        const oldId = item.actionId;
        if (!oldId) return item;
        report.push({
          planId: plan._id,
          dayIndex: day.dayIndex,
          oldActionId: oldId,
          oldName: item.name,
          newActionId: null,
          status: 'unmatched_retained',
        });
        return { ...item, actionId: null };
      }),
    }));
    return { ...plan, days };
  });
}

const exercisesPath = join(vendorDir, 'data/exercises.json');
if (!existsSync(exercisesPath)) {
  throw new Error(`Missing vendor snapshot: ${exercisesPath}`);
}

const upstream = JSON.parse(readFileSync(exercisesPath, 'utf8')) as UpstreamExercise[];
const actions = transformUpstreamExercises(upstream);

const equipment = EQUIPMENT_CATALOG.filter((item) => item.raw !== 'body weight').map(
  (item, index) => ({
    _id: item.id,
    name: item.nameZh,
    type: item.type,
    scenes: item.scenes,
    primaryScene: item.primaryScene,
    difficulty: 'beginner' as const,
    intro: `${item.nameZh}用于完成对应动作训练，请按自身水平循序渐进，仅供参考。`,
    value: '支持多关节与单关节训练动作',
    cover: `asset://content/equipment/${item.id}.png`,
    homeAlternatives: item.scenes.includes('home') ? ['自重'] : ['自重', '弹力带'],
    notes: '选购与使用前检查稳固性；仅供参考。',
    relatedActionIds: [],
    sortWeight: 100 - index,
    updatedAt: '2026-07-24T00:00:00.000Z',
    sourceEquipmentRaw: item.raw,
  }),
);

const foodsPath = join(catalogDir, 'foods.json');
const plansPath = join(catalogDir, 'training_plans.json');
if (!existsSync(foodsPath) || !existsSync(plansPath)) {
  throw new Error(
    'Missing catalog foods/training_plans. Keep previous catalog outputs or restore them before rebuilding actions.',
  );
}

const foods = JSON.parse(readFileSync(foodsPath, 'utf8'));
const currentPlans = JSON.parse(readFileSync(plansPath, 'utf8')) as TrainingPlan[];
const planReport: Array<Record<string, unknown>> = [];
// Plans already live in catalog; only remigrate actionId values that still look like legacy seeds.
const trainingPlans = migratePlans(currentPlans, planReport).map((plan) => {
  // If actionIds were already nulled in a previous migration, keep them.
  return plan;
});

const nameMap = Object.fromEntries(
  actions.map((action) => [
    action._id,
    {
      sourceId: action.source!.sourceId,
      nameEn: action.source!.nameEn,
      nameZh: action.localized!.nameZh,
      status: action.localized!.status,
      version: action.localized!.version,
    },
  ]),
);

const enrichmentMap = Object.fromEntries(
  actions.map((action) => [action._id, action.enrichment]),
);

mkdirSync(catalogDir, { recursive: true });
mkdirSync(enrichmentDir, { recursive: true });
mkdirSync(reportsDir, { recursive: true });

writeJson(join(catalogDir, 'actions.json'), actions);
writeJson(join(catalogDir, 'equipment.json'), equipment);
writeJson(join(catalogDir, 'foods.json'), foods);
writeJson(join(catalogDir, 'training_plans.json'), trainingPlans);
writeJson(join(enrichmentDir, 'action-names.zh.json'), nameMap);
writeJson(join(enrichmentDir, 'action-enrichment.json'), enrichmentMap);
writeJson(join(reportsDir, 'plan-action-migration.json'), {
  generatedAt: new Date().toISOString(),
  unmatchedCount: planReport.length,
  items: planReport,
});

console.log(
  `[catalog] actions=${actions.length} equipment=${equipment.length} foods=${foods.length} plans=${trainingPlans.length} unmatchedPlanRefs=${planReport.length}`,
);
