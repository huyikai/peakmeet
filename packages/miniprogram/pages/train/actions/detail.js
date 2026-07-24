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
const MEDIA_ATTRIBUTION = '© Gym visual — https://gymvisual.com/';
Page({
    data: {
        loading: true,
        error: '',
        id: '',
        name: '',
        alias: '',
        difficultyLabel: '',
        equipmentText: '',
        sceneText: '',
        primaryMusclesText: '',
        secondaryMusclesText: '',
        secondaryMuscles: [],
        coverSrc: '',
        demoGifSrc: '',
        steps: [],
        cues: [],
        mistakes: [],
        substitutes: [],
        showCues: false,
        showMistakes: false,
        showSubstitutes: false,
        collected: false,
        mediaAttribution: MEDIA_ATTRIBUTION,
        disclaimer: index_1.FITNESS_DISCLAIMER,
    },
    onLoad(query) {
        var _a;
        const id = String((_a = query.id) !== null && _a !== void 0 ? _a : '');
        this.setData({ id });
        void this.load(id);
    },
    async load(id) {
        var _a, _b, _c, _d;
        if (!id) {
            this.setData({ loading: false, error: '缺少动作 ID' });
            return;
        }
        this.setData({ loading: true, error: '' });
        try {
            const [detailRes, equipRes] = await Promise.all([
                (0, cloud_content_1.contentGetActionById)(id),
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
            let equipmentLabels = ['自重/无器械'];
            if ((_a = action.equipment) === null || _a === void 0 ? void 0 : _a.length) {
                const map = equipRes.ok
                    ? new Map(equipRes.data.items.map((e) => [e._id, e.name]))
                    : new Map();
                equipmentLabels = action.equipment.map((eid) => { var _a; return (_a = map.get(eid)) !== null && _a !== void 0 ? _a : eid; });
            }
            const substituteIds = (_d = (_c = (_b = action.enrichment) === null || _b === void 0 ? void 0 : _b.substituteIds) !== null && _c !== void 0 ? _c : action.substituteIds) !== null && _d !== void 0 ? _d : [];
            const substitutes = [];
            for (const sid of substituteIds) {
                const sub = await (0, cloud_content_1.contentGetActionById)(sid);
                if (sub.ok)
                    substitutes.push({ id: sid, name: sub.data.item.name });
            }
            let collected = false;
            try {
                const idRes = await (0, user_collect_1.ensureOpenId)();
                if (idRes.ok) {
                    const row = await (0, user_collect_1.findActionCollect)(idRes.data.openid, id);
                    collected = Boolean(row);
                }
            }
            catch (_e) {
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const cues = (_c = (_b = (_a = action.enrichment) === null || _a === void 0 ? void 0 : _a.cues) !== null && _b !== void 0 ? _b : action.cues) !== null && _c !== void 0 ? _c : [];
        const mistakes = (_f = (_e = (_d = action.enrichment) === null || _d === void 0 ? void 0 : _d.mistakes) !== null && _e !== void 0 ? _e : action.mistakes) !== null && _f !== void 0 ? _f : [];
        const alias = (_h = (_g = action.aliases) === null || _g === void 0 ? void 0 : _g[0]) !== null && _h !== void 0 ? _h : '';
        this.setData({
            loading: false,
            error: '',
            name: action.name,
            alias,
            difficultyLabel: (0, index_1.difficultyLabelZh)(action.difficulty),
            equipmentText: extra.equipmentLabels.join('、'),
            sceneText: ((_j = action.scenes) !== null && _j !== void 0 ? _j : [])
                .map((s) => { var _a; return (_a = SCENE_ZH[s]) !== null && _a !== void 0 ? _a : s; })
                .join('、'),
            primaryMusclesText: ((_k = action.primaryMuscles) !== null && _k !== void 0 ? _k : [])
                .map(index_1.muscleLabelZh)
                .join('、'),
            secondaryMusclesText: ((_l = action.secondaryMuscles) !== null && _l !== void 0 ? _l : [])
                .map(index_1.muscleLabelZh)
                .join('、'),
            secondaryMuscles: ((_m = action.secondaryMuscles) !== null && _m !== void 0 ? _m : []).map(index_1.muscleLabelZh),
            coverSrc: (0, content_cover_1.contentCoverSrc)((_o = action.coverJpg) !== null && _o !== void 0 ? _o : action.cover),
            demoGifSrc: (0, content_cover_1.contentCoverSrc)(action.demoGif),
            steps: (_p = action.steps) !== null && _p !== void 0 ? _p : [],
            cues,
            mistakes,
            substitutes: extra.substitutes,
            showCues: cues.length > 0,
            showMistakes: mistakes.length > 0,
            showSubstitutes: extra.substitutes.length > 0,
            collected: extra.collected,
            mediaAttribution: action.mediaAttribution || MEDIA_ATTRIBUTION,
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
