// credit.js – Deudas y pagos de FIA'O
(function () {
  const KEY = 'fiao_credit_v1';
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const money = (n) => 'B/. ' + n.toFixed(2);
  const round2 = (n) => Math.round(n * 100) / 100;

  function todayLabel() {
    const d = new Date();
    return String(d.getDate()).padStart(2, '0') + ' ' + MONTHS[d.getMonth()];
  }

  // ---------- Datos (de ejemplo; cámbialos por los reales) ----------
  function defaultState() {
    return {
      day: new Date().toDateString(),
      customers: {
        'Ramón Batista': {
          debt: 35, limit: 100,
          history: [
            { date: '14 JUL', desc: 'Milk (2)', amount: 8, kind: 'debt', paid: false },
            { date: '09 JUL', desc: 'Detergent', amount: 4.5, kind: 'debt', paid: false },
            { date: '05 JUL', desc: 'Payment received', amount: 20, kind: 'payment', paid: true }
          ]
        },
        'Carlos Gómez': {
          debt: 12.5, limit: 80,
          history: [
            { date: '13 JUL', desc: 'Rice (5 lb)', amount: 12.5, kind: 'debt', paid: false }
          ]
        }
      },
      overview: { outstanding: 480, paymentsToday: 150, withDebt: 18 },
      activity: [
        { name: 'Ramón Batista', text: 'Paid B/. 15.00', when: 'Today' },
        { name: 'Carlos Gómez', text: 'New debt: B/. 12.50', when: 'Yesterday' },
        { name: 'Ana Martínez', text: 'Payment received: B/. 20.00', when: 'Yesterday' }
      ]
    };
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && saved.customers) {
        // Si cambió el día, reiniciamos "Payments today"
        if (saved.day !== new Date().toDateString()) {
          saved.day = new Date().toDateString();
          saved.overview.paymentsToday = 0;
          saved.activity.forEach((a) => { if (a.when === 'Today') a.when = 'Earlier'; });
        }
        return saved;
      }
    } catch (e) { /* si falla, usamos los datos por defecto */ }
    return defaultState();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignorar */ }
  }

  const state = load();

  // ---------- Elementos de la página ----------
  const findCard = (title) =>
    [...document.querySelectorAll('.card')].find((c) => {
      const h = c.querySelector('h3');
      return h && h.textContent.trim() === title;
    });

  const select = document.querySelector('select');
  const customerCard = document.querySelector('.bar').closest('.card');
  const nameEl = customerCard.querySelector('h3');
  const [debtEl, limitEl] = customerCard.querySelectorAll('.mini b');
  const barFill = customerCard.querySelector('.bar i');
  const barText = customerCard.querySelector('.bar').nextElementSibling;

  const historyCard = findCard('Debt history');
  const activityCard = findCard('Recent activity');
  const [outEl, todayEl, withDebtEl] = findCard('Debt overview').querySelectorAll('.mini b');

  const payCard = findCard('Register payment');
  const amountInput = document.getElementById('amt');
  const [partialRadio, fullRadio] = payCard.querySelectorAll('input[type="radio"]');
  const registerBtn = payCard.querySelector('.acts .pill');
  const paidBtn = payCard.querySelector('.acts .btn');

  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.style.marginTop = '0.6rem';
  payCard.appendChild(status);

  function showStatus(text, ok) {
    status.textContent = text;
    status.style.color = ok ? '#1a7f37' : '#c62828';
  }

  const current = () => state.customers[select.value];

  // ---------- Dibujar la pantalla ----------
  function renderHistory(c) {
    historyCard.querySelectorAll('.row').forEach((r) => r.remove());
    c.history.forEach((h) => {
      const row = document.createElement('div');
      row.className = 'row';

      const label = document.createElement('span');
      label.textContent = h.date + ' · ' + h.desc;

      const amount = document.createElement('b');
      if (h.kind === 'payment') {
        amount.textContent = '-' + money(h.amount);
        amount.style.color = 'var(--green)';
      } else {
        amount.textContent = money(h.amount);
        if (!h.paid) amount.className = 'red-t';
      }

      const badge = document.createElement('span');
      badge.className = 'badge ' + (h.paid ? 'ok' : 'pend');
      badge.textContent = h.paid ? 'Paid' : 'Pending';

      row.append(label, amount, badge);
      historyCard.appendChild(row);
    });
  }

  function renderActivity() {
    activityCard.querySelectorAll('.row').forEach((r) => r.remove());
    state.activity.forEach((a) => {
      const row = document.createElement('div');
      row.className = 'row';

      const who = document.createElement('span');
      const small = document.createElement('small');
      small.textContent = a.text;
      who.append(a.name, document.createElement('br'), small);

      const when = document.createElement('small');
      when.textContent = a.when;

      row.append(who, when);
      activityCard.appendChild(row);
    });
  }

  function syncAmountField() {
    const c = current();
    if (fullRadio.checked) {
      amountInput.value = c.debt.toFixed(2);
      amountInput.readOnly = true;
    } else {
      amountInput.readOnly = false;
    }
  }

  function render() {
    const c = current();
    nameEl.textContent = select.value;
    debtEl.textContent = money(c.debt);
    limitEl.textContent = money(c.limit);

    const pct = Math.min(100, Math.round((c.debt / c.limit) * 100));
    barFill.style.width = pct + '%';
    barText.textContent = pct + '% used · Limit: ' + money(c.limit) + (c.debt >= c.limit ? ' · LIMIT REACHED' : '');

    outEl.textContent = money(state.overview.outstanding);
    todayEl.textContent = money(state.overview.paymentsToday);
    withDebtEl.textContent = state.overview.withDebt;

    renderHistory(c);
    renderActivity();
    syncAmountField();
  }

  // ---------- Registrar un pago ----------
  function applyPayment(amount) {
    const name = select.value;
    const c = current();
    const hadDebt = c.debt > 0;

    c.debt = round2(Math.max(0, c.debt - amount));
    c.history.unshift({ date: todayLabel(), desc: 'Payment received', amount: amount, kind: 'payment', paid: true });

    state.overview.outstanding = round2(Math.max(0, state.overview.outstanding - amount));
    state.overview.paymentsToday = round2(state.overview.paymentsToday + amount);

    if (c.debt === 0) {
      c.history.forEach((h) => { if (h.kind === 'debt') h.paid = true; });
      if (hadDebt) state.overview.withDebt = Math.max(0, state.overview.withDebt - 1);
    }

    state.activity.unshift({ name: name, text: 'Paid ' + money(amount), when: 'Today' });
    state.activity = state.activity.slice(0, 5);

    save();
    render();
    showStatus('Payment of ' + money(amount) + ' registered for ' + name + '.', true);
  }

  function parseAmount(text) {
    const clean = text.replace(/B\/\.?/gi, '').replace(',', '.').replace(/[^\d.]/g, '');
    return round2(parseFloat(clean));
  }

  registerBtn.addEventListener('click', function () {
    const c = current();
    if (c.debt <= 0) return showStatus('This customer has no pending debt.', false);

    let amount;
    if (fullRadio.checked) {
      amount = c.debt;
    } else {
      amount = parseAmount(amountInput.value);
      if (!amount || amount <= 0) return showStatus('Enter a valid payment amount.', false);
      if (amount > c.debt) return showStatus('The payment exceeds the debt (' + money(c.debt) + ').', false);
    }
    applyPayment(amount);
    if (!fullRadio.checked) amountInput.value = '';
  });

  paidBtn.addEventListener('click', function () {
    const c = current();
    if (c.debt <= 0) return showStatus('This customer has no pending debt.', false);
    if (confirm('Mark the full debt of ' + money(c.debt) + ' as paid for ' + select.value + '?')) {
      applyPayment(c.debt);
    }
  });

  // ---------- Eventos ----------
  select.addEventListener('change', function () {
    status.textContent = '';
    amountInput.value = '';
    render();
  });

  [partialRadio, fullRadio].forEach((r) =>
    r.addEventListener('change', function () {
      if (!fullRadio.checked) amountInput.value = '';
      status.textContent = '';
      syncAmountField();
    })
  );

  render();
})();
