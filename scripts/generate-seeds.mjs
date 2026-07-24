/**
 * One-shot generator for database/seeds/*.json — run: node scripts/generate-seeds.mjs
 * Content is fitness科普 only; no medical claims.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seedsDir = join(root, 'database', 'seeds');
mkdirSync(seedsDir, { recursive: true });

const difficulties = ['beginner', 'intermediate', 'advanced'];
const scenes = ['gym', 'home', 'bodyweight'];
const muscles = [
  'chest',
  'back',
  'shoulders',
  'quads',
  'hamstrings',
  'glutes',
  'core',
  'biceps',
  'triceps',
  'calves',
];
const goals = ['strength', 'hypertrophy', 'conditioning', 'mobility'];

const actionNames = [
  '深蹲',
  '硬拉',
  '卧推',
  '引体向上',
  '俯卧撑',
  '肩上推举',
  '划船',
  '弓步蹲',
  '臀桥',
  '平板支撑',
  '卷腹',
  '侧平板',
  '二头弯举',
  '三头下压',
  '腿举',
  '腿弯举',
  '腿伸展',
  '提踵',
  '面拉',
  '开合跳',
  '高抬腿',
  '波比跳',
  '农夫行走',
  '壶铃摆动',
  '药球砸地',
  '战绳',
  '箱式跳跃',
  '登山跑',
  '鸟狗式',
  '死虫式',
  '猫牛式',
  '髋屈肌拉伸',
  '胸椎旋转',
  '倒走',
  '单腿硬拉',
  '保加利亚分腿蹲',
  '相扑硬拉',
  '罗马尼亚硬拉',
  '俯身飞鸟',
  '哑铃推举',
  '哑铃飞鸟',
  '坐姿划船',
  '高位下拉',
  '坐姿推胸',
  '夹胸',
  '侧平举',
  '前平举',
  '反向飞鸟',
  '锤式弯举',
  '集中弯举',
  '颈后臂屈伸',
  '窄距俯卧撑',
  '宽距俯卧撑',
  '钻石俯卧撑',
  '跪姿俯卧撑',
  '靠墙静蹲',
  '臀推',
  '蚌式开合',
  '侧卧抬腿',
  '超人式',
  '山羊挺身',
  '悬垂举腿',
  '悬挂收腹',
  '俄罗斯转体',
  '自行车卷腹',
  '登山者',
  '开合深蹲跳',
  '侧弓步',
  '相扑深蹲',
  '高脚杯深蹲',
  '前蹲',
  '过头深蹲',
  '早安式',
  '早安伸展',
  '北欧腿弯',
  '滑盘卷腹',
  '滑盘弓步',
  'TRX划船',
  'TRX俯卧撑',
  '弹力带面拉',
  '弹力带深蹲',
  '弹力带划船',
  '跳绳',
];

function slugify(i, prefix, name) {
  return `${prefix}_${String(i + 1).padStart(3, '0')}_${Buffer.from(name)
    .toString('hex')
    .slice(0, 6)}`;
}

const actions = actionNames.slice(0, 80).map((name, i) => {
  const difficulty = difficulties[i % 3];
  const primaryScene = scenes[i % 3];
  const muscle = muscles[i % muscles.length];
  return {
    _id: slugify(i, 'action', name),
    name,
    aliases: [],
    difficulty,
    goals: [goals[i % goals.length]],
    primaryMuscles: [muscle],
    secondaryMuscles: [muscles[(i + 1) % muscles.length]],
    equipment: i % 4 === 0 ? [] : [`equip_${String((i % 20) + 1).padStart(3, '0')}`],
    scenes: [primaryScene],
    primaryScene,
    cover: `asset://content/actions/${slugify(i, 'action', name)}.png`,
    steps: [`准备姿势：保持中立脊柱`, `完成${name}的主要发力阶段`, `控制还原，呼吸均匀`],
    cues: ['核心收紧', '动作幅度可控'],
    mistakes: ['用惯性借力', '憋气过久'],
    substituteIds: [],
    sortWeight: 100 - i,
    updatedAt: '2026-07-24T00:00:00.000Z',
  };
});

// fix equipment refs to real slugs after we know equipment ids
const equipNames = [
  '哑铃',
  '杠铃',
  '壶铃',
  '弹力带',
  '瑜伽垫',
  '引体向上杆',
  '龙门架',
  '史密斯机',
  '腿举机',
  '坐姿划船机',
  '高位下拉机',
  '推胸机',
  '战绳',
  '药球',
  'TRX',
  '跳绳',
  '泡沫轴',
  '健腹轮',
  '壶铃架',
  '卧推凳',
];
const equipTypes = ['free_weight', 'machine', 'cardio', 'accessory'];
const equipment = equipNames.map((name, i) => {
  const primaryScene = scenes[i % 3];
  const id = `equip_${String(i + 1).padStart(3, '0')}`;
  return {
    _id: id,
    name,
    type: equipTypes[i % 4],
    scenes: [primaryScene],
    primaryScene,
    difficulty: difficulties[i % 3],
    intro: `${name}常用于力量与体能训练，适合按自身水平循序渐进。`,
    value: '帮助完成多关节与单关节训练动作',
    cover: `asset://content/equipment/${id}.png`,
    homeAlternatives: primaryScene === 'gym' ? ['弹力带', '自重'] : ['自重'],
    notes: '选购时注意承重与握感；训练前检查是否稳固。仅供参考。',
    relatedActionIds: [actions[i % actions.length]._id, actions[(i + 3) % actions.length]._id],
    sortWeight: 50 - i,
    updatedAt: '2026-07-24T00:00:00.000Z',
  };
});

for (let i = 0; i < actions.length; i++) {
  if (actions[i].equipment.length) {
    actions[i].equipment = [equipment[i % equipment.length]._id];
  }
  actions[i].substituteIds = [actions[(i + 1) % actions.length]._id];
}

const planDefs = [
  {
    title: '居家新手四周',
    goal: 'general',
    scene: 'home',
    category: 'beginner',
    hot: true,
  },
  {
    title: '健身房增肌入门',
    goal: 'muscle',
    scene: 'gym',
    category: 'strength',
    hot: true,
  },
  {
    title: '减脂体能循环',
    goal: 'fat_loss',
    scene: 'gym',
    category: 'conditioning',
    hot: false,
  },
  {
    title: '自重核心强化',
    goal: 'general',
    scene: 'bodyweight',
    category: 'beginner',
    hot: false,
  },
  {
    title: '功能性混合训练',
    goal: 'conditioning',
    scene: 'gym',
    category: 'functional',
    hot: true,
  },
  {
    title: '活动度与恢复周',
    goal: 'mobility',
    scene: 'home',
    category: 'mobility',
    hot: false,
  },
];

const training_plans = planDefs.map((p, i) => {
  const dayActions = [actions[i], actions[i + 6], actions[i + 12]];
  return {
    _id: `plan_${String(i + 1).padStart(3, '0')}`,
    title: p.title,
    goal: p.goal,
    scene: p.scene,
    difficulty: difficulties[i % 3],
    category: p.category,
    cycleWeeks: 4,
    frequencyPerWeek: 3,
    intro: `${p.title}：面向普通健身爱好者的结构化安排，请根据自身状况量力而行，仅供参考。`,
    audience: '健身新手至进阶爱好者',
    cover: null,
    warmup: ['关节环绕', '轻度有氧 3–5 分钟'],
    days: [1, 2, 3].map((dayIndex) => ({
      dayIndex,
      title: `训练日 ${dayIndex}`,
      items: dayActions.map((a, j) => ({
        actionId: a._id,
        name: a.name,
        sets: 3,
        reps: j === 2 ? '30s' : '8-12',
        restSec: 60,
      })),
    })),
    stretch: ['静态拉伸主要肌群 5–8 分钟'],
    hot: p.hot,
    sortWeight: 20 - i,
    updatedAt: '2026-07-24T00:00:00.000Z',
  };
});

const grades = ['S', 'A', 'B', 'C'];
const foodNamesByCategory = {
  staple: [
    '白米饭', '糙米饭', '黑米饭', '藜麦饭', '小米粥', '燕麦粥', '玉米', '玉米糁',
    '燕麦片', '藜麦', '荞麦', '荞麦面', '全麦面包', '黑麦面包', '全麦贝果', '馒头',
    '花卷', '面条', '意大利面', '米粉', '河粉', '红薯', '紫薯', '土豆', '山药',
    '芋头', '南瓜', '莲藕', '全麦卷饼', '玉米饼', '薏米', '大麦', '青稞', '鹰嘴豆泥饼',
  ],
  protein: [
    '鸡胸肉', '鸡腿肉', '火鸡胸肉', '瘦牛肉', '牛里脊', '瘦猪里脊', '猪瘦肉', '羊里脊',
    '三文鱼', '鳕鱼', '金枪鱼', '鲈鱼', '虾仁', '扇贝', '蛤蜊', '牡蛎', '鸡蛋', '蛋清',
    '北豆腐', '南豆腐', '豆腐干', '豆皮', '毛豆', '黄豆', '黑豆', '红腰豆', '鹰嘴豆',
    '扁豆', '青豆', '无糖豆浆', '鸡肉丸', '牛肉丸', '低脂火腿', '去皮鸭胸',
  ],
  veg: [
    '西兰花', '菠菜', '油麦菜', '生菜', '小白菜', '上海青', '芥蓝', '空心菜', '菜心',
    '羽衣甘蓝', '紫甘蓝', '卷心菜', '娃娃菜', '芹菜', '西芹', '芦笋', '秋葵', '黄瓜',
    '西葫芦', '冬瓜', '丝瓜', '苦瓜', '番茄', '彩椒', '青椒', '茄子', '胡萝卜',
    '白萝卜', '蘑菇', '香菇', '杏鲍菇', '金针菇', '海带', '木耳',
  ],
  fruit: [
    '苹果', '香蕉', '橙子', '柚子', '柑橘', '梨', '桃', '油桃', '李子', '杏', '葡萄',
    '草莓', '蓝莓', '树莓', '黑莓', '猕猴桃', '菠萝', '芒果', '木瓜', '西瓜', '哈密瓜',
    '甜瓜', '火龙果', '石榴', '樱桃', '柠檬', '百香果', '无花果', '杨梅', '荔枝',
    '龙眼', '牛油果', '椰子肉', '柿子',
  ],
  dairy: [
    '低脂牛奶', '脱脂牛奶', '全脂牛奶', '无乳糖牛奶', '希腊酸奶', '低脂酸奶',
    '无糖酸奶', '原味酸奶', '高蛋白酸奶', '低脂奶酪', '茅屋奶酪', '马苏里拉奶酪',
    '帕玛森奶酪', '切达奶酪', '羊奶', '羊奶酸奶', '奶粉', '乳清蛋白粉',
    '酪蛋白粉', '开菲尔酸奶', '奶豆腐', '低脂芝士片', '无糖杏仁奶', '无糖燕麦奶',
    '无糖椰奶', '豆奶', '调制乳', '高钙牛奶', '巴氏鲜奶', '低温酸奶', '水牛奶',
    '儿童奶酪', '再制奶酪', '乳清饮品',
  ],
  snack: [
    '杏仁', '核桃', '腰果', '开心果', '榛子', '花生', '南瓜籽', '葵花籽', '奇亚籽',
    '亚麻籽', '芝麻', '葡萄干', '蔓越莓干', '无花果干', '红枣', '黑巧克力',
    '原味爆米花', '全麦饼干', '米饼', '海苔', '牛肉干', '鸡胸肉干', '鹰嘴豆脆',
    '烤毛豆', '蛋白棒', '燕麦棒', '花生酱', '芝麻酱', '果仁混合', '低糖麦片',
    '椰子片', '冻干草莓', '冻干苹果', '酸奶块',
  ],
};

const macroBase = {
  staple: { kcal: 180, protein: 5, carb: 36, fat: 2, fiber: 3 },
  protein: { kcal: 150, protein: 22, carb: 3, fat: 6, fiber: 0 },
  veg: { kcal: 32, protein: 2.5, carb: 6, fat: 0.4, fiber: 2.5 },
  fruit: { kcal: 58, protein: 0.8, carb: 14, fat: 0.3, fiber: 2 },
  dairy: { kcal: 90, protein: 7, carb: 7, fat: 4, fiber: 0 },
  snack: { kcal: 380, protein: 12, carb: 35, fat: 22, fiber: 5 },
};

const foodCatalog = Object.entries(foodNamesByCategory)
  .flatMap(([category, names]) => names.map((name) => ({ name, category })))
  .slice(0, 200);

if (foodCatalog.length !== 200 || new Set(foodCatalog.map((f) => f.name)).size !== 200) {
  throw new Error('food catalog must contain 200 unique names');
}

const foods = foodCatalog.map(({ name, category }, i) => {
  const base = macroBase[category];
  const variance = 0.9 + (i % 9) * 0.025;
  return {
    _id: `food_${String(i + 1).padStart(3, '0')}`,
    name,
    category,
    per100g: {
      kcal: Math.round(base.kcal * variance),
      protein: Number((base.protein * variance).toFixed(1)),
      carb: Number((base.carb * variance).toFixed(1)),
      fat: Number((base.fat * variance).toFixed(1)),
      fiber: Number((base.fiber * variance).toFixed(1)),
    },
    recommendGrade: grades[i % 4],
    notes: '营养数据为常见近似值，仅供参考，不构成专业营养指导。',
    cover: `asset://content/foods/food_${String(i + 1).padStart(3, '0')}.png`,
    sortWeight: 300 - i,
    updatedAt: '2026-07-24T00:00:00.000Z',
  };
});

function dump(name, data) {
  const path = join(seedsDir, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`wrote ${path} (${data.length})`);
}

dump('actions', actions);
dump('equipment', equipment);
dump('training_plans', training_plans);
dump('foods', foods);

if (!training_plans.some((p) => p.category === 'functional')) {
  throw new Error('missing functional plan');
}
if (actions.length < 80 || equipment.length < 20 || training_plans.length !== 6 || foods.length < 200) {
  throw new Error('seed volume unmet');
}
