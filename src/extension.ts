// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as childProcess from 'child_process';

let editor: vscode.TextEditor | undefined;
let resultView: vscode.WebviewPanel | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('activate');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('vscode-csharp-playground.new', () => {
		console.log('vscode-csharp-playground.new');
		if (!editor) {
			const doc = vscode.workspace.openTextDocument({ language: 'csharp' });
			doc.then((document) => {
				vscode.window.showTextDocument(document, vscode.ViewColumn.One);
				editor = vscode.window.activeTextEditor;
				createResultView();
			});
		} else {
			const column = editor.viewColumn || vscode.ViewColumn.One;
			const doc = vscode.workspace.openTextDocument({ language: 'csharp' });
			doc.then((document) => {
				vscode.window.showTextDocument(document, column);
				editor = vscode.window.activeTextEditor;
			});
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-csharp-playground.run', () => {
		console.log('vscode-csharp-playground.run');
		if (editor && editor.document.languageId === 'csharp') {
			const code = editor.document.getText();
			executeCSharpCode(code);
		}
	}));
}
function createResultView() {
	resultView = vscode.window.createWebviewPanel('vscode-csharp-playgroundResult', 'C# Playground Result', {
		viewColumn: vscode.ViewColumn.Two
	});

	resultView.webview.html = getWebviewContent();

	resultView.webview.onDidReceiveMessage((message) => {
		if (message.command === 'printOutput') {
			resultView?.webview.postMessage({
				command: 'printOutput',
				text: message.text
			});
		}
	});
}
function executeCSharpCode(code: string) {
    //const tempFilePath = `${vscode.workspace.workspaceFolders}/playground.cs`;
    //fs.writeFileSync(tempFilePath, code);

    //const command = `dotnet run ${tempFilePath}`;
	const command = `dotnet --info`;
    childProcess.exec(command, (error, stdout, stderr) => {
        if (resultView) {
            resultView.webview.postMessage({
                command: 'printOutput',
                text: error ? `Error: ${error.message}` : stdout + stderr
            });
        }
    });
}

// Execute the C# code and print the output to the output channel
function getWebviewContent(): string {
	const htmlPath = vscode.Uri.file(
		vscode.extensions.getExtension('your-extension-id')?.extensionPath + '/webview/index.html'
	);
	const htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf-8');
	return htmlContent;
}

// This method is called when your extension is deactivated
export function deactivate() { }
