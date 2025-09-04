import { or, Query } from '../dist/src/query.js';
import test from 'node:test';

test('queries', (t) => {
    const q = Query.create('demo')
                .where([
                    {'name': 'peter', 'surname': 'pollywalk'}
                ])
                .limit(20)
                .all();
});