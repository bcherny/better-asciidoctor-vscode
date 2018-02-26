import * as path from 'path'
import {
  commands,
  Disposable,
  ExtensionContext,
  TextDocument,
  TextDocumentChangeEvent,
  TextEditor,
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
  let tryOpenPreviewWithProvider = tryOpenPreview(provider, context)

  workspace.onDidChangeTextDocument(e =>
    provider.update(makePreviewUri(e.document))
  )

  tryOpenPreviewWithProvider(window.activeTextEditor)
  window.onDidChangeActiveTextEditor(tryOpenPreviewWithProvider)

  context.subscriptions.push(
    providerRegistrations,
    registerDocumentSymbolProvider()
  )
}

// this method is called when your extension is deactivated
export function deactivate() { }

function tryOpenPreview(provider: AsciiDocProvider, context: ExtensionContext) {
  return async (activeTextEditor: TextEditor | undefined) => {
    let lastActiveTextEditor = context.workspaceState.get('activeTextEditor')
    if (!activeTextEditor || activeTextEditor === lastActiveTextEditor) {
      return
    }
    if (activeTextEditor.document.languageId !== 'asciidoc') {
      // TODO: close existing tab
      return
    }
    context.workspaceState.update('activeTextEditor', activeTextEditor)
    let x = await createHTMLWindow(provider, activeTextEditor, getColumn(activeTextEditor))
  }
}

function getColumn(activeTextEditor: TextEditor) {
  switch (activeTextEditor.viewColumn) {
    case ViewColumn.One:
      return ViewColumn.Two
    default:
      return ViewColumn.Three
  }
}
