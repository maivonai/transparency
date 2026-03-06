export function createGiftCard(gift, { onBuy, onFavoriteToggle, isFavorite }) {
  const card = document.createElement('div');
  card.className = 'gift-card';

  const header = document.createElement('div');
  header.className = 'gift-card-header';

  const col = document.createElement('div');
  col.className = 'gift-collection';
  col.textContent = gift.collection;
  header.appendChild(col);

  const favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'gift-favorite';
  if (isFavorite) favBtn.classList.add('active');
  favBtn.innerHTML = isFavorite ? '❤' : '♡';
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nowFav = !favBtn.classList.contains('active');
    favBtn.classList.toggle('active', nowFav);
    favBtn.innerHTML = nowFav ? '❤' : '♡';
    onFavoriteToggle(gift, nowFav);
  });
  header.appendChild(favBtn);

  card.appendChild(header);

  const media = document.createElement('div');
  media.className = 'gift-media';

  if (gift.image) {
    const img = document.createElement('img');
    img.src = gift.image;
    img.alt = gift.name;
    media.appendChild(img);
  } else {
    const label = document.createElement('div');
    label.style.fontSize = '32px';
    label.textContent = '🎁';
    media.appendChild(label);
  }

  const chip = document.createElement('div');
  chip.className = 'gift-label-chip';
  chip.innerHTML = `<span class="gift-label-dot"></span><span>Gift #${gift.id}</span>`;
  media.appendChild(chip);

  card.appendChild(media);

  const body = document.createElement('div');
  body.className = 'gift-body';

  const textCol = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'gift-title';
  title.textContent = gift.name;
  const id = document.createElement('div');
  id.className = 'gift-id';
  id.textContent = `#${gift.id}`;
  textCol.appendChild(title);
  textCol.appendChild(id);

  const priceCol = document.createElement('div');
  priceCol.className = 'gift-price';
  const main = document.createElement('div');
  main.className = 'gift-price-main';
  main.textContent = `${gift.price.toFixed(2)} TON`;
  const secondary = document.createElement('div');
  secondary.className = 'gift-price-secondary';
  secondary.textContent = 'Non-upgraded';
  priceCol.appendChild(main);
  priceCol.appendChild(secondary);

  body.appendChild(textCol);
  body.appendChild(priceCol);
  card.appendChild(body);

  const actions = document.createElement('div');
  actions.className = 'gift-actions';

  const buyBtn = document.createElement('button');
  buyBtn.type = 'button';
  buyBtn.className = 'gift-buy-button';
  buyBtn.innerHTML = `<span>Buy</span><span>›</span>`;
  buyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onBuy(gift);
  });

  const moreBtn = document.createElement('button');
  moreBtn.type = 'button';
  moreBtn.className = 'gift-more-button';
  moreBtn.textContent = '⋯';

  actions.appendChild(buyBtn);
  actions.appendChild(moreBtn);
  card.appendChild(actions);

  return card;
}