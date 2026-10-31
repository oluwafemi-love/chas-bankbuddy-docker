import "dotenv/config";
import mysql from "mysql2/promise";

// Create a pool of MySQL connections using environment variables.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "bankbuddy",
});

//Function to make sql querying beautiful to use/write - it executes regular SQL queries.
export async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}
