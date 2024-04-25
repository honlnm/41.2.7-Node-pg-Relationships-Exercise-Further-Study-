const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM industries`);
        return res.json({ industries: results.rows });
    } catch (e) {
        return next(e);
    }
})

router.post("/", async function (req, res, next) {
    try {
        let { code, industry } = req.body;
        const result = await db.query(
            `INSERT INTO industries (code, industry) 
             VALUES ($1, $2)
             RETURNING code, industry`,
            [code, industry]);
        return res.status(201).json({ "industry": result.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});



module.exports = router;