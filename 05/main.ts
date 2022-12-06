import { assert } from 'console';
import * as fs from 'fs';
import * as readline from 'readline';

type Stack = string[];
type Instruction = {
    fromStack: number;
    toStack: number;
    count: number;
}

function restack(stacks: Stack[], instructions: Instruction[]) {
    for (const instruction of instructions) {
        const fromStack = stacks[instruction.fromStack];
        const toStack = stacks[instruction.toStack];
        const { count } = instruction;
        const elementsToMove = fromStack.splice(fromStack.length - count);
        console.log('---- move', elementsToMove, ' from', instruction.fromStack, 'to', instruction.toStack, '------');
        toStack.push(...elementsToMove.reverse());
        console.log(stacks);
    }
}

function topOfStacks(stacks: Stack[]): string {
    return stacks.map(x => {
        if (x.length > 0) {
            return x[x.length - 1];
        }
        return '';
    }).join('');
}

async function main() {
    const stream = fs.createReadStream('./05/input.data');
    const lineReader = readline.createInterface(stream);

    // Read stacks
    const stacks : Stack[] = Array.from(new Array<Stack>(10).keys()).map(() => []);
    for await (const line of lineReader) {
        if (line.trim() === '')
            break; 
        
        let stackIndex = 0;
        let i = 0;
        do {
            const element = line.substring(i, i + 3).trim();
            if (element !== '') {
                stacks[stackIndex].push(element[1]);
            }
            i += 4; // Skip element + separator
            stackIndex++;
        } while (i < line.length);
    }
    // Remove stack number from each stack and reverse list
    for (const stack of stacks) {
        stack.pop();
        stack.reverse();
    }
    console.log(stacks);
    

    // Read instructions
    const instructions : Instruction[] = [];
    for await (const line of lineReader) {
        assert(line.startsWith('move '));
        const match = line.match(/^move (\d+) from (\d+) to (\d+)$/);
        const instruction: Instruction = {
            count: Number.parseInt(match[1]),
            // Make indices 0-based
            fromStack: Number.parseInt(match[2]) - 1,
            toStack: Number.parseInt(match[3]) - 1
        }
        instructions.push(instruction);
    }

    restack(stacks, instructions);
    console.log('Top of stack:', topOfStacks(stacks));
}
main();