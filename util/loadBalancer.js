const loadBalancer = {};

/**
 * Implements the ROUND_ROBIN load balancing strategy.
 * Cycles through available instances, ensuring a balanced distribution of requests.
 * If the `service.index` is not defined, it initializes it.
 * @param {Object} service - The service object containing instances.
 * @param {Array} service.instances - List of available service instances.
 * @param {number} [service.index] - The current index of the instance being used.
 * @returns {number} The index of the selected instance.
 */

loadBalancer.ROUND_ROBIN = (service) => {
  if (service.index === undefined) {
    service.index = -1;
  }
  const newIndex =
    ++service.index >= service.instances.length ? 0 : service.index;
  service.index = newIndex;
  return loadBalancer.isEnabled(service, newIndex, loadBalancer.ROUND_ROBIN);
};

/**
 * Checks if the instance at the given index is enabled.
 * If not, the load balancing strategy is recursively applied to find the next available instance.
 * @param {Object} service - The service object containing instances.
 * @param {number} index - The index of the current instance.
 * @param {Function} loadBalanceStrategy - The load balancing strategy to apply.
 * @returns {number} The index of the enabled instance.
 */

loadBalancer.isEnabled = (service, index, loadBalanceStrategy) => {
  return service.instances[index].enabled
    ? index
    : loadBalanceStrategy(service);
};

/**
 * Implements the RANDOM load balancing strategy.
 * Randomly selects an instance from the available service instances.
 * @param {Object} service - The service object containing instances.
 * @param {Array} service.instances - List of available service instances.
 * @returns {number} The index of the randomly selected instance.
 */
loadBalancer.RANDOM = (service) => {
  const randomIndex = Math.floor(Math.random() * service.instances.length);
  return randomIndex;
};

module.exports = loadBalancer;
