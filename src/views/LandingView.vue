<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/logo.png'
import { getReports } from '../utils/reportsStore'
import { authLoading, authUser, signOut } from '../utils/authStore'

const router = useRouter()
const isMenuOpen = ref(false)
const slideIndex = ref(0)
const reports = ref([])

const currentYear = computed(() => new Date().getFullYear())

const loadReports = () => {
  reports.value = getReports().slice(0, 3)
}

const accidentCards = [
  {
    title: 'Choque multiple',
    description: 'Accidente reportado en la carretera principal de Santa Ana.',
    image: '/landing/accidente1.webp'
  },
  {
    title: 'Derrumbe',
    description: 'La carretera permanece bloqueada por las fuertes lluvias.',
    image: '/landing/derrumbe-carretera-los-chorros-9.jpg'
  },
  {
    title: 'Colision urbana',
    description: 'Dos vehiculos chocaron en una interseccion importante.',
    image: '/landing/colision-urbana.jpg'
  }
]

const newsSlides = [
  {
    title: 'Accidente en Los Chorros',
    description: 'Se reporta trafico debido a un derrumbe. Utiliza rutas alternas.',
    image: '/landing/accidente-en-los-chorros.jpg'
  },
  {
    title: 'Nueva Ruta Segura',
    description: 'Safe City recomienda nuevas rutas para evitar congestionamientos.',
    image: '/landing/accidente-nuevas-rutas.webp'
  },
  {
    title: 'Alerta por lluvias',
    description: 'Conduce con precaucion y evita zonas propensas a inundaciones.',
    image: '/landing/lluvias-accidentes.jpeg'
  }
]

let autoSlideTimer = null

const openLogin = () => router.push('/auth')
const openRegister = () => router.push('/register')
const openReport = () => router.push('/reportar')
const openMap = () => router.push('/mapa')
const openProfile = () => router.push('/perfil')
const openReportDetail = (reportId) => router.push({ name: 'report-detail', params: { id: reportId } })

const isSigningOut = ref(false)
const signOutError = ref('')

const handleSignOut = async () => {
  if (isSigningOut.value) return

  isSigningOut.value = true
  signOutError.value = ''
  const { error, auditError } = await signOut()
  isSigningOut.value = false

  if (error) {
    signOutError.value = 'No se pudo cerrar la sesion. Intenta de nuevo.'
    return
  }

  if (auditError) {
    console.warn('El cierre de sesion se completo, pero no se pudo registrar el evento.', auditError)
  }

  closeMenu()
  router.push('/')
}

const nextSlide = () => {
  slideIndex.value = (slideIndex.value + 1) % newsSlides.length
}

const previousSlide = () => {
  slideIndex.value = (slideIndex.value - 1 + newsSlides.length) % newsSlides.length
}

const startAutoSlide = () => {
  autoSlideTimer = setInterval(nextSlide, 5000)
}

const stopAutoSlide = () => {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer)
    autoSlideTimer = null
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

watch(() => router.currentRoute.value.fullPath, () => {
  loadReports()
})

onMounted(() => {
  startAutoSlide()
  loadReports()
})

onUnmounted(() => {
  stopAutoSlide()
})
</script>

<template>
  <div class="landing-page">
    <header class="navbar">
      <div class="navbar__container">
        <h1 class="brand">Safe <span>City</span></h1>

        <nav class="navbar__links" aria-label="Navegacion principal">
          <RouterLink to="/" class="nav-link">Inicio</RouterLink>
          <RouterLink to="/reportar" class="nav-link">Reportar</RouterLink>
          <RouterLink to="/mapa" class="nav-link">Rutas</RouterLink>
          <button class="nav-link" type="button" @click="closeMenu(); openProfile()">Perfil</button>
          <RouterLink to="/guia" class="nav-link">Guia</RouterLink>
          <a class="nav-link" href="#noticias">Noticias</a>
        </nav>

        <div v-if="!authLoading" class="auth-actions auth-actions--desktop">
          <button v-if="authUser" type="button" class="btn-auth btn-auth--solid" :disabled="isSigningOut" @click="handleSignOut">
            {{ isSigningOut ? 'Cerrando...' : 'Cerrar sesion' }}
          </button>
          <template v-else>
          <button type="button" class="btn-auth btn-auth--ghost" @click="openLogin">Iniciar sesion</button>
          <button type="button" class="btn-auth btn-auth--solid" @click="openRegister">Registrarse</button>
          </template>
        </div>
        <p v-if="signOutError" class="auth-error auth-error--desktop">{{ signOutError }}</p>

        <button type="button" class="menu-toggle" aria-label="Abrir menu" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav v-if="isMenuOpen" class="mobile-menu" aria-label="Navegacion movil">
        <RouterLink to="/" class="nav-link" @click="closeMenu">Inicio</RouterLink>
        <RouterLink to="/reportar" class="nav-link" @click="closeMenu">Reportar</RouterLink>
        <RouterLink to="/mapa" class="nav-link" @click="closeMenu">Rutas</RouterLink>
        <button class="nav-link" type="button" @click="closeMenu(); openProfile()">Perfil</button>
        <RouterLink to="/guia" class="nav-link" @click="closeMenu">Guia</RouterLink>
        <a class="nav-link" href="#noticias" @click="closeMenu">Noticias</a>
        <div v-if="!authLoading" class="auth-actions auth-actions--mobile">
          <button v-if="authUser" type="button" class="btn-auth btn-auth--solid" :disabled="isSigningOut" @click="handleSignOut">
            {{ isSigningOut ? 'Cerrando...' : 'Cerrar sesion' }}
          </button>
          <template v-else>
          <button type="button" class="btn-auth btn-auth--ghost" @click="openLogin">Iniciar sesion</button>
          <button type="button" class="btn-auth btn-auth--solid" @click="openRegister">Registrarse</button>
          </template>
        </div>
        <p v-if="signOutError" class="auth-error">{{ signOutError }}</p>
      </nav>
    </header>

    <section class="hero">
      <img src="/landing/fondo.jpg" alt="Fondo principal de Safe City" class="hero__background" />
      <div class="hero__overlay"></div>

      <div class="hero__content">
        <img :src="logoImage" alt="Logo de Safe City" class="hero__logo" />
        <span class="hero__badge">Seguridad Inteligente</span>

        <h2>
          Juntos hacemos una
          <span>ciudad mas segura</span>
        </h2>

        <p>
          Reporta accidentes, consulta rutas seguras, recibe alertas en tiempo real y ayuda a proteger a toda la
          comunidad.
        </p>

        <div class="hero__actions">
          <button type="button" class="btn btn--primary" @click="openReport">Reportar accidente</button>
          <button type="button" class="btn btn--outline" @click="openMap">Ver mapa</button>
        </div>
      </div>
    </section>

    <section class="stats">
      <article class="stat-card">
        <h3 class="tone-red">1245</h3>
        <p>Accidentes</p>
      </article>

      <article class="stat-card">
        <h3 class="tone-yellow">320</h3>
        <p>Zonas de riesgo</p>
      </article>

      <article class="stat-card">
        <h3 class="tone-green">98%</h3>
        <p>Reportes verificados</p>
      </article>

      <article class="stat-card">
        <h3 class="tone-blue">12K+</h3>
        <p>Usuarios</p>
      </article>
    </section>

    <section class="recent-section">
      <h2>Accidentes recientes</h2>

      <div v-if="reports.length" class="recent-grid">
        <article v-for="report in reports" :key="report.id" class="recent-card">
          <img v-if="report.photoDataUrl" :src="report.photoDataUrl" :alt="report.title" />
          <img v-else :src="accidentCards[0].image" :alt="report.title" />

          <div class="recent-card__body">
            <h3>{{ report.title }}</h3>
            <p>{{ report.description }}</p>
            <button type="button" @click="openReportDetail(report.id)">Ver detalles</button>
          </div>
        </article>
      </div>

      <div v-else class="recent-empty">
        <p>Aun no hay reportes registrados. Crea el primero desde la seccion Reportar.</p>
      </div>
    </section>

    <section id="noticias" class="news-section">
      <h2>Ultimas Noticias</h2>

      <div class="news-slider">
        <div class="news-track" :style="{ transform: `translateX(-${slideIndex * 100}%)` }">
          <article v-for="slide in newsSlides" :key="slide.title" class="news-slide">
            <img :src="slide.image" :alt="slide.title" />
            <div class="news-slide__overlay"></div>

            <div class="news-slide__content">
              <h3>{{ slide.title }}</h3>
              <p>{{ slide.description }}</p>
              <button type="button">Ver mas</button>
            </div>
          </article>
        </div>

        <button type="button" class="arrow arrow--left" aria-label="Noticia anterior" @click="previousSlide">&#10094;</button>
        <button type="button" class="arrow arrow--right" aria-label="Siguiente noticia" @click="nextSlide">&#10095;</button>

        <div class="slider-dots" aria-hidden="true">
          <span v-for="(_, index) in newsSlides" :key="`dot-${index}`" class="slider-dot" :class="{ 'is-active': slideIndex === index }"></span>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer__content">
        <div>
          <h3>Safe <span>City</span></h3>
          <p>Nuestra mision es ayudar a la comunidad a reportar accidentes y mantenerse informada en tiempo real.</p>
        </div>

        <div>
          <h4>Enlaces rapidos</h4>
          <nav class="footer-links">
            <RouterLink to="/">Inicio</RouterLink>
            <RouterLink to="/reportar">Reportar</RouterLink>
            <RouterLink to="/mapa">Rutas</RouterLink>
          </nav>
        </div>

        <div>
          <h4>Contacto</h4>
          <p>Email: safecity@gmail.com</p>
          <p>Santa Ana, El Salvador</p>
        </div>
      </div>

      <p class="footer__copy">&copy; {{ currentYear }} Safe City | Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<style scoped>
:global(html),
:global(body) {
  margin: 0;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  background: #f1f5f9;
}

:global(#app) {
  min-height: 100vh;
  background: #f1f5f9;
}

.landing-page {
  color: #0f172a;
  min-height: 100vh;
  background: linear-gradient(180deg, #f1f5f9 0%, #eef4ff 100%);
}

.navbar {
  background: #102d75;
  position: sticky;
  top: 0;
  z-index: 30;
  box-shadow: 0 10px 24px rgba(21, 22, 24, 0.3);
}

.navbar__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.95rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  color: #fff;
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.brand span {
  color: #60a5fa;
}

.navbar__links {
  display: flex;
  gap: 1.35rem;
  align-items: center;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0;
}

.nav-link:hover {
  color: #93c5fd;
}

.auth-actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.btn-auth {
  border-radius: 999px;
  border: 1px solid transparent;
  height: 40px;
  padding: 0 1.05rem;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.btn-auth--ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.65);
  color: #fff;
}

.btn-auth--solid {
  background: #60a5fa;
  border-color: #60a5fa;
  color: #0f2b72;
}

.btn-auth:hover {
  transform: translateY(-1px);
}

.btn-auth:disabled {
  cursor: wait;
  opacity: 0.75;
}

.auth-error {
  margin: 0;
  color: #fecaca;
  font-size: 0.85rem;
}

.auth-error--desktop {
  position: absolute;
  top: calc(100% - 0.1rem);
  right: 1.25rem;
}

.menu-toggle {
  display: none;
  border: none;
  background: transparent;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
}

.menu-toggle span {
  width: 1.5rem;
  height: 0.15rem;
  background: #fff;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0 1.25rem 1rem;
}

.hero {
  min-height: 90vh;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero__background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 45, 120, 0.64);
}

.hero__content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3.6rem 1.5rem 4.2rem;
  color: #fff;
}

.hero__logo {
  width: 180px;
}

.hero__badge {
  display: inline-block;
  background: #3b82f6;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  font-weight: 600;
  margin-top: 1rem;
}

.hero h2 {
  font-size: clamp(2rem, 7vw, 3.9rem);
  line-height: 1.08;
  margin: 1.1rem 0 0;
  max-width: 11ch;
}

.hero h2 span {
  color: #93c5fd;
}

.hero p {
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.7;
  max-width: 52ch;
  margin: 1rem 0 0;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 1.35rem;
  align-items: center;
}

.btn {
  border: 2px solid transparent;
  border-radius: 0.8rem;
  min-height: 52px;
  padding: 0 1.55rem;
  font-weight: 700;
  font-size: 0.98rem;
  letter-spacing: 0.01em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.btn--primary {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 14px 24px rgba(15, 57, 156, 0.35);
}

.btn--outline {
  background: transparent;
  border-color: #fff;
  color: #fff;
}

.btn:hover {
  transform: translateY(-2px);
}

.stats {
  max-width: 1050px;
  margin: -3.5rem auto 0;
  padding: 0 1.2rem;
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  position: relative;
  z-index: 5;
}

.stat-card {
  background: #fff;
  text-align: center;
  padding: 1.15rem 0.6rem;
  border-radius: 1rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
}

.stat-card h3 {
  margin: 0;
  font-size: 2.2rem;
}

.stat-card p {
  margin: 0.45rem 0 0;
  color: #64748b;
  font-weight: 600;
}

.tone-red {
  color: #dc2626;
}

.tone-yellow {
  color: #ca8a04;
}

.tone-green {
  color: #16a34a;
}

.tone-blue {
  color: #2563eb;
}

.recent-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4.5rem 1.5rem;
  background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
  border-radius: 1.4rem;
  box-shadow: 0 18px 35px rgba(37, 99, 235, 0.08);
  border: 1px solid #dbeafe;
}

.recent-section h2 {
  text-align: center;
  color: #12327c;
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin: 0 0 2rem;
}

.recent-grid {
  display: grid;
  gap: 1.1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
}

.recent-card {
  background: #ffffff;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid #dbeafe;
  box-shadow: 0 10px 24px rgba(30, 58, 138, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px rgba(30, 58, 138, 0.18);
}

.recent-card img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.recent-card__body {
  padding: 1.05rem;
  display: flex;
  flex-direction: column;
  min-height: 205px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.recent-card h3 {
  margin: 0;
  font-size: 1.45rem;
  color: #11306c;
}

.recent-card p {
  color: #334155;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.recent-card button {
  border: none;
  border-radius: 0.75rem;
  background: #1d4ed8;
  color: #fff;
  min-height: 44px;
  padding: 0 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: auto;
  align-self: flex-start;
}

.news-section {
  background: #eff6ff;
  padding: 4.2rem 1.5rem;
  margin-top: 1.8rem;
}

.news-section h2 {
  text-align: center;
  margin: 0 0 2rem;
  color: #12327c;
  font-size: clamp(2rem, 4vw, 2.8rem);
}

.news-slider {
  max-width: 1100px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 1.2rem;
  box-shadow: 0 14px 28px rgba(30, 64, 175, 0.26);
  position: relative;
}

.news-track {
  display: flex;
  transition: transform 0.7s ease;
}

.news-slide {
  min-width: 100%;
  height: 540px;
  position: relative;
}

.news-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-slide__overlay {
  position: absolute;
  inset: 0;
  background: rgba(9, 36, 99, 0.58);
}

.news-slide__content {
  position: absolute;
  left: 3rem;
  bottom: 3rem;
  color: #fff;
  max-width: min(680px, 90%);
}

.news-slide__content h3 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.2rem);
}

.news-slide__content p {
  font-size: 1.12rem;
  line-height: 1.6;
  margin: 0.85rem 0 1.2rem;
}

.news-slide__content button {
  border: 1px solid #fff;
  border-radius: 0.75rem;
  background: #fff;
  color: #0f2b72;
  min-height: 46px;
  padding: 0 1.2rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #0c2b71;
  font-size: 1.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.arrow--left {
  left: 1.2rem;
}

.arrow--right {
  right: 1.2rem;
}

.arrow:hover {
  transform: translateY(-50%) scale(1.06);
  background: #fff;
}

.slider-dots {
  position: absolute;
  left: 50%;
  bottom: 1.15rem;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 4;
}

.slider-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
}

.slider-dot.is-active {
  background: #fff;
  width: 22px;
  border-radius: 999px;
}

.footer {
  background: #102d75;
  color: #dbeafe;
  padding: 3rem 1.5rem 1.5rem;
}

.footer__content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.footer h3,
.footer h4 {
  color: #fff;
  margin: 0;
}

.footer h3 span {
  color: #60a5fa;
}

.footer-links {
  display: grid;
  gap: 0.45rem;
}

.footer-links a {
  color: #dbeafe;
  text-decoration: none;
}

.footer__copy {
  max-width: 1200px;
  margin: 1.5rem auto 0;
  border-top: 1px solid rgba(147, 197, 253, 0.35);
  padding-top: 1rem;
  text-align: center;
}

@media (max-width: 980px) {
  .navbar__links,
  .auth-actions--desktop,
  .auth-error--desktop {
    display: none;
  }

  .menu-toggle,
  .mobile-menu {
    display: flex;
  }

  .mobile-menu .nav-link {
    width: fit-content;
  }

  .auth-actions--mobile {
    margin-top: 0.35rem;
  }

  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .recent-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .recent-section {
    border-radius: 1rem;
  }

  .footer__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .hero {
    min-height: auto;
  }

  .hero__actions .btn {
    width: 100%;
  }

  .hero__content {
    padding-top: 2.4rem;
    padding-bottom: 3rem;
  }

  .stats {
    margin-top: -2.8rem;
    grid-template-columns: 1fr;
  }

  .recent-grid {
    grid-template-columns: 1fr;
  }

  .recent-section {
    padding: 3.4rem 1rem;
    border-radius: 0;
    box-shadow: none;
  }

  .news-slide {
    height: 430px;
  }

  .news-slide__content {
    left: 1.25rem;
    right: 1.25rem;
    bottom: 1.8rem;
  }

  .arrow {
    width: 42px;
    height: 42px;
  }

  .arrow--left {
    left: 0.65rem;
  }

  .arrow--right {
    right: 0.65rem;
  }

  .slider-dots {
    bottom: 0.8rem;
  }
}
</style>
