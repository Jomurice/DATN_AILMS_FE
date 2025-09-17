// src/services/eventBus.js
const _events = new Map();

export const EVENTS = Object.freeze({
  INBOUND_SCANNED: 'inbound:scanned',
  PRODUCT_CHANGED: 'product:changed',
  PRODUCT_DETAIL_CHANGED: 'product-detail:changed',
  DASHBOARD_SHOULD_REFRESH: 'dashboard:refresh',
});

export function on(type, handler) {
  if(!_events.has(type)) _events.set(type, new Set());
  _events.get(type).add(handler);
  return () => off(type, handler);
}
export function off(type, handler) {
  const set = _events.get(type);
  if(!set) return;
  set.delete(handler);
  if(set.size===0) _events.delete(type);
}
export function once(type, handler) {
  const wrap = (p)=>{ try{handler(p);} finally{ off(type, wrap); } };
  return on(type, wrap);
}
export function fire(type, payload) {
  _emit(type, payload);
  if (type === EVENTS.INBOUND_SCANNED) {
    _emit(EVENTS.PRODUCT_CHANGED, { productId: payload?.productId ?? null });
    _emit(EVENTS.DASHBOARD_SHOULD_REFRESH, null);
  }
}
function _emit(type, payload) {
  const set = _events.get(type);
  if(!set) return;
  [...set].forEach(fn => { try{ fn(payload); } catch(e){ console.error(`[eventBus] ${type}`, e); } });
}
export function clearAll(){ _events.clear(); }
