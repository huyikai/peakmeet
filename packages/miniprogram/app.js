"use strict";
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用支持云开发的基础库');
      return;
    }
    wx.cloud.init({
      env: 'cloud1-d8ghafmni1c847e3f',
      traceUser: true,
    });
  },
});
