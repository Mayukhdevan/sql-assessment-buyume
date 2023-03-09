const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "productInventory.db");

// Initialize server and database
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000/")
    );
  } catch (err) {
    console.log(`DB error: ${err.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Product quantity update API

app.put("/update", async (req, res) => {
  try {
    const payload = req.body;
    let postQuery = "UPDATE products SET quantity = CASE ";

    for (let data of payload) {
      const { productId, quantity, operation } = data;

      if (operation === "add") {
        postQuery += `WHEN product_id = ${productId} THEN quantity+${quantity} `;
      } else if (operation === "subtract") {
        postQuery += `WHEN product_id = ${productId} THEN quantity-${quantity} `;
      }
    }

    postQuery += `END WHERE product_id IN
      (${payload.map((eachData) => eachData.productId)})
    ;`;
    console.log(postQuery);

    await db.run(postQuery);
    res.status(200);
    res.send("Database updated successfully.");

    console.log(postQuery);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
});
