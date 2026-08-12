<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/logo.png'

const router = useRouter()
const searchQuery = ref('')
const selectedFilter = ref('Todos')

const emergencyDirectory = [
  // Servicios de emergencia principales
  {
    institution: 'Sistema de Emergencias 911',
    phone: '911',
    link: 'tel:911',
    category: 'Emergencia',
    description: 'Policía, bomberos y ambulancia',
    icon: '🚨',
    featured: true
  },
  {
    institution: 'Sistema de Emergencias Médicas',
    phone: '132',
    link: 'tel:132',
    category: 'Ambulancia',
    description: 'Ambulancia y emergencias médicas',
    icon: '🚑'
  },
  {
    institution: 'Cuerpo de Bomberos',
    phone: '913',
    link: 'tel:913',
    category: 'Bomberos',
    description: 'Incendios y rescates',
    icon: '🚒'
  },
  {
    institution: 'Cruz Roja Salvadoreña',
    phone: '+503 2239-4930',
    link: 'tel:+50322394930',
    category: 'Ambulancia',
    description: 'Emergencias y ambulancias',
    icon: '🔴'
  },
  {
    institution: 'Comandos de Salvamento',
    phone: '+503 2133-0000',
    link: 'tel:+50321330000',
    category: 'Seguridad',
    description: 'Rescates y emergencias especiales',
    icon: '🛟'
  },
  {
    institution: 'Policía Nacional Civil',
    phone: '+503 2511-6000',
    link: 'tel:+50325116000',
    category: 'Seguridad',
    description: 'Seguridad pública',
    icon: '🚓'
  },
  {
    institution: 'Protección Civil',
    phone: '+503 2281-0888',
    link: 'tel:+50322810888',
    category: 'Seguridad',
    description: 'Atención de desastres',
    icon: '🛡️'
  },
  {
    institution: 'Hospital Nacional Rosales',
    phone: '+503 2231-9200',
    link: 'tel:+50322319200',
    category: 'Hospitales',
    description: 'Hospital nacional de referencia',
    icon: '🏥'
  },
  {
    institution: 'Hospital Nacional Zacamil',
    phone: '+503 2559-0000',
    link: 'tel:+50325590000',
    category: 'Hospitales',
    description: 'Hospital metropolitano',
    icon: '🏥'
  },
  {
    institution: 'Hospital Nacional San Rafael',
    phone: '+503 2594-4000',
    link: 'tel:+50325944000',
    category: 'Hospitales',
    description: 'Hospital de La Libertad',
    icon: '🏥'
  },
  {
    institution: 'ISSS General',
    phone: '+503 2591-4500',
    link: 'tel:+50325914500',
    category: 'Hospitales',
    description: 'Hospital del ISSS',
    icon: '🏥'
  }
]

const filters = ['Todos', 'Hospitales', 'Ambulancias', 'Seguridad', 'Bomberos']

const filteredDirectory = computed(() => {
  let result = emergencyDirectory

  if (selectedFilter.value !== 'Todos') {
    const filterMap = {
      'Hospitales': 'Hospitales',
      'Ambulancias': 'Ambulancia',
      'Seguridad': 'Seguridad',
      'Bomberos': 'Bomberos'
    }
    result = result.filter(item => item.category === filterMap[selectedFilter.value])
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.institution.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    )
  }

  return result
})

const featuredItem = computed(() => {
  return emergencyDirectory.find(item => item.featured)
})

const goToReport = () => router.push('/reportar')
const goToMap = () => router.push('/mapa')
const goToLocation = (institution) => {
  // Navega al mapa con el nombre de la institución
  router.push({ name: 'mapa', query: { search: institution } })
}
</script>

<template>
  <main class="emergency-page">
    <section class="emergency-shell">
      <!-- Panel izquierdo -->
      <aside class="emergency-intro">
        <img 
          :src="logoImage" 
          alt="Logo Safe City"
          class="emergency-intro__logo"
        />

        <p class="emergency-intro__eyebrow">
          Emergencias
        </p>

        <h1>
          Contactos de Emergencia
        </h1>

        <p>
          Accede rápidamente a los números de hospitales, ambulancias, Cruz Roja, Bomberos, Policía y otros servicios de emergencia en El Salvador.
        </p>

        <div class="alert-box">
          <p class="alert-box__icon">📞</p>
          <p class="alert-box__text">
            En una emergencia, llama inmediatamente al servicio correspondiente y comparte tu ubicación.
          </p>
        </div>
      </aside>

      <!-- Panel derecho -->
      <div class="emergency-content">
        <!-- Encabezado -->
        <header class="emergency-header">
          <p class="emergency-header__eyebrow">
            Emergencias
          </p>
          <h2>
            Números importantes
          </h2>
          <p>
            Selecciona un servicio para comunicarte rápidamente.
          </p>
        </header>

        <!-- Tarjeta destacada 911 -->
        <div v-if="featuredItem" class="featured-card">
          <div class="featured-card__content">
            <p class="featured-card__label">Emergencia Inmediata</p>
            <p class="featured-card__number">{{ featuredItem.phone }}</p>
            <p class="featured-card__description">{{ featuredItem.description }}</p>
          </div>
          <a :href="featuredItem.link" class="featured-card__button">
            Llamar ahora
          </a>
        </div>

        <!-- Barra de búsqueda -->
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar servicio..."
            class="search-box__input"
          />
          <span class="search-box__icon">🔍</span>
        </div>

        <!-- Filtros -->
        <div class="filters">
          <button
            v-for="filter in filters"
            :key="filter"
            @click="selectedFilter = filter"
            :class="['filter-chip', { 'filter-chip--active': selectedFilter === filter }]"
          >
            {{ filter }}
          </button>
        </div>

        <!-- Grid de tarjetas -->
        <div class="contacts-grid">
          <div 
            v-for="(item, idx) in filteredDirectory" 
            :key="idx"
            class="contact-card"
          >
            <div class="contact-card__icon">{{ item.icon }}</div>
            <div class="contact-card__content">
              <h3 class="contact-card__title">{{ item.institution }}</h3>
              <p class="contact-card__description">{{ item.description }}</p>
              <p class="contact-card__phone">{{ item.phone }}</p>
            </div>
            <div class="contact-card__actions">
              <a :href="item.link" class="btn btn--call">
                Llamar
              </a>
              <button @click="goToLocation(item.institution)" class="btn btn--location">
                Ubicación
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="filteredDirectory.length === 0" class="no-results">
          <p>No se encontraron resultados para tu búsqueda.</p>
        </div>

        <!-- Acciones inferiores -->
        <div class="action-buttons">
          <button @click="goToReport" class="action-button action-button--primary">
            📋 Reportar accidente
          </button>
          <button @click="goToMap" class="action-button action-button--secondary">
            🗺️ Ver mapa
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

.emergency-page {
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 3rem);
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1a1f35 100%);
}

.emergency-shell {
  max-width: 1200px;
  margin: auto;
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.5fr);
  gap: 2rem;
}

/* Panel izquierdo */
.emergency-intro {
  padding: 3rem;
  color: white;
  background: linear-gradient(160deg, #dc2626 0%, #f97316 100%);
  display: flex;
  flex-direction: column;
  border-radius: 2rem;
  box-shadow: 0 20px 60px rgba(220, 38, 38, 0.3);
}

.emergency-intro__logo {
  width: 120px;
  margin-bottom: 2rem;
  filter: brightness(0) invert(1);
}

.emergency-intro__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.75rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.5rem 0;
}

.emergency-intro h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  font-weight: 900;
}

.emergency-intro p {
  line-height: 1.7;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.alert-box {
  margin-top: auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.alert-box__icon {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.alert-box__text {
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* Panel derecho */
.emergency-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.emergency-header__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.75rem;
  font-weight: 800;
  color: #f97316;
  margin: 0;
}

.emergency-header h2 {
  color: #fbbf24;
  font-size: 2.5rem;
  margin: 0.5rem 0;
  font-weight: 900;
}

.emergency-header p {
  color: #cbd5e1;
  font-size: 1.1rem;
  margin: 0;
}

/* Tarjeta destacada */
.featured-card {
  padding: 2rem;
  border-radius: 2rem;
  background: linear-gradient(135deg, #dc2626, #f97316);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 20px 60px rgba(220, 38, 38, 0.3);
  gap: 2rem;
}

.featured-card__content {
  flex: 1;
}

.featured-card__label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 700;
}

.featured-card__number {
  font-size: 3rem;
  font-weight: 900;
  color: white;
  margin: 0.5rem 0;
}

.featured-card__description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.featured-card__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background: white;
  color: #dc2626;
  border-radius: 999px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.featured-card__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3);
}

/* Barra de búsqueda */
.search-box {
  position: relative;
}

.search-box__input {
  width: 100%;
  padding: 1rem 1.5rem 1rem 3rem;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 1rem;
  color: #e2e8f0;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-box__input::placeholder {
  color: #64748b;
}

.search-box__input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

.search-box__icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

/* Filtros */
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 0.7rem 1.3rem;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  color: #cbd5e1;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-chip:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
}

.filter-chip--active {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

/* Grid de tarjetas */
.contacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.contact-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-card:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
  transform: translateY(-5px);
}

.contact-card__icon {
  font-size: 2.5rem;
}

.contact-card__content {
  flex: 1;
}

.contact-card__title {
  color: #f0f9ff;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0 0 0.3rem 0;
}

.contact-card__description {
  color: #cbd5e1;
  font-size: 0.85rem;
  margin: 0 0 0.8rem 0;
}

.contact-card__phone {
  color: #06b6d4;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.contact-card__actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 0.7rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;
}

.btn--call {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  flex: 1;
}

.btn--call:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.btn--location {
  background: rgba(6, 182, 212, 0.2);
  color: #06b6d4;
  border: 1px solid #06b6d4;
  flex: 1;
}

.btn--location:hover {
  background: rgba(6, 182, 212, 0.3);
  transform: translateY(-2px);
}

/* Sin resultados */
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: #cbd5e1;
  font-size: 1.1rem;
}

/* Botones de acción inferiores */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.action-button {
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button--primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.action-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.5);
}

.action-button--secondary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.action-button--secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(16, 185, 129, 0.5);
}

/* Responsive */
@media (max-width: 800px) {
  .emergency-shell {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .emergency-intro,
  .emergency-content {
    padding: 2rem 1.2rem;
  }

  .emergency-intro h1 {
    font-size: 2rem;
  }

  .featured-card {
    flex-direction: column;
    text-align: center;
  }

  .featured-card__number {
    font-size: 2.5rem;
  }

  .contacts-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .emergency-header h2 {
    font-size: 2rem;
  }
}
</style>
