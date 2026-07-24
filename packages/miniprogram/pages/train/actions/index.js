"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../utils/shared/index");
const content_cover_1 = require("../../../utils/content-cover");
const cloud_content_1 = require("../../../utils/cloud-content");
const user_collect_1 = require("../../../utils/user-collect");
function sortActions(actions) {
    return [...actions].sort((a, b) => {
        if (b.sortWeight !== a.sortWeight)
            return b.sortWeight - a.sortWeight;
        return a._id.localeCompare(b._id);
    });
}
function toItems(actions, collectedIds) {
    return actions.map((a) => {
        var _a;
        return ({
            _id: a._id,
            name: a.name,
            coverSrc: (0, content_cover_1.contentCoverSrc)(a.cover),
            primaryMuscleLabel: (0, index_1.muscleLabelZh)((_a = a.primaryMuscles[0]) !== null && _a !== void 0 ? _a : ''),
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
    },
    _allActions: [],
    _collectedIds: new Set(),
    _reqSeq: 0,
    onShow() {
        void this.reload();
    },
    async reload() {
        var _a;
        const seq = ++this._reqSeq;
        this.setData({ loading: true, error: '' });
        try {
            const [actionsRes, equipRes] = await Promise.all([
                (0, cloud_content_1.contentListActions)(100),
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
            this._allActions = sortActions((_a = actionsRes.data.items) !== null && _a !== void 0 ? _a : []);
            let collectedIds = new Set();
            try {
                const idRes = await (0, user_collect_1.ensureOpenId)();
                if (idRes.ok) {
                    const ids = await (0, user_collect_1.listActionCollectTargetIds)(idRes.data.openid);
                    collectedIds = new Set(ids);
                }
            }
            catch (_b) {
                collectedIds = new Set();
            }
            if (seq !== this._reqSeq)
                return;
            this._collectedIds = collectedIds;
            this.setData({ equipmentOptions, loading: false, error: '' });
            this.applyFilters();
        }
        catch (e) {
            if (seq !== this._reqSeq)
                return;
            const message = e instanceof Error ? e.message : '加载失败';
            this.setData({ loading: false, error: message, items: [], empty: false });
        }
    },
    currentFilters() {
        return (0, index_1.normalizeActionCatalogFilters)({
            primaryMuscle: this.data.primaryMuscle || null,
            equipmentId: this.data.equipmentId || null,
            difficulty: this.data.difficulty || null,
            goal: this.data.goal || null,
            keyword: this.data.keyword,
        });
    },
    applyFilters() {
        const filtered = (0, index_1.filterActions)(this._allActions, this.currentFilters());
        const items = toItems(filtered, this._collectedIds);
        this.setData({ items, empty: !this.data.loading && items.length === 0 });
    },
    onKeywordInput(e) {
        var _a;
        this.setData({ keyword: (_a = e.detail.value) !== null && _a !== void 0 ? _a : '' });
        this.applyFilters();
    },
    clearKeyword() {
        this.setData({ keyword: '' });
        this.applyFilters();
    },
    onPickMuscle(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
        this.setData({
            primaryMuscle: this.data.primaryMuscle === id ? '' : id,
        });
        this.applyFilters();
    },
    onPickEquipment(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
        this.setData({
            equipmentId: this.data.equipmentId === id ? '' : id,
        });
        this.applyFilters();
    },
    onPickDifficulty(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
        this.setData({
            difficulty: this.data.difficulty === id ? '' : id,
        });
        this.applyFilters();
    },
    onPickGoal(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
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
    goDetail(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
        if (!id)
            return;
        wx.navigateTo({ url: `/pages/train/actions/detail?id=${id}` });
    },
    onToday() {
        const pick = (0, index_1.pickRandomAction)(this._allActions);
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
