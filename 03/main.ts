import { assert } from 'console';
import * as fs from 'fs';
import * as readline from 'readline';

// function findDuplicate(compartmentOne: string, compartmentTwo: string): string
// {
//     const compartmentOneSet = new Set<string>(compartmentOne.split(''));
//     const compartmentTwoSet = new Set<string>(compartmentTwo.split(''));
//     for (const element of compartmentOneSet.values()) {
//         if (compartmentTwoSet.has(element)) {
//             return element;
//         }
//     }
//     assert(false);
//     return '';
// }

function findDuplicate(compartment1: string, ...otherCompartments: string[]): string
{
    const compartment1Set = new Set<string>(compartment1.split(''));
    const otherCompartmentSets = otherCompartments.map(x => new Set<string>(x.split('')));
    for (const element of compartment1Set.values()) {
        if (otherCompartmentSets.every(x => x.has(element))) {
            return element;
        }
    }
    assert(false);
    return '';
}

function priority(c: string): number {
    assert(c.length === 1);
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) // A-Z
        return code - 65 + 27;
    if (code >= 97 && code <= 122) // a-z
        return code - 97 + 1;
    assert(false);
}

async function main() {
    const stream = fs.createReadStream('./03/input.data');
    const lineReader = readline.createInterface(stream);

    // PART ONE
    // let sum = 0;
    // for await (const line of lineReader) {
    //     assert(line.length % 2 === 0);
    //     const compartmentOne = line.substring(0, line.length / 2);
    //     const compartmentTwo = line.substring(line.length / 2);
    //     console.log('------------');
    //     const duplicate = findDuplicate(compartmentOne, compartmentTwo);
    //     const pri = priority(duplicate);
    //     sum += pri;
    //     console.log(compartmentOne, compartmentTwo, duplicate, pri);
    // }
    // console.log(sum);


    // PART TWO
    const lines: string[] = [];
    for await (const line of lineReader) {
        lines.push(line);        
    }
    assert(lines.length % 3 === 0);

    let sum = 0;
    for (let i = 0; i < lines.length; i+=3) {
        const badge = findDuplicate(lines[i], lines[i+1], lines[i+2]);
        sum += priority(badge);
    }
    console.log(sum);


}
main();