const express = require("express");
require("./db/config");
const cors = require("cors");
const app = express();
const User = require("./db/User");
const Product = require("./db/Product");
const Jwt = require("jsonwebtoken");
const jwtKey = "list";

app.use(express.json());
app.use(cors());

app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      resp.send({ result: "Something went Wrong" });
    } else {
      resp.send({ result, auth: token });
    }
  });
});

app.post("/login", async (req, resp) => {
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          resp.send({ result: "No User" });
        } else {
          resp.send({ user, auth: token });
        }
      });
    }
  } else {
    resp.send({ result: "Please Enter Correct Details" });
  }
});

app.post("/add-product", verifyToken, async (req, resp) => {
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result);
});

app.get("/product-list", verifyToken, async (req, resp) => {
  let product = await Product.find();
  resp.send(product);
});

app.delete("/delete/:id", verifyToken, async (req, resp) => {
  let result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
});

app.get("/product/:id", verifyToken, async (req, resp) => {
  let result = await Product.find({ _id: req.params.id });
  if (result) {
    resp.send(result);
  } else {
    resp.send({ result: "No data Found" });
  }
});

app.put("/product/:id", verifyToken, async (req, resp) => {
  let result = await Product.updateOne(
    {
      _id: req.params.id,
    },
    { $set: req.body }
  );
  resp.send(result);
});

app.get("/search/:key", verifyToken, async (req, resp) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { brand: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      // { ram: { $regex: req.params.key } },
    ],
  });
  resp.send(result);
});

function verifyToken(req, resp, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        resp.status(401).send({ result: "Provide valid token" });
      } else {
        next();
      }
    });
  } else {
    resp.status(403).send({ result: "Add token with header" });
  }
}

app.listen(5000);
