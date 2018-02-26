import AsciiDoctor from 'asciidoctor.js'
import { readFileSync } from 'fs'
import { basename, resolve } from 'path'
import {
  commands,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentProvider,
  TextEditor,
  TextEditorSelectionChangeEvent,
  Uri,
  ViewColumn,
  window,
  workspace
} from 'vscode'

type State = {
  asciidoctor: AsciiDoctor.AsciiDoctor,
  css: string
}

export class AsciiDocProvider implements TextDocumentContentProvider {
  static scheme = 'adoc-preview'

  state: State = {
    asciidoctor: AsciiDoctor(),
    css: readFileSync(resolve(__dirname, '../../src', './static/default.css'), 'utf-8')
  }

  _onDidChange = new EventEmitter<Uri>()

  private resolveDocument(uri: Uri): TextDocument | null {
    const matches = workspace.textDocuments.filter(d => {
      return makePreviewUri(d).toString() === uri.toString()
    })
    if (matches.length > 0) {
      return matches[0]
    } else {
      return null
    }
  }

  provideTextDocumentContent(uri: Uri): string {
    const doc = this.resolveDocument(uri)
    if (doc) {
      return this.createAsciiDocHTML(doc)
    }
    return ''
  }

  get onDidChange(): Event<Uri> {
    return this._onDidChange.event
  }

  update(uri: Uri) {
    this._onDidChange.fire(uri)
  }

  private createAsciiDocHTML(doc: TextDocument): string {
    let editor = window.activeTextEditor

    if (!doc || !(doc.languageId === 'asciidoc')) {
      return this.errorSnippet("Active editor doesn't show an AsciiDoc document - no properties to preview.")
    }
    return this.preview(doc)
  }

  private errorSnippet(error: string): string {
    return `
      <body>
        ${error}
      </body>
    `
  }

  preview(doc: TextDocument) {
    return `
      <style>${this.state.css}</style>
      <body>${this.state.asciidoctor.convert(doc.getText())}</body>
    `
  }

}

export function makePreviewUri(doc: TextDocument): Uri {
  return Uri.parse(`adoc-preview://preview/${doc.fileName}`)
}

export async function createHTMLWindow(
  provider: AsciiDocProvider,
  displayColumn: ViewColumn
): Promise<void> {
  let previewTitle = `Preview: '${basename(window.activeTextEditor.document.fileName)}'`
  let previewUri = makePreviewUri(window.activeTextEditor.document)

  try {
    await commands.executeCommand('vscode.previewHtml', previewUri, displayColumn)
  } catch (e) {
    console.warn(e)
    window.showErrorMessage(e)
  }
}
