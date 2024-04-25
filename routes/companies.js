const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const companyQuery = await db.query(`SELECT * FROM companies WHERE code = $1`, [req.params.code]);
        if (companyQuery.rows.length === 0) {
            let notFoundError = new Error(`There is no company with code '${req.params.code}`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.json({ company: companyQuery.rows[0] })
    } catch (e) {
        return next(e);
    }
})

router.post("/", async function (req, res, next) {
    try {
        let { name, description } = req.body;
        let code = slugify(name, { lower: true });

        const result = await db.query(
            `INSERT INTO companies (code, name, description) 
             VALUES ($1, $2, $3) 
             RETURNING code, name, description`,
            [code, name, description]);

        return res.status(201).json({ "company": result.rows[0] });
    }

    catch (err) {
        return next(err);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        let { name, description } = req.body;
        let code = req.params.code;
        const result = await db.query(
            `UPDATE companies
               SET name=$1, description=$2
               WHERE code = $3
               RETURNING code, name, description`,
            [name, description, code]);

        if (result.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        } else {
            return res.json({ "company": result.rows[0] });
        }
    } catch (e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        let code = req.params.code;
        const result = await db.query(
            `DELETE FROM companies
               WHERE code=$1
               RETURNING code`,
            [code]);
        if (result.rows.length == 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        } else {
            return res.json({ "status": "deleted" });
        }
    } catch (e) {
        return next(e);
    }
})

module.exports = router;