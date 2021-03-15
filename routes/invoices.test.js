process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { createData } = require("../_test-common");

beforeEach(createData);

afterAll(async () => {
	await db.end(); // to end running db
});

describe("GET /", function () {
	test("It should respond with array of invoices", async function () {
		const response = await request(app).get("/invoices");
		expect(response.body).toEqual({
			invoices: [
				{ id: 1, comp_code: "apple" },
				{ id: 2, comp_code: "apple" },
				{ id: 3, comp_code: "ibm" }
			]
		});
	});
});

describe("GET /:id", function () {
	test("Gets a single invoice", async function () {
		const response = await request(app).get(`/invoices/1`);
		expect(response.body).toEqual({
			invoice: {
				id: 1,
				add_date: "2018-01-01T05:00:00.000Z",
				amt: 100,
				paid: false,
				paid_date: null,
				company: {
					code: "apple",
					name: "Apple",
					description: "Maker of OSX."
				}
			}
		});
	});

	test("Responds with 404 for invalid code", async function () {
		const response = await request(app).get("/invoices/0");
		expect(response.status).toEqual(404);
	});
});

describe("POST /", () => {
	test("Creates a new invoice", async () => {
		const res = await request(app).post("/invoices").send({
			amt: 400,
			comp_code: "ibm"
		});

		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			invoice: {
				id: 4,
				comp_code: "ibm",
				amt: 400,
				add_date: expect.any(String),
				paid: false,
				paid_date: null
			}
		});
	});
});

describe("PUT /:id", () => {
	test("It should update an invoice", async function () {
		const response = await request(app).put("/invoices/1").send({ comp_code: "apple", amt: 1000, paid: false, add_date: "2020-01-01", paid_date: null });

		expect(response.body).toEqual({
			invoice: {
				id: 1,
				comp_code: "apple",
				paid: false,
				amt: 1000,
				add_date: expect.any(String),
				paid_date: null
			}
		});
	});
	test("Responds with 404 for invalid id", async () => {
		const res = await request(app).put(`/invoices/0`).send({ amt: 1000, paid: false });
		expect(res.statusCode).toBe(404);
	});
});

describe("DELETE /:id", () => {
	test("Deletes a single invoice", async () => {
		const res = await request(app).delete(`/invoices/1`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: "deleted" });
	});
	test("Responds with 404 for invalid id", async function () {
		const response = await request(app).delete("/invoices/0");

		expect(response.status).toEqual(404);
	});
});
