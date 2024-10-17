const loadBalancer = {};

loadBalancer.ROUND_ROBIN = (service) => {
  if (service.index === undefined) {
    service.index = -1;
  }
  const newIndex =
    ++service.index >= service.instances.length ? 0 : service.index;
  service.index = newIndex;
  return loadBalancer.isEnabled(service, newIndex, loadBalancer.ROUND_ROBIN);
};

loadBalancer.isEnabled = (service, index, loadBalanceStrategy) => {
  return service.instances[index].enabled
    ? index
    : loadBalanceStrategy(service);
};

loadBalancer.RANDOM = (service) => {
  const randomIndex = Math.floor(Math.random() * service.instances.length);
  return randomIndex;
};

module.exports = loadBalancer;
