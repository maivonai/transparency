export function initTelegram() {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) {
    document.body.dataset.theme = 'dark';
    return {
      user: null,
      theme: 'dark'
    };
  }

  try {
    tg.ready();
    tg.expand();
  } catch (e) {
    console.warn('Telegram WebApp not fully ready', e);
  }

  const theme = tg.colorScheme === 'light' ? 'light' : 'dark';
  document.body.dataset.theme = theme;

  const user = (tg.initDataUnsafe && tg.initDataUnsafe.user) || null;

  return {
    user,
    theme
  };
}