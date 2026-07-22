<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/logo.png'
import { loginUser } from '../utils/userStore'

const router = useRouter()
const isSubmitting = ref(false)
const submitError = ref('')

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)

const formErrors = computed(() => {
  const errors = {}

  if (!form.email) {
    errors.email = 'Ingresa tu correo.'
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Correo invalido.'
  }

  if (!form.password) {
    errors.password = 'Ingresa tu contrasena.'
  } else if (form.password.length < 6) {
    errors.password = 'La contrasena debe tener al menos 6 caracteres.'
  }

  return errors
})

const canSubmit = computed(() => Object.keys(formErrors.value).length === 0)

const goToRegister = () => {
  router.push('/register')
}

const goToAuth = () => {
  router.push('/auth')
}

const submitLogin = async () => {
  submitError.value = ''

  if (!canSubmit.value) {
    submitError.value = 'Revisa los campos del formulario.'
    return
  }

  isSubmitting.value = true

  const user = loginUser(form.email, form.password)

  setTimeout(() => {
    isSubmitting.value = false

    if (!user) {
      submitError.value = 'Correo o contraseña incorrectos.'
      return
    }

    router.push('/perfil')
  }, 650)
}
</script>

<template>
  <main class="auth-shell">
    <section class="auth-box" aria-label="Iniciar sesion en Safe City">
      <img class="logo" :src="logoImage" alt="Logo Safe City" />
      <h1>Iniciar sesion</h1>
      <p class="subtitle">Accede para reportar accidentes y consultar alertas en tiempo real.</p>

      <form class="form" @submit.prevent="submitLogin">
        <label>
          Correo
          <input v-model.trim="form.email" type="email" placeholder="correo@ejemplo.com" autocomplete="email" />
          <small v-if="formErrors.email" class="field-error">{{ formErrors.email }}</small>
        </label>

        <label>
          Contrasena
          <input
            v-model="form.password"
            type="password"
            placeholder="Minimo 6 caracteres"
            autocomplete="current-password"
          />
          <small v-if="formErrors.password" class="field-error">{{ formErrors.password }}</small>
        </label>

        <label class="remember-row">
          <input v-model="form.remember" type="checkbox" />
          <span>Recordar sesion</span>
        </label>

        <p v-if="submitError" class="submit-error">{{ submitError }}</p>

        <button class="primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Ingresando...' : 'Entrar' }}
        </button>
      </form>

      <div class="links-row">
        <button type="button" class="text-link" @click="goToRegister">Crear cuenta</button>
        <button type="button" class="text-link" @click="goToAuth">Volver</button>
      </div>
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
  width: min(100%, 430px);
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(20, 55, 122, 0.18);
  padding: 1.6rem;
  display: grid;
  gap: 0.85rem;
}

.logo {
  width: 86px;
  margin: 0 auto 0.35rem;
}

h1 {
  margin: 0;
  text-align: center;
  color: #123269;
}

.subtitle {
  margin: 0;
  text-align: center;
  color: #4b5563;
}

.form {
  display: grid;
  gap: 0.8rem;
}

label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

input[type='email'],
input[type='password'] {
  border: 1px solid #cbd5e1;
  border-radius: 0.7rem;
  padding: 0.7rem 0.85rem;
  font-size: 0.95rem;
}

input:focus {
  outline: 2px solid #93c5fd;
  border-color: #60a5fa;
}

.remember-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;
}

.field-error,
.submit-error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.8rem;
}

.primary {
  border: none;
  border-radius: 0.75rem;
  background: #1d4ed8;
  color: #fff;
  font-weight: 700;
  padding: 0.78rem 1rem;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.75;
  cursor: wait;
}

.links-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-link {
  border: none;
  background: transparent;
  color: #1d4ed8;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 480px) {
  .auth-shell {
    padding: 0.85rem;
  }

  .auth-box {
    padding: 1.2rem 1rem;
    border-radius: 1rem;
  }

  .links-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.45rem;
  }

  .text-link {
    text-align: left;
    padding: 0.15rem 0;
  }
}
</style>
