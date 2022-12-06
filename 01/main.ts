import * as fs from 'fs';
import * as readline from 'readline';

const stream = fs.createReadStream('./1/input.data');
const lineReader = readline.createInterface(stream);

async function main() {
    let elvCalories: number[] = [0];
    for await (const line of lineReader) {
        if (line === '') {
            elvCalories.push(0);
        } else {
            let lineNumber = Number.parseInt(line);
            elvCalories[elvCalories.length - 1] += lineNumber;
        }
    }

    elvCalories.sort((a,b) => b - a );    

    console.log('top:', elvCalories[0]);
    console.log('sum of top three:', elvCalories[0] + elvCalories[1] + elvCalories[2]);
}
main();