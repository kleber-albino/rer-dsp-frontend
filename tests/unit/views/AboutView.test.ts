import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '@/views/AboutView.vue'
import { getAboutConfig } from '@/services/aboutService'
import type { AboutConfig } from '@/types/aboutConfig'

vi.mock('@/services/aboutService', () => ({
  getAboutConfig: vi.fn(),
}))

const CONFIG: AboutConfig = {
  enabled: true,
  bannerTitle: 'About',
  defaultTabId: 'overview',
  tabs: [
    { id: 'overview', label: 'Overview', content: '# Overview\n\nDigital Public Good.' },
    { id: 'license', label: 'License', content: '## License\n\nGPL-3.0, see LICENSE.' },
  ],
}

async function mountAbout(query: Record<string, string> = {}) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/geoservices', component: { template: '<div />' } },
      { path: '/about', name: 'about', component: AboutView },
    ],
  })
  await router.push({ path: '/about', query })
  await router.isReady()

  const wrapper = mount(AboutView, {
    global: {
      plugins: [router],
    },
  })
  await flushPromises()
  return { wrapper, router }
}

describe('AboutView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show a loading state before the config resolves', async () => {
    let resolveConfig: (value: AboutConfig) => void = () => {}
    vi.mocked(getAboutConfig).mockReturnValue(
      new Promise((resolve) => {
        resolveConfig = resolve
      }),
    )

    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/about', name: 'about', component: AboutView }],
    })
    await router.push('/about')
    await router.isReady()
    const wrapper = mount(AboutView, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('Loading')

    resolveConfig(CONFIG)
    await flushPromises()
    expect(wrapper.text()).not.toContain('Loading')
  })

  it('should render banner and dynamic tabs on success', async () => {
    vi.mocked(getAboutConfig).mockResolvedValue(CONFIG)

    const { wrapper } = await mountAbout()

    expect(wrapper.text()).toContain('About')
    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.text()).toContain('License')
    expect(wrapper.text()).toContain('Digital Public Good.')
    expect(wrapper.find('.tab-panel h1').text()).toBe('Overview')
  })

  it('should switch tab content and update query, rendering markdown as HTML', async () => {
    vi.mocked(getAboutConfig).mockResolvedValue(CONFIG)

    const { wrapper, router } = await mountAbout()

    const licenseTab = wrapper
      .findAll('button[role="tab"]')
      .find((button) => button.text() === 'License')
    await licenseTab!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.tab).toBe('license')
    expect(wrapper.find('h2').text()).toBe('License')
    expect(wrapper.text()).toContain('GPL-3.0')
  })

  it('should open a tab from the query string', async () => {
    vi.mocked(getAboutConfig).mockResolvedValue(CONFIG)

    const { wrapper } = await mountAbout({ tab: 'license' })

    expect(wrapper.text()).toContain('GPL-3.0')
  })

  it('should fall back to the default tab when the query is invalid', async () => {
    vi.mocked(getAboutConfig).mockResolvedValue(CONFIG)

    const { wrapper, router } = await mountAbout({ tab: 'not-a-real-tab' })

    expect(router.currentRoute.value.query.tab).toBe('overview')
    expect(wrapper.text()).toContain('Digital Public Good.')
  })

  it('should show a graceful empty state on network error', async () => {
    vi.mocked(getAboutConfig).mockRejectedValue(new Error('offline'))

    const { wrapper } = await mountAbout()

    expect(wrapper.text()).toContain('About')
    expect(wrapper.text()).toContain('unavailable')
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
  })

  it('should show a graceful empty state when the feature is disabled', async () => {
    vi.mocked(getAboutConfig).mockResolvedValue({ ...CONFIG, enabled: false })

    const { wrapper } = await mountAbout()

    expect(wrapper.text()).toContain('unavailable')
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
  })
})
