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
        const res = await request(app).post('/invoices').send({ comp_code: `emerson`, amt: 50 });
        expect(res.statusCode).toBe(201);
        expect(res.body.invoice.id).toBeDefined();
        expect(typeof res.body.invoice.id).toBe(`number`);
        expect(res.body.invoice.comp_code).toBe(`emerson`);
        expect(res.body.invoice.amt).toBe(50);
        expect(res.body.invoice.paid).toBe(false);
        expect(res.body.invoice.add_date).toBeDefined();
        expect(typeof res.body.invoice.add_date).toBe(`string`);
        expect(res.body.invoice.paid_date).toBe(null);
    })
})

describe("PUT /invoices/:id", () => {
    test("Updates a single invoice", async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 400, paid: true })
        expect(res.statusCode).toBe(200);
        const paidDate = res.body.invoice.paid_date;
        delete res.body.invoice.paid_date;
        expect(res.body).toEqual({
            invoice: { id: testInvoice.id, comp_code: "emerson", amt: 400, paid: true, add_date: testInvoice.add_date.toISOString() }
        })
        expect(paidDate.length).toEqual(res.body.invoice.add_date.length);
        expect(typeof paidDate).toBe(`string`);
        expect(new Date(paidDate) > new Date(res.body.invoice.add_date)).toBe(true);
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