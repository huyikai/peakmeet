"use strict";
Page({
    data: {
        title: '饮食',
    },
    goToolbox() {
        wx.navigateTo({ url: '/pages/diet/toolbox/index' });
    },
    goCaloriePlan() {
        wx.navigateTo({ url: '/pages/diet/calorie-plan/index' });
    },
});
