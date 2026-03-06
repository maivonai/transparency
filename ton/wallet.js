import { showToast } from '../ui/modal.js';

let tonConnectUI = null;
let walletStatus = null;

const listeners = {
  connect: [],
  disconnect: [],
  statusChange: []
};

const MANIFEST_FILE = 'tonconnect-manifest.json';

function getManifestUrl() {
  try {
    const { origin, pathname } = window.location;
    let path = pathname || '/';
    if (path.endsWith('index.html')) {
      path = path.slice(0, -'index.html'.length);
    }
    if (!path.endsWith('/')) {
      path += '/';
    }
    return origin + path + MANIFEST_FILE;
  } catch {
    return MANIFEST_FILE;
  }
}

export function getCurrentWallet() {
  if (!walletStatus || walletStatus.status !== 'connected') {
    return null;
  }
  const address = walletStatus.account.address;
  const addressShort =
    address.slice(0, 4) + '…' + address.slice(address.length - 4, address.length);
  return {
    address,
    addressShort
  };
}

export function onWalletChange(type, cb) {
  if (!listeners[type]) return;
  listeners[type].push(cb);
}

function emit(type, payload) {
  if (!listeners[type]) return;
  listeners[type].forEach((cb) => {
    try {
      cb(payload);
    } catch (e) {
      console.error('Wallet listener error', e);
    }
  });
}

export function initWallet({ onConnect, onDisconnect, onStatusChange }) {
  if (onConnect) listeners.connect.push(onConnect);
  if (onDisconnect) listeners.disconnect.push(onDisconnect);
  if (onStatusChange) listeners.statusChange.push(onStatusChange);

  if (!window.TON_CONNECT_UI || !window.TON_CONNECT_UI.TonConnectUI) {
    console.warn('TON_CONNECT_UI not available');
    return;
  }

  tonConnectUI = new window.TON_CONNECT_UI.TonConnectUI({
    manifestUrl: getManifestUrl()
  });

  tonConnectUI.connectionRestored
    .then((restored) => {
      if (!restored) return;
      walletStatus = tonConnectUI.wallet;
      emit('statusChange', toWalletInfo(walletStatus));
      if (walletStatus && walletStatus.status === 'connected') {
        emit('connect', toWalletInfo(walletStatus));
      }
    })
    .catch((e) => console.error('TonConnect restore error', e));

  tonConnectUI.onStatusChange((wallet) => {
    walletStatus = wallet;
    if (!wallet || wallet.status !== 'connected') {
      emit('disconnect', null);
      emit('statusChange', null);
      return;
    }
    const info = toWalletInfo(wallet);
    emit('connect', info);
    emit('statusChange', info);
  });
}

function toWalletInfo(wallet) {
  if (!wallet || wallet.status !== 'connected') return null;
  const address = wallet.account.address;
  const addressShort =
    address.slice(0, 4) + '…' + address.slice(address.length - 4, address.length);
  return {
    address,
    addressShort,
    chain: wallet.account.chain
  };
}

export async function requestWalletConnection() {
  if (!tonConnectUI) {
    showToast('Wallet SDK not ready', 'error');
    return;
  }
  try {
    await tonConnectUI.openModal();
  } catch (e) {
    console.error(e);
    showToast('Failed to open wallet modal', 'error');
  }
}

export async function sendTonTransaction({ to, amountTon, payload }) {
  if (!tonConnectUI) {
    throw new Error('Wallet not initialized');
  }
  const nanoAmount = BigInt(Math.round(amountTon * 1e9));
  const tx = {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: to,
        amount: nanoAmount.toString(),
        payload: payload || ''
      }
    ]
  };
  await tonConnectUI.sendTransaction(tx);
}