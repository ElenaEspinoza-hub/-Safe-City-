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

const routes = [
  {
    path: '/',
    name: 'home',
    component: LandingView
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/reportar',
    name: 'reportar',
    component: ReportView
  },
  {
    path: '/mapa',
    name: 'mapa',
    component: RoutesView
  },
  {
    path: '/guia',
    name: 'guia',
    component: GuiaView
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: PerfilView
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

export default router
