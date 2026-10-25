document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const subject = encodeURIComponent('Portfolio enquiry from ' + name);
  const body = encodeURIComponent('From: ' + name + ' (' + email + ')\\n\\n' + message);
  document.getElementById('formStatus').textContent = 'Opening your email app…';
  window.location.href = 'mailto:hello@example.com?subject=' + subject + '&body=' + body;
});
