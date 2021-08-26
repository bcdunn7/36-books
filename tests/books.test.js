process.env.NODE_ENV = "test"; 

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testBook;


beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO 
      books (isbn, amazon_url,author,language,pages,publisher,title,year)   
      VALUES(
        '12345678', 
        'https://amazon.com/bookhere', 
        'Bryce', 
        'en', 
        246,  
        'Fortress', 
        'booktitle', 2021) 
      RETURNING isbn, amazon_url,author,language,pages,publisher,title,year `);

  testBook = result.rows[0]
});

afterEach(async () => {
    await db.query(`DELETE FROM books`);
})

afterAll(async () => {
    await db.end();
})


describe("GET /books", () => {
    test("Get list of books", async () => {
        const resp = await request(app).get('/books');

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            books: [testBook]
        })
    })
})

describe("GET /books/:id", () => {
    test("Get info for one book", async () => {
        const resp = await request(app).get('/books/12345678');

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({book: testBook})
    })

    test("Fail if not found", async () => {
        const resp = await request(app).get('/books/999');

        expect(resp.statusCode).toEqual(404);
    })
})

describe("POST /books", () => {
    test("Add new book", async () => {
        let newBook = {
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
        }

        const resp = await request(app)
            .post('/books')
            .send(newBook);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({book: newBook});
    });

    test("Fail if invalid JSON", async () => {
        let wrongBook = {
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            // "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
        }

        const resp = await request(app)
            .post('/books')
            .send(wrongBook);

        expect(resp.statusCode).toEqual(400);
    })
});

describe("PUT /books/:isbn", () => {
    test("Update book", async () => {
        const resp = await request(app)
            .put('/books/12345678')
            .send({
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Matthew Lane",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                "year": 2017
            })

        expect(resp.statusCode).toEqual(200);
        expect(resp.body.book.pages).toEqual(264);
        })

    test("Fail if invalid JSON", async () => {
        const resp = await request(app)
            .put('/books/12345678')
            .send({
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Matthew Lane",
                "language": "english",
                // "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                "year": 2017
            })

        expect(resp.statusCode).toEqual(400);
        })

    test("Fail if include isbn", async () => {
        const resp = await request(app)
            .put('/books/12345678')
            .send(testBook);

        expect(resp.statusCode).toEqual(400);
    })

    test("Fail if not found", async () => {
        const resp = await request(app).get('/books/999');

        expect(resp.statusCode).toEqual(404);
    })
})

describe("DELETE /books/:isbn", () => {
    test("Delete book", async () => {
        const resp = await request(app).delete('/books/12345678');

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({message: "Book deleted"});
    })
})