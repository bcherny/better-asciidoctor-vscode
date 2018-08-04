import {
  Disposable,
  ExtensionContext,
  TextEditor,
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
  let tryOpenPreviewWithProvider = tryOpenPreview(context)

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

function tryOpenPreview(context: ExtensionContext) {
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
    await createHTMLWindow(activeTextEditor, getColumn(activeTextEditor))
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
