// reports.js – Reportes de FIA'O: filtros, indicadores, gráfico, desglose, tabla y exportación
(function () {
  const CURRENCY = 'B/. '; // cámbialo a '$' si prefieres
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const STATUS_BY_RANK = ['On Time', 'Pending', 'Overdue'];
  const RANK = { 'On Time': 0, Pending: 1, Overdue: 2 };
  const BADGE = { 'On Time': 'ok', Pending: 'pend', Overdue: 'over' };

  // ---------- Datos de ejemplo (reemplázalos por los reales) ----------
  // [cliente, descripción, monto, fecha, tipo ('credit' | 'payment'), estado]
  const RAW = [
    // Junio (periodo anterior)
    ['Rosa Delgado', 'Monthly pantry order', 60, '2026-06-03', 'credit', 'On Time'],
    ['Maria Gomez', 'Groceries', 38.5, '2026-06-08', 'credit', 'On Time'],
    ['Carlos Mendoza', 'Hardware credit', 95, '2026-06-12', 'credit', 'Pending'],
    ['Luis Herrera', 'Beverages order', 72, '2026-06-15', 'credit', 'On Time'],
    ['Ana Ruiz', 'Bakery stock order', 64, '2026-06-20', 'credit', 'Overdue'],
    ['Ramón Batista', 'Milk & detergent', 28, '2026-06-24', 'credit', 'On Time'],
    ['Rosa Delgado', 'Payment received', 60, '2026-06-10', 'payment'],
    ['Maria Gomez', 'Payment received', 38.5, '2026-06-14', 'payment'],
    ['Luis Herrera', 'Payment received', 72, '2026-06-22', 'payment'],
    ['Ramón Batista', 'Payment received', 20, '2026-06-28', 'payment'],
    // Julio
    ['Maria Gomez', 'Grocery items & supplies', 45, '2026-07-28', 'credit', 'On Time'],
    ['Carlos Mendoza', 'Weekly hardware credit', 120, '2026-07-25', 'credit', 'Pending'],
    ['Ana Ruiz', 'Bakery stock order', 85.5, '2026-07-18', 'credit', 'Overdue'],
    ['Ramón Batista', 'Milk (2)', 8, '2026-07-14', 'credit', 'Pending'],
    ['Ramón Batista', 'Detergent', 4.5, '2026-07-09', 'credit', 'Pending'],
    ['Yolanda Pérez', 'Weekly groceries', 52, '2026-07-06', 'credit', 'On Time'],
    ['Mireya Santos', 'Pantry & drinks', 12, '2026-07-02', 'credit', 'Pending'],
    ['Luis Herrera', 'Beverages order', 90, '2026-07-20', 'credit', 'Overdue'],
    ['Rosa Delgado', 'Monthly pantry order', 66, '2026-07-04', 'credit', 'On Time'],
    ['Yolanda Pérez', 'Payment received', 52, '2026-07-10', 'payment'],
    ['Rosa Delgado', 'Payment received', 66, '2026-07-12', 'payment'],
    ['Ramón Batista', 'Payment received', 20, '2026-07-05', 'payment'],
    ['Maria Gomez', 'Payment received', 45, '2026-07-29', 'payment'],
    ['Mireya Santos', 'Payment received', 15, '2026-07-16', 'payment'],
    ['Carlos Mendoza', 'Payment received', 50, '2026-07-27', 'payment']
  ];

  // ---------- Utilidades ----------
  // Convertimos cada fecha a "número de día" para evitar problemas de zona horaria
  const toDay = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  };
  const shortDate = (day) => {
    const d = new Date(day * 86400000);
    return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate();
  };
  const money = (n) =>
    CURRENCY + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sum = (list, test) => list.filter(test).reduce((total, t) => total + t.amount, 0);

  const txns = RAW.map((r) => ({
    customer: r[0], desc: r[1], amount: r[2], date: r[3],
    day: toDay(r[3]), type: r[4], status: r[5] || null
  }));

  const firstDay = {};
  txns.forEach((t) => {
    if (!(t.customer in firstDay) || t.day < firstDay[t.customer]) firstDay[t.customer] = t.day;
  });
  const names = Object.keys(firstDay).sort((a, b) => a.localeCompare(b));

  // ---------- Elementos de la página ----------
  const filterCard = document.querySelector('main > .card');
  const [startInput, endInput] = filterCard.querySelectorAll('input[type="date"]');
  const select = filterCard.querySelector('select');
  const applyBtn = filterCard.querySelector('button.btn');
  const kpis = document.querySelectorAll('.card.kpi');
  const chart = document.querySelector('.chart');
  const groups = chart.querySelectorAll(':scope > div');
  const chartLabels = chart.nextElementSibling.querySelectorAll('span');
  const brk = document.querySelector('.card.brk');
  const tbody = document.querySelector('tbody');
  const exportPdf = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Export PDF');
  const exportXls = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Export Excel');

  const msg = document.createElement('p');
  msg.setAttribute('role', 'alert');
  msg.style.color = '#c62828';
  msg.style.margin = '.6rem 0 0';
  filterCard.appendChild(msg);

  // ---------- Selector de cliente / estado ----------
  function buildSelect() {
    select.innerHTML = '';
    const all = document.createElement('option');
    all.value = 'all';
    all.textContent = 'All Customers (All Names)';
    select.appendChild(all);

    const byStatus = document.createElement('optgroup');
    byStatus.label = 'By status';
    STATUS_BY_RANK.forEach((s) => {
      const o = document.createElement('option');
      o.value = 'status:' + s;
      o.textContent = 'Status: ' + s;
      byStatus.appendChild(o);
    });
    select.appendChild(byStatus);

    const byName = document.createElement('optgroup');
    byName.label = 'By customer';
    names.forEach((n) => {
      const o = document.createElement('option');
      o.value = 'name:' + n;
      o.textContent = n;
      byName.appendChild(o);
    });
    select.appendChild(byName);
  }

  // Conjunto de clientes permitido según el filtro (null = todos)
  function customerSet(value, start, end) {
    if (value === 'all') return null;
    if (value.indexOf('name:') === 0) return new Set([value.slice(5)]);

    // Estado del cliente = el peor estado de sus créditos en el rango
    const wanted = value.slice(7);
    const worst = {};
    txns.forEach((t) => {
      if (t.day >= start && t.day <= end) {
        const rank = t.type === 'credit' ? RANK[t.status] : 0;
        worst[t.customer] = Math.max(worst[t.customer] || 0, rank);
      }
    });
    const set = new Set();
    Object.keys(worst).forEach((n) => {
      if (STATUS_BY_RANK[worst[n]] === wanted) set.add(n);
    });
    return set;
  }

  const inRange = (a, b, set) =>
    txns.filter((t) => t.day >= a && t.day <= b && (!set || set.has(t.customer)));

  // ---------- Dibujar el reporte ----------
  let lastView = null;

  function delta(cur, prev) {
    if (prev === 0) return cur > 0 ? 'New activity (nothing in previous period)' : 'No activity';
    const pct = ((cur - prev) / prev) * 100;
    return (pct >= 0 ? '↑ +' : '↓ ') + pct.toFixed(1) + '% vs previous period';
  }

  function setKpi(card, value, note) {
    card.querySelector('.big').textContent = value;
    card.querySelector('span').textContent = note;
  }

  function render() {
    msg.textContent = '';
    if (!startInput.value || !endInput.value) {
      msg.textContent = 'Please choose both dates.';
      return;
    }
    const start = toDay(startInput.value);
    const end = toDay(endInput.value);
    if (start > end) {
      msg.textContent = 'The start date must be before the end date.';
      return;
    }

    const len = end - start + 1;
    const set = customerSet(select.value, start, end);
    const cur = inRange(start, end, set);
    const prev = inRange(start - len, start - 1, set);

    const isCredit = (t) => t.type === 'credit';
    const isPayment = (t) => t.type === 'payment';
    const isUnpaid = (t) => t.type === 'credit' && t.status !== 'On Time';

    // Indicadores
    setKpi(kpis[0], money(sum(cur, isCredit)), delta(sum(cur, isCredit), sum(prev, isCredit)));
    setKpi(kpis[1], money(sum(cur, isPayment)), delta(sum(cur, isPayment), sum(prev, isPayment)));

    const overdueCustomers = new Set(cur.filter((t) => t.status === 'Overdue').map((t) => t.customer)).size;
    setKpi(
      kpis[2],
      money(sum(cur, isUnpaid)),
      overdueCustomers + ' account' + (overdueCustomers === 1 ? '' : 's') + ' overdue'
    );

    const customers = new Set(cur.map((t) => t.customer));
    let newCustomers = 0;
    customers.forEach((c) => { if (firstDay[c] >= start) newCustomers++; });
    setKpi(kpis[3], String(customers.size), '+' + newCustomers + ' new in this period');

    // Gráfico: el rango se divide en 4 tramos iguales
    const buckets = [0, 1, 2, 3].map(() => ({ issued: 0, paid: 0, overdue: 0 }));
    cur.forEach((t) => {
      const i = Math.min(3, Math.floor(((t.day - start) * 4) / len));
      if (t.type === 'credit') {
        buckets[i].issued += t.amount;
        if (t.status === 'Overdue') buckets[i].overdue += t.amount;
      } else {
        buckets[i].paid += t.amount;
      }
    });
    const max = Math.max(1, ...buckets.map((b) => Math.max(b.issued, b.paid, b.overdue)));
    const barNames = ['Credit issued', 'Payments received', 'Overdue'];

    groups.forEach((group, i) => {
      const b = buckets[i];
      const values = [b.issued, b.paid, b.overdue];
      group.querySelectorAll('i').forEach((bar, j) => {
        bar.style.height = (values[j] > 0 ? Math.max(3, (values[j] / max) * 100) : 0) + '%';
        bar.title = barNames[j] + ': ' + money(values[j]);
      });

      const bucketStart = start + Math.floor((i * len) / 4);
      const bucketEnd = Math.max(bucketStart, start + Math.floor(((i + 1) * len) / 4) - 1);
      chartLabels[i].textContent =
        bucketStart === bucketEnd ? shortDate(bucketStart) : shortDate(bucketStart) + '–' + shortDate(bucketEnd);
    });

    // Desglose por estado de pago
    const credits = cur.filter(isCredit);
    const totalCredit = sum(credits, () => true);
    const rows = brk.querySelectorAll('p');
    const fills = brk.querySelectorAll('.bar i');
    STATUS_BY_RANK.forEach((status, i) => {
      const amount = sum(credits, (t) => t.status === status);
      const pct = totalCredit ? Math.round((amount / totalCredit) * 100) : 0;
      rows[i].children[0].textContent = status + ' (' + pct + '%)';
      rows[i].children[1].textContent = money(amount);
      fills[i].style.width = pct + '%';
    });

    // Tabla de créditos recientes (los 10 más nuevos)
    tbody.innerHTML = '';
    const recent = credits.slice().sort((a, b) => b.day - a.day).slice(0, 10);
    if (recent.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.style.textAlign = 'center';
      td.textContent = 'No transactions for this selection.';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    recent.forEach((t) => {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      const bold = document.createElement('b');
      bold.textContent = t.customer;
      tdName.appendChild(bold);

      const tdDesc = document.createElement('td');
      tdDesc.textContent = t.desc;

      const tdAmount = document.createElement('td');
      tdAmount.textContent = money(t.amount);

      const tdDate = document.createElement('td');
      tdDate.textContent = t.date;

      const tdStatus = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'badge ' + BADGE[t.status];
      badge.textContent = t.status;
      tdStatus.appendChild(badge);

      tr.append(tdName, tdDesc, tdAmount, tdDate, tdStatus);
      tbody.appendChild(tr);
    });

    lastView = { cur: cur, from: startInput.value, to: endInput.value };
  }

  // ---------- Exportar ----------
  const csvCell = (v) => '"' + String(v).replace(/"/g, '""') + '"';

  function downloadCsv() {
    if (!lastView) return;
    const header = ['Customer', 'Description', 'Type', 'Amount', 'Date', 'Status'];
    const body = lastView.cur
      .slice()
      .sort((a, b) => b.day - a.day)
      .map((t) => [
        t.customer, t.desc, t.type === 'credit' ? 'Credit' : 'Payment',
        t.amount.toFixed(2), t.date, t.status || 'Paid'
      ]);
    const csv = [header].concat(body).map((row) => row.map(csvCell).join(',')).join('\r\n');

    // El BOM (\uFEFF) hace que Excel muestre bien las tildes
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fiao-report-' + lastView.from + '_to_' + lastView.to + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  // ---------- Eventos ----------
  applyBtn.addEventListener('click', render);
  if (exportPdf) exportPdf.addEventListener('click', () => window.print());
  if (exportXls) exportXls.addEventListener('click', downloadCsv);

  buildSelect();
  render();
})();
