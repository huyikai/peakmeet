Page({
  data: {
    title: '训练计划库',
    hint: '计划库内容将在后续版本上线。你可以从动作详情通过「加入训练」回到这里选择成品计划。',
  },
  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/train/index' }) });
  },
});
