const asyncLocalStorage = new (require('async_hooks').AsyncLocalStorage)();

module.exports = {
  setTenant(tenantId) {
    asyncLocalStorage.enterWith({ tenantId });
  },
  getTenant() {
    return asyncLocalStorage.getStore()?.tenantId || null;
  },
  clear() {
    asyncLocalStorage.enterWith({});
  }
};