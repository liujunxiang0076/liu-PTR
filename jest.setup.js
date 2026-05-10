// Polyfill globals before expo runtime tries to install them
// This prevents "import a file outside of the scope of the test code" error

// Define __ExpoImportMetaRegistry with a proper value to prevent expo from trying to load it
if (typeof globalThis.__ExpoImportMetaRegistry === 'undefined') {
  Object.defineProperty(globalThis, '__ExpoImportMetaRegistry', {
    value: {
      // Minimal mock to prevent errors
      register: () => {},
      resolve: () => null,
    },
    writable: false,
    configurable: false,
    enumerable: false,
  });
}

// Polyfill structuredClone if not present
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
