import { getPeakMeetPing } from '../../utils/shared/index';

Page({
  data: {
    title: '首页',
    ping: '',
  },
  onLoad() {
    const ping = getPeakMeetPing();
    console.log('[peakmeet] shared smoke:', ping);
    this.setData({ ping });
  },
});
