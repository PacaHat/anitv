let cache = {};

export const redis = {
  get: async (key) => {
    return cache[key] || null;
  },
  set: async (key, value, options) => {
    cache[key] = value;
    if (options && options.EX) {
      setTimeout(() => {
        delete cache[key];
      }, options.EX * 1000);
    }
  },
  del: async (key) => {
    delete cache[key];
  }
};