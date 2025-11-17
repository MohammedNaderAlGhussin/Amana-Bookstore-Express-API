const express = require("express");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const app = express();
app.use(express.json()); // to use the body parameters
app.set("view engine", "ejs"); // set EJS as the template engine (no need to use the .ejs in the path)

// address: localhost, port: 3000, path: /books ... etc, method: get/post ...etc
const port = 3000;

//read data once when server Statrs
const books = JSON.parse(fs.readFileSync("./data/books.json", "utf-8"));
const reviews = JSON.parse(fs.readFileSync("./data/reviews.json", "utf-8"));

//Implement a logging function such that whenever any route is hit, it creates a record of the event in the file called log.txt
const logStlogream = fs.createWriteStream(
  path.join(__dirname, "./logging/log.txt"),
  { flags: "a" } // 'a' means append (don't overwrite)
);
app.use(morgan("combined", { stream: logStream }));

// GET Rquestes
app.get("/api/books", (req, res) => {
  res.json({ success: true, data: books });
});

app.get("/api/books/view/:bookId", (req, res) => {
  const { bookId } = req.params;
  const book = books.books.find((b) => b.id == bookId);

  if (isNaN(bookId)) {
    return res.status(400).json({ success: false, message: "Invalid Book ID" });
  }

  if (!book)
    return res.status(404).json({ success: false, message: "Book not found" });
  res.json({ success: true, book });
});

// GET /api/books/published?start=2022-01-01&end=2022-12-31
app.get("/api/books/published", (req, res) => {
  const { start, end } = req.query;

  // validate query parameters
  if (!start || !end) {
    return res
      .status(400)
      .json({ success: false, message: "Start and end dates are required" });
  }
  // converts the string from the query or JSON into a Date object.
  const startDate = new Date(start);
  const endDate = new Date(end);

  // check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid date format" });
  }

  // filter books within the range
  const filteredBooks = books.books.filter((book) => {
    const pubDate = new Date(book.datePublished);
    return pubDate >= startDate && pubDate <= endDate;
  });

  res.json({ success: true, books: filteredBooks });
});

app.get("/api/books/top-rated", (req, res) => {
  // 1. Calculate score for each book
  const booksWithScore = books.books.map((book) => ({
    ...book,
    score: book.rating * book.reviewCount,
  }));

  // 2. Sort descending by score
  booksWithScore.sort((a, b) => b.score - a.score);

  // 3. Take top 10
  const top10 = booksWithScore.slice(0, 10);

  // 4. Return response
  res.json({ success: true, books: top10 });
});

app.get("/api/books/featured", (req, res) => {
  // filter books with featured = true
  const featuredBooks = books.books.filter((book) => book.featured);

  res.json({ success: true, books: featuredBooks });
});

app.get("/api/reviews/book/:bookId", (req, res) => {
  const { bookId } = req.params;

  // optional: validate bookId
  const bookExists = books.books.find((b) => b.id === bookId);
  if (!bookExists) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }

  // filter reviews for this book
  const bookReviews = reviews.reviews.filter(
    (review) => review.bookId === bookId
  );

  res.json({ success: true, reviews: bookReviews });
});

// Post Requests.

// a function to restrict who can make POST requests to only users you have designated as authenticated
function authMiddleware(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== "SECRET123") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing API key",
    });
  }

  next(); // user is allowed
}

app.post("/api/books", authMiddleware, (req, res) => {
  const { title, author, year, rating, reviewsCount } = req.body;

  // 1. Validate
  if (!title || !author) {
    return res.status(400).json({
      success: false,
      message: "Title and author are required",
    });
  }

  // 2. Create new book object
  const newBook = {
    id:
      books.books.length == 0
        ? 1
        : Number(books.books[books.books.length - 1].id) + 1,
    title,
    author,
    year: year || null,
    rating: rating || 0,
    reviewsCount: reviewsCount || 0,
  };
  console.log();

  // 3. Save to array
  books.books.push(newBook);

  // 4. Return response
  res.status(201).json({
    success: true,
    book: newBook,
  });
});

app.post("/api/reviews", authMiddleware, (req, res) => {
  const { bookId, user, rating, comment } = req.body;

  // 1. Basic validation
  if (!bookId || !user || !rating) {
    return res.status(400).json({
      success: false,
      message: "bookId, user, and rating are required",
    });
  }

  // 2. Check if book exists
  const bookExists = books.books.some((b) => b.id == bookId);
  if (!bookExists) {
    return res.status(404).json({
      success: false,
      message: "Book not found",
    });
  }

  // 3. Create new review

  const reviewId = reviews.reviews[reviews.reviews.length - 1].id
    .split("")
    .filter((e) => {
      return !isNaN(parseInt(e));
    })
    .join("");
  const newReview = {
    id:
      reviews.reviews.length == 0
        ? `review-${1}`
        : `review-${Number(reviewId) + 1}`,
    bookId,
    user,
    rating,
    comment: comment || "",
  };

  console.log(`review-${Number(reviewId) + 1}`);

  // 4. Add to array
  reviews.reviews.push(newReview);

  // 5. Return response
  res.status(201).json({
    success: true,
    review: newReview,
  });
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
        --------------- same ejs but with logic in .ejs file (html elements)
            app.get("/", (req, res) => {
                    console.log(books.length);
                    res.render("index", {
                        name: "nader",
                        books: books.books,
                        totalBooks: books.books.length,
                });
                        console.log(books.books);
            });
*/
