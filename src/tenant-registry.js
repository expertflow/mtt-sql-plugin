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

  async closeAll() {
    for (const ds of this.dataSources.values()) {
      if (typeof ds.destroy === "function") await ds.destroy();
      if (typeof ds.end === "function") await ds.end();
    }
  }
}

module.exports = new TenantRegistry();