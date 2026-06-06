const { Pool } = require("pg")

const isProduction = process.env.NODE_ENV === "production"

const poolConfig = {
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false
}

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL
} else {
  poolConfig.host = process.env.DB_HOST || "localhost"
  poolConfig.user = process.env.DB_USER
  poolConfig.password = process.env.DB_PASSWORD
  poolConfig.database = process.env.DB_NAME
  poolConfig.port = Number(process.env.DB_PORT || 5432)
}

const pool = new Pool(poolConfig)

module.exports = pool
