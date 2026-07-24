export type ContentQueryCode =
  | 'INVALID_COLLECTION'
  | 'INVALID_FILTER'
  | 'INVALID_PAGINATION'
  | 'INVALID_ID'
  | 'NOT_FOUND'
  | 'INTERNAL';

export type ContentQueryResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: ContentQueryCode; message: string };

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Scene = 'gym' | 'home' | 'bodyweight';
export type EquipmentType = 'free_weight' | 'machine' | 'cardio' | 'accessory';
export type RecommendGrade = 'S' | 'A' | 'B' | 'C';
export type CollectType = 'action' | 'equipment' | 'plan';
export type ReviewStatus = 'pending_review' | 'approved' | 'rejected';
export type MediaLicenseStatus =
  | 'first_party'
  | 'provisional_third_party'
  | 'licensed_third_party';

export interface MacroPer100g {
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  fiber?: number | null;
}

export interface PlanItem {
  actionId: string | null;
  name: string;
  sets: number | null;
  reps: string | null;
  restSec: number | null;
}

export interface PlanDay {
  dayIndex: number;
  title: string;
  items: PlanItem[];
}

export interface ActionSource {
  dataset: string;
  commit: string;
  sourceId: string;
  nameEn: string;
  bodyPart: string;
  category: string;
  equipmentRaw: string;
  target: string;
  muscleGroup: string;
  secondaryMusclesRaw: string[];
  instructionsZh: string;
  instructionsEn: string;
  stepsZh: string[];
  stepsEn: string[];
  mediaId: string;
  imagePath: string;
  gifPath: string;
  attribution: string;
  createdAt: string;
}

export interface ActionLocalized {
  nameZh: string;
  aliases: string[];
  status: ReviewStatus;
  version: string;
}

export interface ActionTaxonomy {
  version: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipmentIds: string[];
  bodyPart: string;
  target: string;
}

export interface ActionMedia {
  thumbnailPath: string;
  gifPath: string;
  thumbnailUri: string;
  gifUri: string;
  cover: string;
  coverJpg: string;
  demoGif: string;
  attribution: string;
  licenseStatus: MediaLicenseStatus;
  width: number;
  height: number;
}

export interface ActionEnrichment {
  version: string;
  status: ReviewStatus;
  generatedBy: 'rule' | 'model' | 'human';
  difficulty: Difficulty;
  goals: string[];
  scenes: Scene[];
  primaryScene: Scene;
  cues: string[];
  mistakes: string[];
  substituteIds: string[];
}

export interface Action {
  _id: string;
  name: string;
  aliases?: string[];
  difficulty: Difficulty;
  goals: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment?: string[];
  scenes: Scene[];
  primaryScene: Scene;
  cover?: string | null;
  steps: string[];
  cues?: string[];
  mistakes?: string[];
  substituteIds?: string[];
  coverJpg?: string | null;
  demoGif?: string | null;
  mediaAttribution?: string;
  schemaVersion?: number;
  source?: ActionSource;
  localized?: ActionLocalized;
  taxonomy?: ActionTaxonomy;
  media?: ActionMedia;
  enrichment?: ActionEnrichment | null;
  sortWeight: number;
  updatedAt?: string;
}

export type ActionSummary = Pick<
  Action,
  | '_id'
  | 'name'
  | 'aliases'
  | 'difficulty'
  | 'goals'
  | 'primaryMuscles'
  | 'equipment'
  | 'cover'
  | 'coverJpg'
>;

export interface ActionTaxonomyFilter {
  primaryMuscle: string | null;
  equipmentId: string | null;
  difficulty: Difficulty | null;
  goal: string | null;
}

export interface ActionListQueryInput {
  limit?: unknown;
  offset?: unknown;
  cursor?: unknown;
  search?: unknown;
  taxonomy?: unknown;
}

export interface NormalizedActionListQuery {
  limit: number;
  offset: number;
  cursor: string | null;
  search: string;
  taxonomy: ActionTaxonomyFilter;
}

export interface Equipment {
  _id: string;
  name: string;
  type: EquipmentType;
  scenes: Scene[];
  primaryScene: Scene;
  difficulty: Difficulty;
  intro: string;
  value?: string;
  cover?: string | null;
  homeAlternatives?: string[];
  notes?: string;
  relatedActionIds?: string[];
  sortWeight: number;
  updatedAt?: string;
}

export interface TrainingPlan {
  _id: string;
  title: string;
  goal: string;
  scene: Scene;
  difficulty: Difficulty;
  category: string;
  cycleWeeks: number;
  frequencyPerWeek: number;
  intro: string;
  audience?: string;
  cover?: string | null;
  warmup: string[];
  days: PlanDay[];
  stretch: string[];
  hot: boolean;
  sortWeight: number;
  updatedAt?: string;
}

export interface Food {
  _id: string;
  name: string;
  category: string;
  per100g: MacroPer100g;
  recommendGrade: RecommendGrade;
  notes?: string;
  cover?: string | null;
  sortWeight: number;
  updatedAt?: string;
}

export interface UserCollect {
  _id: string;
  openid: string;
  type: CollectType;
  targetId: string;
  createdAt: string;
}

export interface UserBodyRecord {
  _id: string;
  openid: string;
  date: string;
  weight?: number | null;
  waist?: number | null;
  hip?: number | null;
  createdAt: string;
}

export interface UserTrainRecord {
  _id: string;
  openid: string;
  date: string;
  durationSec: number;
  planId?: string | null;
  createdAt: string;
}

export type PublicCollection =
  | 'actions'
  | 'equipment'
  | 'training_plans'
  | 'foods';

export type ListFilterValue = string | number | boolean;

export interface ListQueryInput {
  collection?: unknown;
  limit?: unknown;
  skip?: unknown;
  filter?: unknown;
}

export interface NormalizedListQuery {
  collection: PublicCollection;
  limit: number;
  skip: number;
  filter: Record<string, ListFilterValue>;
}

export interface GetByIdQueryInput {
  collection?: unknown;
  id?: unknown;
}

export interface NormalizedGetByIdQuery {
  collection: PublicCollection;
  id: string;
}
