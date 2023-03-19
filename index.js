#!/usr/bin/env node

import meow from 'meow';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path'

const CHANGELOG_FOLDER = 'changelog'
const RELEASED_FOLDER = `${CHANGELOG_FOLDER}/released`
const UNRELEASED_FOLDER = `${CHANGELOG_FOLDER}/unreleased`

const ROOT = path.resolve('');

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

async function askFunction() {
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

async function runSelectedFunction(selected, data = []) {
    switch(selected) {
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

async function newEntry(data = []) {
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

async function addEntry(type, content = '') {
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

async function release(version) {
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
        `[${version}] - ${getDateToday()}`
    )
}

async function unreleased() {
    displayReleaseNotes(
        UNRELEASED_FOLDER,
        `Unreleased`,
    )
}

function moveUnreleasedNotes(versionFolder) {
    var folder = UNRELEASED_FOLDER

    let folders = fs.readdirSync(folder);

    createFolder(`${versionFolder}`)

    folders.forEach((typeFolder) => {
        let releaseNotes = fs.readdirSync(`${folder}/${typeFolder}`).filter((file) => file != '.gitkeep');
        if (releaseNotes.length == 0) return
        
        createFolder(`${versionFolder}/${typeFolder}`)

        releaseNotes.forEach((file) => {
            fs.rename(`${folder}/${typeFolder}/${file}`, `${versionFolder}/${typeFolder}/${file}`, () => {})
        });
    });
}

function displayReleaseNotes(folder, header = '') {
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

function createFolder(folderName, withGitKeep = false) {
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

function createFile(fileName, content = '') {
    try {
        if (!fs.existsSync(fileName)) {
            fs.writeFile(fileName, content, () => {})
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
    await askFunction();
} else {
    var [selected, ...data] = cli.input

    runSelectedFunction(selected, data)
}

function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

function toVersionFolder(version) {
    var [major, minor, patch] = version.split('.')

    return `${padNumber(major)}-${padNumber(minor)}-${padNumber(patch)}`
}  

function padNumber(number) {
    if (number <= 999) { 
        number = ("00"+number).slice(-3);
    }

    return number;
}

function getDateToday() {
    let date_time = new Date();

    let date = ("0" + date_time.getDate()).slice(-2);

    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);

    let year = date_time.getFullYear();

    return `${year}-${month}-${date}`;
}

function getPath(targetPath) {
    return path.join(ROOT, targetPath)
} 