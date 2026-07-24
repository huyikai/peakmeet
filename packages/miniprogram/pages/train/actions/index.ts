import {
  ACTION_DIFFICULTY_OPTIONS,
  ACTION_GOAL_OPTIONS,
  ACTION_PRIMARY_MUSCLE_OPTIONS,
  BODYWEIGHT_EQUIPMENT_OPTION,
  difficultyLabelZh,
  filterActions,
  muscleLabelZh,
  normalizeActionCatalogFilters,
  pickRandomAction,
  type Action,
  type ActionCatalogFilters,
  type Difficulty,
} from '../../../utils/shared/index';
import { contentCoverSrc } from '../../../utils/content-cover';
import {
  contentListActions,
  contentListEquipment,
} from '../../../utils/cloud-content';
import {
  ensureOpenId,
  listActionCollectTargetIds,
} from '../../../utils/user-collect';

type ListItem = {
  _id: string;
  name: string;
  coverSrc: string;
  primaryMuscleLabel: string;
  difficultyLabel: string;
  collected: boolean;
};

type FilterChip = { id: string; labelZh: string };

function sortActions(actions: Action[]): Action[] {
  return [...actions].sort((a, b) => {
    if (b.sortWeight !== a.sortWeight) return b.sortWeight - a.sortWeight;
    return a._id.localeCompare(b._id);
  });
}

function toItems(
  actions: Action[],
  collectedIds: Set<string>,
): ListItem[] {
  return actions.map((a) => ({
    _id: a._id,
    name: a.name,
    coverSrc: contentCoverSrc(a.cover),
    primaryMuscleLabel: muscleLabelZh(a.primaryMuscles[0] ?? ''),
    difficultyLabel: difficultyLabelZh(a.difficulty),
    collected: collectedIds.has(a._id),
  }));
}

Page({
  data: {
    loading: true,
    error: '',
    keyword: '',
    muscleOptions: ACTION_PRIMARY_MUSCLE_OPTIONS as FilterChip[],
    goalOptions: ACTION_GOAL_OPTIONS as FilterChip[],
    difficultyOptions: ACTION_DIFFICULTY_OPTIONS as FilterChip[],
    equipmentOptions: [] as FilterChip[],
    primaryMuscle: '' as string,
    equipmentId: '' as string,
    difficulty: '' as string,
    goal: '' as string,
    items: [] as ListItem[],
    empty: false,
  },

  _allActions: [] as Action[],
  _collectedIds: new Set<string>(),
  _reqSeq: 0,

  onShow() {
    void this.reload();
  },

  async reload() {
    const seq = ++this._reqSeq;
    this.setData({ loading: true, error: '' });
    try {
      const [actionsRes, equipRes] = await Promise.all([
        contentListActions(100),
        contentListEquipment(100),
      ]);
      if (seq !== this._reqSeq) return;

      if (!actionsRes.ok) {
        this.setData({
          loading: false,
          error: actionsRes.message || '加载失败',
          items: [],
          empty: false,
        });
        return;
      }

      const equipmentOptions: FilterChip[] = [
        BODYWEIGHT_EQUIPMENT_OPTION,
        ...(equipRes.ok
          ? equipRes.data.items.map((e) => ({
              id: e._id,
              labelZh: e.name,
            }))
          : []),
      ];

      this._allActions = sortActions(actionsRes.data.items ?? []);

      let collectedIds = new Set<string>();
      try {
        const idRes = await ensureOpenId();
        if (idRes.ok) {
          const ids = await listActionCollectTargetIds(idRes.data.openid);
          collectedIds = new Set(ids);
        }
      } catch {
        collectedIds = new Set();
      }
      if (seq !== this._reqSeq) return;
      this._collectedIds = collectedIds;

      this.setData({ equipmentOptions, loading: false, error: '' });
      this.applyFilters();
    } catch (e) {
      if (seq !== this._reqSeq) return;
      const message = e instanceof Error ? e.message : '加载失败';
      this.setData({ loading: false, error: message, items: [], empty: false });
    }
  },

  currentFilters(): ActionCatalogFilters {
    return normalizeActionCatalogFilters({
      primaryMuscle: this.data.primaryMuscle || null,
      equipmentId: this.data.equipmentId || null,
      difficulty: this.data.difficulty || null,
      goal: this.data.goal || null,
      keyword: this.data.keyword,
    });
  },

  applyFilters() {
    const filtered = filterActions(this._allActions, this.currentFilters());
    const items = toItems(filtered, this._collectedIds);
    this.setData({ items, empty: !this.data.loading && items.length === 0 });
  },

  onKeywordInput(e: WechatInputEvent) {
    this.setData({ keyword: e.detail.value ?? '' });
    this.applyFilters();
  },

  clearKeyword() {
    this.setData({ keyword: '' });
    this.applyFilters();
  },

  onPickMuscle(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '');
    this.setData({
      primaryMuscle: this.data.primaryMuscle === id ? '' : id,
    });
    this.applyFilters();
  },

  onPickEquipment(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '');
    this.setData({
      equipmentId: this.data.equipmentId === id ? '' : id,
    });
    this.applyFilters();
  },

  onPickDifficulty(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '') as Difficulty | '';
    this.setData({
      difficulty: this.data.difficulty === id ? '' : id,
    });
    this.applyFilters();
  },

  onPickGoal(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '');
    this.setData({ goal: this.data.goal === id ? '' : id });
    this.applyFilters();
  },

  clearFilters() {
    this.setData({
      primaryMuscle: '',
      equipmentId: '',
      difficulty: '',
      goal: '',
      keyword: '',
    });
    this.applyFilters();
  },

  goDetail(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '');
    if (!id) return;
    wx.navigateTo({ url: `/pages/train/actions/detail?id=${id}` });
  },

  onToday() {
    const pick = pickRandomAction(this._allActions);
    if (!pick) {
      wx.showToast({ title: '暂无可用动作', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/train/actions/detail?id=${pick._id}` });
  },

  onRetry() {
    void this.reload();
  },
});
