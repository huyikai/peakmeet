import type { Difficulty, EquipmentType, Scene } from './types';

export const EXERCISE_DATASET_ID_PREFIX = 'exercise_dataset_' as const;
export const TRANSFORM_VERSION = 'exercise-transform-v1' as const;
export const LOCALIZATION_VERSION = 'exercise-zh-names-v1' as const;
export const ENRICHMENT_VERSION = 'exercise-enrichment-v1' as const;
export const MEDIA_ATTRIBUTION = '© Gym visual — https://gymvisual.com/' as const;

export type UpstreamBodyPart =
  | 'back'
  | 'cardio'
  | 'chest'
  | 'lower arms'
  | 'lower legs'
  | 'neck'
  | 'shoulders'
  | 'upper arms'
  | 'upper legs'
  | 'waist';

const TARGET_TO_PRIMARY: Record<string, string> = {
  abs: 'core',
  abductors: 'glutes',
  adductors: 'glutes',
  biceps: 'biceps',
  calves: 'calves',
  'cardiovascular system': 'core',
  delts: 'shoulders',
  forearms: 'biceps',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  lats: 'back',
  'levator scapulae': 'shoulders',
  pectorals: 'chest',
  quads: 'quads',
  'serratus anterior': 'chest',
  spine: 'back',
  traps: 'back',
  triceps: 'triceps',
  'upper back': 'back',
};

const SECONDARY_TO_PRIMARY: Record<string, string> = {
  abdominals: 'core',
  abs: 'core',
  biceps: 'biceps',
  calves: 'calves',
  chest: 'chest',
  core: 'core',
  deltoids: 'shoulders',
  forearms: 'biceps',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  'hip flexors': 'quads',
  'latissimus dorsi': 'back',
  lats: 'back',
  'lower back': 'back',
  obliques: 'core',
  quadriceps: 'quads',
  rhomboids: 'back',
  'rotator cuff': 'shoulders',
  shoulders: 'shoulders',
  soleus: 'calves',
  trapezius: 'back',
  traps: 'back',
  triceps: 'triceps',
  'upper back': 'back',
};

export const EQUIPMENT_CATALOG: ReadonlyArray<{
  raw: string;
  id: string;
  nameZh: string;
  type: EquipmentType;
  scenes: Scene[];
  primaryScene: Scene;
}> = [
  {
    raw: 'assisted',
    id: 'equip_assisted',
    nameZh: '助力器械',
    type: 'machine',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'band',
    id: 'equip_band',
    nameZh: '弹力带',
    type: 'accessory',
    scenes: ['home', 'gym'],
    primaryScene: 'home',
  },
  {
    raw: 'barbell',
    id: 'equip_barbell',
    nameZh: '杠铃',
    type: 'free_weight',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'body weight',
    id: 'equip_body_weight',
    nameZh: '自重',
    type: 'accessory',
    scenes: ['bodyweight', 'home'],
    primaryScene: 'bodyweight',
  },
  {
    raw: 'bosu ball',
    id: 'equip_bosu_ball',
    nameZh: '波速球',
    type: 'accessory',
    scenes: ['gym', 'home'],
    primaryScene: 'gym',
  },
  {
    raw: 'cable',
    id: 'equip_cable',
    nameZh: '绳索',
    type: 'machine',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'dumbbell',
    id: 'equip_dumbbell',
    nameZh: '哑铃',
    type: 'free_weight',
    scenes: ['gym', 'home'],
    primaryScene: 'gym',
  },
  {
    raw: 'elliptical machine',
    id: 'equip_elliptical_machine',
    nameZh: '椭圆机',
    type: 'cardio',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'ez barbell',
    id: 'equip_ez_barbell',
    nameZh: 'EZ杠',
    type: 'free_weight',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'hammer',
    id: 'equip_hammer',
    nameZh: '锤铃',
    type: 'free_weight',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'kettlebell',
    id: 'equip_kettlebell',
    nameZh: '壶铃',
    type: 'free_weight',
    scenes: ['gym', 'home'],
    primaryScene: 'gym',
  },
  {
    raw: 'leverage machine',
    id: 'equip_leverage_machine',
    nameZh: '杠杆器械',
    type: 'machine',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'medicine ball',
    id: 'equip_medicine_ball',
    nameZh: '药球',
    type: 'accessory',
    scenes: ['gym', 'home'],
    primaryScene: 'gym',
  },
  {
    raw: 'olympic barbell',
    id: 'equip_olympic_barbell',
    nameZh: '奥杆',
    type: 'free_weight',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'resistance band',
    id: 'equip_resistance_band',
    nameZh: '阻力带',
    type: 'accessory',
    scenes: ['home', 'gym'],
    primaryScene: 'home',
  },
  {
    raw: 'roller',
    id: 'equip_roller',
    nameZh: '泡沫轴',
    type: 'accessory',
    scenes: ['home', 'gym'],
    primaryScene: 'home',
  },
  {
    raw: 'rope',
    id: 'equip_rope',
    nameZh: '绳索配件',
    type: 'accessory',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'skierg machine',
    id: 'equip_skierg_machine',
    nameZh: '滑雪机',
    type: 'cardio',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'sled machine',
    id: 'equip_sled_machine',
    nameZh: '雪橇机',
    type: 'machine',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'smith machine',
    id: 'equip_smith_machine',
    nameZh: '史密斯机',
    type: 'machine',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'stability ball',
    id: 'equip_stability_ball',
    nameZh: '稳定球',
    type: 'accessory',
    scenes: ['home', 'gym'],
    primaryScene: 'home',
  },
  {
    raw: 'stationary bike',
    id: 'equip_stationary_bike',
    nameZh: '固定自行车',
    type: 'cardio',
    scenes: ['gym', 'home'],
    primaryScene: 'gym',
  },
  {
    raw: 'stepmill machine',
    id: 'equip_stepmill_machine',
    nameZh: '台阶机',
    type: 'cardio',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'tire',
    id: 'equip_tire',
    nameZh: '轮胎',
    type: 'accessory',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'trap bar',
    id: 'equip_trap_bar',
    nameZh: '六角杠',
    type: 'free_weight',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'upper body ergometer',
    id: 'equip_upper_body_ergometer',
    nameZh: '上肢测力计',
    type: 'cardio',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'weighted',
    id: 'equip_weighted',
    nameZh: '负重配件',
    type: 'accessory',
    scenes: ['gym'],
    primaryScene: 'gym',
  },
  {
    raw: 'wheel roller',
    id: 'equip_wheel_roller',
    nameZh: '健腹轮',
    type: 'accessory',
    scenes: ['home', 'gym'],
    primaryScene: 'home',
  },
] as const;

const EQUIPMENT_BY_RAW = new Map(
  EQUIPMENT_CATALOG.map((item) => [item.raw, item]),
);

export function stableExerciseId(sourceId: string): string {
  if (!/^\d{4}$/.test(sourceId)) {
    throw new Error(`invalid sourceId: ${sourceId}`);
  }
  return `${EXERCISE_DATASET_ID_PREFIX}${sourceId}`;
}

export function mapTargetToPrimaryMuscle(target: string): string {
  const mapped = TARGET_TO_PRIMARY[target.trim().toLowerCase()];
  if (!mapped) throw new Error(`unmapped target: ${target}`);
  return mapped;
}

export function mapSecondaryMuscle(raw: string): string | null {
  return SECONDARY_TO_PRIMARY[raw.trim().toLowerCase()] ?? null;
}

export function resolveEquipment(raw: string): {
  equipmentIds: string[];
  catalog: (typeof EQUIPMENT_CATALOG)[number];
} {
  const catalog = EQUIPMENT_BY_RAW.get(raw.trim().toLowerCase());
  if (!catalog) throw new Error(`unmapped equipment: ${raw}`);
  if (catalog.raw === 'body weight') {
    return { equipmentIds: [], catalog };
  }
  return { equipmentIds: [catalog.id], catalog };
}

export function inferScenes(rawEquipment: string, bodyPart: string): {
  scenes: Scene[];
  primaryScene: Scene;
} {
  const { catalog } = resolveEquipment(rawEquipment);
  if (catalog.raw === 'body weight') {
    return { scenes: ['bodyweight', 'home'], primaryScene: 'bodyweight' };
  }
  if (bodyPart === 'cardio') {
    return { scenes: ['gym'], primaryScene: 'gym' };
  }
  return {
    scenes: [...catalog.scenes],
    primaryScene: catalog.primaryScene,
  };
}

export function inferDifficulty(name: string, equipment: string): Difficulty {
  const lower = `${name} ${equipment}`.toLowerCase();
  if (
    /(assisted|machine|smith|beginner|kneeling|wall)/.test(lower) ||
    equipment === 'body weight'
  ) {
    if (/(pistol|muscle.?up|handstand|nordic|snatch|clean|jerk)/.test(lower)) {
      return 'advanced';
    }
    return 'beginner';
  }
  if (/(snatch|clean|jerk|muscle.?up|pistol|handstand|nordic)/.test(lower)) {
    return 'advanced';
  }
  return 'intermediate';
}

export function inferGoals(
  bodyPart: string,
  target: string,
  equipment: string,
): string[] {
  if (bodyPart === 'cardio' || target === 'cardiovascular system') {
    return ['conditioning'];
  }
  if (/(roller|stretch|mobility)/.test(`${equipment} ${target}`.toLowerCase())) {
    return ['mobility'];
  }
  if (/(barbell|dumbbell|kettlebell|trap bar|olympic)/.test(equipment)) {
    return ['strength', 'hypertrophy'];
  }
  return ['hypertrophy'];
}
