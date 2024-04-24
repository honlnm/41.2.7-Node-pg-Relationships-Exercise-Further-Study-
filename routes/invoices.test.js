process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testInvoice;

beforeEach(async () => {
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('emerson', 'Emerson', 'Maker of everything') RETURNING code, name, description`)
    const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date) VALUES ('emerson', 500, false, '2023-01-01') RETURNING id, comp_code, amt, paid, add_date, paid_date`);
    testInvoice = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE from companies`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /invoices", () => {
    test("Get a list with one invoice", async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ invoices: [{ id: testInvoice.id, comp_code: testInvoice.comp_code }] })
    })
})

describe("GET /invoices/:id", () => {
    test("Gets a single invoice", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        const companyQuery = await db.query((`SELECT * FROM companies WHERE code = '${testInvoice.comp_code}'`))
        company = companyQuery.rows[0];
        expect(res.body).toEqual({
            invoice: {
                id: testInvoice.id,
                company,
                amt: testInvoice.amt,
                paid: testInvoice.paid,
                add_date: testInvoice.add_date.toISOString(),
                paid_date: testInvoice.paid_date ? testInvoice.paid_date.toISOString() : null
            }
        })
    })
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).get(`/invoices/0`)
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /invoices", () => {
    test("Creates a single invoice", async () => {
        const res = await request(app).post('/invoices').send({ comp_Code: `emerson`, amt: 50 });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: { id: testInvoice.id, comp_Code: `emerson`, amt: 50, paid: false, add_date: testInvoice.add_date, paid_date: null }
        })
    })
})

describe("PUT /invoices/:id", () => {
    test("Updates a single invoice", async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 400, paid: true })
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: { id: testInvoice.id, comp_code: "emerson", amt: 400, paid: true, add_date: testInvoice.add_date.toISOString(), paid_date: testInvoice.paid_date.toISOString() }
        })
    })
    test("Rsponds with 404 for invalid id", async () => {
        const res = await request(app).patch(`/invoices/0`).send({ amt: 500, paid: true })
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /invoices/:id", () => {
    test("Deletes a single invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'deleted' });
    })
})