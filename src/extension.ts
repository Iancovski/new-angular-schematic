import * as vscode from 'vscode';
import { schematics } from './constants/schematics.const';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('new-angular-schematic.newAngularSchematic', async (uri) => {

        // 1. Select the schematic
        const selectedSchematic = await vscode.window.showQuickPick(schematics, {
            placeHolder: 'Select a schematic'
        });

        if (!selectedSchematic) {
            return vscode.window.showErrorMessage('New Angular Schematic cancelled: no schematic selected.');
        }

        // 2. Type the name and options
        const name = await vscode.window.showInputBox({
            placeHolder: `Type the name and options of the ${selectedSchematic}`
        });

        if (!name) {
            return vscode.window.showErrorMessage('New Angular Schematic cancelled: no name provided.');
        }

        exec(`cd "${uri.fsPath}" && ng generate ${selectedSchematic} ${name}`, (error, stdout, stderr) => {
            if (stderr) {
                return vscode.window.showErrorMessage(`New Angular Schematic error:\n ${stderr.replace('Error: ', '')}`);
            }

            vscode.window.showInformationMessage(`${selectedSchematic[0].toUpperCase() + selectedSchematic.slice(1)} "${name}" generated successfully.`);
        });

    });
    
    context.subscriptions.push(disposable);
}

export function deactivate() {}
