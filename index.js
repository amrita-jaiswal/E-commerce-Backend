const express = require("express");
require("./db/config");
const cors = require("cors");
const app = express();
const User = require("./db/User");

app.use(express.json());
app.use(cors());

app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  resp.send(result);
});

app.listen(5000);
