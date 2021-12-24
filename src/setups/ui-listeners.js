const settingsBarEl = document.querySelector('.settings-bar')
const toggleBarBtnEl = document.querySelector('[data-id="bar-toggle"]')

export const setupUiListeners = () => {
  toggleBarBtnEl.addEventListener('click', () => {
    settingsBarEl.classList.toggle('shortened')
  })
}