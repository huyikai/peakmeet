"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../utils/shared/index");
const timer_alerts_1 = require("../../../utils/timer-alerts");
const DISCLAIMER = '计时器仅供辅助训练节奏，请根据自身身体状况量力而行；不构成专业健身指导。';
function formatDisplay(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
function phaseLabelOf(session) {
    if (session.status !== 'running' && session.status !== 'paused')
        return '';
    if (session.mode === 'tabata') {
        return session.phase === 'work' ? '训练中' : '休息中';
    }
    if (session.mode === 'rest')
        return '休息倒计时';
    return '正计时';
}
function roundLabelOf(session) {
    if (session.mode !== 'tabata' || session.roundIndex == null)
        return '';
    const rounds = 'rounds' in session.config ? session.config.rounds : 0;
    return `第 ${session.roundIndex} / ${rounds} 组`;
}
function parseIntSafe(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n))
        return null;
    return n;
}
Page({
    data: {
        mode: 'rest',
        status: 'idle',
        restSec: String(index_1.REST_DEFAULT_SEC),
        workSec: String(index_1.TABATA_DEFAULT_WORK_SEC),
        rounds: String(index_1.TABATA_DEFAULT_ROUNDS),
        displayText: formatDisplay(index_1.REST_DEFAULT_SEC),
        phaseLabel: '',
        roundLabel: '',
        errorTip: '',
        summaryText: '',
        checkInJson: '',
        disclaimer: DISCLAIMER,
        source: 'standalone',
    },
    session: null,
    launchParams: null,
    tickTimer: 0,
    onLoad(query) {
        this.applyLaunchQuery(query || {});
    },
    onUnload() {
        this.clearTicker();
        (0, timer_alerts_1.destroyTimerAlerts)();
    },
    onHide() {
        this.clearTicker();
    },
    onShow() {
        this.reconcileNow();
        if (this.session && this.session.status === 'running') {
            this.startTicker();
        }
    },
    applyLaunchQuery(query) {
        var _a, _b, _c, _d;
        const modeRaw = query.mode;
        let mode = 'rest';
        if (modeRaw === 'tabata' || modeRaw === 'stopwatch' || modeRaw === 'rest') {
            mode = modeRaw;
        }
        const hasLaunch = Boolean(modeRaw);
        const restSec = (_a = parseIntSafe(query.restSec || '')) !== null && _a !== void 0 ? _a : index_1.REST_DEFAULT_SEC;
        const workSec = (_b = parseIntSafe(query.workSec || '')) !== null && _b !== void 0 ? _b : index_1.TABATA_DEFAULT_WORK_SEC;
        const rounds = (_c = parseIntSafe(query.rounds || '')) !== null && _c !== void 0 ? _c : index_1.TABATA_DEFAULT_ROUNDS;
        const patch = {
            mode,
            source: hasLaunch ? 'launch' : 'standalone',
            status: 'idle',
            errorTip: '',
            checkInJson: '',
            restSec: String(mode === 'rest'
                ? restSec
                : mode === 'tabata'
                    ? (_d = parseIntSafe(query.restSec || '')) !== null && _d !== void 0 ? _d : index_1.TABATA_DEFAULT_REST_SEC
                    : index_1.REST_DEFAULT_SEC),
            workSec: String(workSec),
            rounds: String(rounds),
            displayText: mode === 'stopwatch'
                ? formatDisplay(0)
                : mode === 'tabata'
                    ? formatDisplay(workSec)
                    : formatDisplay(restSec),
            phaseLabel: '',
            roundLabel: '',
        };
        this.launchParams = hasLaunch
            ? {
                mode,
                restSec: Number(patch.restSec),
                workSec: Number(patch.workSec),
                rounds: Number(patch.rounds),
            }
            : null;
        this.session = null;
        this.setData(patch);
    },
    applySession(session, events) {
        this.session = session;
        if (events) {
            for (const ev of events) {
                if (ev.alert === 'phase')
                    (0, timer_alerts_1.notifyPhaseChange)();
                if (ev.alert === 'complete')
                    (0, timer_alerts_1.notifySessionComplete)();
            }
        }
        let summaryText = '';
        if (session.status === 'completed') {
            if (session.mode === 'stopwatch') {
                summaryText = `累计 ${formatDisplay(session.displaySec)}`;
            }
            else if (session.mode === 'rest') {
                summaryText = '休息结束';
            }
            else {
                summaryText = 'Tabata 完成';
            }
        }
        this.setData({
            status: session.status,
            displayText: formatDisplay(session.displaySec),
            phaseLabel: phaseLabelOf(session),
            roundLabel: roundLabelOf(session),
            summaryText,
        });
        if (session.status === 'running') {
            this.startTicker();
        }
        else {
            this.clearTicker();
        }
    },
    clearTicker() {
        if (this.tickTimer) {
            clearInterval(this.tickTimer);
            this.tickTimer = 0;
        }
    },
    startTicker() {
        this.clearTicker();
        this.tickTimer = setInterval(() => {
            this.reconcileNow();
        }, 250);
    },
    reconcileNow() {
        if (!this.session)
            return;
        if (this.session.status !== 'running' &&
            this.session.status !== 'paused') {
            return;
        }
        const { session, events } = (0, index_1.tickSession)(this.session, Date.now());
        this.applySession(session, events);
    },
    onSelectMode(e) {
        if (this.data.status === 'running' || this.data.status === 'paused')
            return;
        const mode = e.currentTarget.dataset.mode;
        const displayText = mode === 'stopwatch'
            ? formatDisplay(0)
            : mode === 'tabata'
                ? formatDisplay(Number(this.data.workSec) || index_1.TABATA_DEFAULT_WORK_SEC)
                : formatDisplay(Number(this.data.restSec) || index_1.REST_DEFAULT_SEC);
        this.session = null;
        this.setData({
            mode,
            status: 'idle',
            errorTip: '',
            checkInJson: '',
            displayText,
            phaseLabel: '',
            roundLabel: '',
        });
    },
    onRestSec(e) {
        this.setData({ restSec: e.detail.value, errorTip: '' });
    },
    onWorkSec(e) {
        this.setData({ workSec: e.detail.value, errorTip: '' });
    },
    onRounds(e) {
        this.setData({ rounds: e.detail.value, errorTip: '' });
    },
    onStart() {
        const now = Date.now();
        const mode = this.data.mode;
        let config = {};
        if (mode === 'rest') {
            const restSec = parseIntSafe(this.data.restSec);
            config = { restSec };
        }
        else if (mode === 'tabata') {
            config = {
                workSec: parseIntSafe(this.data.workSec),
                restSec: parseIntSafe(this.data.restSec),
                rounds: parseIntSafe(this.data.rounds),
            };
        }
        const created = (0, index_1.createSession)(mode, config, now);
        if (!created.ok) {
            this.setData({ errorTip: created.message });
            return;
        }
        const started = (0, index_1.startSession)(created.value, now);
        if (!started.ok) {
            this.setData({ errorTip: started.message });
            return;
        }
        this.setData({ errorTip: '', checkInJson: '' });
        this.applySession(started.value);
    },
    onPause() {
        if (!this.session)
            return;
        const r = (0, index_1.pauseSession)(this.session, Date.now());
        if (!r.ok) {
            this.setData({ errorTip: r.message });
            return;
        }
        this.applySession(r.value);
    },
    onResume() {
        if (!this.session)
            return;
        const r = (0, index_1.resumeSession)(this.session, Date.now());
        if (!r.ok) {
            this.setData({ errorTip: r.message });
            return;
        }
        this.applySession(r.value);
    },
    onCancel() {
        if (!this.session)
            return;
        const r = (0, index_1.cancelSession)(this.session, Date.now());
        if (!r.ok) {
            this.setData({ errorTip: r.message });
            return;
        }
        this.clearTicker();
        this.session = null;
        const mode = this.data.mode;
        this.setData({
            status: 'idle',
            phaseLabel: '',
            roundLabel: '',
            errorTip: '',
            checkInJson: '',
            displayText: mode === 'stopwatch'
                ? formatDisplay(0)
                : mode === 'tabata'
                    ? formatDisplay(Number(this.data.workSec) || index_1.TABATA_DEFAULT_WORK_SEC)
                    : formatDisplay(Number(this.data.restSec) || index_1.REST_DEFAULT_SEC),
        });
    },
    onEndStopwatch() {
        if (!this.session)
            return;
        const r = (0, index_1.endStopwatch)(this.session, Date.now());
        if (!r.ok) {
            this.setData({ errorTip: r.message });
            return;
        }
        (0, timer_alerts_1.notifySessionComplete)();
        this.applySession(r.value);
    },
    onReuseRest() {
        if (!this.session)
            return;
        const r = (0, index_1.restartRestSameConfig)(this.session, Date.now());
        if (!r.ok) {
            this.setData({ errorTip: r.message });
            return;
        }
        this.setData({ errorTip: '', checkInJson: '' });
        this.applySession(r.value);
    },
    onCheckIn() {
        if (!this.session)
            return;
        const r = (0, index_1.buildWorkoutCheckInPayload)(this.session, {
            source: this.data.source,
            launchParams: this.launchParams || undefined,
        });
        if (!r.ok) {
            this.setData({ errorTip: r.message });
            return;
        }
        this.setData({
            checkInJson: JSON.stringify(r.value),
            errorTip: '',
        });
    },
    onSkipCheckIn() {
        this.setData({ checkInJson: '' });
    },
    onResetIdle() {
        this.clearTicker();
        this.session = null;
        const mode = this.data.mode;
        this.setData({
            status: 'idle',
            phaseLabel: '',
            roundLabel: '',
            summaryText: '',
            checkInJson: '',
            errorTip: '',
            displayText: mode === 'stopwatch'
                ? formatDisplay(0)
                : mode === 'tabata'
                    ? formatDisplay(Number(this.data.workSec) || index_1.TABATA_DEFAULT_WORK_SEC)
                    : formatDisplay(Number(this.data.restSec) || index_1.REST_DEFAULT_SEC),
        });
    },
});
