const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
	try {
		const result = await db.query("SELECT id,comp_code FROM invoices");
		return res.json({ invoices: result.rows });
	} catch (e) {
		return next(e);
	}
});

router.get("/:id", async function (req, res, next) {
	try {
		let { id } = req.params;

		const result = await db.query(
			`SELECT i.id,
                    i.comp_code,
                    i.amt,
                    i.paid,
                    i.add_date,
                    i.paid_date,
                    c.name,
                    c.description
            FROM invoices AS i
            JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id = $1`,
			[id]
		);
		if (result.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id : ${id}`, 404);
		}

		const data = result.rows[0];
		const invoice = {
			id: data.id,
			company: {
				code: data.comp_code,
				name: data.name,
				description: data.description
			},
			amt: data.amt,
			paid: data.paid,
			add_date: data.add_date,
			paid_date: data.paid_date
		};

		return res.json({ invoice: invoice });
	} catch (err) {
		return next(err);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const result = await db.query("INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date", [comp_code, amt]);
		return res.status(201).json({ invoice: result.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.put("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const { comp_code, amt, paid, add_date, paid_date } = req.body;
		const result = await db.query("UPDATE invoices SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5 WHERE id=$6 RETURNING id, comp_code, amt, paid, add_date, paid_date", [
			comp_code,
			amt,
			paid,
			add_date,
			paid_date,
			id
		]);
		if (result.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id : ${id}`, 404);
		}
		return res.send({ invoice: result.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		const result = await db.query("DELETE FROM invoices WHERE id=$1 RETURNING id", [req.params.id]);
		if (result.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id : ${req.params.id}`, 404);
		} else {
			return res.json({ status: "deleted" });
		}
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
