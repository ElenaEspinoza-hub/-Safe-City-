<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/logo.png'
import { insforge } from '../utils/insforgeClient'
import { setAuthenticatedUser } from '../utils/authStore'

const router = useRouter()
const OAUTH_PENDING_KEY = 'safe-city-oauth-pending'

const isLoadingProvider = ref('')
const authError = ref('')
const isProcessingOAuth = ref(false)

const authProviders = [
  {
    id: 'google',
    label: 'Continuar con Google',
    provider: 'google',
    iconType: 'image',
    iconSrc: '/Google-Logo.png'
  },
  {
    id: 'github',
    label: 'Continuar con GitHub',
    provider: 'github',
    iconType: 'symbol',
    iconSymbol: '#github-icon'
  }
]

const currentYear = computed(() => new Date().getFullYear())

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getOAuthParams = () => {
  if (typeof window === 'undefined') return new URLSearchParams()

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  hashParams.forEach((value, key) => {
    if (!searchParams.has(key)) {
      searchParams.set(key, value)
    }
  })

  return searchParams
}

const isOAuthCallback = () => {
  const params = getOAuthParams()
  return params.has('insforge_code') || params.has('code') || params.has('error')
}

const continueWithProvider = async (provider) => {
  authError.value = ''
  isLoadingProvider.value = provider.id

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(OAUTH_PENDING_KEY, provider.id)
  }

  const { error } = await insforge.auth.signInWithOAuth(provider.provider, {
    redirectTo: `${window.location.origin}/auth`,
    additionalParams: {
      prompt: 'select_account'
    }
  })

  if (error) {
    authError.value = error.message || `No se pudo iniciar sesión con ${provider.label}.`
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(OAUTH_PENDING_KEY)
    }
    isLoadingProvider.value = ''
  }
}

const hasPendingOAuth = () => {
  if (typeof window === 'undefined') return false
  return Boolean(window.localStorage.getItem(OAUTH_PENDING_KEY))
}

const clearPendingOAuth = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(OAUTH_PENDING_KEY)
}

const checkExistingSession = async () => {
  isProcessingOAuth.value = true
  const { data, error } = await insforge.auth.getCurrentUser()

  if (error) {
    authError.value = error.message || 'No se pudo validar la sesión actual.'
    isProcessingOAuth.value = false
    return
  }

  if (data?.user) {
    clearPendingOAuth()
    setAuthenticatedUser(data.user)
    isProcessingOAuth.value = false
    router.replace('/')
    return
  }

  // PKCE callback can complete a moment later; retry briefly before giving up.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await sleep(350)
    const { data: retryData, error: retryError } = await insforge.auth.getCurrentUser()

    if (retryError) {
      authError.value = retryError.message || 'No se pudo finalizar el inicio de sesión.'
      isProcessingOAuth.value = false
      return
    }

    if (retryData?.user) {
      clearPendingOAuth()
      setAuthenticatedUser(retryData.user)
      isProcessingOAuth.value = false
      router.replace('/')
      return
    }
  }

  authError.value = 'No se pudo completar el inicio de sesión. Intenta nuevamente.'
  clearPendingOAuth()
  isProcessingOAuth.value = false
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

onMounted(() => {
  if (isOAuthCallback() || hasPendingOAuth()) {
    const params = getOAuthParams()
    if (params.get('error_description')) {
      authError.value = params.get('error_description')
      clearPendingOAuth()
      return
    }
    checkExistingSession()
  }
})
</script>

<template>
  <main class="page-shell">
    <div class="bg-shape bg-shape--top" aria-hidden="true" />
    <div class="bg-shape bg-shape--bottom" aria-hidden="true" />

    <section class="auth-card" aria-label="Acceso a Safe City">
      <aside class="brand-panel">
        <img class="brand-logo" :src="logoImage" alt="Logo de Safe City" />
        <h1>Safe City</h1>
        <p>Plataforma colaborativa para reportar accidentes y mejorar la seguridad vial.</p>
      </aside>

      <div class="actions-panel">
        <h2>Bienvenido</h2>

        <button
          v-for="provider in authProviders"
          :key="provider.id"
          class="social-btn"
          type="button"
          :disabled="isLoadingProvider === provider.id"
          @click="continueWithProvider(provider)"
        >
          <img
            v-if="provider.iconType === 'image'"
            :src="provider.iconSrc"
            :alt="`Logo de ${provider.id}`"
            class="provider-logo"
          />
          <svg v-else class="provider-logo" aria-hidden="true" viewBox="0 0 19 19">
            <use :href="`/icons.svg${provider.iconSymbol}`" />
          </svg>
          <span>{{ provider.label }}</span>
          <span v-if="isLoadingProvider === provider.id" class="spinner" aria-hidden="true" />
        </button>

        <div class="divider" role="separator" aria-label="o">
          <span>o</span>
        </div>

        <p v-if="authError" class="auth-error">{{ authError }}</p>
        <p v-if="isProcessingOAuth" class="auth-info">Validando inicio de sesión...</p>

        <button class="primary-btn" type="button" @click="goToLogin">Iniciar sesion</button>

        <button class="outline-btn" type="button" @click="goToRegister">Registrarse</button>

        <small class="footer-note">Safe City {{ currentYear }} - Reportes ciudadanos en tiempo real</small>
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
}

.page-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(140deg, #dbeafe 0%, #f8fbff 45%, #c7ddff 100%);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  opacity: 0.38;
  pointer-events: none;
}

.bg-shape--top {
  width: 20rem;
  height: 20rem;
  left: -5rem;
  top: -5rem;
  background: #5f9bff;
}

.bg-shape--bottom {
  width: 25rem;
  height: 25rem;
  right: -8rem;
  bottom: -10rem;
  background: #2465d6;
}

.auth-card {
  width: min(100%, 1000px);
  min-height: 600px;
  border-radius: 2.5rem;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 24px 60px rgba(27, 57, 106, 0.2);
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  z-index: 1;
}

.brand-panel {
  background: linear-gradient(145deg, #08307d 0%, #1f69e0 100%);
  color: #fff;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 1rem;
  padding: 2rem;
}

.brand-logo {
  width: min(180px, 45vw);
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25));
}

.brand-panel h1 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.5rem);
}

.brand-panel p {
  margin: 0;
  max-width: 26ch;
  opacity: 0.94;
  line-height: 1.5;
}

.actions-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.9rem;
  padding: 3rem;
}

.actions-panel h2 {
  margin: 0 0 0.75rem;
  color: #0d2b63;
  font-size: clamp(1.8rem, 2.5vw, 2.25rem);
}

.social-btn,
.primary-btn,
.outline-btn {
  width: 100%;
  min-height: 50px;
  border-radius: 0.9rem;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.social-btn {
  border: 1px solid #d6dbe8;
  background: #fff;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
}

.provider-logo {
  width: 2rem;
  height: 2rem;
}

.social-btn:hover,
.primary-btn:hover,
.outline-btn:hover {
  transform: translateY(-1px);
}

.social-btn:hover {
  background: #f8faff;
}

.social-btn:disabled {
  cursor: wait;
  opacity: 0.85;
}

.spinner {
  position: absolute;
  right: 1rem;
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 50%;
  border: 2px solid #b7c8ec;
  border-top-color: #2563eb;
  animation: spin 0.75s linear infinite;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #9ca3af;
  margin: 0.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.divider span {
  padding: 0 0.75rem;
}

.primary-btn {
  border: none;
  background: #1c4fb3;
  color: #fff;
}

.primary-btn:hover {
  background: #123f97;
  box-shadow: 0 10px 20px rgba(18, 63, 151, 0.25);
}

.outline-btn {
  border: 2px solid #1c4fb3;
  color: #1c4fb3;
  background: #fff;
}

.outline-btn:hover {
  background: #1c4fb3;
  color: #fff;
}

.footer-note {
  margin-top: 0.6rem;
  text-align: center;
  color: #6b7280;
}

.auth-error {
  margin: 0;
  font-size: 0.9rem;
  color: #b91c1c;
}

.auth-info {
  margin: 0;
  font-size: 0.9rem;
  color: #1d4ed8;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .auth-card {
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .brand-panel,
  .actions-panel {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 520px) {
  .page-shell {
    padding: 0.9rem;
  }

  .auth-card {
    border-radius: 1.25rem;
  }

  .brand-panel,
  .actions-panel {
    padding: 1.25rem 1rem;
  }

  .actions-panel h2 {
    margin-bottom: 0.45rem;
  }

  .footer-note {
    font-size: 0.82rem;
  }
}
</style>
