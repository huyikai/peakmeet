import {
  ACTION_DIFFICULTY_OPTIONS,
  ACTION_GOAL_OPTIONS,
  ACTION_PRIMARY_MUSCLE_OPTIONS,
  BODYWEIGHT_EQUIPMENT_OPTION,
  difficultyLabelZh,
  muscleLabelZh,
  type ActionSummary,
  type ActionTaxonomyFilter,
  type Difficulty,
} from '../../../utils/shared/index';
import { contentCoverSrc } from '../../../utils/content-cover';
import {
  contentListActions,
  contentListEquipment,
  contentRandomAction,
} from '../../../utils/cloud-content';
import {
  ensureOpenId,
  listActionCollectTargetIds,
} from '../../../utils/user-collect';

type ListItem = {
  _id: string;
  name: string;
  alias: string;
  coverSrc: string;
  primaryMuscleLabel: string;
  difficultyLabel: string;
  collected: boolean;
};

type FilterChip = { id: string; labelZh: string };

function toItems(
  actions: ActionSummary[],
  collectedIds: Set<string>,
): ListItem[] {
  return actions.map((a) => ({
    _id: a._id,
    name: a.name,
    alias: a.aliases?.[0] ?? '',
    coverSrc: contentCoverSrc(a.coverJpg ?? a.cover),
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
    loadingMore: false,
    hasMore: false,
  },

  _collectedIds: new Set<string>(),
  _reqSeq: 0,
  _nextCursor: null as string | null,
  _offset: 0,
  _catalogTotal: 0,
  _searchTimer: null as ReturnType<typeof setTimeout> | null,

  onShow() {
    void this.reload();
  },

  onUnload() {
    this._reqSeq += 1;
    if (this._searchTimer) clearTimeout(this._searchTimer);
  },

  onReachBottom() {
    void this.loadMore();
  },

  async reload() {
    const seq = ++this._reqSeq;
    this._nextCursor = null;
    this._offset = 0;
    this.setData({
      loading: true,
      loadingMore: false,
      error: '',
      items: [],
      empty: false,
      hasMore: false,
    });
    try {
      const [actionsRes, equipRes] = await Promise.all([
        contentListActions({
          limit: 24,
          offset: 0,
          search: this.data.keyword,
          taxonomy: this.currentTaxonomy(),
        }),
        contentListEquipment(100),
      ]);
      if (seq !== this._reqSeq) return;

      if (!actionsRes.ok) {
        this.setData({
          loading: false,
          error: actionsRes.message || '加载失败',
          items: [],
          empty: false,
          hasMore: false,
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
      const summaries = actionsRes.data.items ?? [];
      this._nextCursor = actionsRes.data.nextCursor ?? null;
      this._offset = summaries.length;
      if (!this.hasActiveQuery()) {
        this._catalogTotal = actionsRes.data.total ?? summaries.length;
      }
      const items = toItems(summaries, collectedIds);
      this.setData({
        equipmentOptions,
        items,
        loading: false,
        error: '',
        empty: items.length === 0,
        hasMore: Boolean(actionsRes.data.hasMore),
      });
    } catch (e) {
      if (seq !== this._reqSeq) return;
      const message = e instanceof Error ? e.message : '加载失败';
      this.setData({ loading: false, error: message, items: [], empty: false });
    }
  },

  currentTaxonomy(): Partial<ActionTaxonomyFilter> {
    return {
      primaryMuscle: this.data.primaryMuscle || null,
      equipmentId: this.data.equipmentId || null,
      difficulty: (this.data.difficulty || null) as Difficulty | null,
      goal: this.data.goal || null,
    };
  },

  hasActiveQuery(): boolean {
    return Boolean(
      this.data.keyword ||
        this.data.primaryMuscle ||
        this.data.equipmentId ||
        this.data.difficulty ||
        this.data.goal,
    );
  },

  async loadMore() {
    if (this.data.loading || this.data.loadingMore || !this.data.hasMore) return;
    const seq = this._reqSeq;
    this.setData({ loadingMore: true });
    const result = await contentListActions({
      limit: 24,
      cursor: this._nextCursor,
      offset: this._nextCursor ? 0 : this._offset,
      search: this.data.keyword,
      taxonomy: this.currentTaxonomy(),
    });
    if (seq !== this._reqSeq) return;
    if (!result.ok) {
      this.setData({ loadingMore: false });
      wx.showToast({ title: result.message || '加载更多失败', icon: 'none' });
      return;
    }
    const summaries = result.data.items ?? [];
    const known = new Set(this.data.items.map((item) => item._id));
    const appended = toItems(summaries, this._collectedIds).filter(
      (item) => !known.has(item._id),
    );
    this._offset += summaries.length;
    this._nextCursor = result.data.nextCursor ?? null;
    this.setData({
      items: [...this.data.items, ...appended],
      loadingMore: false,
      hasMore: Boolean(result.data.hasMore),
    });
  },

  onKeywordInput(e: WechatInputEvent) {
    this.setData({ keyword: e.detail.value ?? '' });
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => void this.reload(), 250);
  },

  clearKeyword() {
    this.setData({ keyword: '' });
    void this.reload();
  },

  onPickMuscle(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '');
    this.setData({
      primaryMuscle: this.data.primaryMuscle === id ? '' : id,
    });
    void this.reload();
  },

  onPickEquipment(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '');
    this.setData({
      equipmentId: this.data.equipmentId === id ? '' : id,
    });
    void this.reload();
  },

  onPickDifficulty(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '') as Difficulty | '';
    this.setData({
      difficulty: this.data.difficulty === id ? '' : id,
    });
    void this.reload();
  },

  onPickGoal(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '');
    this.setData({ goal: this.data.goal === id ? '' : id });
    void this.reload();
  },

  clearFilters() {
    this.setData({
      primaryMuscle: '',
      equipmentId: '',
      difficulty: '',
      goal: '',
      keyword: '',
    });
    void this.reload();
  },

  goDetail(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '');
    if (!id) return;
    wx.navigateTo({ url: `/pages/train/actions/detail?id=${id}` });
  },

  async onToday() {
    let total = this._catalogTotal;
    if (total < 1) {
      const countRes = await contentListActions({ limit: 1, offset: 0 });
      if (!countRes.ok) {
        wx.showToast({ title: countRes.message || '推荐失败', icon: 'none' });
        return;
      }
      total = countRes.data.total ?? countRes.data.items.length;
      this._catalogTotal = total;
    }
    const result = await contentRandomAction(total);
    if (!result.ok) {
      wx.showToast({ title: result.message || '暂无可用动作', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/train/actions/detail?id=${result.data.item._id}`,
    });
  },

  onRetry() {
    void this.reload();
  },
});
