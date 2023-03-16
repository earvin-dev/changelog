## Introduction
The "@earvin.dev/changelog" package is a tool for generating and maintaining a changelog files for your project.

## Installation
To install the "@earvin.dev/changelog" package, use the following command:
```
npm install --save-dev @earvin.dev/changelog
```

## Usage
To generate a changelog file, run the following command:
```
npx changelog new <added|changed|deprecated|removed|fixed|security> "<content>"
npx changelog init
npx changelog release <version>
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
