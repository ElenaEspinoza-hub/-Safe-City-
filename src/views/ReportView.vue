<script setup>
import { computed, nextTick, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/logo.png'
import { addReport } from '../utils/reportsStore'
import { insforge } from '../utils/insforgeClient'

const router = useRouter()

const locationState = ref('Pendiente')
const locationError = ref('')
const isLocating = ref(false)
const isSaving = ref(false)
const isReviewingImage = ref(false)
const savedMessage = ref('')
const cameraError = ref('')
const imageReviewMessage = ref('')
const isStartingCamera = ref(false)
const isCameraOpen = ref(false)
const capturedPhoto = ref('')
const cameraVideo = ref(null)
const cameraCanvas = ref(null)
let cameraStream = null

const form = reactive({
  title: '',
  category: 'colision',
  severity: 'media',
  description: '',
  contact: '',
  lat: '',
  lng: '',
  consent: false,
  photoDataUrl: ''
})

const categories = [
  { value: 'colision', label: 'Colision vehicular' },
  { value: 'caida', label: 'Caida / atropello' },
  { value: 'bloqueo', label: 'Bloqueo vial' },
  { value: 'otro', label: 'Otro' }
]

const severityLevels = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' }
]

const isValidEmailOrPhone = (value) => {
  if (!value) return true
  return /\S+@\S+\.\S+/.test(value) || /^[0-9+\-()\s]{6,}$/.test(value)
}

const formErrors = computed(() => {
  const errors = {}

  if (!form.title.trim()) errors.title = 'Agrega un titulo corto.'
  else if (form.title.trim().length > 45) errors.title = 'El titulo permite un maximo de 45 caracteres.'
  if (!form.description.trim()) errors.description = 'Describe lo que paso.'
  else if (form.description.trim().length < 20) errors.description = 'Explica con mas detalle.'
  else if (form.description.trim().length > 150) errors.description = 'La descripcion permite un maximo de 150 caracteres.'
  if (form.contact && !isValidEmailOrPhone(form.contact)) errors.contact = 'Ingresa un contacto valido.'
  if (!form.lat || !form.lng) errors.location = 'Necesitas registrar tu ubicacion.'
  if (!form.consent) errors.consent = 'Debes confirmar que la informacion es correcta.'

  return errors
})

const canSubmit = computed(() => Object.keys(formErrors.value).length === 0)
const coordLabel = computed(() => {
  if (form.lat && form.lng) return `${form.lat}, ${form.lng}`
  return 'Sin ubicacion capturada'
})

const mapEmbedUrl = computed(() => {
  if (!form.lat || !form.lng) return ''

  const lat = Number(form.lat)
  const lng = Number(form.lng)

  if (Number.isNaN(lat) || Number.isNaN(lng)) return ''

  const delta = 0.005
  const left = (lng - delta).toFixed(6)
  const right = (lng + delta).toFixed(6)
  const top = (lat + delta).toFixed(6)
  const bottom = (lat - delta).toFixed(6)

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`
})

const captureLocation = () => {
  locationError.value = ''
  savedMessage.value = ''

  if (!navigator.geolocation) {
    locationError.value = 'Tu navegador no soporta geolocalizacion.'
    return
  }

  isLocating.value = true
  locationState.value = 'Buscando ubicacion...'

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.lat = position.coords.latitude.toFixed(6)
      form.lng = position.coords.longitude.toFixed(6)
      locationState.value = 'Ubicacion capturada'
      isLocating.value = false
    },
    (error) => {
      locationState.value = 'No se pudo obtener la ubicacion'
      locationError.value = error.message || 'Activa el permiso de ubicacion para continuar.'
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const stopCamera = () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop())
    cameraStream = null
  }
  isCameraOpen.value = false
}

const startCamera = async () => {
  cameraError.value = ''
  savedMessage.value = ''

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraError.value = 'Tu navegador no permite acceder a la camara.'
    return
  }

  isStartingCamera.value = true

  try {
    stopCamera()
    isCameraOpen.value = true
    await nextTick()

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    })

    if (!cameraVideo.value) {
      throw new Error('No se pudo inicializar la vista previa de camara.')
    }

    cameraVideo.value.srcObject = cameraStream
    cameraVideo.value.muted = true
    await cameraVideo.value.play()
  } catch (error) {
    if (error?.name === 'NotAllowedError') {
      cameraError.value = 'Permiso de camara denegado. Habilitalo en el navegador.'
    } else if (error?.name === 'NotFoundError') {
      cameraError.value = 'No se detecto una camara disponible en este dispositivo.'
    } else if (error?.name === 'NotReadableError') {
      cameraError.value = 'La camara esta en uso por otra aplicacion.'
    } else {
      cameraError.value = error?.message || 'No se pudo abrir la camara. Verifica permisos.'
    }
    stopCamera()
  } finally {
    isStartingCamera.value = false
  }
}

const takePhoto = () => {
  cameraError.value = ''

  if (!cameraVideo.value || !cameraCanvas.value) {
    cameraError.value = 'No se pudo tomar la fotografia.'
    return
  }

  const width = cameraVideo.value.videoWidth
  const height = cameraVideo.value.videoHeight

  if (!width || !height) {
    cameraError.value = 'Espera un momento para capturar la imagen.'
    return
  }

  cameraCanvas.value.width = width
  cameraCanvas.value.height = height
  const ctx = cameraCanvas.value.getContext('2d')
  ctx.drawImage(cameraVideo.value, 0, 0, width, height)

  const photo = cameraCanvas.value.toDataURL('image/jpeg', 0.9)
  capturedPhoto.value = photo
  form.photoDataUrl = photo
  stopCamera()
}

const retakePhoto = async () => {
  capturedPhoto.value = ''
  form.photoDataUrl = ''
  imageReviewMessage.value = ''
  await startCamera()
}

const pixelateImage = (dataUrl) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')

    if (!context) {
      reject(new Error('No se pudo proteger la fotografía.'))
      return
    }

    const pixelSize = Math.max(12, Math.round(Math.min(canvas.width, canvas.height) / 38))
    const reducedWidth = Math.max(1, Math.floor(canvas.width / pixelSize))
    const reducedHeight = Math.max(1, Math.floor(canvas.height / pixelSize))
    const reducedCanvas = document.createElement('canvas')
    reducedCanvas.width = reducedWidth
    reducedCanvas.height = reducedHeight
    const reducedContext = reducedCanvas.getContext('2d')

    if (!reducedContext) {
      reject(new Error('No se pudo proteger la fotografía.'))
      return
    }

    reducedContext.drawImage(image, 0, 0, reducedWidth, reducedHeight)
    context.imageSmoothingEnabled = false
    context.drawImage(reducedCanvas, 0, 0, reducedWidth, reducedHeight, 0, 0, canvas.width, canvas.height)
    resolve(canvas.toDataURL('image/jpeg', 0.85))
  }
  image.onerror = () => reject(new Error('No se pudo leer la fotografía.'))
  image.src = dataUrl
})

const reviewPhoto = async () => {
  if (!form.photoDataUrl) return

  isReviewingImage.value = true
  imageReviewMessage.value = 'La IA está revisando la fotografía…'

  try {
    const { data, error } = await insforge.functions.invoke('review-report-image', {
      body: {
        imageDataUrl: form.photoDataUrl,
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim()
      }
    })
    const review = data?.data ?? data

    if (error) throw error
    if (!review?.matchesReport) {
      throw new Error(review?.reason || 'La fotografía no parece corresponder al accidente descrito. Toma otra foto para enviar el reporte.')
    }

    if (review.isGraphic) {
      const protectedPhoto = await pixelateImage(form.photoDataUrl)
      capturedPhoto.value = protectedPhoto
      form.photoDataUrl = protectedPhoto
      imageReviewMessage.value = 'La fotografía contenía material sensible y fue pixelada para proteger a los usuarios.'
    } else {
      imageReviewMessage.value = 'Fotografía verificada por la IA.'
    }
  } finally {
    isReviewingImage.value = false
  }
}

const goBack = () => {
  router.push('/')
}

const submitReport = async () => {
  savedMessage.value = ''
  imageReviewMessage.value = ''

  if (!canSubmit.value) return

  isSaving.value = true

  try {
    await reviewPhoto()
    await addReport({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      contact: form.contact.trim(),
      createdAt: new Date().toISOString()
    })

    savedMessage.value = 'Reporte registrado correctamente.'
    router.push('/')
  } catch (error) {
    savedMessage.value = error.message || 'No se pudo registrar el reporte. Intenta de nuevo.'
  } finally {
    isSaving.value = false
  }
}

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <main class="report-page">
    <section class="hero-panel">
      <div class="hero-panel__content">
        <button class="back-link" type="button" @click="goBack" style="font-size: 20px; text-decoration: none;">Volver al inicio</button>
        <img class="brand-logo" :src="logoImage" alt="Logo Safe City" />
        <p class="eyebrow">Reporte rapido con ubicacion</p>
        <h1>Registra un accidente con una captura precisa del lugar</h1>
        <p class="lead">
          Usa esta pantalla para documentar el incidente, adjuntar una ubicacion y dejar listo el reporte para su seguimiento.
        </p>

        <div class="hero-stats">
          <article>
            <strong>1</strong>
            <span>captura de ubicacion</span>
          </article>
          <article>
            <strong>3</strong>
            <span>niveles de gravedad</span>
          </article>
          <article>
            <strong>24/7</strong>
            <span>monitoreo urbano</span>
          </article>
        </div>

      </div>
    </section>

    <section class="form-panel">
      <form class="report-form" @submit.prevent="submitReport">
        <div class="section-head">
          <span class="section-number">01</span>
          <div>
            <h2>Datos del reporte</h2>
            <p>Describe el incidente con claridad. La ubicacion se captura antes de enviar.</p>
          </div>
        </div>

        <div class="grid-2">
          <label>
            Titulo del incidente
            <input v-model.trim="form.title" type="text" maxlength="45" placeholder="Ej. choque en avenida principal" />
            <small v-if="formErrors.title" class="error">{{ formErrors.title }}</small>
          </label>

          <label>
            Categoria
            <select v-model="form.category">
              <option v-for="category in categories" :key="category.value" :value="category.value">
                {{ category.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="grid-2">
          <label>
            Gravedad
            <div class="choice-row">
              <button
                v-for="level in severityLevels"
                :key="level.value"
                type="button"
                class="choice-pill"
                :class="{ 'is-active': form.severity === level.value }"
                @click="form.severity = level.value"
              >
                {{ level.label }}
              </button>
            </div>
          </label>

          <label>
            Contacto opcional
            <input v-model.trim="form.contact" type="text" placeholder="Telefono o correo" />
            <small v-if="formErrors.contact" class="error">{{ formErrors.contact }}</small>
          </label>
        </div>

        <label>
          Descripcion
          <textarea
            v-model.trim="form.description"
            rows="5"
            maxlength="150"
            placeholder="Cuenta que sucedio, cuantos vehiculos participaron y si hay heridos..."
          />
          <small v-if="formErrors.description" class="error">{{ formErrors.description }}</small>
        </label>

        <div class="location-card">
          <div>
            <p class="location-label">Ubicacion actual</p>
            <strong>{{ coordLabel }}</strong>
            <small>{{ locationState }}</small>
            <small v-if="locationError" class="error">{{ locationError }}</small>
          </div>
          <button class="capture-btn" type="button" :disabled="isLocating" @click="captureLocation">
            {{ isLocating ? 'Obteniendo...' : 'Obtener mi ubicacion' }}
          </button>
        </div>

        <div class="mini-map-card">
          <div class="mini-map-card__head">
            <p class="location-label">Vista rapida del punto</p>
            <small v-if="form.lat && form.lng">Mapa centrado en la ubicacion capturada</small>
            <small v-else>Primero captura la ubicacion para mostrar el mapa</small>
          </div>

          <div v-if="mapEmbedUrl" class="mini-map-frame">
            <iframe :src="mapEmbedUrl" title="Mapa de ubicacion del accidente" loading="lazy"></iframe>
          </div>

          <div v-else class="mini-map-placeholder">
            <strong>Mapa pendiente</strong>
            <p>Cuando pulses "Obtener mi ubicacion", aqui aparecera una vista previa del lugar.</p>
          </div>
        </div>

        <div class="grid-2 grid-2--tight">
          <label>
            Latitud
            <input v-model="form.lat" type="text" readonly placeholder="Se completa automaticamente" />
          </label>

          <label>
            Longitud
            <input v-model="form.lng" type="text" readonly placeholder="Se completa automaticamente" />
          </label>
        </div>

        <div class="camera-card">
          <div class="camera-card__head">
            <div>
              <p class="location-label">Evidencia fotografica</p>
              <strong>{{ capturedPhoto ? 'Fotografia lista para el reporte' : 'Captura una foto del accidente' }}</strong>
            </div>

            <div class="camera-actions">
            <button v-if="!isCameraOpen" class="capture-btn" type="button" :disabled="isStartingCamera || isSaving" @click="startCamera">
                {{ isStartingCamera ? 'Abriendo camara...' : 'Abrir camara' }}
              </button>
              <button v-else class="secondary-btn" type="button" @click="stopCamera">Cerrar camara</button>
            </div>
          </div>

          <div v-if="isCameraOpen" class="camera-preview">
            <video ref="cameraVideo" autoplay playsinline muted></video>
            <button class="primary-btn" type="button" @click="takePhoto">Tomar fotografia</button>
          </div>

          <div v-else-if="capturedPhoto" class="photo-result">
            <img :src="capturedPhoto" alt="Fotografia capturada para el reporte" />
            <button class="secondary-btn" type="button" :disabled="isSaving" @click="retakePhoto">Tomar otra foto</button>
          </div>

          <small v-if="cameraError" class="error">{{ cameraError }}</small>
          <small v-if="imageReviewMessage" :class="imageReviewMessage.includes('pixelada') ? 'review-warning' : 'review-message'">{{ imageReviewMessage }}</small>
          <canvas ref="cameraCanvas" class="camera-canvas"></canvas>
        </div>

        <label class="consent-row">
          <input v-model="form.consent" type="checkbox" />
          <span>Confirmo que la informacion es correcta y que deseo registrar este reporte.</span>
        </label>
        <small v-if="formErrors.consent" class="error">{{ formErrors.consent }}</small>

        <p v-if="savedMessage" :class="savedMessage.includes('correctamente') ? 'success' : 'error-message'">{{ savedMessage }}</p>

        <div class="actions-row">
          <button class="secondary-btn" type="button" @click="goBack">Cancelar</button>
          <button class="primary-btn" type="submit" :disabled="isSaving || !canSubmit">
            {{ isReviewingImage ? 'Revisando fotografía...' : isSaving ? 'Registrando...' : 'Registrar reporte' }}
          </button>
        </div>
      </form>
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
  background: #f2f6fc;
  color: #0f172a;
}

.report-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  background: linear-gradient(135deg, #e5efff 0%, #f6faff 45%, #d7e5ff 100%);
}

.hero-panel {
  position: relative;
  overflow: hidden;
  padding: 3.5rem 2.5rem;
  display: flex;
  align-items: center;
  border-right: 1px solid #ccdcf4;
}

.hero-panel::before {
  content: '';
  position: absolute;
  inset: 1.6rem;
  border-radius: 2rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(229, 239, 255, 0.78));
  border: 1px solid #c8d9f3;
}

.hero-panel__content {
  position: relative;
  z-index: 1;
  max-width: 560px;
  display: grid;
  gap: 1.1rem;
  padding: 2.2rem 0;
}

.brand-logo {
  width: 110px;
  height: auto;
}

.eyebrow {
  margin: 0;
  color: #1d4ed8;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.78rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(2.1rem, 4.2vw, 4rem);
  line-height: 1;
  color: #10346f;
  max-width: 13ch;
}

.lead {
  margin: 0;
  font-size: 1rem;
  line-height: 1.68;
  color: #425a7f;
  max-width: 44ch;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 0.75rem;
}

.hero-stats article {
  padding: 0.9rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid #d9e5f6;
  display: grid;
  gap: 0.3rem;
}

.hero-stats strong {
  font-size: 1.45rem;
  color: #1e40af;
}

.hero-stats span {
  color: #5e7394;
  font-size: 0.88rem;
  line-height: 1.3;
}

.back-link {
  border-radius: 10px;
  width: fit-content;
  border: none;
  background: #1d4ed8;
  color: white;
  font-weight: 700;
  padding: 10px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.form-panel {
  padding: 2rem;
  display: grid;
  place-items: center;
}

.report-form {
  width: min(100%, 780px);
  display: grid;
  gap: 1rem;
  padding: 1.45rem;
  border-radius: 1.8rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #ccdbf3;
  box-shadow: 0 24px 44px rgba(29, 78, 216, 0.16);
}

.section-head {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  padding-bottom: 0.25rem;
}

.section-number {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.9rem;
  background: #1d4ed8;
  color: #fff;
  font-weight: 800;
}

.section-head h2 {
  margin: 0;
  color: #123269;
}

.section-head p {
  margin: 0.25rem 0 0;
  color: #5e7394;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.grid-2--tight {
  margin-top: -0.15rem;
}

label {
  display: grid;
  gap: 0.45rem;
  color: #1f3352;
  font-weight: 600;
}

input,
select,
textarea {
  border: 1px solid #cbd8ec;
  border-radius: 1rem;
  background: #f8fbff;
  color: #0f172a;
  padding: 0.85rem 0.95rem;
  font: inherit;
}

input::placeholder,
textarea::placeholder {
  color: #8aa0bf;
}

input:focus,
select:focus,
textarea:focus,
button:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

textarea {
  resize: vertical;
  min-height: 130px;
}

.error {
  color: #b91c1c;
  font-size: 0.82rem;
  font-weight: 500;
}

.review-message,
.review-warning {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
}

.review-message {
  color: #166534;
}

.review-warning {
  color: #a16207;
}

.success {
  margin: 0;
  color: #0f9f6e;
  font-weight: 700;
}

.error-message {
  margin: 0;
  color: #b91c1c;
  font-weight: 700;
}

.choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.choice-pill {
  border: 1px solid #cfdbec;
  background: #f4f8ff;
  color: #2a3f63;
  border-radius: 999px;
  padding: 0.55rem 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.choice-pill.is-active {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #ffffff;
}

.location-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #e9f2ff, #f7fbff);
  border: 1px solid #ccdbf3;
}

.location-card strong,
.location-label {
  display: block;
}

.location-label {
  margin-bottom: 0.25rem;
  color: #57739b;
  font-size: 0.86rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.location-card small {
  display: block;
  margin-top: 0.2rem;
  color: #587097;
}

.mini-map-card {
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #e9f2ff, #f7fbff);
  border: 1px solid #ccdbf3;
}

.mini-map-card__head {
  display: grid;
  gap: 0.15rem;
}

.mini-map-card__head small {
  color: #587097;
}

.mini-map-frame {
  border-radius: 0.95rem;
  overflow: hidden;
  border: 1px solid #c6d6ef;
  background: #e2edff;
}

.mini-map-frame iframe {
  width: 100%;
  height: 230px;
  border: 0;
}

.mini-map-placeholder {
  min-height: 165px;
  border-radius: 0.95rem;
  border: 1px dashed #b9ceeb;
  background: #f4f8ff;
  display: grid;
  place-content: center;
  text-align: center;
  padding: 0.95rem;
  color: #4c678f;
}

.mini-map-placeholder strong {
  color: #1c3f84;
}

.mini-map-placeholder p {
  margin: 0.35rem 0 0;
  max-width: 40ch;
}

.camera-card {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #e9f2ff, #f7fbff);
  border: 1px solid #ccdbf3;
}

.camera-card__head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.camera-actions {
  display: flex;
  gap: 0.6rem;
}

.camera-preview {
  display: grid;
  gap: 0.75rem;
}

.camera-preview video,
.photo-result img {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 0.95rem;
  border: 1px solid #cbd8ec;
  background: #dbeafe;
}

.photo-result {
  display: grid;
  gap: 0.75rem;
  justify-items: flex-start;
}

.camera-canvas {
  display: none;
}

.capture-btn,
.primary-btn,
.secondary-btn {
  border-radius: 999px;
  padding: 0.8rem 1.1rem;
  border: none;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.capture-btn:hover,
.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-1px);
}

.capture-btn {
  background: #1e40af;
  color: #ffffff;
}

.capture-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.2rem;
}

.secondary-btn {
  background: #ffffff;
  color: #1e40af;
  border: 1px solid #bfd0e8;
}

.primary-btn {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  color: #ffffff;
  box-shadow: 0 14px 26px rgba(29, 78, 216, 0.22);
}

.primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 1100px) {
  .report-page {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    min-height: auto;
  }

  .hero-panel::before {
    inset: 0.75rem;
  }
}

@media (max-width: 720px) {
  .form-panel,
  .hero-panel {
    padding: 1rem;
  }

  .report-form {
    padding: 1rem;
  }

  .grid-2,
  .hero-stats {
    grid-template-columns: 1fr;
  }

  .location-card,
  .camera-card__head,
  .actions-row {
    flex-direction: column;
    align-items: stretch;
  }

  .capture-btn,
  .primary-btn,
  .secondary-btn {
    width: 100%;
  }

  .camera-actions {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .section-head {
    flex-direction: column;
    gap: 0.65rem;
  }

  .section-number {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.75rem;
  }

  .hero-panel__content {
    gap: 0.75rem;
  }

  .hero-stats article {
    padding: 0.75rem;
  }
}
</style>
