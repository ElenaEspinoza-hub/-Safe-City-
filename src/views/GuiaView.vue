<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/logo.png'

const router = useRouter()
const quizResult = ref('')
const quizIsCorrect = ref(false)

const guideSteps = [
  { title: 'Reportar un accidente', description: 'Toma una fotografía del accidente, agrega una descripción y envía el reporte.', icon: '01' },
  { title: 'Compartir ubicación', description: 'Activa tu ubicación para que las autoridades encuentren el lugar del incidente.', icon: '02' },
  { title: 'Consultar rutas', description: 'Busca rutas más seguras y evita calles con accidentes o tráfico.', icon: '03' },
  { title: 'Esperar ayuda', description: 'Mantente en un lugar seguro mientras llegan los equipos de emergencia.', icon: '04' }
]

const faqs = [
  { question: '¿Cómo reporto un accidente?', answer: 'Ingresa a la sección Reportar, toma una fotografía, agrega la ubicación y envía el reporte.' },
  { question: '¿Cómo puedo ver una ruta segura?', answer: 'Abre la sección Rutas, escribe tu destino y consulta el mapa para elegir el recorrido más seguro.' },
  { question: '¿Por qué debo compartir mi ubicación?', answer: 'Tu ubicación ayuda a que las autoridades y los equipos de emergencia lleguen más rápido al lugar del incidente.' },
  { question: '¿Qué debo hacer mientras llega la ayuda?', answer: 'Mantén la calma, aléjate del peligro si es posible y sigue las indicaciones de las autoridades.' }
]

const answerQuiz = (isCorrect) => {
  quizIsCorrect.value = isCorrect
  quizResult.value = isCorrect
    ? '¡Correcto! Lo primero es mantener la calma y reportar el accidente.'
    : 'Respuesta incorrecta. Mantén la calma y reporta el accidente antes de actuar.'
}

const goToReport = () => router.push('/reportar')
const goToMap = () => router.push('/mapa')
const scrollToFaqs = () => document.querySelector('#preguntas')?.scrollIntoView({ behavior: 'smooth' })
</script>

<template>
  <main class="guide-page">
    <section class="guide-shell" aria-labelledby="guide-title">
      <aside class="guide-intro">
        <img :src="logoImage" alt="Logo de Safe City" class="guide-intro__logo" />
        <p class="guide-intro__eyebrow">Guía de uso</p>
        <h1>Safe City</h1>
        <p>Aprende a utilizar las herramientas de la aplicación para reportar accidentes, consultar rutas seguras y proteger a tu comunidad.</p>

        <div class="progress" aria-label="Progreso de la guía: paso 1 de 4">
          <div class="progress__labels"><span>Paso 1</span><span>Paso 4</span></div>
          <div class="progress__track"><span></span></div>
        </div>
      </aside>

      <div class="guide-content">
        <header class="guide-header">
          <p class="guide-header__eyebrow">Empecemos</p>
          <h2 id="guide-title">Bienvenido a Safe City</h2>
          <p>Sigue estos pasos para aprender a utilizar todas las herramientas de la plataforma.</p>
        </header>

        <section class="steps" aria-label="Pasos para usar Safe City">
          <article v-for="step in guideSteps" :key="step.icon" class="step-card">
            <span class="step-card__number">{{ step.icon }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </article>
        </section>

        <button type="button" class="next-button" @click="scrollToFaqs">Continuar con las preguntas frecuentes <span aria-hidden="true">→</span></button>

        <section id="preguntas" class="faq-section" aria-labelledby="faq-title">
          <h2 id="faq-title">Preguntas frecuentes</h2>
          <details v-for="faq in faqs" :key="faq.question" class="faq-item">
            <summary>{{ faq.question }}</summary>
            <p>{{ faq.answer }}</p>
          </details>

          <div class="guide-actions">
            <button type="button" class="action-button action-button--blue" @click="goToReport">Reportar</button>
            <button type="button" class="action-button action-button--green" @click="goToMap">Ver mapa</button>
          </div>
        </section>

        <section class="quiz" aria-labelledby="quiz-title">
          <h2 id="quiz-title">Mini cuestionario</h2>
          <p>¿Qué debes hacer primero cuando presencias un accidente?</p>
          <div class="quiz__answers">
            <button type="button" @click="answerQuiz(false)">A) Alejarte sin avisar.</button>
            <button type="button" @click="answerQuiz(true)">B) Mantener la calma y reportar el accidente.</button>
            <button type="button" @click="answerQuiz(false)">C) Mover a las personas heridas sin ayuda.</button>
          </div>
          <p v-if="quizResult" class="quiz__result" :class="{ 'quiz__result--correct': quizIsCorrect }" role="status">{{ quizResult }}</p>
        </section>

        <section class="guide-finish">
          <h2>¡Ya estás listo para usar Safe City!</h2>
          <p>Ahora puedes reportar accidentes, consultar rutas seguras y ayudar a mantener informada a tu comunidad.</p>
          <div class="guide-finish__actions">
            <button type="button" @click="goToReport">Reportar</button>
            <button type="button" @click="goToMap">Ver mapa</button>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.guide-page { min-height: 100vh; padding: clamp(1rem, 3vw, 3rem); background: radial-gradient(circle at 12% 10%, #bfdbfe 0, transparent 24rem), linear-gradient(135deg, #dbeafe, #f8fbff 48%, #bfdbfe); font-family: 'Poppins', 'Segoe UI', sans-serif; color: #172554; }
.guide-shell { max-width: 1250px; margin: 0 auto; display: grid; grid-template-columns: minmax(260px, .75fr) minmax(0, 1.7fr); overflow: hidden; background: #fff; border-radius: 2rem; box-shadow: 0 24px 60px rgba(30, 64, 175, .2); }
.guide-intro { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start; padding: clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem); color: #fff; background: linear-gradient(160deg, #102d75 0%, #1d4ed8 60%, #60a5fa 100%); }
.guide-intro::after { content: ''; position: absolute; width: 20rem; height: 20rem; right: -13rem; bottom: -8rem; border: 2.5rem solid rgba(191, 219, 254, .24); border-radius: 50%; }
.guide-intro > * { position: relative; z-index: 1; }
.guide-intro__logo { width: 9rem; margin-bottom: 2.5rem; }
.guide-intro__eyebrow, .guide-header__eyebrow { margin: 0 0 .5rem; font-size: .78rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.guide-intro h1 { margin: 0; font-size: clamp(2.2rem, 4vw, 3.4rem); }
.guide-intro > p:not(.guide-intro__eyebrow) { margin: 1.25rem 0 0; line-height: 1.75; }
.progress { width: 100%; margin-top: auto; padding-top: 4rem; font-weight: 700; }
.progress__labels { display: flex; justify-content: space-between; font-size: .88rem; }
.progress__track { height: .7rem; margin-top: .75rem; overflow: hidden; border-radius: 999px; background: rgba(191, 219, 254, .55); }
.progress__track span { display: block; width: 25%; height: 100%; border-radius: inherit; background: #fff; }
.guide-content { padding: clamp(2rem, 5vw, 4.5rem); }
.guide-header__eyebrow { color: #2563eb; }
.guide-header h2, .faq-section h2, .quiz h2, .guide-finish h2 { margin: 0; color: #102d75; font-size: clamp(2rem, 4vw, 3.3rem); line-height: 1.1; }
.guide-header > p:last-child { max-width: 54ch; margin: 1rem 0 2.5rem; color: #475569; line-height: 1.7; }
.steps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.step-card { padding: 1.4rem; border: 1px solid #dbeafe; border-radius: 1.25rem; background: #f8fbff; transition: transform .2s ease, box-shadow .2s ease; }
.step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 26px rgba(37, 99, 235, .13); }
.step-card__number { display: inline-grid; width: 2.25rem; height: 2.25rem; place-items: center; border-radius: 50%; background: #dbeafe; color: #1d4ed8; font-weight: 800; }
.step-card h3 { margin: .9rem 0 .35rem; color: #12327c; font-size: 1.1rem; }
.step-card p { margin: 0; color: #475569; font-size: .93rem; line-height: 1.6; }
.next-button { display: flex; align-items: center; gap: .6rem; margin: 2rem 0 3rem auto; padding: .85rem 1.2rem; border: 0; border-radius: .8rem; background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.next-button span { font-size: 1.2rem; }
.faq-section h2, .quiz h2 { font-size: clamp(1.6rem, 3vw, 2.1rem); }
.faq-item { margin-top: .8rem; padding: 1rem 1.2rem; border: 1px solid #dbeafe; border-radius: 1rem; background: #f8fbff; }
.faq-item summary { color: #12327c; font-weight: 700; cursor: pointer; }
.faq-item p { margin: .9rem 0 0; color: #475569; line-height: 1.65; }
.guide-actions, .guide-finish__actions { display: flex; justify-content: space-between; gap: 1rem; margin-top: 2rem; }
.action-button, .guide-finish button { border: 0; border-radius: .8rem; padding: .8rem 1.2rem; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.action-button--blue { background: #1d4ed8; }.action-button--green, .guide-finish button:last-child { background: #16a34a; }
.quiz { margin-top: 3.5rem; padding: clamp(1.3rem, 3vw, 2rem); border-radius: 1.3rem; background: #dbeafe; }
.quiz > p { color: #334155; line-height: 1.6; }
.quiz__answers { display: grid; gap: .75rem; }
.quiz__answers button { padding: 1rem; border: 1px solid #cbd5e1; border-radius: .75rem; background: #fff; color: #334155; text-align: left; font: inherit; cursor: pointer; transition: background .2s ease, border-color .2s ease; }
.quiz__answers button:hover { border-color: #60a5fa; background: #eff6ff; }
.quiz__result { margin: 1rem 0 0; padding: .85rem 1rem; border-radius: .75rem; background: #fee2e2; color: #b91c1c; font-weight: 700; }.quiz__result--correct { background: #dcfce7; color: #15803d; }
.guide-finish { margin-top: 3.5rem; padding: clamp(1.5rem, 4vw, 2.5rem); border-radius: 1.3rem; background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: #fff; text-align: center; }.guide-finish h2 { color: #fff; font-size: clamp(1.6rem, 3vw, 2.25rem); }.guide-finish p { max-width: 60ch; margin: 1rem auto 0; line-height: 1.65; }.guide-finish__actions { justify-content: center; }.guide-finish button:first-child { background: #fff; color: #1d4ed8; }
@media (max-width: 800px) { .guide-page { padding: 0; }.guide-shell { grid-template-columns: 1fr; border-radius: 0; }.guide-intro { min-height: 22rem; }.progress { margin-top: 2rem; padding-top: 0; }.guide-content { padding: 2rem 1.25rem; } }
@media (max-width: 520px) { .steps { grid-template-columns: 1fr; }.guide-actions, .guide-finish__actions { flex-direction: column; }.action-button, .guide-finish button { width: 100%; }.next-button { margin-left: 0; } }
@media (prefers-reduced-motion: reduce) { .step-card, .quiz__answers button { transition: none; } }
</style>
