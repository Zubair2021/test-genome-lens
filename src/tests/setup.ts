import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Web APIs for test environment
declare global {
  // eslint-disable-next-line no-var
  var crypto: Crypto
  // eslint-disable-next-line no-var
  var indexedDB: IDBFactory
}

if (typeof globalThis !== 'undefined') {
  if (!globalThis.crypto) {
    globalThis.crypto = {
      randomUUID: () => Math.random().toString(36).substring(7),
    } as Crypto
  }

  if (!globalThis.indexedDB) {
    globalThis.indexedDB = {
      open: vi.fn(),
      deleteDatabase: vi.fn(),
    } as unknown as IDBFactory
  }
}
