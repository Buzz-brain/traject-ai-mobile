/**
 * GPS Forwarder
 * Simple pub/sub to forward saved GPS points to interested listeners (eg. hybrid predictor)
 */

const listeners = new Set();

export function addListener(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function removeListener(fn) {
  listeners.delete(fn);
}

export function notifyNewGpsPoint(point) {
  try {
    listeners.forEach((fn) => {
      try {
        fn(point);
      } catch (e) {
        console.error('[gpsForwarder] listener error', e);
      }
    });
  } catch (e) {
    console.error('[gpsForwarder] notify error', e);
  }
}

export default {
  addListener,
  removeListener,
  notifyNewGpsPoint,
};
