// products.js – Inventario de FIA'O: buscar, agregar, editar y eliminar productos
(function () {
  const KEY = 'fiao_products_v1';

  const money = (n) => 'B/. ' + n.toFixed(2);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const normalize = (text) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // ---------- Datos (de ejemplo; se guardan en el navegador) ----------
  function defaults() {
    return [
      { id: 'p1', emoji: '🍚', category: 'Pantry', name: 'Sugar', price: 0.85, stock: 25, unit: 'lb' },
      { id: 'p2', emoji: '🌾', category: 'Pantry', name: 'Rice', price: 0.95, stock: 38, unit: 'lb' },
      { id: 'p3', emoji: '🍞', category: 'Bakery', name: 'White Bread', price: 1.5, stock: 12, unit: 'Unit' },
      { id: 'p4', emoji: '🥤', category: 'Beverages', name: 'Coca Cola 2L', price: 2.1, stock: 20, unit: 'Bottle' },
      { id: 'p5', emoji: '🥚', category: 'Dairy', name: 'Eggs (Dozen)', price: 3.2, stock: 15, unit: 'Pack' }
    ];
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) { /* usamos los datos por defecto */ }
    return defaults();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(products)); } catch (e) { /* ignorar */ }
  }

  let products = load();
  let editingId = null;

  // ---------- Elementos de la página ----------
  const search = document.querySelector('input[type="search"]');
  const grid = document.querySelector('.grid.g4');
  const addCard = grid.querySelector('.card.add');

  const emptyMsg = document.createElement('p');
  emptyMsg.textContent = 'No products found.';
  emptyMsg.style.gridColumn = '1 / -1';
  emptyMsg.hidden = true;
  grid.insertBefore(emptyMsg, addCard);

  // Las pestañas y el enlace "+" usan href="#": evitamos que la página salte arriba
  document.querySelectorAll('.tabs a').forEach((a) =>
    a.addEventListener('click', (e) => e.preventDefault())
  );

  // ---------- Ventana (diálogo) para agregar / editar ----------
  const style = document.createElement('style');
  style.textContent =
    'dialog.pdlg{border:none;border-radius:16px;padding:1.4rem;width:92%;max-width:420px;box-shadow:0 10px 40px rgba(0,0,0,.25)}' +
    'dialog.pdlg::backdrop{background:rgba(0,0,0,.4)}' +
    'dialog.pdlg label{display:block;margin-top:.7rem}' +
    'dialog.pdlg input{width:100%;box-sizing:border-box}' +
    'dialog.pdlg .perr{color:#c62828;min-height:1.2em;margin:.6rem 0 0}' +
    'dialog.pdlg .pbtns{display:flex;gap:.6rem;margin-top:.8rem}';
  document.head.appendChild(style);

  const dialog = document.createElement('dialog');
  dialog.className = 'pdlg';
  dialog.innerHTML =
    '<form id="pform" novalidate>' +
    '<h3 id="ptitle"></h3>' +
    '<label>Name<input name="name"></label>' +
    '<label>Category<input name="category" list="pcats"></label><datalist id="pcats"></datalist>' +
    '<label>Price (B/.)<input name="price" inputmode="decimal"></label>' +
    '<label>Stock<input name="stock" inputmode="decimal"></label>' +
    '<label>Unit<input name="unit" placeholder="lb, Unit, Bottle, Pack…"></label>' +
    '<label>Icon (emoji)<input name="emoji" maxlength="4"></label>' +
    '<p class="perr" role="alert"></p>' +
    '<div class="pbtns"><button type="button" class="btn line" id="pcancel">Cancel</button><button class="send">Save</button></div>' +
    '</form>';
  document.body.appendChild(dialog);

  const form = dialog.querySelector('#pform');
  const errorEl = dialog.querySelector('.perr');
  const title = dialog.querySelector('#ptitle');

  function fillCategories() {
    const cats = new Set(['Pantry', 'Bakery', 'Beverages', 'Dairy']);
    products.forEach((p) => cats.add(p.category));
    const list = dialog.querySelector('#pcats');
    list.innerHTML = '';
    cats.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      list.appendChild(opt);
    });
  }

  function openDialog(product) {
    editingId = product ? product.id : null;
    title.textContent = product ? 'Edit product' : 'Add new product';
    form.name.value = product ? product.name : '';
    form.category.value = product ? product.category : '';
    form.price.value = product ? product.price.toFixed(2) : '';
    form.stock.value = product ? product.stock : '';
    form.unit.value = product ? product.unit : '';
    form.emoji.value = product ? product.emoji : '';
    errorEl.textContent = '';
    fillCategories();
    dialog.showModal();
    form.name.focus();
  }

  const toNumber = (text) => parseFloat(String(text).replace(',', '.'));

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = form.name.value.trim();
    const category = form.category.value.trim() || 'General';
    const price = toNumber(form.price.value);
    const stock = toNumber(form.stock.value);
    const unit = form.unit.value.trim() || 'Unit';
    const emoji = form.emoji.value.trim() || '🛒';

    if (name.length < 2) { errorEl.textContent = 'Enter the product name.'; return form.name.focus(); }
    if (!isFinite(price) || price < 0) { errorEl.textContent = 'Enter a valid price.'; return form.price.focus(); }
    if (!isFinite(stock) || stock < 0) { errorEl.textContent = 'Enter a valid stock amount.'; return form.stock.focus(); }

    const duplicate = products.some(
      (p) => p.id !== editingId && normalize(p.name) === normalize(name)
    );
    if (duplicate) { errorEl.textContent = 'A product with that name already exists.'; return form.name.focus(); }

    const data = { name, category, price: Math.round(price * 100) / 100, stock, unit, emoji };

    if (editingId) {
      const p = products.find((x) => x.id === editingId);
      Object.assign(p, data);
    } else {
      products.push(Object.assign({ id: uid() }, data));
    }

    save();
    dialog.close();
    render();
  });

  dialog.querySelector('#pcancel').addEventListener('click', () => dialog.close());

  // ---------- Dibujar las tarjetas ----------
  function buildCard(p) {
    const card = document.createElement('div');
    card.className = 'card prod';
    card.dataset.id = p.id;

    const top = document.createElement('div');
    top.className = 'top';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.textContent = p.emoji;

    const info = document.createElement('div');
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = p.category;
    const nameEl = document.createElement('b');
    nameEl.textContent = p.name;
    const priceEl = document.createElement('span');
    priceEl.className = 'red-t';
    priceEl.textContent = money(p.price);
    info.append(tag, document.createElement('br'), nameEl, document.createElement('br'), priceEl);

    top.append(thumb, info);

    const stock = document.createElement('div');
    stock.className = 'stock';
    const label = document.createElement('span');
    label.textContent = 'Stock:';
    const qty = document.createElement('b');
    qty.textContent = p.stock + ' ' + p.unit;
    stock.append(label, qty);

    const acts = document.createElement('div');
    acts.className = 'acts';
    const edit = document.createElement('button');
    edit.className = 'btn line';
    edit.textContent = 'Edit';
    edit.dataset.action = 'edit';
    const del = document.createElement('button');
    del.className = 'btn line';
    del.textContent = 'Delete';
    del.dataset.action = 'delete';
    acts.append(edit, del);

    card.append(top, stock, acts);
    return card;
  }

  function render() {
    const query = normalize(search.value.trim());
    grid.querySelectorAll('.card.prod').forEach((c) => c.remove());

    const shown = products.filter(
      (p) => normalize(p.name).includes(query) || normalize(p.category).includes(query)
    );
    shown.forEach((p) => grid.insertBefore(buildCard(p), emptyMsg));
    emptyMsg.hidden = shown.length > 0;
  }

  // ---------- Eventos ----------
  search.addEventListener('input', render);

  addCard.addEventListener('click', function (event) {
    event.preventDefault();
    openDialog(null);
  });

  // Un solo "escuchador" para los botones Edit / Delete de todas las tarjetas
  grid.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = button.closest('.card.prod').dataset.id;
    const product = products.find((p) => p.id === id);

    if (button.dataset.action === 'edit') {
      openDialog(product);
    } else if (confirm('Delete "' + product.name + '" from your inventory?')) {
      products = products.filter((p) => p.id !== id);
      save();
      render();
    }
  });

  render();
})();
