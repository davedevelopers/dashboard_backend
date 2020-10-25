const express = require("express");
require("./db/mongoose");

const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/event");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use(userRoutes);
app.use(eventRoutes);

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
