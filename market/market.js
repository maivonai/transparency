import { renderFilters, DEFAULT_FILTERS, applyFilters } from './filters.js';
import { createGiftCard } from './giftCard.js';
import { openConfirmModal, showToast } from '../ui/modal.js';
import { sendTonTransaction, getCurrentWallet } from '../ton/wallet.js';

const LS_LISTINGS = 'tgifts_market_listings_v1';
const LS_FAVORITES = 'tgifts_market_favorites_v1';
const LS_ACTIVITY = 'tgifts_market_activity_v1';
const LS_OWNED = 'tgifts_market_owned_v1';

// ВСЕ ТОКЕНЫ ОТПРАВЛЯЮТСЯ НА ЭТОТ АДРЕС (ВАШ КОШЕЛЕК)
const MARKET_OWNER_ADDRESS = 'UQDLUQwxUttwdqd4VBOpqAAHwzPH_O7QTCVhCceKuDyh-DKI';

const MOCK_MARKET = [
  {
    id: 45855,
    collection: 'Fresh Socks',
    name: 'Fresh Socks #45855',
    price: 6.89,
    image: 'https://via.placeholder.com/300x240.png?text=Fresh+Socks',
    owner: 'market',
    createdAt: Date.now() - 1000 * 60 * 60 * 6
  },
  {
    id: 11221,
    collection: 'Fresh Socks',
    name: 'Fresh Socks #11221',
    price: 3.4,
    image: 'https://via.placeholder.com/300x240.png?text=Fresh+Socks',
    owner: 'market',
    createdAt: Date.now() - 1000 * 60 * 60 * 24
  },
  {
    id: 90012,
    collection: 'Free Elf',
    name: 'Free Elf #90012',
    price: 12.5,
    image: 'https://via.placeholder.com/300x240.png?text=Free+Elf',
    owner: 'market',
    createdAt: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    id: 90133,
    collection: 'Free Elf',
    name: 'Free Elf #90133',
    price: 9.99,
    image: 'https://via.placeholder.com/300x240.png?text=Free+Elf',
    owner: 'market',
    createdAt: Date.now() - 1000 * 60 * 60 * 12
  }
];

const ALL_COLLECTIONS = ['Fresh Socks', 'Free Elf'];

let CURRENT_FILTERS = { ...DEFAULT_FILTERS };
let CALLBACKS = {
  onBuyCompleted: null,
  onRequestConnect: null
};

export function initMarketPages(root, callbacks) {
  CALLBACKS = { ...CALLBACKS, ...callbacks };
  root.innerHTML = '';

  const marketPage = document.createElement('section');
  marketPage.className = 'page active';
  marketPage.dataset.page = 'market';

  const myGiftsPage = document.createElement('section');
  myGiftsPage.className = 'page';
  myGiftsPage.dataset.page = 'my-gifts';

  const activityPage = document.createElement('section');
  activityPage.className = 'page';
  activityPage.dataset.page = 'activity';

  const auctionsPage = document.createElement('section');
  auctionsPage.className = 'page';
  auctionsPage.dataset.page = 'auctions';

  const leasePage = document.createElement('section');
  leasePage.className = 'page';
  leasePage.dataset.page = 'lease';

  const galleryPage = document.createElement('section');
  galleryPage.className = 'page';
  galleryPage.dataset.page = 'gallery';

  buildMarketPage(marketPage);
  buildMyGiftsPage(myGiftsPage);
  buildActivityPage(activityPage);
  buildPlaceholder(auctionsPage, 'Auctions coming soon');
  buildPlaceholder(leasePage, 'Lease coming soon');
  buildPlaceholder(galleryPage, 'Gallery coming soon');

  root.appendChild(marketPage);
  root.appendChild(auctionsPage);
  root.appendChild(leasePage);
  root.appendChild(myGiftsPage);
  root.appendChild(galleryPage);
  root.appendChild(activityPage);

  refreshOwnedAndActivity();
}

function buildMarketPage(page) {
  const header = document.createElement('div');
  header.className = 'section-header';

  const left = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'section-title';
  title.textContent = 'Market';
  const subtitle = document.createElement('div');
  subtitle.className = 'section-subtitle';
  subtitle.textContent = 'Buy non-upgraded Telegram gifts';
  left.appendChild(title);
  left.appendChild(subtitle);

  const right = document.createElement('div');
  right.innerHTML =
    '<div class="tag-pill"><span>●</span><span>Live offers</span></div>';

  header.appendChild(left);
  header.appendChild(right);

  const filtersRoot = document.createElement('div');
  renderFilters(filtersRoot, {
    collections: ALL_COLLECTIONS,
    onChange: (change) => {
      CURRENT_FILTERS = { ...CURRENT_FILTERS, [change.type]: change.value };
      renderMarketGrid(gridRoot);
    }
  });

  const gridRoot = document.createElement('div');
  gridRoot.className = 'market-grid';
  renderSkeletonGrid(gridRoot);

  page.appendChild(header);
  page.appendChild(filtersRoot);
  page.appendChild(gridRoot);

  setTimeout(() => {
    renderMarketGrid(gridRoot);
  }, 450);
}

function renderSkeletonGrid(root) {
  root.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const card = document.createElement('div');
    card.className = 'gift-card';
    const top = document.createElement('div');
    top.className = 'gift-card-header';
    const s1 = document.createElement('div');
    s1.className = 'skeleton skeleton-text';
    s1.style.width = '60px';
    const s2 = document.createElement('div');
    s2.className = 'skeleton skeleton-circle';
    s2.style.width = '22px';
    s2.style.height = '22px';
    top.appendChild(s1);
    top.appendChild(s2);

    const media = document.createElement('div');
    media.className = 'gift-media skeleton';

    const bottom = document.createElement('div');
    bottom.className = 'gift-body';
    const b1 = document.createElement('div');
    const t1 = document.createElement('div');
    t1.className = 'skeleton skeleton-text';
    t1.style.width = '90px';
    const t2 = document.createElement('div');
    t2.className = 'skeleton skeleton-text';
    t2.style.width = '50px';
    b1.appendChild(t1);
    b1.appendChild(t2);

    const b2 = document.createElement('div');
    const t3 = document.createElement('div');
    t3.className = 'skeleton skeleton-text';
    t3.style.width = '60px';
    b2.appendChild(t3);

    bottom.appendChild(b1);
    bottom.appendChild(b2);

    card.appendChild(top);
    card.appendChild(media);
    card.appendChild(bottom);
    root.appendChild(card);
  }
}

function getAllMarketItems() {
  const customListings = getListingsFromStorage();
  return [...MOCK_MARKET, ...customListings];
}

function getListingsFromStorage() {
  try {
    const raw = localStorage.getItem(LS_LISTINGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error('Listings parse error', e);
    return [];
  }
}

function saveListingsToStorage(listings) {
  localStorage.setItem(LS_LISTINGS, JSON.stringify(listings));
}

function getFavorites() {
  try {
    const raw = localStorage.getItem(LS_FAVORITES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function setFavorites(ids) {
  localStorage.setItem(LS_FAVORITES, JSON.stringify(ids));
}

function getOwned() {
  try {
    const raw = localStorage.getItem(LS_OWNED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function setOwned(list) {
  localStorage.setItem(LS_OWNED, JSON.stringify(list));
}

function getActivity() {
  try {
    const raw = localStorage.getItem(LS_ACTIVITY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function setActivity(list) {
  localStorage.setItem(LS_ACTIVITY, JSON.stringify(list));
}

function renderMarketGrid(root) {
  const allItems = getAllMarketItems();
  const favorites = getFavorites();
  const filtered = applyFilters(allItems, CURRENT_FILTERS);

  root.innerHTML = '';

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML =
      '<div class="empty-state-icon">🛒</div><div>No gifts match filters</div>';
    root.appendChild(empty);
    return;
  }

  filtered.forEach((gift) => {
    const card = createGiftCard(gift, {
      onBuy: () => handleBuy(gift),
      onFavoriteToggle: handleFavoriteToggle,
      isFavorite: favorites.includes(gift.id)
    });
    root.appendChild(card);
  });
}

function handleFavoriteToggle(gift, isFav) {
  const favorites = new Set(getFavorites());
  if (isFav) {
    favorites.add(gift.id);
  } else {
    favorites.delete(gift.id);
  }
  setFavorites(Array.from(favorites));
}

async function handleBuy(gift) {
  const wallet = getCurrentWallet();
  if (!wallet) {
    showToast('Connect wallet to buy gifts', 'error');
    if (CALLBACKS.onRequestConnect) CALLBACKS.onRequestConnect();
    return;
  }

  openConfirmModal({
    title: 'Confirm purchase',
    gift,
    primaryLabel: `Pay ${gift.price.toFixed(2)} TON`,
    onConfirm: async (close) => {
      try {
        await sendTonTransaction({
          to: MARKET_OWNER_ADDRESS, // все TON идут на ваш кошелек
          amountTon: gift.price,
          payload: ''
        });

        addOwnedGift(gift, wallet.address);
        addActivityEntry({
          type: 'buy',
          gift,
          amount: gift.price,
          address: wallet.address
        });

        showToast(`Bought ${gift.name}`, 'success');
        if (CALLBACKS.onBuyCompleted) {
          CALLBACKS.onBuyCompleted();
        }
        close();
        refreshOwnedAndActivity();
      } catch (e) {
        console.error(e);
        showToast('Transaction failed or rejected', 'error');
      }
    }
  });
}

function addOwnedGift(gift, owner) {
  const list = getOwned();
  const exists = list.some((g) => g.id === gift.id);
  if (exists) return;
  list.push({
    ...gift,
    owner,
    acquiredAt: Date.now()
  });
  setOwned(list);
}

function addActivityEntry({ type, gift, amount, address }) {
  const entries = getActivity();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    giftId: gift.id,
    giftName: gift.name,
    collection: gift.collection,
    amount,
    address,
    createdAt: Date.now()
  };
  entries.unshift(entry);
  setActivity(entries.slice(0, 100));
}

function buildMyGiftsPage(page) {
  const header = document.createElement('div');
  header.className = 'section-header';

  const left = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'section-title';
  title.textContent = 'My gifts';
  const subtitle = document.createElement('div');
  subtitle.className = 'section-subtitle';
  subtitle.textContent = 'Owned & listed';
  left.appendChild(title);
  left.appendChild(subtitle);

  header.appendChild(left);
  page.appendChild(header);

  const formCard = document.createElement('div');
  formCard.className = 'form-card';
  formCard.innerHTML = `
    <div class="form-group">
      <label class="form-label">List a gift for sale</label>
      <div class="form-row">
        <input class="form-input" type="number" min="1" placeholder="Gift ID" data-field="giftId" />
        <select class="form-select" data-field="collection">
          <option value="Fresh Socks">Fresh Socks</option>
          <option value="Free Elf">Free Elf</option>
        </select>
      </div>
      <div class="form-row" style="margin-top:6px">
        <input class="form-input" type="number" step="0.01" min="0" placeholder="Price (TON)" data-field="price" />
      </div>
      <div class="form-hint">Listings are stored in your browser (localStorage) for this prototype.</div>
    </div>
    <button class="button-primary" type="button" data-action="submit-listing">
      <span>List for sale</span>
    </button>
  `;

  formCard.querySelector('[data-action="submit-listing"]').addEventListener('click', () => {
    handleCreateListing(formCard);
  });

  const ownedHeader = document.createElement('div');
  ownedHeader.className = 'section-header';
  ownedHeader.style.marginTop = '14px';
  ownedHeader.innerHTML =
    '<div class="section-subtitle">Owned gifts</div><div class="section-subtitle text-muted">Synced locally</div>';

  const grid = document.createElement('div');
  grid.className = 'market-grid';
  grid.dataset.role = 'owned-grid';

  page.appendChild(formCard);
  page.appendChild(ownedHeader);
  page.appendChild(grid);
}

function handleCreateListing(formRoot) {
  const idInput = formRoot.querySelector('[data-field="giftId"]');
  const collSelect = formRoot.querySelector('[data-field="collection"]');
  const priceInput = formRoot.querySelector('[data-field="price"]');

  const id = parseInt(idInput.value, 10);
  const collection = collSelect.value;
  const price = Number(priceInput.value);

  if (Number.isNaN(id) || id <= 0) {
    showToast('Enter valid gift ID', 'error');
    return;
  }
  if (Number.isNaN(price) || price <= 0) {
    showToast('Enter valid price', 'error');
    return;
  }

  const wallet = getCurrentWallet();
  if (!wallet) {
    showToast('Connect wallet to list gifts', 'error');
    if (CALLBACKS.onRequestConnect) CALLBACKS.onRequestConnect();
    return;
  }

  const listings = getListingsFromStorage();
  const gift = {
    id,
    collection,
    name: `${collection} #${id}`,
    price,
    image: `https://via.placeholder.com/300x240.png?text=${encodeURIComponent(collection)}`,
    owner: wallet.address,
    createdAt: Date.now()
  };
  listings.push(gift);
  saveListingsToStorage(listings);
  addActivityEntry({
    type: 'sell',
    gift,
    amount: price,
    address: wallet.address
  });
  addOwnedGift(gift, wallet.address);
  showToast('Listing added to market', 'success');
  idInput.value = '';
  priceInput.value = '';
  refreshOwnedAndActivity();
}

function buildActivityPage(page) {
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML =
    '<div class="section-title">Activity</div><div class="section-subtitle">Marketplace events</div>';
  page.appendChild(header);

  const list = document.createElement('div');
  list.className = 'activity-list';
  list.dataset.role = 'activity-list';
  page.appendChild(list);
}

function buildPlaceholder(page, text) {
  const header = document.createElement('div');
  header.className = 'section-header';
  const title = document.createElement('div');
  title.className = 'section-title';
  title.textContent = text.split(' ')[0];
  const subtitle = document.createElement('div');
  subtitle.className = 'section-subtitle';
  subtitle.textContent = text;
  header.appendChild(title);
  header.appendChild(subtitle);
  page.appendChild(header);

  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.innerHTML = '<div class="empty-state-icon">🔧</div><div>Prototype only</div>';
  page.appendChild(empty);
}

function renderOwnedGrid() {
  const page = document.querySelector('[data-page="my-gifts"]');
  if (!page) return;
  const grid = page.querySelector('[data-role="owned-grid"]');
  if (!grid) return;

  const owned = getOwned();
  grid.innerHTML = '';

  if (!owned.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML =
      '<div class="empty-state-icon">🎁</div><div>No gifts in local wallet</div>';
    grid.appendChild(empty);
    return;
  }

  const favorites = getFavorites();

  owned.forEach((gift) => {
    const card = createGiftCard(gift, {
      onBuy: () => {},
      onFavoriteToggle: handleFavoriteToggle,
      isFavorite: favorites.includes(gift.id)
    });
    grid.appendChild(card);
  });
}

function renderActivityList() {
  const page = document.querySelector('[data-page="activity"]');
  if (!page) return;
  const list = page.querySelector('[data-role="activity-list"]');
  if (!list) return;

  const entries = getActivity();

  list.innerHTML = '';

  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML =
      '<div class="empty-state-icon">📜</div><div>No activity yet</div>';
    list.appendChild(empty);
    return;
  }

  entries.forEach((e) => {
    const item = document.createElement('div');
    item.className = 'activity-item';

    const main = document.createElement('div');
    main.className = 'activity-main';
    const title = document.createElement('div');
    title.className = 'activity-title';
    title.textContent = e.type === 'sell' ? `Listed ${e.giftName}` : `Bought ${e.giftName}`;
    const meta = document.createElement('div');
    meta.className = 'activity-meta';
    const date = new Date(e.createdAt);
    meta.textContent = `${e.collection} • #${e.giftId} • ${date.toLocaleString()}`;
    main.appendChild(title);
    main.appendChild(meta);

    const price = document.createElement('div');
    price.className = 'activity-price';
    price.textContent = `${e.amount.toFixed(2)} TON`;

    item.appendChild(main);
    item.appendChild(price);
    list.appendChild(item);
  });
}

export function refreshOwnedAndActivity() {
  renderOwnedGrid();
  renderActivityList();
}