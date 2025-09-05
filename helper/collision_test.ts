import { DocumentIdFactory } from "../src/factories.js";

let generated = [];
let collisions = 0;

for (let n = 0; n < 100000; n++) {
    const id = DocumentIdFactory.makeId();
    if (generated.includes(id)) {
        collisions++;
    }

    generated.push(id);

    if (n % 10000 == 2) {
        console.log(`Run ${n}: ${collisions} collisions.`);
    }
}

console.log(`Colisions: ${collisions}`);