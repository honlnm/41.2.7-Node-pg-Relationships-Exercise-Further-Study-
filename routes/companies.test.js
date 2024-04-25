process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async () => {
    let result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('CR', 'Crossroads', 'animal shelter') RETURNING code, name, description`);
    testCompany = result.rows[0];
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
})

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("Get a list with one company", async () => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ companies: [{ code: testCompany.code, name: testCompany.name, description: testCompany.description }] })
    })
})

describe("GET /companies/:code", () => {
    test("Get a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        const companyQuery = await db.query((`SELECT * FROM companies WHERE code = '${testCompany.code}'`))
        company = companyQuery.rows[0];
        expect(res.body).toEqual({ company });
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/companies/0`)
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /companies", () => {
    test("Creates a new company", async () => {
        const res = await request(app).post(`/companies`).send({ code: `KT`, name: `Kwik Trip`, description: `Gas Station Convienience Store` });
        expect(res.statusCode).toBe(201);
        expect(res.body.company.code).toBeDefined();
        expect(typeof res.body.company.code).toBe(`string`);
        expect(res.body.company.name).toBe(`Kwik Trip`);
        expect(res.body.company.description).toBe('Gas Station Convienience Store');
    })
})

describe("PUT /companies/:code", () => {
    test("Updates a single company", async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({ name: 'BlueNote', description: 'restaurant' })
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: { name: 'BlueNote', description: 'restaurant', code: testCompany.code }
        })
    })
    test("Rsponds with 404 for invalid code", async () => {
        const res = await request(app).patch(`/companies/0`).send({ name: 'BlueNote', description: 'restaurant' })
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /companies/:code", () => {
    test("Deletes a single company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'deleted' });
    })
})

