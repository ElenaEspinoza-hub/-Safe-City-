<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/logo.png'

const router = useRouter()

const currentStep = ref(1)

const quizResult = ref('')
const quizIsCorrect = ref(false)


const guideSteps = [
  {
    number: 1,
    title: 'Reportar un accidente',
    description:
      'Toma una fotografía del accidente, agrega una descripción y envía el reporte.',
    icon: '01'
  },
  {
    number: 2,
    title: 'Compartir ubicación',
    description:
      'Activa tu ubicación para que las autoridades puedan encontrar el lugar del incidente.',
    icon: '02'
  },
  {
    number: 3,
    title: 'Consultar rutas',
    description:
      'Busca rutas más seguras y evita zonas con accidentes o tráfico.',
    icon: '03'
  },
  {
    number: 4,
    title: 'Esperar ayuda',
    description:
      'Mantente en un lugar seguro mientras llegan los equipos de emergencia.',
    icon: '04'
  }
]


const currentGuideStep = computed(() => {
  return guideSteps[currentStep.value - 1]
})


const progressWidth = computed(() => {
  return `${currentStep.value * 25}%`
})


const nextStep = () => {

  if (currentStep.value < guideSteps.length) {
    currentStep.value++
  }

}


const previousStep = () => {

  if (currentStep.value > 1) {
    currentStep.value--
  }

}


const faqs = [
  {
    question: '¿Cómo reporto un accidente?',
    answer:
      'Ingresa a Reportar, toma una fotografía, agrega la ubicación y envía el reporte.'
  },
  {
    question: '¿Cómo puedo ver una ruta segura?',
    answer:
      'Abre la sección Rutas y consulta el mapa para elegir un recorrido más seguro.'
  },
  {
    question: '¿Por qué debo compartir mi ubicación?',
    answer:
      'Ayuda a que los equipos de emergencia encuentren rápidamente el lugar del accidente.'
  },
  {
    question: '¿Qué hago mientras llega la ayuda?',
    answer:
      'Mantén la calma y permanece en un lugar seguro.'
  }
]


const answerQuiz = (correct) => {

  quizIsCorrect.value = correct

  quizResult.value = correct
    ? '¡Correcto! Mantén la calma y reporta el accidente.'
    : 'Respuesta incorrecta. Primero debes mantener la calma y reportar.'

}



const goToReport = () => {
  router.push('/reportar')
}


const goToMap = () => {
  router.push('/mapa')
}


const scrollToFaqs = () => {

  document
    .querySelector('#preguntas')
    ?.scrollIntoView({
      behavior: 'smooth'
    })

}

</script>
<template>

<main class="guide-page">


<section class="guide-shell">


<aside class="guide-intro">

<img 
  :src="logoImage" 
  alt="Logo Safe City"
  class="guide-intro__logo"
/>


<p class="guide-intro__eyebrow">
  Guía de uso
</p>


<h1>
  Safe City
</h1>


<p>
 Aprende a utilizar la aplicación para reportar accidentes,
 consultar rutas seguras y ayudar a tu comunidad.
</p>



<div class="progress">


<div class="progress__labels">

<span>
 Paso {{ currentStep }}
</span>

<span>
 Paso 4
</span>

</div>



<div class="progress__track">

<span 
:style="{ width: progressWidth }"
></span>

</div>


</div>


</aside>






<div class="guide-content">


<header class="guide-header">


<p class="guide-header__eyebrow">
 Empecemos
</p>


<h2>
 Bienvenido a Safe City
</h2>


<p>
 Sigue los pasos para aprender a utilizar todas las herramientas.
</p>


</header>








<section class="steps">


<article class="step-card">


<span class="step-card__number">

{{ currentGuideStep.icon }}

</span>



<h3>

{{ currentGuideStep.title }}

</h3>



<p>

{{ currentGuideStep.description }}

</p>



</article>


</section>







<div class="step-buttons">


<button

type="button"

class="secondary-btn"

@click="previousStep"

:disabled="currentStep === 1"

>

← Anterior

</button>





<button

type="button"

class="next-button"

@click="nextStep"

v-if="currentStep < 4"

>

Siguiente →

</button>




<button

type="button"

class="next-button"

@click="scrollToFaqs"

v-else

>

Continuar

</button>



</div>










<section 
id="preguntas"
class="faq-section"
>


<h2>
 Preguntas frecuentes
</h2>



<details

v-for="faq in faqs"

:key="faq.question"

class="faq-item"

>


<summary>

{{ faq.question }}

</summary>


<p>

{{ faq.answer }}

</p>


</details>





<div class="guide-actions">


<button

type="button"

class="action-button action-button--blue"

@click="goToReport"

>

Reportar

</button>





<button

type="button"

class="action-button action-button--green"

@click="goToMap"

>

Ver mapa

</button>



</div>



</section>









<section class="quiz">


<h2>
 Mini cuestionario
</h2>



<p>
¿Qué debes hacer primero cuando presencias un accidente?
</p>



<div class="quiz__answers">


<button

type="button"

@click="answerQuiz(false)"

>

A) Alejarte sin avisar.

</button>



<button

type="button"

@click="answerQuiz(true)"

>

B) Mantener la calma y reportar el accidente.

</button>



<button

type="button"

@click="answerQuiz(false)"

>

C) Mover a las personas sin ayuda.

</button>



</div>





<p

v-if="quizResult"

class="quiz__result"

:class="{ 'quiz__result--correct': quizIsCorrect }"

>

{{ quizResult }}

</p>



</section>








<section class="guide-finish">


<h2>
¡Ya estás listo para usar Safe City!
</h2>



<p>
Ahora puedes reportar accidentes, consultar rutas seguras
y ayudar a mantener informada a tu comunidad.
</p>



<div class="guide-finish__actions">


<button

type="button"

@click="goToReport"

>

Reportar

</button>




<button

type="button"

@click="goToMap"

>

Ver mapa

</button>



</div>


</section>




</div>


</section>


</main>


</template>
<style scoped>

:global(body) {
  margin: 0;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  background: #f1f5f9;
  color: #172554;
}



.guide-page {

  min-height: 100vh;

  padding: clamp(1rem, 3vw, 3rem);

  background:
  radial-gradient(
    circle at 15% 10%,
    #bfdbfe,
    transparent 25rem
  ),
  linear-gradient(
    135deg,
    #dbeafe,
    #f8fbff
  );

}



.guide-shell {

  max-width: 1200px;

  margin:auto;

  display:grid;

  grid-template-columns:
  minmax(260px,.8fr)
  minmax(0,1.5fr);

  background:white;

  border-radius:2rem;

  overflow:hidden;

  box-shadow:
  0 25px 60px rgba(30,64,175,.18);

}





/* Panel izquierdo */


.guide-intro {

  padding:3rem;

  color:white;

  background:
  linear-gradient(
    160deg,
    #102d75,
    #2563eb
  );

  display:flex;

  flex-direction:column;

}



.guide-intro__logo {

  width:120px;

  margin-bottom:2rem;

}



.guide-intro__eyebrow,
.guide-header__eyebrow {

  text-transform:uppercase;

  letter-spacing:.15em;

  font-size:.75rem;

  font-weight:800;

}



.guide-intro h1 {

  font-size:3rem;

  margin:0;

}



.guide-intro p {

  line-height:1.7;

}





/* Barra progreso */


.progress {

  margin-top:auto;

  padding-top:3rem;

}



.progress__labels {

  display:flex;

  justify-content:space-between;

  font-weight:700;

}



.progress__track {

  height:10px;

  background:#93c5fd;

  border-radius:20px;

  margin-top:.8rem;

  overflow:hidden;

}



.progress__track span {

  display:block;

  height:100%;

  background:white;

  border-radius:20px;

  transition:.4s ease;

}







/* Contenido */


.guide-content {

  padding:3rem;

}



.guide-header h2 {

  color:#102d75;

  font-size:2.5rem;

  margin:.5rem 0;

}



.guide-header p {

  color:#64748b;

}







/* Paso actual */


.steps {

  margin-top:2rem;

}



.step-card {

  min-height:220px;

  padding:2rem;

  border-radius:1.5rem;

  background:#f8fbff;

  border:1px solid #dbeafe;

  display:flex;

  flex-direction:column;

  justify-content:center;

  animation: showStep .35s ease;

}



@keyframes showStep {

from {

 opacity:0;

 transform:translateY(15px);

}

to {

 opacity:1;

 transform:translateY(0);

}

}



.step-card__number {

  width:55px;

  height:55px;

  display:grid;

  place-items:center;

  border-radius:50%;

  background:#dbeafe;

  color:#1d4ed8;

  font-weight:800;

  font-size:1.2rem;

}



.step-card h3 {

  color:#123269;

  margin:1rem 0 .5rem;

}



.step-card p {

  color:#475569;

  line-height:1.6;

}







/* Botones pasos */


.step-buttons {

  display:flex;

  justify-content:space-between;

  margin-top:2rem;

  gap:1rem;

}



.step-buttons button {

  border:none;

  border-radius:999px;

  padding:.85rem 1.4rem;

  font-weight:800;

  cursor:pointer;

}



.secondary-btn {

  background:white;

  color:#1d4ed8;

  border:1px solid #bfdbfe !important;

}



.secondary-btn:disabled {

  opacity:.5;

  cursor:not-allowed;

}



.next-button {

  background:
  linear-gradient(
  135deg,
  #1d4ed8,
  #3b82f6
  );

  color:white;

}







/* Preguntas */


.faq-section {

  margin-top:3rem;

}



.faq-section h2,
.quiz h2,
.guide-finish h2 {

  color:#102d75;

}



.faq-item {

  margin-top:.8rem;

  padding:1rem;

  border-radius:1rem;

  background:#f8fbff;

  border:1px solid #dbeafe;

}



.faq-item summary {

  cursor:pointer;

  font-weight:700;

}





.guide-actions {

  display:flex;

  gap:1rem;

  margin-top:2rem;

}




.action-button {

  border:none;

  padding:.8rem 1.2rem;

  border-radius:.8rem;

  color:white;

  font-weight:700;

  cursor:pointer;

}



.action-button--blue {

  background:#2563eb;

}



.action-button--green {

  background:#16a34a;

}







/* Quiz */


.quiz {

  margin-top:3rem;

  padding:1.5rem;

  border-radius:1.5rem;

  background:#dbeafe;

}



.quiz__answers {

  display:grid;

  gap:.8rem;

}



.quiz__answers button {

  padding:1rem;

  border-radius:.8rem;

  border:1px solid #cbd5e1;

  background:white;

  cursor:pointer;

  text-align:left;

}



.quiz__result {

  padding:.8rem;

  border-radius:.8rem;

  background:#fee2e2;

}



.quiz__result--correct {

  background:#dcfce7;

}







/* Final */


.guide-finish {

  margin-top:3rem;

  padding:2rem;

  border-radius:1.5rem;

  background:
  linear-gradient(
  135deg,
  #1d4ed8,
  #3b82f6
  );

  text-align:center;

  color:white;

}



.guide-finish h2 {

  color:white;

}



.guide-finish__actions {

  display:flex;

  justify-content:center;

  gap:1rem;

}



.guide-finish button {

  border:none;

  border-radius:.8rem;

  padding:.8rem 1.3rem;

  font-weight:800;

  cursor:pointer;

}



.guide-finish button:first-child {

  color:#1d4ed8;

}





/* Celular */


@media(max-width:800px){


.guide-shell {

 grid-template-columns:1fr;

}


.guide-intro,
.guide-content {

 padding:2rem 1.2rem;

}


.guide-intro h1 {

 font-size:2.3rem;

}


.step-buttons,
.guide-actions,
.guide-finish__actions {

 flex-direction:column;

}



.step-buttons button,
.action-button,
.guide-finish button {

 width:100%;

}


}

</style>