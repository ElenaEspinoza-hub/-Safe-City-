import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import AuthView from '../views/AuthView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ReportView from '../views/ReportView.vue'
import RoutesView from '../views/RoutesView.vue'
import ReportDetailView from '../views/ReportDetailView.vue'
import GuiaView from '../views/GuiaView.vue'
import PerfilView from '../views/PerfilView.vue'
import NewsView from '../views/NewsView.vue'
import { initializeAuth } from '../utils/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: LandingView
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { guestOnly: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  {
    path: '/reportar',
    name: 'reportar',
    component: ReportView,
    meta: { requiresAuth: true }
  },
  {
    path: '/mapa',
    name: 'mapa',
    component: RoutesView
  },
  {
    path: '/noticias',
    name: 'noticias',
    component: NewsView
  },
  {
    path: '/guia',
    name: 'guia',
    component: GuiaView
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: PerfilView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reporte/:id',
    name: 'report-detail',
    component: ReportDetailView,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const { user } = await initializeAuth()

  if (to.meta.requiresAuth && !user) {
    return { name: 'auth', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && user) {
    return { name: 'home' }
  }
})

export default router
