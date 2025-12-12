const tenantContext = require("./tenant-context");
const tenantRegistry = require("./tenant-registry");

module.exports = {
  async execute(tenantId, work) {
    tenantContext.setTenant(tenantId);

    const ds = tenantRegistry.getDataSource(tenantId);
    const manager = ds.manager || ds; // typeorm fallback to plain pool

    try {
      return await work(manager);
    } finally {
      tenantContext.clear();
    }
  }
};