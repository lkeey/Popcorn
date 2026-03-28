import { defineConfig } from 'vite'

// GitHub Pages project site: https://<user>.github.io/<repo>/
// Поменяйте '/Popcorn/', если репозиторий называется иначе.
const pagesBase = '/Popcorn/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? pagesBase : '/',
}))
