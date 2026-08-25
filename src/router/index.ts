import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GeoservicesView from '@/views/GeoservicesView.vue'
import AboutView from '@/views/AboutView.vue'
import { getAboutConfig } from '@/services/aboutService'

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
      path: '/about',
      name: 'about',
      component: AboutView,
      beforeEnter: async () => {
        const config = await getAboutConfig()
        return config.enabled ? true : { name: 'home' }
      },
    },
  ],
})

export default router
