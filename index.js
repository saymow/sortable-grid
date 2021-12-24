const settingsBarEl = document.querySelector('.settings-bar');
const toggleBarBtnEl = document.querySelector('[data-id="bar-toggle"]')

toggleBarBtnEl.addEventListener('click', () => {
  settingsBarEl.classList.toggle('shortened')
})