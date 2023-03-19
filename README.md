## Introduction
The "@earvin.dev/changelog" package is a tool for generating and maintaining a changelog files for your project that can output into a standard [keepachangelog](https://keepachangelog.com/en/1.1.0/) format.

Inspired by [whitecloakph/changelog-sh](https://github.com/whitecloakph/changelog-sh) and [fireship-io/javascript-millionaire](https://github.com/fireship-io/javascript-millionaire)

## Installation
To install the "@earvin.dev/changelog" package, use the following command:
```
npm install --save-dev @earvin.dev/changelog
```

## Usage
To generate a changelog file, run the following command:
```
npx changelog new <added|changed|deprecated|removed|fixed|security> "{content}"
npx changelog init
npx changelog release {version}
npx changelog unreleased
```
Sample:
```
npx changelog init
npx changelog unreleased
npx changelog new added "Update layout"
npx changelog release 0.0.1
```
Interactive:
```
npx changelog
```
