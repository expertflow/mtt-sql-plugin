# mtt-sql-plugin
A plugin to manage multiple sql datasources

# **📘 Multi-Tenant SQL SDK – Developer Integration Guide**

A lightweight SDK that enables **runtime multi-tenant database handling** in Node.js applications using **TypeORM**.
Supports **PostgreSQL**, **MySQL**, and **SQL Server** (or any TypeORM-supported SQL database).

---

# **📦 Installation**

Install the SDK:

```bash
npm install mtt-sql-plugin
```

Install TypeORM + relevant drivers:

### PostgreSQL

```bash
npm install typeorm pg
```

### MySQL

```bash
npm install typeorm mysql2
```

### SQL Server

```bash
npm install typeorm mssql
```

---

# **🚀 Quick Start**

## **1️⃣ Import SDK**

```js
const { tenantRegistry, tenantExecution } = require("mtt-postgres-sdk");
```

---

# **2️⃣ Register Tenants (Per Database)**

Your application **creates its own TypeORM datasource** and passes it to the SDK:

```js
const { DataSource } = require("typeorm");

app.post("/tenant/register", async (req, res) => {
  const { tenantId, host, username, password, database, port = 5432 } = req.body;

  try {
    const ds = new DataSource({
      type: "postgres",        // or: mysql, mssql
      host,
      port,
      username,
      password,
      database,
      entities: ["src/entities/**/*.js"],
      synchronize: false,      // Your application manages schema
      logging: false
    });

    await ds.initialize();

    tenantRegistry.registerTenant(tenantId, ds);

    res.send(`Tenant ${tenantId} registered`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
```

✔ This dynamically adds the tenant at runtime
✔ You can register **unlimited tenants**
✔ Each tenant has its own DB connection pool

---

# **3️⃣ Tenant-Aware DB Access**

Using the SDK execution wrapper:

```js
app.post("/tenant/:tenantId/student", async (req, res) => {
  const tenantId = req.params.tenantId;
  const { name, email } = req.body;

  try {
    const savedStudent = await tenantExecution.execute(tenantId, async (em) => {
      const repo = em.getRepository("Student");
      return await repo.save({ name, email });
    });

    res.json(savedStudent);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
```

✔ `em` (EntityManager) is automatically scoped to the tenant
✔ No need to manually switch connections
✔ No global state pollution

---

# **4️⃣ Fetch Tenant-Specific Data**

```js
app.get("/tenant/:tenantId/students", async (req, res) => {
  const tenantId = req.params.tenantId;

  try {
    const students = await tenantExecution.execute(tenantId, async (em) => {
      return await em.getRepository("Student").find();
    });

    res.json(students);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
```

---

# **🏗 Define Your Entities**

Example TypeORM entity:

```js
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Student",
  tableName: "students",
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    email: { type: String }
  }
});
```

---

# **🧠 How the SDK Works**

### **tenantRegistry**

Stores all tenant datasources:

```js
tenantRegistry.registerTenant(id, dataSource);
tenantRegistry.getDataSource(id);
tenantRegistry.removeTenant(id);
tenantRegistry.closeAll();
```

### **tenantExecution**

Executes database operations inside the correct tenant context:

```js
tenantExecution.execute("tenant1", async (entityManager) => {
  return entityManager.query("SELECT now()");
});
```

Internally it:

1. Sets tenant context
2. Retrieves the correct datasource
3. Creates a new EntityManager
4. Executes your function
5. Clears tenant context safely

---

# **🛠 Multi-DB Support**

Just change datasource config:

### PostgreSQL

```js
type: "postgres"
```

### MySQL

```js
type: "mysql"
```

### SQL Server

```js
type: "mssql"
```

Everything else stays the **same** — the SDK is database-agnostic.

---

# **🧹 Removing Tenant Datasource**

```js
tenantRegistry.removeTenant("tenant5");
```

# **🧹 Shutdown All Tenants**

Useful on application shutdown:

```js
await tenantRegistry.closeAll();
```

---

# **🚨 Important Notes**

✔ SDK **does not create DB or tables** — your app controls that
✔ Each tenant should have **its own database** (recommended)
✔ Use small pool sizes for large tenant counts
✔ Works perfectly in cluster / microservices environments

---

# **📄 Example Request Payloads**

### Register Tenant

```json
{
  "tenantId": "tenant1",
  "host": "localhost",
  "username": "postgres",
  "password": "password",
  "database": "tenant1",
  "port": 5432
}
```

### Insert Student

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

# **📧 Support / Issues**

Report issues on GitHub:
[https://github.com/expertflow/multi-tenant-sql-node-sdk](https://github.com/expertflow/multi-tenant-sql-node-sdk) (replace with actual repo URL)


Example 
https://github.com/expertflow/SampleMttSqlAppNode
