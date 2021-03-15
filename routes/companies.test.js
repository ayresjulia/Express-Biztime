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
	test("It should respond with array of companies", async function () {
		const response = await request(app).get("/companies");
		expect(response.body).toEqual({
			companies: [
				{ code: "apple", name: "Apple", description: "Maker of OSX." },
				{ code: "ibm", name: "IBM", description: "Big blue." }
			]
		});
	});
});

describe("GET /:code", function () {
	test("Gets a single company", async function () {
		const response = await request(app).get("/companies/apple");
		expect(response.body).toEqual({
			company: {
				code: "apple",
				name: "Apple",
				description: "Maker of OSX.",
				invoices: [1, 2]
			}
		});
	});

	test("Responds with 404 for invalid code", async function () {
		const response = await request(app).get("/companies/none");
		expect(response.status).toEqual(404);
	});
});

describe("POST /", () => {
	test("Creates a new company", async () => {
		const res = await request(app).post("/companies").send({ code: "UBS", name: "UBS Bank", description: "banking" });
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			company: { code: "UBS", name: "UBS Bank", description: "banking" }
		});
	});
});

describe("PUT /:code", () => {
	test("Updates a single company", async () => {
		const res = await request(app).put(`/companies/ibm`).send({ name: "IBMMM", description: "harry potter" });
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company: { code: "ibm", name: "IBMMM", description: "harry potter" }
		});
	});
	test("Responds with 404 for invalid code", async () => {
		const res = await request(app).put(`/companies/0`).send({ name: "UBSBank", description: "banking" });
		expect(res.statusCode).toBe(404);
	});
});

describe("DELETE /:code", () => {
	test("Deletes a single company", async () => {
		const res = await request(app).delete(`/companies/apple`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: "deleted" });
	});
});
