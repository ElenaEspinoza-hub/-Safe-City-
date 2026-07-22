<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getReportById } from '../utils/reportsStore'

const route = useRoute()
const router = useRouter()
const mapContainer = ref(null)

let mapInstance = null
let reportMarker = null

const report = computed(() => getReportById(route.params.id))
const hasCoordinates = computed(() => {
  const lat = Number(report.value?.lat)
  const lng = Number(report.value?.lng)
  return Number.isFinite(lat) && Number.isFinite(lng)
})

const severityLabel = computed(() => {
  const map = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta'
  }

  return map[report.value?.severity] || report.value?.severity || 'Sin definir'
})

const categoryLabel = computed(() => {
  const map = {
    colision: 'Colisión vehicular',
    caida: 'Caída / atropello',
    bloqueo: 'Bloqueo vial',
    otro: 'Otro'
  }

  return map[report.value?.category] || report.value?.category || 'Sin categoría'
})

const markerColor = computed(() => {
  const severity = (report.value?.severity || '').toLowerCase()

  if (severity === 'alta') return '#dc2626'
  if (severity === 'media') return '#facc15'
  if (severity === 'baja') return '#16a34a'

  return '#2563eb'
})

const getReportCoordinates = () => {
  const lat = Number(report.value?.lat)
  const lng = Number(report.value?.lng)

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return [lat, lng]
  }

  return null
}

const renderMap = () => {
  if (!mapContainer.value || !hasCoordinates.value) return

  const coordinates = getReportCoordinates()
  if (!coordinates) return

  if (!mapInstance) {
    mapInstance = L.map(mapContainer.value, {
      zoomControl: false,
      scrollWheelZoom: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapInstance)

    L.control.zoom({ position: 'topright' }).addTo(mapInstance)
  }

  if (reportMarker) {
    reportMarker.remove()
    reportMarker = null
  }

  reportMarker = L.circleMarker(coordinates, {
    radius: 12,
    color: markerColor.value,
    weight: 3,
    fillColor: markerColor.value,
    fillOpacity: 0.85
  })
    .bindPopup(`<strong>${report.value?.title || 'Reporte'}</strong><br>${severityLabel.value}`)
    .addTo(mapInstance)

  mapInstance.setView(coordinates, 14)
}

watch(
  () => report.value?.id,
  () => {
    if (reportMarker) {
      reportMarker.remove()
      reportMarker = null
    }

    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
    }

    renderMap()
  },
  { immediate: true }
)

onMounted(() => {
  renderMap()
})

onBeforeUnmount(() => {
  if (reportMarker) {
    reportMarker.remove()
    reportMarker = null
  }

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

const goBack = () => router.push('/')
</script>

<template>
  <main v-if="report" class="detail-page">
    <section class="detail-card">
      <button class="back-link" type="button" @click="goBack">Volver a la landing</button>

      <div v-if="report.photoDataUrl" class="photo-wrap">
        <img :src="report.photoDataUrl" :alt="report.title" />
      </div>

      <div class="detail-content">
        <p class="eyebrow">Detalle del reporte</p>
        <h1>{{ report.title }}</h1>
        <p class="description">{{ report.description }}</p>

        <div class="meta-grid">
          <article>
            <span>Categoría</span>
            <strong>{{ categoryLabel }}</strong>
          </article>
          <article>
            <span>Gravedad</span>
            <strong>{{ severityLabel }}</strong>
          </article>
          <article>
            <span>Contacto</span>
            <strong>{{ report.contact || 'No proporcionado' }}</strong>
          </article>
          <article>
            <span>Ubicación</span>
            <strong>{{ report.lat && report.lng ? `${report.lat}, ${report.lng}` : 'Sin ubicación' }}</strong>
          </article>
        </div>

        <div class="map-block">
          <div class="map-block__head">
            <h2>Mapa del lugar</h2>
            <p>La ubicación aparece marcada con el color de la severidad.</p>
          </div>
          <div v-if="hasCoordinates" ref="mapContainer" class="map-canvas"></div>
          <div v-else class="map-placeholder">No hay coordenadas disponibles para este reporte.</div>
        </div>
      </div>
    </section>
  </main>

  <main v-else class="detail-page detail-page--empty">
    <section class="detail-card">
      <p class="eyebrow">No se encontró el reporte</p>
      <h1>Este reporte ya no está disponible.</h1>
      <button class="back-link" type="button" @click="goBack">Volver a la landing</button>
    </section>
  </main>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #eef4ff 0%, #f8fbff 100%);
}

.detail-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #eef4ff 0%, #f8fbff 100%);
}

.detail-card {
  width: min(100%, 860px);
  background: #fff;
  border-radius: 1.6rem;
  padding: 1.5rem;
  box-shadow: 0 24px 44px rgba(29, 78, 216, 0.16);
  border: 1px solid #d7e4f9;
}

.back-link {
  border: none;
  background: transparent;
  color: #1d4ed8;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
}

.photo-wrap {
  margin-bottom: 1rem;
}

.photo-wrap img {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 1rem;
  border: 1px solid #d9e5f6;
}

.eyebrow {
  margin: 0 0 0.4rem;
  color: #1d4ed8;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.8rem;
  font-weight: 700;
}

h1 {
  margin: 0 0 0.75rem;
  color: #123269;
}

.map-block {
  margin-top: 1rem;
  border: 1px solid #dbeafe;
  border-radius: 1rem;
  background: #f8fbff;
  padding: 1rem;
}

.map-block__head h2 {
  margin: 0;
  color: #123269;
}

.map-block__head p {
  margin: 0.35rem 0 0;
  color: #57739b;
}

.map-canvas {
  margin-top: 0.9rem;
  height: 280px;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid #d6e4f7;
}

.map-placeholder {
  margin-top: 0.9rem;
  min-height: 220px;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  border: 1px dashed #b8d0eb;
  color: #57739b;
  background: #f1f7ff;
}

.description {
  margin: 0 0 1rem;
  color: #475569;
  line-height: 1.6;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.meta-grid article {
  background: #f8fbff;
  border: 1px solid #dbeafe;
  border-radius: 1rem;
  padding: 0.9rem;
  display: grid;
  gap: 0.25rem;
}

.meta-grid span {
  color: #57739b;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.meta-grid strong {
  color: #0f172a;
}

@media (max-width: 720px) {
  .detail-page {
    padding: 1rem;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
