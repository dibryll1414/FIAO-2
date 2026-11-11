// clients.js – Búsqueda y filtros para la tabla de clientes de FIA'O
(function () {
  const input = document.querySelector('input[type="search"]');
  const chips = document.querySelectorAll('.chip');
  const rows = document.querySelectorAll('tbody tr');
  const tbody = document.querySelector('tbody');

  // Fila que se muestra cuando no hay coincidencias
  const emptyRow = document.createElement('tr');
  emptyRow.innerHTML = '<td colspan="5" style="text-align:center;padding:1.5rem">No clients found.</td>';
  emptyRow.hidden = true;
  tbody.appendChild(emptyRow);

  let activeStatus = 'All';

  // Quita tildes y pasa a minúsculas: "Ramón" coincide con "ramon"
  const normalize = (text) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function applyFilters() {
    const query = normalize(input.value.trim());
    let visible = 0;

    rows.forEach((row) => {
      const name = normalize(row.querySelector('.who b').textContent);
      const phone = row.querySelector('.who small').textContent;
      const status = row.querySelector('.badge').textContent.trim();

      const matchesSearch = name.includes(query) || phone.includes(query);
      const matchesStatus = activeStatus === 'All' || status === activeStatus;
      const show = matchesSearch && matchesStatus;

      row.hidden = !show;
      if (show) visible++;
    });

    emptyRow.hidden = visible > 0;
  }

  // Búsqueda mientras se escribe
  input.addEventListener('input', applyFilters);

  // Clic en los chips de estado
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('on'));
      chip.classList.add('on');
      activeStatus = chip.textContent.trim();
      applyFilters();
    });
  });
})();
