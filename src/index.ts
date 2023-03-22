#!/usr/bin/env node

import figlet from 'figlet';
import fs from 'fs';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import meow from 'meow';
import { dateToString, getPath, toTitleCase, toVersionFolder } from './util.js';

const CHANGELOG_FOLDER = 'changelog'
const RELEASED_FOLDER = `${CHANGELOG_FOLDER}/released`
const UNRELEASED_FOLDER = `${CHANGELOG_FOLDER}/unreleased`

const ToolFunction = {
    'new': 'new',
    'release': 'release',
    'unreleased': 'unreleased',
    'init': 'init',
}

const ChangelogType = {
    'added': 'added',
    'changed': 'changed',
    'deprecated': 'deprecated',
    'removed': 'removed',
    'fixed': 'fixed',
    'security': 'security',
}

async function askFunction(): Promise<void> {
    const answer = await inquirer.prompt({
        name: 'selected_function',
        type: 'list',
        message: 'Changelog CLI Tool',
        choices: [
            ToolFunction.new,
            ToolFunction.release,
            ToolFunction.init,
        ],
    })

    return runSelectedFunction(answer['selected_function'])
}

async function runSelectedFunction(selected: string, data: string[] = []) {
    switch (selected) {
        case ToolFunction.new:
            newEntry(data)
            break;
        case ToolFunction.release:
            var [version] = data

            release(version)
            break;
        case ToolFunction.unreleased:
            unreleased()
            break;
        case ToolFunction.init:
            init()
            break;
        default:
            console.log(usage)
    }
}

async function newEntry(data: string[] = []): Promise<void> {
    var changelogTypes = [
        ChangelogType.added,
        ChangelogType.changed,
        ChangelogType.deprecated,
        ChangelogType.removed,
        ChangelogType.fixed,
        ChangelogType.security,
    ]

    if (data.length == 0) {
        const answer = await inquirer.prompt({
            name: 'new_entry',
            type: 'list',
            message: 'New Entry',
            choices: changelogTypes,
        })

        return addEntry(answer['new_entry'])
    }

    var [type, ...content] = data

    if (!changelogTypes.includes(type)) {
        console.log(usage)

        return
    }

    addEntry(type, content.join(' '));
}

async function addEntry(type: string, content: string = ''): Promise<void> {
    if (content == '') {

        const answer = await inquirer.prompt({
            name: 'content',
            message: 'Content',
        })

        return addEntry(type, answer['content'])
    }

    var dateTimeStamp = Date.now();

    createFile(`${UNRELEASED_FOLDER}/${type}/${dateTimeStamp}`, content)
}

async function init() {
    createChangelogFolder()
    const msg = `
Init Success
`;

    figlet(msg, (err, data) => {
        console.log(gradient.pastel.multiline(data))
    })
}

async function release(version: string): Promise<void> {
    if (version == undefined) {
        const answer = await inquirer.prompt({
            name: 'version',
            message: 'Version',
        })

        return release(answer['version'])
    }

    var versionFolder = `${RELEASED_FOLDER}/${toVersionFolder(version)}`;

    moveUnreleasedNotes(versionFolder)

    displayReleaseNotes(
        versionFolder,
        `[${version}] - ${dateToString(new Date())}`
    )
}

async function unreleased() {
    displayReleaseNotes(
        UNRELEASED_FOLDER,
        `Unreleased`,
    )
}

function moveUnreleasedNotes(versionFolder: string) {
    var folder = UNRELEASED_FOLDER

    let folders = fs.readdirSync(folder);

    createFolder(`${versionFolder}`)

    folders.forEach((typeFolder) => {
        let releaseNotes = fs.readdirSync(`${folder}/${typeFolder}`).filter((file) => file != '.gitkeep');
        if (releaseNotes.length == 0) return

        createFolder(`${versionFolder}/${typeFolder}`)

        releaseNotes.forEach((file) => {
            fs.rename(`${folder}/${typeFolder}/${file}`, `${versionFolder}/${typeFolder}/${file}`, () => { })
        });
    });
}

function displayReleaseNotes(folder: string, header: string = '') {
    let folders = fs.readdirSync(folder);

    var releaseNotesData = '';

    folders.forEach((typeFolder) => {

        let releaseNotes = fs.readdirSync(`${folder}/${typeFolder}`).filter((file) => file != '.gitkeep');
        if (releaseNotes.length == 0) return

        releaseNotesData += `\n### ${toTitleCase(typeFolder)}\n`

        releaseNotes.forEach((file) => {
            const buffer = fs.readFileSync(`${folder}/${typeFolder}/${file}`);

            releaseNotesData += `\n- ${buffer.toString()}`
        });
    });

    console.log(`## ${header}\n${releaseNotesData}`)
}

function createChangelogFolder() {
    createFolder(getPath(CHANGELOG_FOLDER))
    createFolder(getPath(RELEASED_FOLDER), true)
    createFolder(getPath(UNRELEASED_FOLDER))
    createFolder(getPath(`${UNRELEASED_FOLDER}/${ChangelogType.added}`), true)
    createFolder(getPath(`${UNRELEASED_FOLDER}/${ChangelogType.changed}`), true)
    createFolder(getPath(`${UNRELEASED_FOLDER}/${ChangelogType.deprecated}`), true)
    createFolder(getPath(`${UNRELEASED_FOLDER}/${ChangelogType.removed}`), true)
    createFolder(getPath(`${UNRELEASED_FOLDER}/${ChangelogType.fixed}`), true)
    createFolder(getPath(`${UNRELEASED_FOLDER}/${ChangelogType.security}`), true)
}

function createFolder(folderName: string, withGitKeep: boolean = false) {
    try {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName)

            if (withGitKeep) {
                createFile(`${folderName}/.gitkeep`)
            }
        }
    } catch (err) {
        console.error(err)
    }
}

function createFile(fileName: string, content: string = '') {
    try {
        if (!fs.existsSync(fileName)) {
            fs.writeFile(fileName, content, () => { })
        }
    } catch (err) {
        console.error(err)
    }
}

const usage = `
Usage
  $ npx changelog new <added|changed|deprecated|removed|fixed|security> "<content>"
  $ npx changelog init
  $ npx changelog release <version>
  $ npx changelog unreleased

Options
  --help, -h  Help

Examples
  $ npx changelog new added "Changed Layout"
  $ npx changelog init
  $ npx changelog release 1.0.1
  $ npx changelog unreleased
`

const cli = meow(usage, {
    importMeta: import.meta,
});

if (cli.input.length == 0) {
    askFunction();
} else {
    var [selected, ...data] = cli.input

    runSelectedFunction(selected, data)
}
