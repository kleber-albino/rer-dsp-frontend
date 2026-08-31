<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import landingHtml from '@/content/aboutLanding.html?raw'
import '@/assets/styles/aboutLanding.css'

const baseUrl = import.meta.env.BASE_URL

const sanitizedHtml = computed(() => {
  const html = landingHtml.replace(/__BASE__/g, baseUrl)
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
  })
})
</script>

<template>
  <div class="about-landing" v-html="sanitizedHtml" />
</template>
