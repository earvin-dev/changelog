import { describe } from '@jest/globals'
import {
    toTitleCase,
    toVersionFolder,
    padNumber,
    dateToString,
} from '../src/util'

describe('toTitleCase', () => {
    test('should return title case', () => {
        const str = 'the hobbit';
        expect(toTitleCase(str)).toBe('The Hobbit');
    });
    test('should return title case', () => {
        const str = 'the hobbit: there and back again';
        expect(toTitleCase(str)).toBe('The Hobbit: There And Back Again');
    });
});

describe('toVersionFolder', () => {
    test('should return version folder', () => {
        const version = '1.0.0';
        expect(toVersionFolder(version)).toBe('001-000-000');
    });
    test('should return version folder', () => {
        const version = '1.10.100';
        expect(toVersionFolder(version)).toBe('001-010-100');
    });
});

describe('padNumber', () => {
    test('should return padded number', () => {
        const num = '1';
        expect(padNumber(num)).toBe('001');
    });
    test('should return padded number', () => {
        const num = '10';
        expect(padNumber(num)).toBe('010');
    });
    test('should return padded number', () => {
        const num = '100';
        expect(padNumber(num)).toBe('100');
    });
});

describe('dateToString', () => {
    test('should return date string', () => {
        const dateData = new Date('2021-01-01');
        expect(dateToString(dateData)).toBe('2021-01-01');
    });
    test('should return date string', () => {
        const dateData = new Date('2021-10-10');
        expect(dateToString(dateData)).toBe('2021-10-10');
    });
});