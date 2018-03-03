import AsciiDoctor from 'asciidoctor.js'
import { readFileSync, writeFileSync } from 'fs'
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
    css: readFileSync(resolve(__dirname, '../src', './index.css'), 'utf-8')
  }

  _onDidChange = new EventEmitter<Uri>()

  provideTextDocumentContent(uri: Uri): string {
    let document = resolveDocument(uri)
    if (document) {
      writeFileSync(resolve(__dirname, '../src', './out.html'), this.preview(document))
      return this.preview(document)
    }
    return ''
  }

  preview(doc: TextDocument) {
    return `
      <style>${this.state.css}</style>
      <body>${this.state.asciidoctor.convert(doc.getText())}</body>
    `
  }

  get onDidChange(): Event<Uri> {
    return this._onDidChange.event
  }

  update(uri: Uri) {
    this._onDidChange.fire(uri)
  }

}

function resolveDocument(uri: Uri): TextDocument | null {
  return workspace.textDocuments.filter(d =>
    makePreviewUri(d).toString() === uri.toString()
  )[0]
}

export function makePreviewUri(doc: TextDocument): Uri {
  return Uri.parse(`adoc-preview://preview/${doc.fileName}`)
}

export async function createHTMLWindow(
  provider: AsciiDocProvider,
  activeTextEditor: TextEditor,
  displayColumn: ViewColumn
): Promise<any> {
  let previewTitle = `Preview: '${basename(activeTextEditor.document.fileName)}'`
  let previewUri = makePreviewUri(activeTextEditor.document)

  try {
    return commands.executeCommand('vscode.previewHtml', previewUri, displayColumn)
  } catch (e) {
    console.warn(e)
    window.showErrorMessage(e)
  }
}
