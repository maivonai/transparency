export const DEFAULT_FILTERS = {
  collection: 'all',
  sort: 'lowest',
  searchId: '',
  maxPrice: ''
};

export function renderFilters(root, { onChange, collections }) {
  root.innerHTML = '';

  const bar = document.createElement('div');
  bar.className = 'filters-bar';

  const collectionSelectWrap = document.createElement('div');
  collectionSelectWrap.className = 'filter-select';

  const collectionSelect = document.createElement('select');
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All collections';
  collectionSelect.appendChild(allOption);

  collections.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    collectionSelect.appendChild(opt);
  });

  collectionSelect.addEventListener('change', () => {
    onChange({
      type: 'collection',
      value: collectionSelect.value
    });
  });

  collectionSelectWrap.appendChild(collectionSelect);
  bar.appendChild(collectionSelectWrap);

  const sortChip = document.createElement('button');
  sortChip.type = 'button';
  sortChip.className = 'filter-chip active';
  sortChip.dataset.sortDirection = 'lowest';
  sortChip.innerHTML = '<span>Lowest price</span>';
  sortChip.addEventListener('click', () => {
    const next = sortChip.dataset.sortDirection === 'lowest' ? 'newest' : 'lowest';
    sortChip.dataset.sortDirection = next;
    sortChip.innerHTML = `<span>${next === 'lowest' ? 'Lowest price' : 'Newest'}</span>`;
    onChange({
      type: 'sort',
      value: next
    });
  });
  bar.appendChild(sortChip);

  const idChip = document.createElement('button');
  idChip.type = 'button';
  idChip.className = 'filter-chip';
  idChip.innerHTML = '<span># ID</span>';
  idChip.addEventListener('click', () => {
    const id = window.prompt('Filter by gift ID (exact):');
    onChange({
      type: 'id',
      value: id || ''
    });
  });
  bar.appendChild(idChip);

  const priceChip = document.createElement('button');
  priceChip.type = 'button';
  priceChip.className = 'filter-chip';
  priceChip.innerHTML = '<span>Max price</span>';
  priceChip.addEventListener('click', () => {
    const price = window.prompt('Max price in TON:');
    onChange({
      type: 'maxPrice',
      value: price || ''
    });
  });
  bar.appendChild(priceChip);

  root.appendChild(bar);
}

export function applyFilters(gifts, filters) {
  let res = gifts.slice();

  if (filters.collection && filters.collection !== 'all') {
    res = res.filter((g) => g.collection === filters.collection);
  }

  if (filters.searchId) {
    const idNum = parseInt(filters.searchId, 10);
    if (!Number.isNaN(idNum)) {
      res = res.filter((g) => g.id === idNum);
    }
  }

  if (filters.maxPrice) {
    const max = Number(filters.maxPrice);
    if (!Number.isNaN(max) && max > 0) {
      res = res.filter((g) => g.price <= max);
    }
  }

  if (filters.sort === 'newest') {
    res.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else {
    res.sort((a, b) => a.price - b.price);
  }

  return res;
}