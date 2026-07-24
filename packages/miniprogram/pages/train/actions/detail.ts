import {
  FITNESS_DISCLAIMER,
  difficultyLabelZh,
  muscleLabelZh,
  type Action,
  type Scene,
} from '../../../utils/shared/index';
import { contentCoverSrc } from '../../../utils/content-cover';
import {
  contentGetActionById,
  contentListActions,
  contentListEquipment,
} from '../../../utils/cloud-content';
import {
  ensureOpenId,
  findActionCollect,
  toggleActionCollect,
} from '../../../utils/user-collect';

const SCENE_ZH: Record<Scene, string> = {
  gym: '健身房',
  home: '居家',
  bodyweight: '自重',
};

type SubstituteView = { id: string; name: string };

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
    secondaryMuscles: [] as string[],
    coverSrc: '',
    steps: [] as string[],
    cues: [] as string[],
    mistakes: [] as string[],
    substitutes: [] as SubstituteView[],
    collected: false,
    disclaimer: FITNESS_DISCLAIMER,
  },

  _nameById: new Map<string, string>(),

  onLoad(query: Record<string, string | undefined>) {
    const id = String(query.id ?? '');
    this.setData({ id });
    void this.load(id);
  },

  async load(id: string) {
    if (!id) {
      this.setData({ loading: false, error: '缺少动作 ID' });
      return;
    }
    this.setData({ loading: true, error: '' });
    try {
      const [detailRes, listRes, equipRes] = await Promise.all([
        contentGetActionById(id),
        contentListActions(100),
        contentListEquipment(100),
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
        this._nameById = new Map(
          listRes.data.items.map((a) => [a._id, a.name]),
        );
      }

      let equipmentLabels = ['自重/无器械'];
      if (action.equipment?.length) {
        const map = equipRes.ok
          ? new Map(equipRes.data.items.map((e) => [e._id, e.name]))
          : new Map<string, string>();
        equipmentLabels = action.equipment.map((eid) => map.get(eid) ?? eid);
      }

      const substitutes: SubstituteView[] = [];
      for (const sid of action.substituteIds ?? []) {
        const name = this._nameById.get(sid);
        if (name) substitutes.push({ id: sid, name });
      }

      let collected = false;
      try {
        const idRes = await ensureOpenId();
        if (idRes.ok) {
          const row = await findActionCollect(idRes.data.openid, id);
          collected = Boolean(row);
        }
      } catch {
        collected = false;
      }

      this.applyAction(action, {
        equipmentLabels,
        substitutes,
        collected,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : '加载失败';
      this.setData({ loading: false, error: message });
    }
  },

  applyAction(
    action: Action,
    extra: {
      equipmentLabels: string[];
      substitutes: SubstituteView[];
      collected: boolean;
    },
  ) {
    this.setData({
      loading: false,
      error: '',
      name: action.name,
      difficultyLabel: difficultyLabelZh(action.difficulty),
      equipmentText: extra.equipmentLabels.join('、'),
      sceneText: (action.scenes ?? [])
        .map((s) => SCENE_ZH[s] ?? s)
        .join('、'),
      primaryMusclesText: (action.primaryMuscles ?? [])
        .map(muscleLabelZh)
        .join('、'),
      secondaryMusclesText: (action.secondaryMuscles ?? [])
        .map(muscleLabelZh)
        .join('、'),
      secondaryMuscles: (action.secondaryMuscles ?? []).map(muscleLabelZh),
      coverSrc: contentCoverSrc(action.cover),
      steps: action.steps ?? [],
      cues: action.cues ?? [],
      mistakes: action.mistakes ?? [],
      substitutes: extra.substitutes,
      collected: extra.collected,
      disclaimer: FITNESS_DISCLAIMER,
    });
  },

  onRetry() {
    void this.load(this.data.id);
  },

  goSubstitute(e: WechatTouchEvent) {
    const id = String(e.currentTarget.dataset.id ?? '');
    if (!id) {
      wx.showToast({ title: '动作不可用', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/train/actions/detail?id=${id}` });
  },

  async onToggleCollect() {
    try {
      const idRes = await ensureOpenId();
      if (!idRes.ok) {
        wx.showToast({ title: '请先登录后收藏', icon: 'none' });
        return;
      }
      const { collected } = await toggleActionCollect(this.data.id);
      this.setData({ collected });
      wx.showToast({
        title: collected ? '已收藏' : '已取消收藏',
        icon: 'none',
      });
    } catch (e) {
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
