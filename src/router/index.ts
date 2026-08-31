import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GeoservicesView from '@/views/GeoservicesView.vue'
import AboutView from '@/views/AboutView.vue'
import AboutLandingView from '@/views/AboutLandingView.vue'
import { getAboutConfig } from '@/services/aboutService'

async function ensureAboutEnabled() {
  const config = await getAboutConfig()
  return config.enabled ? true : { name: 'home' as const }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/geoservices',
      name: 'geoservices',
      component: GeoservicesView,
    },
    {
      path: '/about/platform',
      name: 'about-landing',
      component: AboutLandingView,
      beforeEnter: ensureAboutEnabled,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      beforeEnter: ensureAboutEnabled,
    },
  ],
})

export default router
