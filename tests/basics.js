import test from 'node:test';
import { ArdotoDB } from "../dist/src/database.js";
import assert from 'node:assert';

test('instantiate db', (t) => {
    const db = new ArdotoDB('demo-db', './sandbox');
    assert(db instanceof ArdotoDB);

    db.collection('demo').createDocument({
        "name": "Max Mustermann",
        "email": "max.mustermann@example.com",
        "alter": 29,
        "stadt": "Berlin",
        "ist_aktiv": true,
        "profil": {
            "beruf": "Softwareentwickler",
            "interessen": ["Programmieren", "Radfahren", "Fotografie"],
            "social_media": {
                "twitter": "@maxmustermann",
                "linkedin": "linkedin.com/in/maxmustermann"
            }
        }
    });
});