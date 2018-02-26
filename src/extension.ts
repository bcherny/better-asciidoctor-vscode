import * as path from 'path'
import {
  commands,
  Disposable,
  ExtensionContext,
  TextDocument,
  TextDocumentChangeEvent,
  TextEditorSelectionChangeEvent,
  Uri,
  ViewColumn,
  window,
  workspace
} from 'vscode'
import {
  AsciiDocProvider,
  createHTMLWindow,
  makePreviewUri
} from './AsciiDocProvider'
import { registerDocumentSymbolProvider } from './AsciiDocSymbolProvider'

export function activate(context: ExtensionContext) {

  let provider = new AsciiDocProvider()
  let providerRegistrations = Disposable.from(
    workspace.registerTextDocumentContentProvider(AsciiDocProvider.scheme, provider)
  )

  workspace.onDidChangeTextDocument(e =>
    provider.update(makePreviewUri(e.document))
  )

  let previewToSide = commands.registerCommand('adoc.previewToSide', () =>
    createHTMLWindow(provider, window.activeTextEditor.viewColumn === ViewColumn.One
      ? ViewColumn.Two
      : ViewColumn.Three
    )
  )

  let preview = commands.registerCommand('adoc.preview', () =>
    createHTMLWindow(provider, window.activeTextEditor.viewColumn)
  )

  let registration = registerDocumentSymbolProvider()

  context.subscriptions.push(previewToSide, preview, providerRegistrations, registration)
}

// this method is called when your extension is deactivated
export function deactivate() { }
