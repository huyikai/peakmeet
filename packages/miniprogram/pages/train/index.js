"use strict";
Page({
    data: {
        title: '训练',
    },
    goTimer() {
        wx.navigateTo({ url: '/pages/train/timer/index' });
    },
});
