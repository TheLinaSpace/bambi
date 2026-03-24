export function getCatLives(): number {
  const today = new Date().toISOString().split('T')[0]
  const storedDate = localStorage.getItem('catLivesDate')
  if (storedDate !== today) {
    localStorage.setItem('catLives', '9')
    localStorage.setItem('catLivesDate', today)
    return 9
  }
  return Number(localStorage.getItem('catLives') || '9')
}
