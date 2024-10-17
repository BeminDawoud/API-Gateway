const express = require("express");
const app = express();
const helmet = require("helmet");
const routes = require("./routes");
const registry = require("./routes/registry.json");
const PORT = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());

// security middleware
app.use(helmet());

/**
 * Middleware function to handle Basic Authentication.
 * Extracts and verifies the username and password from the Authorization header.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Object} If authentication fails, sends a response with a status message.
 */

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

/**
 * Route to render the home page and display the list of services.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.get("/home", (req, res) => {
  res.render("index", { services: registry.services });
});

app.use(auth);
app.use("/", routes);
app.listen(PORT, () => {
  console.log(`Server is listening on Port ${PORT}`);
});
