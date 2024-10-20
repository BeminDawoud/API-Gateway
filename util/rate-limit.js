const fs = require("fs");
const registry = require("../routes/registry.json");

const rateLimiter = (req, res, next) => {
  const apiName = req.params.apiName;
  const service = registry.services[apiName];

  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  const rateLimitConfig = service.rateLimit;
  const currentTime = Date.now();

  if (!registry.rateLimits[apiName]) {
    registry.rateLimits[apiName] = {
      requests: 0,
      startTime: currentTime,
    };

    return fs.writeFile(
      "./routes/registry.json",
      JSON.stringify(registry),
      (error) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Couldn't write limit rate for service" });
        }
        next(); // Call next after the file operation is successful
      }
    );
  }

  const timeElapsed = currentTime - registry.rateLimits[apiName].startTime;

  if (timeElapsed > rateLimitConfig.windowMs) {
    registry.rateLimits[apiName].requests = 0;
    registry.rateLimits[apiName].startTime = currentTime;

    // Save the updated registry to disk
    return fs.writeFile(
      "./routes/registry.json",
      JSON.stringify(registry),
      (error) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Couldn't write limit rate for service" });
        }
        next(); // Call next after resetting rate limits
      }
    );
  }

  // Check if the number of requests exceeds the maxRequests limit
  if (registry.rateLimits[apiName].requests >= rateLimitConfig.maxRequests) {
    return res.status(429).json({
      message: "Rate limit exceeded. Try again later.",
    });
  }

  registry.rateLimits[apiName].requests++;
  fs.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
    if (error) {
      return res
        .status(500)
        .json({ message: "Couldn't write limit rate for service" });
    }
    next(); // Call next once the rate limit has been successfully updated
  });
};

module.exports = rateLimiter;
