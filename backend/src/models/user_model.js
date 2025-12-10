import { pool as dbPool } from "../config/database.js";

export const getAllUsers = () => {
  const SQLQuery = "SELECT * FROM tb_users";
  return dbPool.execute(SQLQuery);
};

export const createNewUser = (body) => {
  const SQLQuery = `INSERT INTO tb_users (name, email, address) 
                      VALUES (?, ?, ?)`;
  return dbPool.execute(SQLQuery, [body.name, body.email, body.address]);
};

export const updateUser = (body, idUser) => {
  const SQLQuery = `UPDATE tb_users 
                        SET name = ?, email = ?, address = ? 
                        WHERE id = ?`;
  return dbPool.execute(SQLQuery, [
    body.name,
    body.email,
    body.address,
    idUser,
  ]);
};

export const deleteUser = (idUser) => {
  const SQLQuery = `DELETE FROM tb_users WHERE id = ?`;
  return dbPool.execute(SQLQuery, [idUser]);
};
