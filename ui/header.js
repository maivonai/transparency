export function renderHeader(root, { onConnectClick }) {
  root.className = 'app-header';

  const left = document.createElement('div');
  left.className = 'header-left';
  left.innerHTML = `
    <div class="brand-pill">
      <div class="brand-dot"></div>
      <div class="brand-text">Gifts Market</div>
    </div>
    <div class="network-pill">
      <div class="network-dot"></div>
      <div class="network-text">TON Mainnet</div>
    </div>
  `;

  const center = document.createElement('div');
  center.className = 'header-center';
  center.innerHTML = `
    <div class="balance-label">Balance</div>
    <div class="balance-row">
      <div class="header-ton-icon">T</div>
      <div class="balance-value" id="wallet-balance">0.000<span>TON</span></div>
      <div class="header-balance-actions">
        <button class="header-icon-button" type="button" aria-label="Receive">+</button>
        <button class="header-icon-button secondary" type="button" aria-label="Send">−</button>
      </div>
    </div>
  `;

  const right = document.createElement('div');
  right.className = 'header-right';

  const connectBtn = document.createElement('button');
  connectBtn.type = 'button';
  connectBtn.className = 'connect-button';
  connectBtn.id = 'connect-wallet-btn';
  connectBtn.innerHTML = '<span class="icon">🟦</span><span class="label">Connect</span>';
  connectBtn.addEventListener('click', () => {
    onConnectClick();
  });

  const avatar = document.createElement('div');
  avatar.className = 'user-avatar';
  avatar.id = 'user-avatar';
  avatar.textContent = '?';

  right.appendChild(connectBtn);
  right.appendChild(avatar);

  root.appendChild(left);
  root.appendChild(center);
  root.appendChild(right);
}

export function updateBalanceInHeader(balanceTon) {
  const el = document.getElementById('wallet-balance');
  if (!el) return;
  const formatted = (balanceTon || 0).toFixed(3);
  el.innerHTML = `${formatted}<span>TON</span>`;
}

export function updateHeaderConnectionState(isConnected, shortAddress) {
  const btn = document.getElementById('connect-wallet-btn');
  if (!btn) return;
  const label = btn.querySelector('.label');
  const icon = btn.querySelector('.icon');

  if (isConnected) {
    btn.classList.add('connected');
    if (label) label.textContent = shortAddress || 'Connected';
    if (icon) icon.textContent = '✓';
  } else {
    btn.classList.remove('connected');
    if (label) label.textContent = 'Connect';
    if (icon) icon.textContent = '🟦';
  }
}

export function setHeaderUser(user) {
  const avatar = document.getElementById('user-avatar');
  if (!avatar || !user) return;

  if (user.photo_url) {
    avatar.innerHTML = '';
    const img = document.createElement('img');
    img.src = user.photo_url;
    img.alt = user.username || 'User';
    avatar.appendChild(img);
    return;
  }

  const initials = (user.first_name || '?')
    .slice(0, 1)
    .toUpperCase();
  avatar.textContent = initials;
}