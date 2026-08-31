/// <reference types="vite/client" />

declare const __APP_VERSION__: string

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.html?raw' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_DSP_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
