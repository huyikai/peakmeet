"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../utils/shared/index");
const content_cover_1 = require("../../../utils/content-cover");
const cloud_content_1 = require("../../../utils/cloud-content");
const user_collect_1 = require("../../../utils/user-collect");
function toItems(actions, collectedIds) {
    return actions.map((a) => {
        var _a, _b, _c, _d;
        return ({
            _id: a._id,
            name: a.name,
            alias: (_b = (_a = a.aliases) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '',
            coverSrc: (0, content_cover_1.contentCoverSrc)((_c = a.coverJpg) !== null && _c !== void 0 ? _c : a.cover),
            primaryMuscleLabel: (0, index_1.muscleLabelZh)((_d = a.primaryMuscles[0]) !== null && _d !== void 0 ? _d : ''),
            difficultyLabel: (0, index_1.difficultyLabelZh)(a.difficulty),
            collected: collectedIds.has(a._id),
        });
    });
}
Page({
    data: {
        loading: true,
        error: '',
        keyword: '',
        muscleOptions: index_1.ACTION_PRIMARY_MUSCLE_OPTIONS,
        goalOptions: index_1.ACTION_GOAL_OPTIONS,
        difficultyOptions: index_1.ACTION_DIFFICULTY_OPTIONS,
        equipmentOptions: [],
        primaryMuscle: '',
        equipmentId: '',
        difficulty: '',
        goal: '',
        items: [],
        empty: false,
        loadingMore: false,
        hasMore: false,
    },
    _collectedIds: new Set(),
    _reqSeq: 0,
    _nextCursor: null,
    _offset: 0,
    _catalogTotal: 0,
    _searchTimer: null,
    onShow() {
        void this.reload();
    },
    onUnload() {
        this._reqSeq += 1;
        if (this._searchTimer)
            clearTimeout(this._searchTimer);
    },
    onReachBottom() {
        void this.loadMore();
    },
    async reload() {
        var _a, _b, _c;
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
                (0, cloud_content_1.contentListActions)({
                    limit: 24,
                    offset: 0,
                    search: this.data.keyword,
                    taxonomy: this.currentTaxonomy(),
                }),
                (0, cloud_content_1.contentListEquipment)(100),
            ]);
            if (seq !== this._reqSeq)
                return;
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
            const equipmentOptions = [
                index_1.BODYWEIGHT_EQUIPMENT_OPTION,
                ...(equipRes.ok
                    ? equipRes.data.items.map((e) => ({
                        id: e._id,
                        labelZh: e.name,
                    }))
                    : []),
            ];
            let collectedIds = new Set();
            try {
                const idRes = await (0, user_collect_1.ensureOpenId)();
                if (idRes.ok) {
                    const ids = await (0, user_collect_1.listActionCollectTargetIds)(idRes.data.openid);
                    collectedIds = new Set(ids);
                }
            }
            catch (_d) {
                collectedIds = new Set();
            }
            if (seq !== this._reqSeq)
                return;
            this._collectedIds = collectedIds;
            const summaries = (_a = actionsRes.data.items) !== null && _a !== void 0 ? _a : [];
            this._nextCursor = (_b = actionsRes.data.nextCursor) !== null && _b !== void 0 ? _b : null;
            this._offset = summaries.length;
            if (!this.hasActiveQuery()) {
                this._catalogTotal = (_c = actionsRes.data.total) !== null && _c !== void 0 ? _c : summaries.length;
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
        }
        catch (e) {
            if (seq !== this._reqSeq)
                return;
            const message = e instanceof Error ? e.message : '加载失败';
            this.setData({ loading: false, error: message, items: [], empty: false });
        }
    },
    currentTaxonomy() {
        return {
            primaryMuscle: this.data.primaryMuscle || null,
            equipmentId: this.data.equipmentId || null,
            difficulty: (this.data.difficulty || null),
            goal: this.data.goal || null,
        };
    },
    hasActiveQuery() {
        return Boolean(this.data.keyword ||
            this.data.primaryMuscle ||
            this.data.equipmentId ||
            this.data.difficulty ||
            this.data.goal);
    },
    async loadMore() {
        var _a, _b;
        if (this.data.loading || this.data.loadingMore || !this.data.hasMore)
            return;
        const seq = this._reqSeq;
        this.setData({ loadingMore: true });
        const result = await (0, cloud_content_1.contentListActions)({
            limit: 24,
            cursor: this._nextCursor,
            offset: this._nextCursor ? 0 : this._offset,
            search: this.data.keyword,
            taxonomy: this.currentTaxonomy(),
        });
        if (seq !== this._reqSeq)
            return;
        if (!result.ok) {
            this.setData({ loadingMore: false });
            wx.showToast({ title: result.message || '加载更多失败', icon: 'none' });
            return;
        }
        const summaries = (_a = result.data.items) !== null && _a !== void 0 ? _a : [];
        const known = new Set(this.data.items.map((item) => item._id));
        const appended = toItems(summaries, this._collectedIds).filter((item) => !known.has(item._id));
        this._offset += summaries.length;
        this._nextCursor = (_b = result.data.nextCursor) !== null && _b !== void 0 ? _b : null;
        this.setData({
            items: [...this.data.items, ...appended],
            loadingMore: false,
            hasMore: Boolean(result.data.hasMore),
        });
    },
    onKeywordInput(e) {
        var _a;
        this.setData({ keyword: (_a = e.detail.value) !== null && _a !== void 0 ? _a : '' });
        if (this._searchTimer)
            clearTimeout(this._searchTimer);
        this._searchTimer = setTimeout(() => void this.reload(), 250);
    },
    clearKeyword() {
        this.setData({ keyword: '' });
        void this.reload();
    },
    onPickMuscle(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
        this.setData({
            primaryMuscle: this.data.primaryMuscle === id ? '' : id,
        });
        void this.reload();
    },
    onPickEquipment(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
        this.setData({
            equipmentId: this.data.equipmentId === id ? '' : id,
        });
        void this.reload();
    },
    onPickDifficulty(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
        this.setData({
            difficulty: this.data.difficulty === id ? '' : id,
        });
        void this.reload();
    },
    onPickGoal(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
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
    goDetail(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
        if (!id)
            return;
        wx.navigateTo({ url: `/pages/train/actions/detail?id=${id}` });
    },
    async onToday() {
        var _a;
        let total = this._catalogTotal;
        if (total < 1) {
            const countRes = await (0, cloud_content_1.contentListActions)({ limit: 1, offset: 0 });
            if (!countRes.ok) {
                wx.showToast({ title: countRes.message || '推荐失败', icon: 'none' });
                return;
            }
            total = (_a = countRes.data.total) !== null && _a !== void 0 ? _a : countRes.data.items.length;
            this._catalogTotal = total;
        }
        const result = await (0, cloud_content_1.contentRandomAction)(total);
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
