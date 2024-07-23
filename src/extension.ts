import * as vscode from 'vscode';
import { schematics, singleSchematics } from './constants/schematics.const';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('new-angular-schematic.newAngularSchematic', async (uri) => {

        // 1. Select the schematic
        const selectedSchematic = await vscode.window.showQuickPick(schematics, {
            placeHolder: 'Select a schematic'
        });

        if (selectedSchematic === undefined) {
            return vscode.window.showWarningMessage('New Angular Schematic cancelled.');
        }

        const isSingleSchematic: boolean = singleSchematics.includes(selectedSchematic);

        // 2. Type the name and options
        const nameAndOptions = await vscode.window.showInputBox({
            placeHolder: `Type the ${!isSingleSchematic ? 'name and ' : ''}options of the ${selectedSchematic}`
        });

        if (nameAndOptions === undefined) {
            return vscode.window.showWarningMessage('New Angular Schematic cancelled.');
        }

        if (!isSingleSchematic && !nameAndOptions) {
            return vscode.window.showErrorMessage('New Angular Schematic error: no name provided.');
        }

        exec(`cd "${uri.fsPath}" && ng generate ${selectedSchematic} ${nameAndOptions}`, (error, stdout, stderr) => {
            if (stderr) {
                return vscode.window.showErrorMessage(`New Angular Schematic error: ${stderr.replace('Error: ', '')}`);
            }

            vscode.window.showInformationMessage(
                `${selectedSchematic[0].toUpperCase() + selectedSchematic.slice(1)} ${!isSingleSchematic ? '"${nameAndOptions}" ' : ''}generated successfully.`
            );
        });

    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
