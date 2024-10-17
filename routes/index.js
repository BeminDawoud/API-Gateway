const express = require("express");
const router = express.Router();
const axios = require("axios");
const registry = require("./registry.json");
const fs = require("fs");
const { error } = require("console");
const { exit } = require("process");
const loadBalancer = require("../util/loadBalancer");

router.all("/:apiName/*", (req, res) => {
  const service = registry.services[req.params.apiName];
  const path = req.params[0];

  if (service) {
    const newIndex = loadBalancer[service.loadBalanceStrategy](service);
    const url = service.instances[newIndex].url;
    console.log(url);
    axios({
      method: req.method,
      url: url + path,
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
    registry.services[regInfo.apiName].instances.push({ ...regInfo });
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
    const index = registry.services[regInfo.apiName].instances.findIndex(
      (instance) => {
        return regInfo.url === instance.url;
      }
    );
    registry.services[regInfo.apiName].instances.splice(index, 1);
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
  registry.services[regInfo.apiName].instances.forEach((element) => {
    if (element.url === regInfo.url) {
      exists = true;
      return;
    }
  });
  return exists;
};

module.exports = router;
