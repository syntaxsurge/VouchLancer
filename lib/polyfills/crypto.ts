// Polyfill for environments where global crypto lacks SubtleCrypto
;(function () {
  try {
    if (
      typeof globalThis.crypto === 'undefined' ||
      typeof (globalThis.crypto as any).subtle === 'undefined'
    ) {
      const nodeCrypto = require('crypto') as typeof import('crypto')
      if (nodeCrypto && nodeCrypto.webcrypto && nodeCrypto.webcrypto.subtle) {
        globalThis.crypto = nodeCrypto.webcrypto as unknown as Crypto
      }
    }
  } catch {
    /* ignore polyfill errors */
  }
})()
