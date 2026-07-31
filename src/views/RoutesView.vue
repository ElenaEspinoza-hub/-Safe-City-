<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchNearbyReports } from '../utils/reportsStore'

const router = useRouter()
const mapContainer = ref(null)
const mapReady = ref(false)
const mapInitError = ref('')
const isLocatingUser = ref(false)
const isLoadingIncidents = ref(false)
const locateMessage = ref('')
const liveCount = ref(0)
const santaAnaCenter = { lat: 13.9948, lng: -89.5597 }

const incidents = ref([])

const visibleIncidents = computed(() => incidents.value.slice(0, 5))

let mapInstance = null
let userMarker = null
const incidentMarkers = []

const severityClass = (severity) => ['alta', 'media', 'baja'].includes(String(severity).toLowerCase()) ? String(severity).toLowerCase() : 'media'
const formatDistance = (distanceKm) => distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`
const formatReportedTime = (createdAt) => {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Hora no disponible'

  return new Intl.DateTimeFormat('es-SV', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

const formatReportedDate = (createdAt) => {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'

  return new Intl.DateTimeFormat('es-SV', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const getIncidentIcon = (severity) =>
  L.divIcon({
    className: 'car-marker-wrapper',
    html: `<div class="car-marker car-marker--${severityClass(
      severity
    )}">
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <path d="M13 36h38c2.2 0 4 1.8 4 4v7h-5a8 8 0 0 0-16 0H30a8 8 0 0 0-16 0H9v-7c0-2.2 1.8-4 4-4Z" fill="currentColor" />
        <path d="M17 25.5c.6-1.6 2.1-2.7 3.8-2.7h22.4c1.7 0 3.2 1.1 3.8 2.7l2.8 7.5H14.2l2.8-7.5Z" fill="currentColor" />
        <circle cx="22" cy="47" r="5.6" fill="#0f172a" />
        <circle cx="42" cy="47" r="5.6" fill="#0f172a" />
        <rect x="23" y="27" width="8.7" height="4.8" rx="1" fill="#dbeafe" />
        <rect x="32.3" y="27" width="8.7" height="4.8" rx="1" fill="#dbeafe" />
      </svg>
    </div>`,
    iconSize: [60, 60],
    iconAnchor: [30, 50],
    popupAnchor: [0, -43]
  })

const goBack = () => {
  router.push('/')
}

const clearIncidentMarkers = () => {
  incidentMarkers.forEach((marker) => marker.remove())
  incidentMarkers.length = 0
}

const refreshIncidentMarkers = () => {
  clearIncidentMarkers()
  incidents.value.forEach((incident) => addIncidentMarker(incident))
}

const addIncidentMarker = (incident) => {
  if (!mapInstance) return

  const popupHtml = `
    <div class="popup-card">
      <strong>${incident.title}</strong>
      <small>Reportado el ${formatReportedDate(incident.createdAt)} a las ${formatReportedTime(incident.createdAt)}</small>
      <span>${incident.severity} · ${incident.status}</span>
    </div>
  `

  const marker = L.marker([Number(incident.lat), Number(incident.lng)], {
    icon: getIncidentIcon(incident.severity)
  })
    .bindPopup(popupHtml)
    .addTo(mapInstance)

  incidentMarkers.push(marker)
}

const locateUser = (centerMap = false) => {
  locateMessage.value = ''

  if (!navigator.geolocation) {
    locateMessage.value = 'Tu navegador no soporta geolocalizacion.'
    return
  }

  isLocatingUser.value = true

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      if (!mapInstance) {
        isLocatingUser.value = false
        return
      }

      const latLng = [position.coords.latitude, position.coords.longitude]
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      if (userMarker) {
        userMarker.remove()
      }

      userMarker = L.circleMarker(latLng, {
        radius: 9,
        color: '#15803d',
        weight: 3,
        fillColor: '#22c55e',
        fillOpacity: 0.95
      })
        .bindPopup('Tu ubicacion actual')
        .addTo(mapInstance)

      if (centerMap) mapInstance.flyTo(latLng, 14, { duration: 0.9 })

      isLoadingIncidents.value = true
      try {
        incidents.value = await fetchNearbyReports(userLocation, { radiusKm: 12 })
        refreshIncidentMarkers()
        liveCount.value += 1
        locateMessage.value = incidents.value.length
          ? `${incidents.value.length} accidente(s) encontrado(s) cerca de ti.`
          : 'No hay accidentes reportados en un radio de 12 km.'
      } catch (error) {
        incidents.value = []
        refreshIncidentMarkers()
        locateMessage.value = error.message || 'No se pudieron cargar los accidentes cercanos.'
      } finally {
        isLoadingIncidents.value = false
      }
      isLocatingUser.value = false
    },
    (error) => {
      locateMessage.value = error.message || 'No se pudo obtener tu ubicacion.'
      isLocatingUser.value = false
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  )
}

const centerOnUser = () => {
  if (!mapInstance) return
  locateUser(true)
}

onMounted(() => {
  try {
    mapInstance = L.map(mapContainer.value, {
      center: [santaAnaCenter.lat, santaAnaCenter.lng],
      zoom: 13,
      zoomControl: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapInstance)

    L.control.zoom({ position: 'topright' }).addTo(mapInstance)

    mapReady.value = true
    locateUser(true)
  } catch (error) {
    mapInitError.value = 'No se pudo inicializar el mapa.'
  }

})

onBeforeUnmount(() => {
  clearIncidentMarkers()

  if (userMarker) {
    userMarker.remove()
    userMarker = null
  }

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<template>
  <main class="routes-page">
    <aside class="routes-panel">
      <div class="brand-block">
         <button class="back-link" type="button" @click="goBack" style="font-size: 15px; text-decoration: none;">Volver al inicio</button>
        <p class="eyebrow">Rutas seguras en tiempo real</p>
        <h1>Mapa operativo de accidentes</h1>
        <p class="lead">
          Visualiza reportes activos, revisa zonas de riesgo y sigue el pulso de la ciudad con una capa viva de incidentes.
        </p>
      </div>

      <div class="status-grid">
        <article>
          <span>Incidentes visibles</span>
          <strong>{{ incidents.length }}</strong>
        </article>
        <article>
          <span>Consultas</span>
          <strong>{{ liveCount }}</strong>
        </article>
        <article>
          <span>Estado del mapa</span>
          <strong>{{ mapReady ? 'Activo' : 'Cargando' }}</strong>
        </article>
      </div>

      <div v-if="mapInitError" class="warning-box">
        {{ mapInitError }}
      </div>

      <div v-else class="mini-map-note">
        El mapa muestra accidentes registrados en la base de datos dentro de un radio de 12 km de tu ubicacion.
      </div>

      <div class="location-tools">
        <button type="button" :disabled="isLocatingUser || isLoadingIncidents || !mapReady" @click="centerOnUser">
          {{ isLocatingUser || isLoadingIncidents ? 'Buscando accidentes...' : 'Actualizar mi ubicacion' }}
        </button>
        <small v-if="locateMessage">{{ locateMessage }}</small>
      </div>

      <div class="incident-list">
        <header>
          <h2>Incidentes recientes</h2>
          <button type="button" @click="goBack">Volver</button>
        </header>

        <article v-for="incident in visibleIncidents" :key="incident.id" class="incident-item">
          <div>
            <h3>{{ incident.title }}</h3>
            <small class="report-time">Reportado: {{ formatReportedDate(incident.createdAt) }}, {{ formatReportedTime(incident.createdAt) }}</small>
            <p>{{ Number(incident.lat).toFixed(4) }}, {{ Number(incident.lng).toFixed(4) }} · {{ formatDistance(incident.distanceKm) }}</p>
          </div>
          <span :class="`badge badge--${severityClass(incident.severity)}`">{{ incident.severity }}</span>
        </article>
      </div>
    </aside>

    <section class="map-shell">
      <div ref="mapContainer" class="map-canvas" />
      <div v-if="mapInitError" class="map-fallback">
        <h2>Error al cargar el mapa</h2>
        <p>Verifica tu conexion a internet para cargar los mosaicos de OpenStreetMap.</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #040b14;
  color: #eff6ff;
}

.routes-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 390px 1fr;
  background:
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 28%),
    linear-gradient(135deg, #040b14 0%, #0d1728 54%, #06111d 100%);
}

.routes-panel {
  padding: 1.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 1rem;
  align-content: start;
}

.brand-block {
  padding: 1.2rem;
  border-radius: 1.4rem;
  background: linear-gradient(180deg, rgba(14, 22, 35, 0.95), rgba(7, 15, 28, 0.84));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.eyebrow {
  margin: 0 0 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #67e8f9;
  font-size: 0.74rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.15rem);
  line-height: 0.98;
}

.lead {
  margin: 0.9rem 0 0;
  color: #b8c6d8;
  line-height: 1.65;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.status-grid article {
  padding: 0.95rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.status-grid span {
  display: block;
  color: #92a5bd;
  font-size: 0.8rem;
}

.status-grid strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.2rem;
  color: #fff;
}

.warning-box,
.mini-map-note {
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  line-height: 1.55;
}

.location-tools {
  display: grid;
  gap: 0.35rem;
}

.location-tools button {
  border: 1px solid rgba(103, 232, 249, 0.45);
  background: rgba(14, 165, 233, 0.14);
  color: #d7f5ff;
  border-radius: 0.8rem;
  padding: 0.6rem 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.location-tools button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.location-tools small {
  color: #b8d7ef;
}

.warning-box {
  background: rgba(251, 146, 60, 0.14);
  border: 1px solid rgba(251, 146, 60, 0.3);
  color: #ffd7b7;
}

.mini-map-note {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.22);
  color: #c6f6d5;
}

.incident-list {
  display: grid;
  gap: 0.7rem;
}

.incident-list header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.incident-list h2 {
  margin: 0;
  font-size: 1.08rem;
  color: #f8fbff;
}

.incident-list header button {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #fff;
  border-radius: 999px;
  padding: 0.55rem 0.8rem;
  cursor: pointer;
}

.incident-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.incident-item h3 {
  margin: 0;
  font-size: 0.98rem;
  color: #f1f5ff;
}

.report-time {
  display: block;
  margin-top: 0.3rem;
  color: #8fd3ff;
  font-size: 0.78rem;
  font-weight: 700;
}

.incident-item p {
  margin: 0.25rem 0 0;
  color: #bed0e8;
  font-size: 0.84rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
}

.badge--alta {
  background: rgba(248, 113, 113, 0.18);
  color: #fecaca;
}

.badge--media {
  background: rgba(250, 204, 21, 0.18);
  color: #fde68a;
}

.badge--baja {
  background: rgba(74, 222, 128, 0.18);
  color: #bbf7d0;
}

.map-shell {
  position: relative;
}

.map-canvas {
  width: 100%;
  height: 100vh;
  height: 100dvh;
}

.map-fallback {
  position: absolute;
  inset: 1rem;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.75rem;
  text-align: center;
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(4, 11, 20, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.map-fallback code {
  color: #67e8f9;
}

:global(.car-marker-wrapper) {
  background: transparent;
  border: 0;
}

:global(.car-marker) {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.85);
  display: grid;
  place-items: center;
  box-shadow: 0 20px 36px rgba(0, 0, 0, 0.45);
}

:global(.car-marker svg) {
  width: 48px;
  height: 48px;
}

:global(.car-marker--alta) {
  background: radial-gradient(circle at 30% 25%, #fca5a5, #dc2626 70%);
  color: #b91c1c;
}

:global(.car-marker--media) {
  background: radial-gradient(circle at 30% 25%, #fde68a, #d97706 70%);
  color: #b45309;
}

:global(.car-marker--baja) {
  background: radial-gradient(circle at 30% 25%, #bbf7d0, #16a34a 70%);
  color: #15803d;
}

:global(.popup-card) {
  display: grid;
  gap: 0.2rem;
  color: #f8fbff;
}

:global(.popup-card strong) {
  font-size: 0.95rem;
}

:global(.popup-card small) {
  color: #8fd3ff;
  font-size: 0.78rem;
}

:global(.popup-card span) {
  font-size: 0.82rem;
  color: #cbdaf0;
}

:deep(.leaflet-popup-content-wrapper) {
  background: #10233f;
  color: #f8fbff;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0.75rem;
  box-shadow: 0 10px 24px rgba(2, 10, 24, 0.35);
}

.back-link {
  border-radius: 10px;
  width: fit-content;
  border: none;
  background: #16254d;
  color: white;
  font-weight: 700;
  padding: 10px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
:deep(.leaflet-popup-tip) {
  background: #10233f;
}

:deep(.leaflet-popup-content) {
  margin: 0.65rem 0.75rem;
}

:deep(.leaflet-control-zoom a) {
  background: #10233f;
  color: #e6f0ff;
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

:deep(.leaflet-control-zoom a:hover) {
  background: #15315a;
}

@media (max-width: 1240px) {
  .status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1000px) {
  .routes-page {
    grid-template-columns: 1fr;
  }

  .map-canvas {
    height: 56vh;
  }
}

@media (max-width: 640px) {
  .routes-panel {
    padding: 1rem;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .incident-item,
  .incident-list header {
    flex-direction: column;
    align-items: stretch;
  }

  .map-canvas {
    height: 52vh;
  }

  .map-fallback {
    inset: 0.65rem;
    padding: 1.2rem;
  }
}
</style>
