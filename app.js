import { initTelegram } from './telegram.js';
import { initWallet, requestWalletConnection, getCurrentWallet } from './ton/wallet.js';
import {
  renderHeader,
  updateBalanceInHeader,
  updateHeaderConnectionState,
  setHeaderUser
} from './ui/header.js';
import { initModalSystem, showToast } from './ui/modal.js';
import { initMarketPages, refreshOwnedAndActivity } from './market/market.js';
import { fetchBalance } from './ton/tonapi.js';

const APP_STATE = {
  user: null,
  theme: 'dark',
  address: null,
  balanceTon: 0
};

function detectThemeFromTelegram() {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return 'dark';
  const scheme = tg.colorScheme || 'dark';
  return scheme === 'light' ? 'light' : 'dark';
}

async function updateWalletBalance(address) {
  if (!address) return;
  try {
    const balanceTon = await fetchBalance(address);
    APP_STATE.balanceTon = balanceTon;
    updateBalanceInHeader(balanceTon);
  } catch (err) {
    console.error('Failed to fetch balance', err);
  }
}

async function bootstrap() {
  const headerRoot = document.getElementById('app-header');
  const mainRoot = document.getElementById('main-content');

  const tgInfo = initTelegram();
  APP_STATE.user = tgInfo.user;
  APP_STATE.theme = tgInfo.theme || detectThemeFromTelegram();
  document.body.dataset.theme = APP_STATE.theme;

  initModalSystem();
  renderHeader(headerRoot, {
    onConnectClick: async () => {
      await requestWalletConnection();
    }
  });

  if (APP_STATE.user) {
    setHeaderUser(APP_STATE.user);
  }

  initMarketPages(mainRoot, {
    onBuyCompleted: async () => {
      const wallet = getCurrentWallet();
      if (wallet && wallet.address) {
        await updateWalletBalance(wallet.address);
      }
    },
    onRequestConnect: async () => {
      await requestWalletConnection();
    }
  });

  initWallet({
    onConnect: async (walletInfo) => {
      APP_STATE.address = walletInfo.address;
      updateHeaderConnectionState(true, walletInfo.addressShort);
      showToast('Wallet connected', 'success');
      await updateWalletBalance(walletInfo.address);
      refreshOwnedAndActivity();
    },
    onDisconnect: () => {
      APP_STATE.address = null;
      APP_STATE.balanceTon = 0;
      updateHeaderConnectionState(false);
      updateBalanceInHeader(0);
      showToast('Wallet disconnected', 'info');
      refreshOwnedAndActivity();
    },
    onStatusChange: async (walletInfo) => {
      APP_STATE.address = walletInfo ? walletInfo.address : null;
      if (walletInfo) {
        updateHeaderConnectionState(true, walletInfo.addressShort);
        await updateWalletBalance(walletInfo.address);
      } else {
        updateHeaderConnectionState(false);
        updateBalanceInHeader(0);
      }
      refreshOwnedAndActivity();
    }
  });

  const wallet = getCurrentWallet();
  if (wallet && wallet.address) {
    APP_STATE.address = wallet.address;
    updateHeaderConnectionState(true, wallet.addressShort);
    await updateWalletBalance(wallet.address);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch((err) => console.error(err));
});
