const express = require("express");
const router = express.Router();
const axios = require("axios");
const registry = require("./registry.json");
const fs = require("fs");
const { error } = require("console");
const { exit } = require("process");

router.all("/:apiName/*", (req, res) => {
  const { apiName } = req.params;
  const path = req.params[0]; // Capture everything after /:apiName/

  if (registry.services[apiName]) {
    axios({
      method: req.method,
      url: `${registry.services[apiName].url}${path}`,
      data: req.body, // Forward the request body
      headers: req.headers, // Forward the request headers
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res
          .status(error.response?.status || 500)
          .send("API Requested Is Not Available");
      });
  } else {
    res.status(404).send("API Requested Is Not Available");
  }
});

router.post("/register", (req, res) => {
  const regInfo = req.body;
  regInfo.url =
    regInfo.protocol + "://" + regInfo.host + ":" + regInfo.port + "/";

  if (apiAlreadyExists(regInfo)) {
    res.send(
      "Configuration already exists for " +
        regInfo.apiName +
        " at " +
        regInfo.url
    );
  } else {
    registry.services[regInfo.apiName].push({ ...regInfo });
    fs.writeFile(
      "./routes/registry.json",
      JSON.stringify(registry),
      (error) => {
        if (error) {
          console.log("Could Not Register " + regInfo.apiName + "\n" + error);
          res.send("Could Not Register " + regInfo.apiName + "\n" + error);
        } else {
          console.log(
            "Success, API " + regInfo.apiName + " has been registered."
          );
          res.send("Success, API " + regInfo.apiName + " has been registered.");
        }
      }
    );
  }
});

router.post("/unregister", (req, res) => {
  const regInfo = req.body;
  regInfo.url =
    regInfo.protocol + "://" + regInfo.host + ":" + regInfo.port + "/";

  if (apiAlreadyExists(regInfo)) {
    const index = registry.services[regInfo.apiName].findIndex((instance) => {
      return regInfo.url === instance.url;
    });
    registry.services[regInfo.apiName].splice(index, 1);
    fs.writeFile(
      "./routes/registry.json",
      JSON.stringify(registry),
      (error) => {
        if (error) {
          res.send("Could not unregister '" + regInfo.apiName + "'\n" + error);
        } else {
          res.send("Successfully unregistered '" + regInfo.apiName + "'");
        }
      }
    );
  } else {
    res.send(
      "Configuration does not exist for '" +
        regInfo.apiName +
        "' at '" +
        regInfo.url +
        "'"
    );
  }
});

const apiAlreadyExists = (regInfo) => {
  let exists = false;
  registry.services[regInfo.apiName].forEach((element) => {
    if (element.url === regInfo.url) {
      exists = true;
      return;
    }
  });
  return exists;
};

module.exports = router;
