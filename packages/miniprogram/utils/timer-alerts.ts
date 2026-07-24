/** Platform alerts for training timer — vibrate + optional beep. */

let audio: WechatInnerAudioContext | null = null;

function getAudio(): WechatInnerAudioContext {
  if (!audio) {
    audio = wx.createInnerAudioContext();
    audio.src = '/assets/audio/timer-beep.wav';
    audio.obeyMuteSwitch = true;
  }
  return audio;
}

export function notifyPhaseChange(): void {
  try {
    wx.vibrateShort({ type: 'medium' });
  } catch {
    /* ignore */
  }
  try {
    const a = getAudio();
    a.stop();
    a.play();
  } catch {
    /* vibrate-only fallback */
  }
}

export function notifySessionComplete(): void {
  try {
    wx.vibrateShort({ type: 'heavy' });
  } catch {
    /* ignore */
  }
  try {
    const a = getAudio();
    a.stop();
    a.play();
  } catch {
    /* vibrate-only fallback */
  }
}

export function destroyTimerAlerts(): void {
  if (audio) {
    try {
      audio.destroy();
    } catch {
      /* ignore */
    }
    audio = null;
  }
}
