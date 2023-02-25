import * as vscode from "vscode";
import { importCost, Lang, cleanup } from "import-cost";
import { logError, logInfo } from "./logging";

export function getLineImportCost() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    const msg = "No active editor";
    logError(msg);
    vscode.window.showErrorMessage(msg);
    return;
  }

  const selectedLines = getSelectedLines(activeEditor);

  if (!selectedLines) {
    const msg = "No selected lines";
    logError(msg);
    vscode.window.showErrorMessage(msg);
    return;
  }

  const doc = activeEditor.document;
  const fileName = doc.fileName;
  const lang = doc.languageId as Lang;

  selectedLines.forEach((line) => {
    const emitter = importCost(fileName, line, lang);

    emitter.on("error", (e) => logError(`importCost error: ${e}`));
    emitter.on("start", (packages) => logInfo(`importCost start: ${packages}`));
    emitter.on("calculated", (packageInfo) =>
      logInfo(`importCost calculated: ${packageInfo}`)
    );
    emitter.on("done", (packages) => {
      logInfo(`importCost done: ${packages}`);
      cleanup();
    });
    emitter.on("log", (log) => logInfo(`importCost log: ${log}`));
  });
}

function getSelectedLines(activeEditor: vscode.TextEditor) {
  if (activeEditor.selection.isSingleLine) {
    const selectedLine = activeEditor.document.lineAt(
      activeEditor.selection.active.line
    ).text;

    return [selectedLine];
  } else {
    const startline = activeEditor.selection.start.line;
    const endline = activeEditor.selection.end.line;

    const selectedLines = [];

    for (let i = startline; i <= endline; i++) {
      selectedLines.push(activeEditor.document.lineAt(i).text);
    }

    return selectedLines;
  }
}
