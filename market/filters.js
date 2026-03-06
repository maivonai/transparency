export const DEFAULT_FILTERS = {
  collection: 'all',
  sort: 'lowest'
};

export function renderFilters(root, { onChange, collections }) {
  root.innerHTML = '';

  const bar = document.createElement('div');
  bar.className = 'filters-bar';

  // выбор коллекции
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

  // сортировка по цене / новизне
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

  root.appendChild(bar);
}

export function applyFilters(gifts, filters) {
  let res = gifts.slice();

  if (filters.collection && filters.collection !== 'all') {
    res = res.filter((g) => g.collection === filters.collection);
  }

  if (filters.sort === 'newest') {
    res.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else {
    res.sort((a, b) => a.price - b.price);
  }

  return res;
}
