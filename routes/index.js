const express = require("express");
const router = express.Router();
const axios = require("axios");
const registry = require("./registry.json");
const fs = require("fs");
const { error } = require("console");
const { exit } = require("process");
const loadBalancer = require("../util/loadBalancer");

/**
 * Enable or disable a specific API instance.
 * @route POST /enable/:apiName
 * @param {string} req.params.apiName - Name of the API.
 * @param {Object} req.body - The request body containing the URL and enabled status.
 * @param {string} req.body.url - The URL of the API instance.
 * @param {boolean} req.body.enabled - The status to enable or disable the instance.
 * @returns {Object} Response containing the status of the operation.
 */

router.post("/enable/:apiName", (req, res) => {
  const apiName = req.params.apiName;
  const requestBody = req.body;
  const instances = registry.services[apiName].instances;
  const index = instances.findIndex((srv) => {
    return srv.url === requestBody.url;
  });
  if (index == -1) {
    res.send({
      status: "error",
      message:
        "Could not find '" +
        requestBody.url +
        "' for service '" +
        apiName +
        "'",
    });
  } else {
    instances[index].enabled = requestBody.enabled;
    fs.writeFile(
      "./routes/registry.json",
      JSON.stringify(registry),
      (error) => {
        if (error) {
          res.send(
            "Could not enable/disable '" +
              requestBody.url +
              "' for service '" +
              apiName +
              ":'\n" +
              error
          );
        } else {
          res.send(
            "Successfully enabled/disabled '" +
              requestBody.url +
              "' for service '" +
              apiName +
              "'\n"
          );
        }
      }
    );
  }
});

/**
 * Route all incoming API requests to the appropriate instance based on the load balancing strategy.
 * @route ALL /:apiName/*
 * @param {string} req.params.apiName - Name of the API.
 * @param {string} req.params[0] - The path to the specific API resource.
 * @returns {Object} The response from the requested API or an error if unavailable.
 */

router.all("/:apiName/*", (req, res) => {
  const service = registry.services[req.params.apiName];
  const path = req.params[0];

  if (service) {
    if (!service.loadBalanceStrategy) {
      service.loadBalanceStrategy = "ROUND_ROBIN";
      fs.writeFile(
        "./routes/registry.json",
        JSON.stringify(registry),
        (error) => {
          if (error) {
            res.send("Couldn't write load balance strategy" + error);
          }
        }
      );
    }
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

/**
 * Register a new API instance to the registry.
 * @route POST /register
 * @param {Object} req.body - The request body containing registration info.
 * @param {string} req.body.apiName - Name of the API.
 * @param {string} req.body.protocol - Protocol used by the API (e.g., http, https).
 * @param {string} req.body.host - Hostname or IP address of the API.
 * @param {number} req.body.port - Port number of the API.
 * @returns {string} Success or error message.
 */

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
    if (!registry.services[regInfo.apiName]) {
      registry.services[regInfo.apiName] = { instances: [] }; // Initialize if it doesn't exist
    }
    registry.services[regInfo.apiName].instances.push({
      ...regInfo,
      enabled: true,
    });
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

/**
 * Unregister an API instance from the registry.
 * @route POST /unregister
 * @param {Object} req.body - The request body containing unregistration info.
 * @param {string} req.body.apiName - Name of the API.
 * @param {string} req.body.protocol - Protocol used by the API.
 * @param {string} req.body.host - Hostname or IP address of the API.
 * @param {number} req.body.port - Port number of the API.
 * @returns {string} Success or error message.
 */

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

/**
 * Check if an API instance already exists in the registry.
 * @param {Object} regInfo - Registration information of the API.
 * @param {string} regInfo.apiName - Name of the API.
 * @param {string} regInfo.url - Full URL of the API instance.
 * @returns {boolean} True if the API already exists, false otherwise.
 */

const apiAlreadyExists = (regInfo) => {
  if (!registry.services[regInfo.apiName]) {
    return false; // Service doesn't exist, so API doesn't exist
  }
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
