declare module 'asciidoctor.js' {
  namespace AsciiDoctor {
    type AsciiDoctor = {
      convert(content: string, options?: ConvertOptions): string
      load(content: string): Document
      loadFile(filename: string): Document
      Extensions: {
        create(): void
        register(): void
      }
    }
    type Document = {
      getAttribute(attr: 'data-uri'): 'false' | 'true'
      setAttribute(attr: 'data-uri', value: 'false' | 'true'): void
      removeAttribute(attr: 'data-uri'): void
    }
    type ConvertOptions = {
      safe?: 'safe'
      attributes?: {
        icons?: 'fonts'
        showtitle?: true
      }
    }
    type ConfigOptions = {
      runtime?: {
        engine?: 'v8',
        framework?: 'webextensions'
        ioModule?: 'java_nio' | 'node' | 'phantomjs' | 'spidermonkey' | 'xmlhttprequest'
        platform?: 'browser'
      }
    }
  }
  function AsciiDoctor(options?: AsciiDoctor.ConfigOptions): AsciiDoctor.AsciiDoctor
  export = AsciiDoctor
}

declare module 'file-url'
