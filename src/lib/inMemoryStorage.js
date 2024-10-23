let storage = {
    watch: [],
    settings: [],
    feedback: []
  };
  
  export const inMemoryStorage = {
    find: (collection) => Promise.resolve(storage[collection]),
    findOne: (collection, query) => Promise.resolve(storage[collection].find(item => Object.keys(query).every(key => item[key] === query[key]))),
    create: (collection, data) => {
      const newItem = { ...data, id: Date.now().toString() };
      storage[collection].push(newItem);
      return Promise.resolve(newItem);
    },
    updateOne: (collection, query, update) => {
      const index = storage[collection].findIndex(item => Object.keys(query).every(key => item[key] === query[key]));
      if (index !== -1) {
        storage[collection][index] = { ...storage[collection][index], ...update.$set };
        return Promise.resolve({ modifiedCount: 1 });
      }
      return Promise.resolve({ modifiedCount: 0 });
    },
    deleteOne: (collection, query) => {
      const initialLength = storage[collection].length;
      storage[collection] = storage[collection].filter(item => !Object.keys(query).every(key => item[key] === query[key]));
      return Promise.resolve({ deletedCount: initialLength - storage[collection].length });
    },
    deleteMany: (collection) => {
      const deletedCount = storage[collection].length;
      storage[collection] = [];
      return Promise.resolve({ deletedCount });
    }
  };