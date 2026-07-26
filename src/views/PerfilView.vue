<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/logo.png'
import { insforge } from '../utils/insforgeClient'
import { authUser, initializeAuth } from '../utils/authStore'

const router = useRouter()
const profile = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  bio: 'Usuario de Safe City',
  photo: ''
})
const isSaving = ref(false)
const saveMessage = ref('')

const goToHome = () => router.push('/')

const loadProfile = async () => {
  await initializeAuth()
  const currentUser = authUser.value

  if (currentUser) {
    const savedProfile = currentUser.profile || {}
    profile.value = {
      name: savedProfile.name || currentUser.name || '',
      email: currentUser.email || '',
      phone: savedProfile.phone || '',
      address: savedProfile.address || '',
      bio: savedProfile.bio || 'Usuario de Safe City',
      photo: savedProfile.avatar_url || ''
    }
  }
}

const handlePhotoChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    profile.value.photo = reader.result
  }
  reader.readAsDataURL(file)
}

const saveProfile = async () => {
  isSaving.value = true
  saveMessage.value = ''

  const { error } = await insforge.auth.setProfile({
    name: profile.value.name,
    phone: profile.value.phone,
    address: profile.value.address,
    bio: profile.value.bio,
    avatar_url: profile.value.photo
  })
  isSaving.value = false
  saveMessage.value = error ? 'No se pudo guardar el perfil.' : 'Cambios guardados correctamente.'
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <main class="auth-shell">
    <section class="auth-box" aria-label="Perfil de usuario en Safe City">
      <div class="profile-shell">
        <div class="profile-left">
          <header class="page-header">
            <div class="header-badge">Safe City</div>
            <h1>Mi Perfil</h1>
            <p class="subtitle">Actualiza tus datos y mantén tu información al día.</p>
          </header>

          <div class="avatar-block">
            <img class="avatar" :src="profile.photo || logoImage" alt="Foto de perfil" />
            <h2>{{ profile.name || 'Usuario' }}</h2>
            <p>{{ profile.bio }}</p>
            <label class="secondary-btn upload-btn">
              Cambiar foto
              <input type="file" accept="image/*" @change="handlePhotoChange" />
            </label>
          </div>
        </div>

        <form class="form" @submit.prevent="saveProfile">
          <label>
            Nombre completo
            <input v-model.trim="profile.name" type="text" placeholder="Tu nombre" />
          </label>

          <label>
            Correo
            <input v-model.trim="profile.email" type="email" placeholder="correo@ejemplo.com" />
          </label>

          <label>
            Teléfono
            <input v-model.trim="profile.phone" type="tel" placeholder="7777-7777" />
          </label>

          <label>
            Dirección
            <input v-model.trim="profile.address" type="text" placeholder="Tu dirección" />
          </label>

          <label>
            Información adicional
            <textarea v-model="profile.bio" placeholder="Escribe algo sobre ti"></textarea>
          </label>

          <button class="primary" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
          <p v-if="saveMessage" class="save-message">{{ saveMessage }}</p>
        </form>
      </div>

      <footer class="page-footer">
        <button type="button" class="text-link" @click="goToHome">Volver al inicio</button>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: linear-gradient(150deg, #e1ecff 0%, #ffffff 52%, #c6ddff 100%);
}

.auth-box {
  width: min(100%, 820px);
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(20, 55, 122, 0.18);
  padding: 1.35rem;
  display: grid;
  gap: 0.9rem;
}

.page-header {
  display: grid;
  justify-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0 0.1rem;
  text-align: center;
}

.header-badge {
  width: fit-content;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

h1 {
  margin: 0;
  text-align: left;
  color: #123269;
}

.subtitle {
  margin: 0;
  text-align: left;
  color: #4b5563;
}

.profile-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
  align-items: start;
}

.profile-left {
  display: grid;
  gap: 1rem;
}

.avatar-block {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  padding: 1rem 0.9rem 0.95rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
}

.avatar {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #60a5fa;
  margin-bottom: 0.7rem;
}

.avatar-block h2 {
  margin: 0 0 0.3rem;
  color: #123269;
}

.avatar-block p {
  margin: 0 0 0.8rem;
  color: #4b5563;
}

.form {
  display: grid;
  gap: 0.7rem;
  background: #f8fbff;
  border: 1px solid #dbeafe;
  border-radius: 1rem;
  padding: 0.9rem;
}

label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

input,
textarea {
  border: 1px solid #93c5fd;
  border-radius: 0.7rem;
  padding: 0.7rem 0.85rem;
  font-size: 0.95rem;
  font-family: inherit;
  background: #f8fbff;
}

textarea {
  min-height: 92px;
  resize: vertical;
}

input:focus,
textarea:focus {
  outline: 2px solid #93c5fd;
  border-color: #60a5fa;
}

.primary,
.secondary-btn {
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  padding: 0.78rem 1rem;
  cursor: pointer;
}

.primary {
  background: #1d4ed8;
  color: #fff;
}

.secondary-btn {
  background: #e0edff;
  color: #1d4ed8;
  display: inline-block;
  text-align: center;
}

.upload-btn input {
  display: none;
}

.save-message {
  margin: 0;
  color: #0f766e;
  font-size: 0.9rem;
}

.page-footer {
  display: flex;
  justify-content: center;
  padding-top: 0.25rem;
}

.text-link {
  border: none;
  background: transparent;
  color: #1d4ed8;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 780px) {
  .profile-shell {
    grid-template-columns: 1fr;
  }
}
</style>
