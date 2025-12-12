class TenantRegistry {
  constructor() {
    this.dataSources = new Map();
  }

  /**
   * Registers a tenant using an externally provided DataSource / Pool.
   */
  registerTenant(tenantId, dataSource) {
    if (!tenantId) throw new Error("tenantId is required");
    if (!dataSource) throw new Error("dataSource (pool) is required");

    this.dataSources.set(tenantId, dataSource);
    console.log(`Tenant [${tenantId}] registered using external DataSource.`);
  }

  getDataSource(tenantId) {
    const ds = this.dataSources.get(tenantId);
    if (!ds) throw new Error(`Tenant not registered: ${tenantId}`);
    return ds;
  }

  /**
   * Removes a tenant and closes its DataSource / Pool safely.
   */
  async deleteTenant(tenantId) {
    if (!tenantId) throw new Error("tenantId is required");

    const ds = this.dataSources.get(tenantId);
    if (!ds) {
      console.warn(`Tenant not found: ${tenantId}`);
      return false;
    }

    // Gracefully close the datasource/pool
    try {
      if (typeof ds.destroy === "function") await ds.destroy();
      if (typeof ds.end === "function") await ds.end();
      console.log(`Tenant [${tenantId}] connection closed.`);
    } catch (err) {
      console.error(`Error closing datasource for tenant [${tenantId}]:`, err);
    }

    const removed = this.dataSources.delete(tenantId);
    console.log(`Tenant [${tenantId}] removed from registry.`);
    return removed;
  }

  async closeAll() {
    for (const ds of this.dataSources.values()) {
      if (typeof ds.destroy === "function") await ds.destroy();
      if (typeof ds.end === "function") await ds.end();
    }
  }
}

module.exports = new TenantRegistry();