import { getPeakMeetPing } from '../../utils/shared/index';

Page({
  data: {
    title: '首页',
    ping: '',
  },
  onLoad() {
    const ping = getPeakMeetPing();
    console.log('[peakmeet] shared smoke:', ping);
    // WeChat Page instance; keep cast minimal for skeleton compile.
    (this as WechatMiniprogramPage).setData({ ping });
  },
});

type WechatMiniprogramPage = {
  setData: (data: Record<string, unknown>) => void;
};
