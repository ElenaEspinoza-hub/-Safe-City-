<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchReportsPage } from '../utils/reportsStore'

const PAGE_SIZE = 10
const router = useRouter()
const reports = ref([])
const search = ref('')
const hasMore = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
let searchTimer = null
let requestId = 0

const loadReports = async ({ append = false } = {}) => {
  const currentRequest = ++requestId
  isLoading.value = true
  errorMessage.value = ''

  try {
    const page = await fetchReportsPage({
      offset: append ? reports.value.length : 0,
      limit: PAGE_SIZE,
      search: search.value
    })

    if (currentRequest !== requestId) return
    reports.value = append ? [...reports.value, ...page.reports] : page.reports
    hasMore.value = page.hasMore
  } catch (error) {
    if (currentRequest === requestId) {
      errorMessage.value = error.message || 'No se pudieron cargar los accidentes.'
      if (!append) reports.value = []
    }
  } finally {
    if (currentRequest === requestId) isLoading.value = false
  }
}

const handleSearchInput = () => {
  // maxlength protege el campo visual; este corte cubre pegados o cambios programáticos.
  search.value = search.value.slice(0, 70)
}

const clearSearch = () => {
  search.value = ''
}

const openReportDetail = (reportId) => router.push({ name: 'report-detail', params: { id: reportId } })

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadReports(), 250)
})

onMounted(() => loadReports())
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <main class="news-page">
    <header class="news-header">
      <div class="news-header__inner">
        <RouterLink to="/" class="brand" aria-label="Volver al inicio">Safe <span>City</span></RouterLink>
        <RouterLink to="/" class="back-link">Volver al inicio</RouterLink>
      </div>
    </header>

    <section class="news-content" aria-labelledby="news-title">
      <div class="news-intro">
        <p class="eyebrow">Reportes ciudadanos</p>
        <h1 id="news-title">Accidentes reportados</h1>
        <p>Consulta los accidentes más recientes o busca por tipo de accidente.</p>
      </div>

      <label class="search-box">
        <span class="sr-only">Buscar tipo de accidente</span>
        <input v-model="search" type="search" maxlength="70" placeholder="Buscar por tipo de accidente" @input="handleSearchInput" />
        <button v-if="search" type="button" aria-label="Limpiar búsqueda" @click="clearSearch">Limpiar</button>
      </label>
      <small class="search-help">Máximo 70 caracteres.</small>

      <p v-if="errorMessage" class="message message--error">{{ errorMessage }}</p>
      <p v-else-if="isLoading && !reports.length" class="message">Cargando accidentes...</p>

      <div v-if="reports.length" class="recent-grid" :aria-busy="isLoading">
        <article v-for="report in reports" :key="report.id" class="recent-card">
          <img :src="report.photoDataUrl || '/landing/accidente1.webp'" :alt="report.title" />
          <div class="recent-card__body">
            <h2>{{ report.title }}</h2>
            <p>{{ report.description }}</p>
            <button type="button" @click="openReportDetail(report.id)">Ver detalles</button>
          </div>
        </article>
      </div>

      <p v-else-if="!isLoading && !errorMessage" class="message">No hay accidentes que coincidan con la búsqueda.</p>

      <div v-if="hasMore" class="load-more">
        <button type="button" :disabled="isLoading" @click="loadReports({ append: true })">
          {{ isLoading ? 'Cargando...' : 'Ver más' }}
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(body) { margin: 0; font-family: 'Poppins', 'Segoe UI', sans-serif; background: #f1f5f9; }
.news-page { min-height: 100vh; color: #0f172a; background: linear-gradient(180deg, #f1f5f9, #eef5ff); }
.news-header { background: #102d75; box-shadow: 0 10px 24px rgba(21, 22, 24, .3); }
.news-header__inner { max-width: 1200px; min-height: 72px; margin: 0 auto; padding: 0 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.brand { color: #fff; font-size: 1.65rem; font-weight: 800; text-decoration: none; }.brand span { color: #60a5fa; }
.back-link { color: #fff; font-weight: 600; text-decoration: none; }.back-link:hover { color: #93c5fd; }
.news-content { max-width: 1200px; margin: 0 auto; padding: 3.5rem 1.5rem 4.5rem; }
.news-intro { text-align: center; margin-bottom: 1.5rem; }.eyebrow { margin: 0 0 .35rem; color: #2563eb; font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
h1 { margin: 0; color: #12327c; font-size: clamp(2rem, 4vw, 2.8rem); }.news-intro > p:last-child { color: #475569; margin: .65rem 0 0; }
.search-box { width: min(100%, 680px); margin: 0 auto; padding: .35rem; display: flex; gap: .5rem; border: 1px solid #bfdbfe; border-radius: .9rem; background: #fff; box-shadow: 0 8px 20px rgba(30, 64, 175, .1); }
.search-box input { min-width: 0; flex: 1; border: 0; outline: 0; padding: .65rem .8rem; font: inherit; color: #0f172a; }.search-box input:focus-visible { outline: 2px solid #60a5fa; outline-offset: 2px; }
.search-box button, .load-more button { border: 0; border-radius: .7rem; background: #1d4ed8; color: #fff; padding: 0 .95rem; font-weight: 700; cursor: pointer; }.search-box button:hover, .load-more button:hover { background: #1e40af; }
.search-help { display: block; max-width: 680px; margin: .45rem auto 1.8rem; color: #64748b; font-size: .8rem; }
.recent-grid { display: grid; gap: 1.1rem; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: stretch; }.recent-card { overflow: hidden; border: 1px solid #dbeafe; border-radius: 1rem; background: #fff; box-shadow: 0 10px 24px rgba(30, 58, 138, .12); transition: transform .2s ease, box-shadow .2s ease; }.recent-card:hover { transform: translateY(-4px); box-shadow: 0 16px 28px rgba(30, 58, 138, .18); }.recent-card img { width: 100%; height: 240px; object-fit: cover; }.recent-card__body { display: flex; flex-direction: column; min-height: 205px; padding: 1.05rem; background: linear-gradient(180deg, #fff, #f8fbff); }.recent-card h2 { margin: 0; color: #11306c; font-size: 1.45rem; }.recent-card p { margin: .8rem 0 1rem; color: #334155; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }.recent-card button { align-self: flex-start; min-height: 44px; margin-top: auto; padding: 0 1rem; border: 0; border-radius: .75rem; background: #1d4ed8; color: #fff; font-weight: 700; cursor: pointer; }
.message { margin: 2rem 0; text-align: center; color: #475569; }.message--error { color: #b91c1c; }.load-more { display: flex; justify-content: center; margin-top: 2rem; }.load-more button { min-height: 46px; padding: 0 1.3rem; }.load-more button:disabled { cursor: wait; opacity: .7; }.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 800px) { .recent-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .news-content { padding: 2.5rem 1rem 3rem; }.recent-grid { grid-template-columns: 1fr; }.news-header__inner { min-height: 64px; }.back-link { font-size: .9rem; }.search-box { align-items: stretch; flex-direction: column; }.search-box button { min-height: 42px; } }
</style>
