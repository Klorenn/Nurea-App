/**
 * Tipos para la API externa de Jitsi Meet (external_api.js).
 * @see https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-api
 */

declare global {
  interface JitsiMeetExternalAPIOptions {
    roomName: string
    width?: number | string
    height?: number | string
    parentNode?: HTMLElement
    configOverwrite?: Record<string, unknown>
    interfaceConfigOverwrite?: Record<string, unknown>
    userInfo?: { displayName?: string; email?: string }
    onload?: () => void
  }

  interface JitsiMeetExternalAPI {
    dispose: () => void
    executeCommand: (command: string, ...args: unknown[]) => void
  }

  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: JitsiMeetExternalAPIOptions) => JitsiMeetExternalAPI
  }
}

export {}
