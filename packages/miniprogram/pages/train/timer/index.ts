import {
  REST_DEFAULT_SEC,
  TABATA_DEFAULT_REST_SEC,
  TABATA_DEFAULT_ROUNDS,
  TABATA_DEFAULT_WORK_SEC,
  buildWorkoutCheckInPayload,
  cancelSession,
  createSession,
  endStopwatch,
  pauseSession,
  restartRestSameConfig,
  resumeSession,
  startSession,
  tickSession,
  type TimerMode,
  type TimerSession,
  type TimerTickEvent,
} from '../../../utils/shared/index';
import {
  destroyTimerAlerts,
  notifyPhaseChange,
  notifySessionComplete,
} from '../../../utils/timer-alerts';

const DISCLAIMER =
  '计时器仅供辅助训练节奏，请根据自身身体状况量力而行；不构成专业健身指导。';

type PageData = {
  mode: TimerMode;
  status: TimerSession['status'];
  restSec: string;
  workSec: string;
  rounds: string;
  displayText: string;
  phaseLabel: string;
  roundLabel: string;
  errorTip: string;
  summaryText: string;
  checkInJson: string;
  disclaimer: string;
  source: 'standalone' | 'launch';
};

function formatDisplay(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function phaseLabelOf(session: TimerSession): string {
  if (session.status !== 'running' && session.status !== 'paused') return '';
  if (session.mode === 'tabata') {
    return session.phase === 'work' ? '训练中' : '休息中';
  }
  if (session.mode === 'rest') return '休息倒计时';
  return '正计时';
}

function roundLabelOf(session: TimerSession): string {
  if (session.mode !== 'tabata' || session.roundIndex == null) return '';
  const rounds =
    'rounds' in session.config ? (session.config as { rounds: number }).rounds : 0;
  return `第 ${session.roundIndex} / ${rounds} 组`;
}

function parseIntSafe(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

Page({
  data: {
    mode: 'rest',
    status: 'idle',
    restSec: String(REST_DEFAULT_SEC),
    workSec: String(TABATA_DEFAULT_WORK_SEC),
    rounds: String(TABATA_DEFAULT_ROUNDS),
    displayText: formatDisplay(REST_DEFAULT_SEC),
    phaseLabel: '',
    roundLabel: '',
    errorTip: '',
    summaryText: '',
    checkInJson: '',
    disclaimer: DISCLAIMER,
    source: 'standalone',
  } as PageData,

  session: null as TimerSession | null,
  launchParams: null as Record<string, unknown> | null,
  tickTimer: 0 as number,

  onLoad(query: Record<string, string | undefined>) {
    this.applyLaunchQuery(query || {});
  },

  onUnload() {
    this.clearTicker();
    destroyTimerAlerts();
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

  applyLaunchQuery(query: Record<string, string | undefined>) {
    const modeRaw = query.mode;
    let mode: TimerMode = 'rest';
    if (modeRaw === 'tabata' || modeRaw === 'stopwatch' || modeRaw === 'rest') {
      mode = modeRaw;
    }
    const hasLaunch = Boolean(modeRaw);
    const restSec = parseIntSafe(query.restSec || '') ?? REST_DEFAULT_SEC;
    const workSec = parseIntSafe(query.workSec || '') ?? TABATA_DEFAULT_WORK_SEC;
    const rounds = parseIntSafe(query.rounds || '') ?? TABATA_DEFAULT_ROUNDS;

    const patch: Partial<PageData> = {
      mode,
      source: hasLaunch ? 'launch' : 'standalone',
      status: 'idle',
      errorTip: '',
      checkInJson: '',
      restSec: String(
        mode === 'rest'
          ? restSec
          : mode === 'tabata'
            ? parseIntSafe(query.restSec || '') ?? TABATA_DEFAULT_REST_SEC
            : REST_DEFAULT_SEC,
      ),
      workSec: String(workSec),
      rounds: String(rounds),
      displayText:
        mode === 'stopwatch'
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
    this.setData(patch as PageData);
  },

  applySession(session: TimerSession, events?: TimerTickEvent[]) {
    this.session = session;
    if (events) {
      for (const ev of events) {
        if (ev.alert === 'phase') notifyPhaseChange();
        if (ev.alert === 'complete') notifySessionComplete();
      }
    }
    let summaryText = '';
    if (session.status === 'completed') {
      if (session.mode === 'stopwatch') {
        summaryText = `累计 ${formatDisplay(session.displaySec)}`;
      } else if (session.mode === 'rest') {
        summaryText = '休息结束';
      } else {
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
    } else {
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
    }, 250) as unknown as number;
  },

  reconcileNow() {
    if (!this.session) return;
    if (
      this.session.status !== 'running' &&
      this.session.status !== 'paused'
    ) {
      return;
    }
    const { session, events } = tickSession(this.session, Date.now());
    this.applySession(session, events);
  },

  onSelectMode(e: { currentTarget: { dataset: { mode: string } } }) {
    if (this.data.status === 'running' || this.data.status === 'paused') return;
    const mode = e.currentTarget.dataset.mode as TimerMode;
    const displayText =
      mode === 'stopwatch'
        ? formatDisplay(0)
        : mode === 'tabata'
          ? formatDisplay(Number(this.data.workSec) || TABATA_DEFAULT_WORK_SEC)
          : formatDisplay(Number(this.data.restSec) || REST_DEFAULT_SEC);
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

  onRestSec(e: { detail: { value: string } }) {
    this.setData({ restSec: e.detail.value, errorTip: '' });
  },
  onWorkSec(e: { detail: { value: string } }) {
    this.setData({ workSec: e.detail.value, errorTip: '' });
  },
  onRounds(e: { detail: { value: string } }) {
    this.setData({ rounds: e.detail.value, errorTip: '' });
  },

  onStart() {
    const now = Date.now();
    const mode = this.data.mode as TimerMode;
    let config: unknown = {};
    if (mode === 'rest') {
      const restSec = parseIntSafe(this.data.restSec as string);
      config = { restSec };
    } else if (mode === 'tabata') {
      config = {
        workSec: parseIntSafe(this.data.workSec as string),
        restSec: parseIntSafe(this.data.restSec as string),
        rounds: parseIntSafe(this.data.rounds as string),
      };
    }
    const created = createSession(mode, config, now);
    if (!created.ok) {
      this.setData({ errorTip: created.message });
      return;
    }
    const started = startSession(created.value, now);
    if (!started.ok) {
      this.setData({ errorTip: started.message });
      return;
    }
    this.setData({ errorTip: '', checkInJson: '' });
    this.applySession(started.value);
  },

  onPause() {
    if (!this.session) return;
    const r = pauseSession(this.session, Date.now());
    if (!r.ok) {
      this.setData({ errorTip: r.message });
      return;
    }
    this.applySession(r.value);
  },

  onResume() {
    if (!this.session) return;
    const r = resumeSession(this.session, Date.now());
    if (!r.ok) {
      this.setData({ errorTip: r.message });
      return;
    }
    this.applySession(r.value);
  },

  onCancel() {
    if (!this.session) return;
    const r = cancelSession(this.session, Date.now());
    if (!r.ok) {
      this.setData({ errorTip: r.message });
      return;
    }
    this.clearTicker();
    this.session = null;
    const mode = this.data.mode as TimerMode;
    this.setData({
      status: 'idle',
      phaseLabel: '',
      roundLabel: '',
      errorTip: '',
      checkInJson: '',
      displayText:
        mode === 'stopwatch'
          ? formatDisplay(0)
          : mode === 'tabata'
            ? formatDisplay(Number(this.data.workSec) || TABATA_DEFAULT_WORK_SEC)
            : formatDisplay(Number(this.data.restSec) || REST_DEFAULT_SEC),
    });
  },

  onEndStopwatch() {
    if (!this.session) return;
    const r = endStopwatch(this.session, Date.now());
    if (!r.ok) {
      this.setData({ errorTip: r.message });
      return;
    }
    notifySessionComplete();
    this.applySession(r.value);
  },

  onReuseRest() {
    if (!this.session) return;
    const r = restartRestSameConfig(this.session, Date.now());
    if (!r.ok) {
      this.setData({ errorTip: r.message });
      return;
    }
    this.setData({ errorTip: '', checkInJson: '' });
    this.applySession(r.value);
  },

  onCheckIn() {
    if (!this.session) return;
    const r = buildWorkoutCheckInPayload(this.session, {
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
    const mode = this.data.mode as TimerMode;
    this.setData({
      status: 'idle',
      phaseLabel: '',
      roundLabel: '',
      summaryText: '',
      checkInJson: '',
      errorTip: '',
      displayText:
        mode === 'stopwatch'
          ? formatDisplay(0)
          : mode === 'tabata'
            ? formatDisplay(Number(this.data.workSec) || TABATA_DEFAULT_WORK_SEC)
            : formatDisplay(Number(this.data.restSec) || REST_DEFAULT_SEC),
    });
  },
});
