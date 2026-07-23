"use strict";
Page({
    data: {
        tools: [
            {
                id: 'bmi',
                title: 'BMI',
                desc: '身高体重指数与双标准对照',
                path: '/pages/diet/toolbox/bmi/index',
            },
            {
                id: 'bmr',
                title: '基础代谢',
                desc: '估算每日基础代谢热量',
                path: '/pages/diet/toolbox/bmr/index',
            },
            {
                id: 'body-fat',
                title: '体脂估算',
                desc: '腰围体重法估算体脂率',
                path: '/pages/diet/toolbox/body-fat/index',
            },
            {
                id: 'whr',
                title: '腰臀比',
                desc: '腰臀比与健康风险参考',
                path: '/pages/diet/toolbox/whr/index',
            },
            {
                id: 'one-rm',
                title: '1RM 估算',
                desc: '根据重量与次数估算最大力量',
                path: '/pages/diet/toolbox/one-rm/index',
            },
        ],
    },
    openTool(e) {
        const path = e.currentTarget.dataset.path;
        if (!path)
            return;
        wx.navigateTo({ url: path });
    },
});
