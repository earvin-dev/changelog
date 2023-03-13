#!/usr/bin/env node

import meow from 'meow';
import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import fs from 'fs';

const ToolFunction = {
    'new': 'new',
    'release': 'release',
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
            release(data)
            break;
        case ToolFunction.init:
            init()
            break;
        default:
            console.log(usage)
    }
}

async function newEntry(data = []) {
    if (data.length == 0) {
        const answer = await inquirer.prompt({
            name: 'new_entry',
            type: 'list',
            message: 'New Entry',
            choices: [
                ChangelogType.added,
                ChangelogType.changed,
                ChangelogType.deprecated,
                ChangelogType.removed,
                ChangelogType.fixed,
                ChangelogType.security,
            ],
        })

        return addEntry(answer['new_entry'])
    }

    addEntry(data[0], data[1]);
}

async function addEntry(type, content = '') {
    if (content == '') {
        
        const answer = await inquirer.prompt({
            name: 'content',
            message: 'Content',
        })

        return addEntry(type, answer['content'])
    }

    createFile(type, content)
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

async function release() {

}

function winner() {
    console.clear();
    const msg = `
Congrats , halo

Testing
`;

    figlet(msg, (err, data) => {
        console.log(gradient.pastel.multiline(data))
    })
}

function createChangelogFolder() {
    createFolder('changelog')
    createFolder('changelog/released', true)
    createFolder('changelog/unreleased')
    createFolder('changelog/unreleased/added', true)
    createFolder('changelog/unreleased/changed', true)
    createFolder('changelog/unreleased/deprecated', true)
    createFolder('changelog/unreleased/removed', true)
    createFolder('changelog/unreleased/fixed', true)
    createFolder('changelog/unreleased/security', true)
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
  $ changelog new <added|changed|deprecated|removed|fixed|security> "<content>"
  $ changelog init
  $ changelog release <version>

Options
  --help, -h  Help

Examples
  $ changelog new added "Changed Layout"
  $ changelog init
  $ changelog release 1.0.1
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
