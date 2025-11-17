const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json()); // to use the body parameters
app.set("view engine", "ejs"); // set EJS as the template engine (no need to use the .ejs in the path)

// address: localhost, port: 3000, path: /books ... etc, method: get/post ...etc
const port = 3000;

//read data once when server Statrs
const books = JSON.parse(fs.readFileSync("./data/books.json", "utf-8"));
const reviews = JSON.parse(fs.readFileSync("./data/reviews.json", "utf-8"));

app.get("/api/books", (req, res) => {
  res.json({ success: true, data: books });
});

app.get("/", (req, res) => {
  console.log(books.length);
  res.render("index", {
    name: "nader",
    books: books.books,
    totalBooks: books.books.length,
  });
  console.log(books.books);
});

app.listen(port, () => {
  console.log("The server is running on port ", port);
});

/*
    -For Testing:
        // Path parameters, sent by the client and managed in the server side.

        app.get("/findSumm/:num1/:num2", (req, res) => {
            const { num1, num2 } = req.params;
            const sum = Number(num1) + Number(num2);
            console.log(`num1 is ${num1} and num2 is ${num2} and the sum is ${sum}`);
            res.json({ sum: sum });
        });

        // body parameters, sent by the client and managed in the server side.

            app.get("/sayHello", (req, res) => {
                const { name, age } = req.body;
                res.send(`Hello ${name} your age  is: ${age}`);
            });

        // query parameters, sent by the client and managed in the server side.

                the URI => {{baseUrl}}/sayHello?age=50

                    app.get("/sayHello", (req, res) => {
                        const { name } = req.body;
                        const { age } = req.query;
                        res.send(`Hello ${name} your age  is: ${age}`);
                    });
    
            SSR => rendering HTML Fils
            app.get("/wlc", (req, res) => {
        res.sendFile(__dirname + "/views/index.html");
        });

            SSR => Using Template Engine "EJS"
            note: make sure to include --> app.set("view engine", "ejs"); in the top or the file

            app.get("/wlc", (req, res) => {
                res.render("index");
            });
*/
