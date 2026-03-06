export function renderNavbar(root, { onTabChange }) {
  root.className = 'bottom-nav';

  const inner = document.createElement('div');
  inner.className = 'bottom-nav-inner';

  const bar = document.createElement('div');
  bar.className = 'bottom-nav-bar';

  const items = [
    { id: 'market', icon: '🛒', label: 'Market' },
    { id: 'my-gifts', icon: '🎁', label: 'My gifts' },
    { id: 'activity', icon: '📜', label: 'Activity' }
  ];

  const itemEls = {};

  items.forEach((item) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'nav-item';
    el.dataset.tab = item.id;

    const icon = document.createElement('div');
    icon.className = 'nav-item-icon';
    icon.textContent = item.icon;

    const label = document.createElement('div');
    label.className = 'nav-item-label';
    label.textContent = item.label;

    el.appendChild(icon);
    el.appendChild(label);

    el.addEventListener('click', () => {
      setActive(item.id);
      if (onTabChange) onTabChange(item.id);
    });

    bar.appendChild(el);
    itemEls[item.id] = el;
  });

  inner.appendChild(bar);
  root.appendChild(inner);

  function setActive(id) {
    Object.values(itemEls).forEach((el) => el.classList.remove('active'));
    if (itemEls[id]) itemEls[id].classList.add('active');
  }

  return { setActive };
}
