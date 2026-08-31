<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAboutTabById, isAboutTabId } from '@/config/aboutUi'
import { getAboutConfig } from '@/services/aboutService'
import { renderMarkdown } from '@/utils/renderMarkdown'
import type { AboutConfig } from '@/types/aboutConfig'
import MoreContents from '@/components/MoreContents.vue'
import { getMoreContentsCards } from '@/config/moreContentsUi'

const pageCards = getMoreContentsCards('about')

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const hasError = ref(false)
const config = ref<AboutConfig | null>(null)

const bannerTitle = computed(() => config.value?.bannerTitle ?? 'About')

const activeTabId = computed(() => {
  if (!config.value) return null
  const fromQuery = typeof route.query.tab === 'string' ? route.query.tab : null
  if (fromQuery && isAboutTabId(config.value.tabs, fromQuery)) {
    return fromQuery
  }
  return config.value.tabs[0]?.id ?? null
})

const activeTab = computed(() => {
  if (!config.value || activeTabId.value === null) return undefined
  return getAboutTabById(config.value.tabs, activeTabId.value)
})

const activeTabHtml = computed(() => {
  if (!activeTab.value) return ''
  return renderMarkdown(activeTab.value.content)
})

function selectTab(tabId: string): void {
  if (tabId === activeTabId.value) return
  void router.replace({ query: { ...route.query, tab: tabId } })
}

onMounted(async () => {
  try {
    config.value = await getAboutConfig()
    const fromQuery = typeof route.query.tab === 'string' ? route.query.tab : null
    const firstTabId = config.value.tabs[0]?.id
    if (fromQuery && !isAboutTabId(config.value.tabs, fromQuery) && firstTabId) {
      void router.replace({ query: { ...route.query, tab: firstTabId } })
    }
  } catch (error) {
    console.warn('Failed to load About config.', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="banner-container">
      <div class="banner-content">
        <h1>{{ bannerTitle }}</h1>
      </div>
    </div>

    <div class="main-page">
      <div class="content-general">
        <div v-if="isLoading" class="about-status">Loading…</div>

        <div v-else-if="hasError || !config?.enabled" class="about-status">
          About content is unavailable right now.
        </div>

        <div v-else class="about-panel" role="region" :aria-label="bannerTitle">
          <div class="tabs" role="tablist" aria-label="About sections">
            <button
              v-for="tab in config.tabs"
              :key="tab.id"
              type="button"
              role="tab"
              class="tab"
              :class="{ 'tab--active': tab.id === activeTabId }"
              :aria-selected="tab.id === activeTabId"
              :id="`about-tab-${tab.id}`"
              :aria-controls="`about-panel-${tab.id}`"
              @click="selectTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>

          <div
            v-if="activeTab"
            class="tab-panel"
            role="tabpanel"
            :id="`about-panel-${activeTab.id}`"
            :aria-labelledby="`about-tab-${activeTab.id}`"
            v-html="activeTabHtml"
          ></div>
        </div>
      </div>
    </div>

    <MoreContents :cards="pageCards" />
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  background: #f8f8f8;
}

.banner-container {
  padding-top: 10px;
  width: 94%;
  margin-left: 3%;
  display: flex;
  flex-direction: row;
  padding-bottom: 24px;
}

.banner-content {
  background: #fdfaef;
  color: #42916e;
  flex-grow: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 10px;
  min-height: 140px;
}

.banner-content h1 {
  margin: 0 0 0 50px;
  font-size: 40px;
  font-weight: 100;
  font-style: italic;
}

.main-page {
  width: 100%;
  display: flex;
  justify-content: center;
}

.content-general {
  width: 92%;
  padding-bottom: 48px;
}

.about-status {
  padding: 28px 30px;
  background: #f2f2f2;
  border-radius: 4px;
  color: #555;
  font-size: 16px;
}

.about-panel {
  background: #f2f2f2;
  border-radius: 4px;
  overflow: hidden;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border-bottom: 1px solid #d9d9d9;
  background: #ebebeb;
}

.tab {
  appearance: none;
  border: none;
  background: transparent;
  color: #555;
  font-size: 15px;
  font-weight: 500;
  padding: 14px 20px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
}

.tab:hover {
  color: #42916e;
  background: #f5f3f3;
}

.tab--active {
  color: #42916e;
  background: #f5f3f3;
  border-bottom-color: #42916e;
}

.tab-panel {
  background: #f5f3f3;
  padding: 28px 30px 32px;
}

.tab-panel :deep(h1),
.tab-panel :deep(h2),
.tab-panel :deep(h3) {
  margin: 0 0 12px;
  font-weight: 600;
  color: #333;
}

.tab-panel :deep(h1) {
  font-size: 28px;
  line-height: 1.25;
}

.tab-panel :deep(h2) {
  font-size: 20px;
  line-height: 1.3;
}

.tab-panel :deep(h3) {
  font-size: 18px;
  line-height: 1.35;
}

.tab-panel :deep(p) {
  margin: 0 0 14px;
  font-size: 16px;
  line-height: 1.7;
  color: #333;
  text-align: justify;
}

.tab-panel :deep(ul),
.tab-panel :deep(ol) {
  margin: 0 0 14px;
  padding: 4px 0 8px 18px;
  color: #333;
  font-size: 16px;
  line-height: 1.7;
}

.tab-panel :deep(li) {
  margin-bottom: 6px;
}

.tab-panel :deep(a) {
  color: #42916e;
}

@media screen and (max-width: 750px) {
  .banner-content h1 {
    margin-left: 24px;
    font-size: 28px;
  }

  .tab {
    flex: 1 1 auto;
    text-align: center;
    padding: 12px 10px;
    font-size: 14px;
  }

  .tab-panel {
    padding: 20px 16px 24px;
  }
}
</style>
