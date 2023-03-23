const express = require("express");
require("./db/config");
const cors = require("cors");
const app = express();
const User = require("./db/User");
const Product = require("./db/Product");

app.use(express.json());
app.use(cors());

app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  resp.send(result);
});

app.post("/login", async (req, resp) => {
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      resp.send(user);
    } else {
      resp.send({ result: "No user Found" });
    }
  } else {
    resp.send({ result: "Please Enter Correct Details" });
  }
});

app.post("/add-product", async (req, resp) => {
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result);
});

app.get("/product-list", async (req, resp) => {
  let product = await Product.find();
  resp.send(product);
});

app.delete("/delete/:id", async (req, resp) => {
  let result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
});

app.get("/product/:id", async (req, resp) => {
  let result = await Product.findById({ _id: req.params.id });
  if (result) {
    resp.send(result);
  } else {
    resp.send({ result: "No data Found" });
  }
});

app.put("/product/:id", async (req, resp) => {
  let result = await Product.updateOne(
    {
      _id: req.params.id,
    },
    { $set: req.body }
  );
  resp.send(result);
});

app.listen(5000);
