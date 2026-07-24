"use strict";
Page({
    data: {
        title: '训练',
    },
    goActions() {
        wx.navigateTo({ url: '/pages/train/actions/index' });
    },
    goPlans() {
        wx.navigateTo({ url: '/pages/train/plans/index' });
    },
    goTimer() {
        wx.navigateTo({ url: '/pages/train/timer/index' });
    },
});
