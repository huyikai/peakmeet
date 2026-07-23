"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../utils/shared/index");
Page({
    data: {
        title: '首页',
        ping: '',
    },
    onLoad() {
        const ping = (0, index_1.getPeakMeetPing)();
        console.log('[peakmeet] shared smoke:', ping);
        // WeChat Page instance; keep cast minimal for skeleton compile.
        this.setData({ ping });
    },
});
