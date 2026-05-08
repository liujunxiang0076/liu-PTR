// Polyfill globals before expo runtime tries to install them
// This prevents "import a file outside of the scope of the test code" error

// Prevent expo's installGlobal from overriding by making properties non-configurable
const globalsToPolyfill = [
  'TextDecoder',
  'TextDecoderStream', 
  'TextEncoderStream',
  'URL',
  'URLSearchParams',
  '__ExpoImportMetaRegistry',
  'structuredClone',
];

for (const name of globalsToPolyfill) {
  if (!(name in globalThis)) {
    // Set a dummy value so expo's lazy getter won't trigger
    Object.defineProperty(globalThis, name, {
      value: undefined,
      writable: true,
      configurable: false,
      enumerable: false,
    });
  }
}
