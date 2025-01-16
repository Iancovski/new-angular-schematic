import * as vscode from 'vscode';
import { schematics, coreSchematics } from './constants/schematics.const';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('newAngularSchematic.execute', async (uri: vscode.Uri) => {
        // 1. Select the schematic
        const { selectedSchematic, isCoreSchematic } = await getSchematic();
        if (!selectedSchematic) return;

        // 2. Type the name and options
        const nameAndOptions = await getNameAndOptions(selectedSchematic, isCoreSchematic);
        if (!isCoreSchematic && !nameAndOptions) return;

        // 3. Generate the schematic
        await generateSchematic(uri, selectedSchematic, isCoreSchematic, nameAndOptions);
    });

    context.subscriptions.push(disposable);
}

async function getSchematic() {
    const selectedSchematic = await vscode.window.showQuickPick(schematics, {
        placeHolder: 'Select a schematic'
    });

    if (selectedSchematic === undefined) {
        vscode.window.showWarningMessage('New Angular Schematic cancelled.');
    }

    const isCoreSchematic: boolean = coreSchematics.includes(selectedSchematic);

    return { selectedSchematic, isCoreSchematic };
}

async function getNameAndOptions(selectedSchematic: string, isCoreSchematic: boolean) {
    let nameAndOptions: string = '';

    if (!isCoreSchematic) {
        nameAndOptions = await vscode.window.showInputBox({
            placeHolder: `Type the name and options of the ${selectedSchematic} ` +
                `(e.g. my-${selectedSchematic} --skip-tests)`
        });

        if (nameAndOptions === undefined) {
            return vscode.window.showWarningMessage('New Angular Schematic cancelled.');
        }

        nameAndOptions.trim();

        if (!nameAndOptions) {
            return vscode.window.showErrorMessage('New Angular Schematic error: no name provided.');
        }
    }

    return nameAndOptions;
}

async function generateSchematic(uri: vscode.Uri, selectedSchematic: string, isCoreSchematic: boolean, nameAndOptions?: string) {
    exec(`cd "${uri.fsPath}" && ng generate ${selectedSchematic} ${nameAndOptions}`, (_error, _stdout, stderr) => {
        if (stderr) {
            return vscode.window.showErrorMessage(`New Angular Schematic error: ${stderr.replace('Error: ', '')}`);
        }

        vscode.window.showInformationMessage(
            `${selectedSchematic[0].toUpperCase() + selectedSchematic.slice(1)} ` +
            `${!isCoreSchematic ? `"${extractSchematicName(nameAndOptions)}" ` : ''}` +
            'generated successfully.'
        );
    });
}

function extractSchematicName(nameAndOptions: string): string {
    const spaceIndex: number = nameAndOptions.indexOf(' ');

    if (spaceIndex > 0) {
        return nameAndOptions.substring(0, spaceIndex);
    } else {
        return nameAndOptions;
    }
}
