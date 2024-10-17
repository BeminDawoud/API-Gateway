const express = require("express");
const app = express();
const helmet = require("helmet");
const routes = require("./routes");
const registry = require("./routes/registry.json");
const PORT = 3000;

app.use(express.json());

// security middleware
app.use(helmet());

const auth = (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Basic ")
  ) {
    return res.status(401).send({
      authenticated: false,
      message: "Authorization header missing or not Basic authentication.",
    });
  }

  const base64AuthString = req.headers.authorization.split(" ")[1];
  const authString = Buffer.from(base64AuthString, "base64").toString("utf8");

  const authParts = authString.split(":");
  const username = authParts[0];
  const password = authParts[1];

  const user = registry.auth.users[username];

  if (user) {
    if (user.username === username && user.password === password) {
      next();
    } else {
      res.send({
        authenticated: false,
        message: "Authentication Unsuccessful: Incorrect password.",
      });
    }
  } else {
    res.send({
      authenticated: false,
      message:
        "Authentication Unsuccessful: User " + username + " does not exist.",
    });
  }
};

app.use(auth);
app.use("/", routes);
app.listen(PORT, () => {
  console.log(`Server is listening on Port ${PORT}`);
});
