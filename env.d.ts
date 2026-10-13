/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_STATIC_ROUTES?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_WS_URL?: string
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
