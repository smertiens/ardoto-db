import test from 'node:test';
import { ArdotoDB } from "../dist/src/database.js";
import assert from 'node:assert';

test('instantiate db', (t) => {
    const db = new ArdotoDB('demo-db', './sandbox');
    assert(db instanceof ArdotoDB);
});