<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/logo.png'

const router = useRouter()

const currentStep = ref(1)

const quizAnswer = ref(null)
const quizQuestionIndex = ref(0)
const quizCompleted = ref(false)
const quizQuestions = [
  {
    prompt: '¿Qué debes hacer primero cuando presencias un accidente?',
    answers: [
      { id: 'leave', label: 'A) Alejarte sin avisar.' },
      { id: 'protect', label: 'B) Protegerte y revisar que sea seguro acercarte.' },
      { id: 'move', label: 'C) Mover a las personas heridas de inmediato.' }
    ],
    correctAnswer: 'protect',
    explanation: 'Primero protégete y revisa los riesgos. Después avisa a emergencias.'
  },
  {
    prompt: '¿A qué número puedes llamar para pedir atención médica de emergencia en El Salvador?',
    answers: [
      { id: '911', label: 'A) 911.' },
      { id: '132', label: 'B) 132.' },
      { id: 'none', label: 'C) No hace falta avisar.' }
    ],
    correctAnswer: '132',
    explanation: 'El 132 corresponde al Sistema de Emergencias Médicas. El 911 atiende emergencias generales.'
  },
  {
    prompt: '¿Qué debes hacer con una persona herida si no hay un peligro inmediato?',
    answers: [
      { id: 'move', label: 'A) Moverla para que esté más cómoda.' },
      { id: 'water', label: 'B) Darle agua.' },
      { id: 'still', label: 'C) Evitar moverla y seguir las instrucciones de emergencias.' }
    ],
    correctAnswer: 'still',
    explanation: 'Evita mover a la persona herida salvo que exista un peligro inmediato y sigue las instrucciones del operador.'
  }
]
const currentQuizQuestion = computed(() => quizQuestions[quizQuestionIndex.value])
const quizIsCorrect = computed(() => quizAnswer.value === currentQuizQuestion.value.correctAnswer)
const quizResult = computed(() => {
  if (quizAnswer.value === null) return ''
  return quizIsCorrect.value
    ? `¡Correcto! ${currentQuizQuestion.value.explanation}`
    : `Respuesta incorrecta. ${currentQuizQuestion.value.explanation}`
})


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

const accidentActions = [
  {
    title: '1. Protégete y revisa el entorno',
    description: 'Detente en un lugar seguro, enciende las luces de emergencia y observa el tráfico, humo, fuego, derrames o cables caídos antes de acercarte. No te expongas para tomar fotos ni para colocar señales.'
  },
  {
    title: '2. Avisa a emergencias en El Salvador',
    description: 'Llama al 911 para una emergencia general o al 132 para solicitar atención médica del Sistema de Emergencias Médicas. Indica municipio, carretera o punto de referencia, sentido de circulación, cantidad de vehículos y personas heridas, y cualquier peligro presente.'
  },
  {
    title: '3. Ayuda sin agravar las lesiones',
    description: 'No muevas a una persona herida ni le quites el casco, salvo que exista un peligro inmediato. No des líquidos a una persona inconsciente. Sigue las instrucciones del operador de emergencias y tranquiliza a la persona mientras llega ayuda.'
  },
  {
    title: '4. Comparte información útil',
    description: 'Cuando ya estés a salvo, reporta el incidente en Safe City con la ubicación y una descripción clara. No publiques nombres, rostros, placas ni imágenes sensibles de las personas afectadas.'
  }
]


const answerQuiz = (answer) => {
  if (quizAnswer.value !== null || quizCompleted.value) return
  quizAnswer.value = answer
}

const nextQuizQuestion = () => {
  if (quizAnswer.value === null || quizCompleted.value) return

  if (quizQuestionIndex.value === quizQuestions.length - 1) {
    quizCompleted.value = true
    return
  }

  quizQuestionIndex.value += 1
  quizAnswer.value = null
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










<section class="accident-guide" aria-labelledby="accident-guide-title">
  <p class="guide-header__eyebrow">Orientación para El Salvador</p>
  <h2 id="accident-guide-title">¿Qué hacer ante un accidente de tránsito?</h2>
  <p class="accident-guide__intro">Sigue el principio PAS: Proteger, Avisar y Socorrer. Primero cuida tu seguridad; una persona más en riesgo dificulta la atención.</p>

  <article v-for="action in accidentActions" :key="action.title" class="accident-action">
    <h3>{{ action.title }}</h3>
    <p>{{ action.description }}</p>
  </article>


  
</section>

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



<template v-if="!quizCompleted">
  <p class="quiz__progress">Pregunta {{ quizQuestionIndex + 1 }} de {{ quizQuestions.length }}</p>
  <p id="quiz-question">{{ currentQuizQuestion.prompt }}</p>

  <div class="quiz__answers" role="group" aria-labelledby="quiz-question">
    <button
      v-for="choice in currentQuizQuestion.answers"
      :key="choice.id"
      type="button"
      :disabled="quizAnswer !== null"
      :class="{
        'quiz__answer--correct': quizAnswer !== null && choice.id === currentQuizQuestion.correctAnswer,
        'quiz__answer--incorrect': quizAnswer === choice.id && !quizIsCorrect
      }"
      @click="answerQuiz(choice.id)"
    >
      {{ choice.label }}
    </button>
  </div>

  <p
    v-if="quizResult"
    class="quiz__result"
    :class="{ 'quiz__result--correct': quizIsCorrect }"
    role="status"
    aria-live="polite"
  >
    {{ quizResult }}
  </p>

  <button type="button" class="quiz__next" :disabled="quizAnswer === null" @click="nextQuizQuestion">
    Siguiente
  </button>
</template>

<p v-else class="quiz__result quiz__result--correct" role="status" aria-live="polite">
  ¡Cuestionario completado! Ya repasaste cómo protegerte, avisar a emergencias y ayudar con precaución.
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
    #020202,
    transparent 25rem
  ),
  linear-gradient(
    135deg,
    #dbeafe,
    #000000
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

  color:rgb(255, 255, 255);

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
  color: #ffffff;

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

  color:#030303;

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

  color:rgb(0, 0, 0);

}







/* Preguntas */


.faq-section {

  margin-top:3rem;

}

.accident-guide {
  margin-top: 3rem;
  padding: 1.5rem;
  border: 1px solid #bfdbfe;
  border-radius: 1.5rem;
  background: #eff6ff;
}

.accident-guide h2 {
  margin: .35rem 0;
  color: #102d75;
}

.accident-guide__intro,
.accident-action p,
.emergency-numbers p,
.accident-guide__source {
  line-height: 1.6;
  color: #000000;
}

.accident-action {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  background: #fff;
}

.accident-action h3,
.emergency-numbers h3 {
  margin: 0;
  color: #123269;
}

.accident-action p,
.emergency-numbers p {
  margin: .4rem 0 0;
  color: #1e293b;
}

.emergency-numbers {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  background: #dbeafe;
}

.emergency-numbers a {
  color: #123269;
  font-weight: 800;
}

.accident-guide__source {
  margin: 1rem 0 0;
  color: #475569;
  font-size: .85rem;
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

  background:#2453ec;

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

  color:rgb(255, 255, 255);

  font-weight:700;

  cursor:pointer;

}



.action-button--blue {

  background:#2563eb;

}



.action-button--green {

  background:#02702a;

}







/* Quiz */


.quiz {

  margin-top:3rem;

  padding:1.5rem;

  border-radius:1.5rem;

  background:#4594fc;

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
  color: #000000;

  cursor:pointer;

  text-align:left;

}

.quiz__answers button:disabled {
  cursor: default;
  opacity: .82;
}

.quiz__progress {
  margin-bottom: .5rem;
  color: #123269;
  font-size: .9rem;
  font-weight: 700;
}

.quiz__answers button.quiz__answer--correct {
  border-color: #15803d;
  background: #dcfce7;
  color: #14532d;
  font-weight: 700;
}

.quiz__answers button.quiz__answer--incorrect {
  border-color: #b91c1c;
  background: #fee2e2;
  color: #7f1d1d;
}



.quiz__result {

  padding:.8rem;

  border-radius:.8rem;

  background:#e90f0f;

}



.quiz__result--correct {

  background:#dcfce7;
  color:#14532d;

}

.quiz__result:not(.quiz__result--correct) {
  background: #fee2e2;
  color: #7f1d1d;
}

.quiz__next {
  margin-top: .8rem;
  border: 0;
  border-radius: .8rem;
  padding: .8rem 1rem;
  background: #123269;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.quiz__next:disabled {
  cursor: not-allowed;
  opacity: .55;
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

  color:rgb(255, 255, 255);

}



.guide-finish h2 {

  color:rgb(255, 255, 255);

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
