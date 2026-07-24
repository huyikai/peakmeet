"use strict";
/** Platform alerts for training timer — vibrate + optional beep. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyPhaseChange = notifyPhaseChange;
exports.notifySessionComplete = notifySessionComplete;
exports.destroyTimerAlerts = destroyTimerAlerts;
let audio = null;
function getAudio() {
    if (!audio) {
        audio = wx.createInnerAudioContext();
        audio.src = '/assets/audio/timer-beep.wav';
        audio.obeyMuteSwitch = true;
    }
    return audio;
}
function notifyPhaseChange() {
    try {
        wx.vibrateShort({ type: 'medium' });
    }
    catch (_a) {
        /* ignore */
    }
    try {
        const a = getAudio();
        a.stop();
        a.play();
    }
    catch (_b) {
        /* vibrate-only fallback */
    }
}
function notifySessionComplete() {
    try {
        wx.vibrateShort({ type: 'heavy' });
    }
    catch (_a) {
        /* ignore */
    }
    try {
        const a = getAudio();
        a.stop();
        a.play();
    }
    catch (_b) {
        /* vibrate-only fallback */
    }
}
function destroyTimerAlerts() {
    if (audio) {
        try {
            audio.destroy();
        }
        catch (_a) {
            /* ignore */
        }
        audio = null;
    }
}
