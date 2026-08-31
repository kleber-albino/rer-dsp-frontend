import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutLandingView from '@/views/AboutLandingView.vue'

describe('AboutLandingView', () => {
  it('should render hardcoded about landing content', () => {
    const wrapper = mount(AboutLandingView)

    expect(wrapper.find('.about-landing').exists()).toBe(true)
    expect(wrapper.text()).toContain('About DSP')
    expect(wrapper.text()).toContain('Configurable by design')
    expect(wrapper.find('.config-highlight').exists()).toBe(true)
    expect(wrapper.find('.config-yaml').exists()).toBe(true)
    expect(wrapper.find('.config-script').text()).toBe('config.sh')
    expect(wrapper.find('details').exists()).toBe(true)
  })
})
