import { pool as dbPool } from "../config/database.js";

export const findUserByEmail = (email) => {
  const SQLQuery = "SELECT id FROM tb_users WHERE email = ?";
  return dbPool.query(SQLQuery, [email]);
};

export const registerUser = (username, email, hashedPassword, role_id) => {
  const SQLQuery =
    "INSERT INTO tb_users (username, email, pass, role_id) VALUES (?, ?, ?, ?)";
  return dbPool.query(SQLQuery, [username, email, hashedPassword, role_id]);
};

export const findUserForLogin = (email, role_id) => {
  const SQLQuery = `
    SELECT u.*, r.name as role_name, u.pass 
    FROM tb_users u 
    JOIN tb_roles r ON u.role_id = r.id 
    WHERE u.email = ? AND u.role_id = ?
  `;
  return dbPool.query(SQLQuery, [email, role_id]);
};
