// contact.js – Formulario de contacto y FAQs de FIA'O
(function () {
  const form = document.querySelector('form.card');
  const nameInput = document.getElementById('n');
  const emailInput = document.getElementById('e');
  const msgInput = document.getElementById('m');
  const faqs = document.querySelectorAll('details');

  // Mensaje de estado debajo del botón
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.style.marginTop = '0.75rem';
  form.appendChild(status);

  function showStatus(text, ok) {
    status.textContent = text;
    status.style.color = ok ? '#1a7f37' : '#c62828';
  }

  // Desactivamos la validación automática del navegador para usar la nuestra
  form.noValidate = true;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = msgInput.value.trim();

    if (name.length < 2) {
      showStatus('Please enter your name.', false);
      nameInput.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('Please enter a valid email.', false);
      emailInput.focus();
      return;
    }
    if (message.length < 10) {
      showStatus('Your message is too short (at least 10 characters).', false);
      msgInput.focus();
      return;
    }

    // Aquí iría el envío real (a un servidor o servicio de correo)
    showStatus('Thank you, ' + name + '! We received your message.', true);
    form.reset();
  });

  // Borra el mensaje de error cuando la persona empieza a corregir
  [nameInput, emailInput, msgInput].forEach(function (field) {
    field.addEventListener('input', function () {
      status.textContent = '';
    });
  });

  // FAQs: al abrir una pregunta, se cierran las demás
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqs.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();
