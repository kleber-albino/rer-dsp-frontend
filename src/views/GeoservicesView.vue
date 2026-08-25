<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DownloadsFilterPanel, {
  type DownloadsFilterPayload,
} from '@/components/DownloadsFilterPanel.vue'
import DownloadsThemesTable from '@/components/DownloadsThemesTable.vue'
import { downloadsUiConfig } from '@/config/downloadsUi'
import type { SelectOption } from '@/config/searchHierarchy'
import {
  downloadThemeFile,
  getDownloadThemes,
  searchDownloads,
  triggerBrowserDownload,
} from '@/services/downloadService'
import type { DownloadItemDTO } from '@/types/download'
import MoreContents from '@/components/MoreContents.vue'
import LoadingDotsComponent from '@/components/LoadingDotsComponent.vue'
import { getMoreContentsCards } from '@/config/moreContentsUi'
import { getAboutConfig } from '@/services/aboutService'

const pageCards = ref(getMoreContentsCards('geoservices', false))
onMounted(async () => {
  const aboutConfig = await getAboutConfig()
  pageCards.value = getMoreContentsCards('geoservices', aboutConfig.enabled)
})

const ui = downloadsUiConfig
const themeOptions = ref<SelectOption[]>([])
const items = ref<DownloadItemDTO[]>([])
const searching = ref(false)
const searchError = ref('')
const hasSearched = ref(false)
const lastFilter = ref<DownloadsFilterPayload | null>(null)
const loadingButtons = ref<Record<string, boolean>>({})

onMounted(() => {
  void loadThemes()
})

async function loadThemes(): Promise<void> {
  try {
    const themes = await getDownloadThemes()
    themeOptions.value = themes.map((theme) => ({
      value: theme.code,
      label: theme.name,
    }))
  } catch (error) {
    console.error(error)
    searchError.value = 'Could not load themes. Check the API.'
  }
}

async function onSearch(payload: DownloadsFilterPayload): Promise<void> {
  if (!payload.level2) {
    return
  }

  searching.value = true
  searchError.value = ''
  hasSearched.value = true
  lastFilter.value = { ...payload }

  try {
    items.value = await searchDownloads({
      level1: payload.level1 || null,
      level2: payload.level2,
      level3: payload.level3 || null,
      theme: payload.theme || null,
    })
  } catch (error) {
    console.error(error)
    items.value = []
    searchError.value = 'Download search failed. Check the API.'
  } finally {
    searching.value = false
  }
}

function onClear(): void {
  searchError.value = ''
}

function onSelectionChange(): void {
  items.value = []
  hasSearched.value = false
  lastFilter.value = null
}

function buttonKey(themeCode: string, format: string): string {
  return `${themeCode}:${format}`
}

async function onDownload(item: DownloadItemDTO, format: string): Promise<void> {
  if (!lastFilter.value?.level2) {
    searchError.value = 'Select level 2 before downloading.'
    return
  }

  const key = buttonKey(item.themeCode, format)
  loadingButtons.value[key] = true
  searchError.value = ''

  try {
    const { blob, fileName } = await downloadThemeFile({
      level2: lastFilter.value.level2,
      level3: lastFilter.value.level3 || null,
      theme: item.themeCode,
      format,
    })
    triggerBrowserDownload(blob, fileName)
  } catch (error) {
    console.error(error)
    searchError.value = 'Could not download the file.'
  } finally {
    loadingButtons.value[key] = false
  }
}
</script>

<template>
  <div class="page">
    <div class="banner-container">
      <div class="banner-content">
        <h1>{{ ui.bannerTitle }}</h1>
      </div>
    </div>

    <div class="main-page">
      <div class="content-general">
        <DownloadsFilterPanel
          :theme-options="themeOptions"
          @search="onSearch"
          @clear="onClear"
          @selection-change="onSelectionChange"
        />

        <p v-if="searching" class="status-msg"><LoadingDotsComponent /></p>
        <p v-else-if="searchError" class="status-msg status-msg--error">{{ searchError }}</p>
        <p v-else-if="hasSearched && !items.length" class="status-msg">
          {{ ui.noResultsMessage }}
        </p>

        <DownloadsThemesTable
          v-if="items.length"
          :items="items"
          :loading-buttons="loadingButtons"
          @download="onDownload"
        />
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

.status-msg {
  margin: 0 0 16px;
  font-size: 14px;
  color: #707070;
}

.status-msg--error {
  color: #b9382e;
}

@media screen and (max-width: 750px) {
  .banner-content h1 {
    margin-left: 24px;
    font-size: 28px;
  }
}
</style>
