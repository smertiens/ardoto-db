import { lte, gt, notEqual, or, Query } from '../dist/src/query.js';
import { ArdotoDB } from '../dist/src/database.js';
import test from 'node:test';

test('queries', async (t) =>  {
    const db = new ArdotoDB('demo-db', './sandbox');

    const r = await db.collection('demo').all();
    console.log(r);
});