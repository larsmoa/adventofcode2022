import { assert } from 'console';
import * as fs from 'fs';
import * as readline from 'readline';

async function main() {
    // const stream = fs.createReadStream('./06/input.data');
    // const lineReader = readline.createInterface(stream);
    const content = fs.readFileSync('./06/input.data', 'utf8');
    let headerEnd = -1;
    for (let i = 0; i < content.length; i++) {
        const fourChars = content.substring(i, i + 4);
        if (fourChars.length === 4 && new Set(fourChars).size === 4) {
            console.log(fourChars);
            headerEnd = i + 4;
            break;
        }
    }
    console.log('Part 1 - Package header ends at', headerEnd);

    let startOfMessageEnd = -1;
    for (let i = 0; i < content.length; i++) {
        const startOfMessage = content.substring(i, i + 14);
        if (startOfMessage.length === 14 && new Set(startOfMessage).size === 14) {
            console.log(startOfMessage);
            startOfMessageEnd = i + 14;
            break;
        }
    }
    console.log('Part 2: Start of message ends at', startOfMessageEnd);

}
main();