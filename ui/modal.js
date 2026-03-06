let modalRoot = null;
let toastRoot = null;

export function initModalSystem() {
  modalRoot = document.getElementById('modal-root');
  toastRoot = document.getElementById('toast-container');
}

export function openConfirmModal({ title, gift, primaryLabel, onConfirm }) {
  if (!modalRoot) return;

  closeModal();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const sheet = document.createElement('div');
  sheet.className = 'modal-sheet';

  const header = document.createElement('div');
  header.className = 'modal-header';
  const titleEl = document.createElement('div');
  titleEl.className = 'modal-title';
  titleEl.textContent = title;
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', () => closeModal());

  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'modal-body';

  const giftInfo = document.createElement('div');
  giftInfo.className = 'form-card';
  giftInfo.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;">
      <div style="width:52px;height:52px;border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#ffce73,#ff718a);flex-shrink:0;">
        ${
          gift.image
            ? `<img src="${gift.image}" alt="${gift.name}" style="width:100%;height:100%;object-fit:cover;" />`
            : '<div style="font-size:28px;display:flex;align-items:center;justify-content:center;height:100%;">🎁</div>'
        }
      </div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;">${gift.name}</div>
        <div style="font-size:12px;opacity:0.7;">${gift.collection} • #${gift.id}</div>
        <div style="font-size:13px;margin-top:4px;">
          <span class="text-accent">${gift.price.toFixed(2)} TON</span>
        </div>
      </div>
    </div>
  `;

  body.appendChild(giftInfo);
  body.appendChild(document.createElement('div'));

  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'button-secondary';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', () => closeModal());

  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.className = 'button-primary';
  confirm.textContent = primaryLabel || 'Confirm';
  confirm.addEventListener('click', async () => {
    if (!onConfirm) {
      closeModal();
      return;
    }
    confirm.disabled = true;
    confirm.textContent = 'Processing…';
    try {
      await onConfirm(() => closeModal());
    } finally {
      confirm.disabled = false;
      confirm.textContent = primaryLabel || 'Confirm';
    }
  });

  footer.appendChild(cancel);
  footer.appendChild(confirm);

  sheet.appendChild(header);
  sheet.appendChild(body);
  sheet.appendChild(footer);
  backdrop.appendChild(sheet);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeModal();
    }
  });

  modalRoot.appendChild(backdrop);
}

export function closeModal() {
  if (!modalRoot) return;
  modalRoot.innerHTML = '';
}

export function showToast(message, type = 'info') {
  if (!toastRoot) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'success') toast.classList.add('toast-success');
  if (type === 'error') toast.classList.add('toast-error');

  const icon = document.createElement('div');
  icon.className = 'toast-icon';

  if (type === 'success') icon.textContent = '✅';
  else if (type === 'error') icon.textContent = '⚠️';
  else icon.textContent = 'ℹ️';

  const msg = document.createElement('div');
  msg.className = 'toast-message';
  msg.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(msg);

  toastRoot.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(4px)';
    setTimeout(() => {
      toast.remove();
    }, 200);
  }, 2600);
}