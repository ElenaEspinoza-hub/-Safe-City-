<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchReports } from '../utils/reportsStore'

const route = useRoute()
const router = useRouter()

const mapContainer = ref(null)
const report = ref(null)

let mapInstance = null
let reportMarker = null


// Cargar reporte por ID
const loadReport = async () => {
  try {
    const reports = await fetchReports(100)

    report.value = reports.find(
      item => String(item.id) === String(route.params.id)
    )

  } catch (error) {
    console.error('Error cargando reporte:', error)
    report.value = null
  }
}


// Verificar coordenadas
const hasCoordinates = computed(() => {
  const lat = Number(report.value?.lat)
  const lng = Number(report.value?.lng)

  return Number.isFinite(lat) && Number.isFinite(lng)
})


// Traducir gravedad
const severityLabel = computed(() => {

  const levels = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta'
  }

  return levels[report.value?.severity] || 'Sin definir'
})


// Traducir categoría
const categoryLabel = computed(() => {

  const categories = {
    colision: 'Colisión vehicular',
    caida: 'Caída / atropello',
    bloqueo: 'Bloqueo vial',
    otro: 'Otro'
  }

  return categories[report.value?.category] || 'Sin categoría'
})


// Color del marcador
const markerColor = computed(() => {

  if (report.value?.severity === 'alta') {
    return '#dc2626'
  }

  if (report.value?.severity === 'media') {
    return '#facc15'
  }

  if (report.value?.severity === 'baja') {
    return '#16a34a'
  }

  return '#2563eb'
})


// Obtener coordenadas
const getCoordinates = () => {

  const lat = Number(report.value?.lat)
  const lng = Number(report.value?.lng)

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return [lat, lng]
  }

  return null
}


// Crear mapa
const renderMap = () => {

  if (!mapContainer.value || !hasCoordinates.value) {
    return
  }


  const coordinates = getCoordinates()

  if (!coordinates) return


  if (!mapInstance) {

    mapInstance = L.map(mapContainer.value, {
      zoomControl: false,
      scrollWheelZoom: false
    })


    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(mapInstance)


    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance)

  }


  if (reportMarker) {
    reportMarker.remove()
  }


  reportMarker = L.circleMarker(
    coordinates,
    {
      radius: 12,
      color: markerColor.value,
      weight: 3,
      fillColor: markerColor.value,
      fillOpacity: 0.85
    }
  )
  .bindPopup(
    `
    <strong>${report.value?.title || 'Accidente'}</strong>
    <br>
    Gravedad: ${severityLabel.value}
    `
  )
  .addTo(mapInstance)


  mapInstance.setView(coordinates, 14)

}


// Recargar cuando cambia el ID
watch(
  () => route.params.id,
  async () => {

    await loadReport()

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
  {
    immediate: true
  }
)


onMounted(() => {
  renderMap()
})


onBeforeUnmount(() => {

  if (reportMarker) {
    reportMarker.remove()
  }


  if (mapInstance) {
    mapInstance.remove()
  }

})


// Volver al inicio
const goBack = () => {
  router.push('/')
}

</script>
<template>

  <main v-if="report" class="detail-page">

    <section class="detail-card">

      <button
        class="back-link"
        type="button"
        @click="goBack"
      >
        ← Volver al inicio
      </button>


      <div v-if="report.photoDataUrl" class="photo-wrap">

        <img
          :src="report.photoDataUrl"
          :alt="report.title"
        />

      </div>


      <div class="detail-content">

        <p class="eyebrow">
          Detalle del accidente
        </p>


        <h1>
          {{ report.title }}
        </h1>


        <p class="description">
          {{ report.description }}
        </p>



        <div class="meta-grid">


          <article>

            <span>
              Categoría
            </span>

            <strong>
              {{ categoryLabel }}
            </strong>

          </article>



          <article>

            <span>
              Gravedad
            </span>

            <strong>
              {{ severityLabel }}
            </strong>

          </article>



          <article>

            <span>
              Ubicación
            </span>

            <strong>
              {{
                hasCoordinates
                ? `${report.lat}, ${report.lng}`
                : 'Sin ubicación'
              }}
            </strong>

          </article>



          <article>

            <span>
              Fecha
            </span>

            <strong>
              {{
                report.createdAt
                ? new Date(report.createdAt).toLocaleDateString()
                : 'Sin fecha'
              }}
            </strong>

          </article>


        </div>



        <section class="map-block">

          <div class="map-block__head">

            <h2>
              Mapa del accidente
            </h2>

            <p>
              Ubicación registrada del incidente.
            </p>

          </div>



          <div
            v-if="hasCoordinates"
            ref="mapContainer"
            class="map-canvas"
          ></div>



          <div
            v-else
            class="map-placeholder"
          >

            No hay coordenadas disponibles.

          </div>


        </section>


      </div>


    </section>


  </main>



  <main
    v-else
    class="detail-page"
  >

    <section class="detail-card error-card">

      <p class="eyebrow">
        Reporte no encontrado
      </p>


      <h1>
        Este accidente ya no está disponible.
      </h1>


      <button
        class="back-link"
        type="button"
        @click="goBack"
      >
        Volver al inicio
      </button>


    </section>


  </main>


</template>


<style scoped>

:global(body){
  margin:0;
  font-family:'Poppins','Segoe UI',sans-serif;
  background:#f1f5f9;
}


.detail-page{

  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:2rem;

  background:
  linear-gradient(
    135deg,
    #eaf2ff,
    #ffffff
  );

}


.detail-card{

  width:min(100%,900px);
  background:white;

  border-radius:1.5rem;

  padding:1.8rem;

  border:1px solid #dbeafe;

  box-shadow:
  0 20px 45px rgba(37,99,235,.15);

}


.back-link{

  border:none;
  background:none;

  color:#2563eb;

  font-weight:700;

  cursor:pointer;

  margin-bottom:1rem;

}


.photo-wrap img{

  width:100%;

  height:350px;

  object-fit:cover;

  border-radius:1rem;

}
.eyebrow{

  color:#2563eb;

  font-weight:800;

  text-transform:uppercase;

  letter-spacing:.12em;

  margin-bottom:.8rem;

}



h1{

  color:#123269;

  font-size:2rem;

  margin:.5rem 0;

}



.description{

  color:#475569;

  line-height:1.7;

  font-size:1rem;

}



.meta-grid{

  display:grid;

  grid-template-columns:repeat(2,1fr);

  gap:1rem;

  margin-top:1.5rem;

}



.meta-grid article{

  background:#f8fbff;

  border:1px solid #dbeafe;

  border-radius:1rem;

  padding:1rem;

  display:flex;

  flex-direction:column;

  gap:.4rem;

}



.meta-grid span{

  color:#64748b;

  font-size:.8rem;

  font-weight:700;

  text-transform:uppercase;

}



.meta-grid strong{

  color:#0f172a;

}



.map-block{

  margin-top:2rem;

  padding:1rem;

  border-radius:1rem;

  background:#f8fbff;

  border:1px solid #dbeafe;

}



.map-block__head h2{

  margin:0;

  color:#123269;

}



.map-block__head p{

  color:#64748b;

}



.map-canvas{

  width:100%;

  height:320px;

  margin-top:1rem;

  border-radius:1rem;

  overflow:hidden;

}



.map-placeholder{

  height:220px;

  margin-top:1rem;

  display:grid;

  place-items:center;

  border-radius:1rem;

  border:1px dashed #94a3b8;

  color:#64748b;

}



.error-card{

  text-align:center;

}



.error-card h1{

  margin-bottom:1.5rem;

}



@media(max-width:700px){


  .detail-page{

    padding:1rem;

  }


  .detail-card{

    padding:1rem;

  }


  .meta-grid{

    grid-template-columns:1fr;

  }


  .photo-wrap img{

    height:230px;

  }


  h1{

    font-size:1.6rem;

  }


  .map-canvas{

    height:250px;

  }


}

</style>