"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../utils/shared/index");
const content_cover_1 = require("../../../utils/content-cover");
const cloud_content_1 = require("../../../utils/cloud-content");
const user_collect_1 = require("../../../utils/user-collect");
const SCENE_ZH = {
    gym: '健身房',
    home: '居家',
    bodyweight: '自重',
};
Page({
    data: {
        loading: true,
        error: '',
        id: '',
        name: '',
        difficultyLabel: '',
        equipmentText: '',
        sceneText: '',
        primaryMusclesText: '',
        secondaryMusclesText: '',
        secondaryMuscles: [],
        coverSrc: '',
        steps: [],
        cues: [],
        mistakes: [],
        substitutes: [],
        collected: false,
        disclaimer: index_1.FITNESS_DISCLAIMER,
    },
    _nameById: new Map(),
    onLoad(query) {
        var _a;
        const id = String((_a = query.id) !== null && _a !== void 0 ? _a : '');
        this.setData({ id });
        void this.load(id);
    },
    async load(id) {
        var _a, _b;
        if (!id) {
            this.setData({ loading: false, error: '缺少动作 ID' });
            return;
        }
        this.setData({ loading: true, error: '' });
        try {
            const [detailRes, listRes, equipRes] = await Promise.all([
                (0, cloud_content_1.contentGetActionById)(id),
                (0, cloud_content_1.contentListActions)(100),
                (0, cloud_content_1.contentListEquipment)(100),
            ]);
            if (!detailRes.ok) {
                this.setData({
                    loading: false,
                    error: detailRes.message || '加载失败',
                });
                return;
            }
            const action = detailRes.data.item;
            if (listRes.ok) {
                this._nameById = new Map(listRes.data.items.map((a) => [a._id, a.name]));
            }
            let equipmentLabels = ['自重/无器械'];
            if ((_a = action.equipment) === null || _a === void 0 ? void 0 : _a.length) {
                const map = equipRes.ok
                    ? new Map(equipRes.data.items.map((e) => [e._id, e.name]))
                    : new Map();
                equipmentLabels = action.equipment.map((eid) => { var _a; return (_a = map.get(eid)) !== null && _a !== void 0 ? _a : eid; });
            }
            const substitutes = [];
            for (const sid of (_b = action.substituteIds) !== null && _b !== void 0 ? _b : []) {
                const name = this._nameById.get(sid);
                if (name)
                    substitutes.push({ id: sid, name });
            }
            let collected = false;
            try {
                const idRes = await (0, user_collect_1.ensureOpenId)();
                if (idRes.ok) {
                    const row = await (0, user_collect_1.findActionCollect)(idRes.data.openid, id);
                    collected = Boolean(row);
                }
            }
            catch (_c) {
                collected = false;
            }
            this.applyAction(action, {
                equipmentLabels,
                substitutes,
                collected,
            });
        }
        catch (e) {
            const message = e instanceof Error ? e.message : '加载失败';
            this.setData({ loading: false, error: message });
        }
    },
    applyAction(action, extra) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.setData({
            loading: false,
            error: '',
            name: action.name,
            difficultyLabel: (0, index_1.difficultyLabelZh)(action.difficulty),
            equipmentText: extra.equipmentLabels.join('、'),
            sceneText: ((_a = action.scenes) !== null && _a !== void 0 ? _a : [])
                .map((s) => { var _a; return (_a = SCENE_ZH[s]) !== null && _a !== void 0 ? _a : s; })
                .join('、'),
            primaryMusclesText: ((_b = action.primaryMuscles) !== null && _b !== void 0 ? _b : [])
                .map(index_1.muscleLabelZh)
                .join('、'),
            secondaryMusclesText: ((_c = action.secondaryMuscles) !== null && _c !== void 0 ? _c : [])
                .map(index_1.muscleLabelZh)
                .join('、'),
            secondaryMuscles: ((_d = action.secondaryMuscles) !== null && _d !== void 0 ? _d : []).map(index_1.muscleLabelZh),
            coverSrc: (0, content_cover_1.contentCoverSrc)(action.cover),
            steps: (_e = action.steps) !== null && _e !== void 0 ? _e : [],
            cues: (_f = action.cues) !== null && _f !== void 0 ? _f : [],
            mistakes: (_g = action.mistakes) !== null && _g !== void 0 ? _g : [],
            substitutes: extra.substitutes,
            collected: extra.collected,
            disclaimer: index_1.FITNESS_DISCLAIMER,
        });
    },
    onRetry() {
        void this.load(this.data.id);
    },
    goSubstitute(e) {
        var _a;
        const id = String((_a = e.currentTarget.dataset.id) !== null && _a !== void 0 ? _a : '');
        if (!id) {
            wx.showToast({ title: '动作不可用', icon: 'none' });
            return;
        }
        wx.navigateTo({ url: `/pages/train/actions/detail?id=${id}` });
    },
    async onToggleCollect() {
        try {
            const idRes = await (0, user_collect_1.ensureOpenId)();
            if (!idRes.ok) {
                wx.showToast({ title: '请先登录后收藏', icon: 'none' });
                return;
            }
            const { collected } = await (0, user_collect_1.toggleActionCollect)(this.data.id);
            this.setData({ collected });
            wx.showToast({
                title: collected ? '已收藏' : '已取消收藏',
                icon: 'none',
            });
        }
        catch (e) {
            const message = e instanceof Error ? e.message : '操作失败';
            wx.showToast({ title: message, icon: 'none' });
        }
    },
    goJoinTraining() {
        wx.navigateTo({
            url: '/pages/train/plans/index',
            fail: () => {
                wx.showToast({ title: '暂时无法打开计划库', icon: 'none' });
            },
        });
    },
});
