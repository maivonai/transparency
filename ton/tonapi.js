const TONAPI_BASE = 'https://tonapi.io/v2';

export async function fetchBalance(address) {
  if (!address) return 0;
  try {
    const url = `${TONAPI_BASE}/accounts/${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    });
    if (!res.ok) {
      console.warn('TonAPI status', res.status);
      return 0;
    }
    const data = await res.json();
    const balanceNano = data.balance || 0;
    return balanceNano / 1e9;
  } catch (e) {
    console.error('TonAPI fetch error', e);
    return 0;
  }
}