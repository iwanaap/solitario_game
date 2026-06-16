export const ACCOUNT_UPDATED_EVENT = 'el-solitario-account-updated'

export function notifyAccountUpdated(): void {
  window.dispatchEvent(new Event(ACCOUNT_UPDATED_EVENT))
}
