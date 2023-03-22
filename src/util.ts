
import path from 'path';
const ROOT = path.resolve('');

export function toTitleCase(str: string): string {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

export function toVersionFolder(version: string): string {
    var [major, minor, patch] = version.split('.')

    return `${padNumber(major)}-${padNumber(minor)}-${padNumber(patch)}`
}

export function padNumber(num: string): string {
    if (parseInt(num) <= 999) {
        num = ("00" + num).slice(-3);
    }

    return num;
}

export function getDateToday(): string {
    let date_time = new Date();

    return dateToString(date_time);
}

export function dateToString(dateData: Date): string {
    let date_time = new Date(dateData);

    let date = ("0" + date_time.getDate()).slice(-2);

    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);

    let year = date_time.getFullYear();

    return `${year}-${month}-${date}`;
}

export function getPath(targetPath: string): string {
    return path.join(ROOT, targetPath)
} 