require("dotenv").config();
const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", require("./Routers/imgGenRouter"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
