const express = require("express");
const app = express();
const helmet = require("helmet");
const routes = require("./routes");
const PORT = 3000;

app.use(express.json());

// security middleware
app.use(helmet());

app.use("/", routes);
app.listen(PORT, () => {
  console.log(`Server is listening on Port ${PORT}`);
});
