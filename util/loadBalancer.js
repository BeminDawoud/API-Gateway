const loadBalancer = {};

loadBalancer.ROUND_ROBIN = (service) => {
  const newIndex =
    ++service.index >= service.instances.length ? 0 : service.index;
  service.index = newIndex;
  return newIndex;
};

loadBalancer.RANDOM = (service) => {
  const randomIndex = Math.floor(Math.random() * service.instances.length);
  return randomIndex;
};

module.exports = loadBalancer;
