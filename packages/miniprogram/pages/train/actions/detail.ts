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

const MEDIA_ATTRIBUTION = '© Gym visual — https://gymvisual.com/';

type SubstituteView = { id: string; name: string };

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
    secondaryMuscles: [] as string[],
    coverSrc: '',
    demoGifSrc: '',
    steps: [] as string[],
    cues: [] as string[],
    mistakes: [] as string[],
    substitutes: [] as SubstituteView[],
    showCues: false,
    showMistakes: false,
    showSubstitutes: false,
    collected: false,
    mediaAttribution: MEDIA_ATTRIBUTION,
    disclaimer: FITNESS_DISCLAIMER,
  },

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
      const [detailRes, equipRes] = await Promise.all([
        contentGetActionById(id),
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
      let equipmentLabels = ['自重/无器械'];
      if (action.equipment?.length) {
        const map = equipRes.ok
          ? new Map(equipRes.data.items.map((e) => [e._id, e.name]))
          : new Map<string, string>();
        equipmentLabels = action.equipment.map((eid) => map.get(eid) ?? eid);
      }

      const substituteIds =
        action.enrichment?.substituteIds ?? action.substituteIds ?? [];
      const substitutes: SubstituteView[] = [];
      for (const sid of substituteIds) {
        const sub = await contentGetActionById(sid);
        if (sub.ok) substitutes.push({ id: sid, name: sub.data.item.name });
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
    const cues = action.enrichment?.cues ?? action.cues ?? [];
    const mistakes = action.enrichment?.mistakes ?? action.mistakes ?? [];
    const alias = action.aliases?.[0] ?? '';
    this.setData({
      loading: false,
      error: '',
      name: action.name,
      alias,
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
      coverSrc: contentCoverSrc(action.coverJpg ?? action.cover),
      demoGifSrc: contentCoverSrc(action.demoGif),
      steps: action.steps ?? [],
      cues,
      mistakes,
      substitutes: extra.substitutes,
      showCues: cues.length > 0,
      showMistakes: mistakes.length > 0,
      showSubstitutes: extra.substitutes.length > 0,
      collected: extra.collected,
      mediaAttribution: action.mediaAttribution || MEDIA_ATTRIBUTION,
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
