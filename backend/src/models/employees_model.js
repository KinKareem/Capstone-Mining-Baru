import { pool as dbPool } from "../config/database.js";

// Get all employees
export const getAllEmployees = () => {
  const SQLQuery = `
    SELECT 
      employee_id,
      name,
      position,
      status,
      competency,
      created_at,
      updated_at
    FROM employees
    ORDER BY employee_id DESC
  `;
  return dbPool.execute(SQLQuery);
};

// Get employee by ID
export const getEmployeeById = (id) => {
  const SQLQuery = `
    SELECT 
      employee_id,
      name,
      position,
      status,
      competency,
      created_at,
      updated_at
    FROM employees 
    WHERE employee_id = ?
  `;
  return dbPool.execute(SQLQuery, [id]);
};

// Create new employee
export const createNewEmployee = (body) => {
  const SQLQuery = `  
    INSERT INTO employees
      (name, position, status, competency)
    VALUES (?, ?, ?, ?)
  `;

  return dbPool.execute(SQLQuery, [
    body.name,
    body.position,
    body.status || "active",
    body.competency || "",
  ]);
};

// Update employee
export const updateEmployee = (body, id) => {
  const SQLQuery = `
    UPDATE employees
    SET 
      name = ?, 
      position = ?, 
      status = ?, 
      competency = ?
    WHERE employee_id = ?
  `;

  return dbPool.execute(SQLQuery, [
    body.name,
    body.position,
    body.status || "active",
    body.competency || "",
    id,
  ]);
};

// Delete employee
export const deleteEmployee = (id) => {
  const SQLQuery = `DELETE FROM employees WHERE employee_id = ?`;
  return dbPool.execute(SQLQuery, [id]);
};

// Get employee statistics
export const getEmployeeStats = async () => {
  const SQLQuery = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
    FROM employees
  `;

  const [rows] = await dbPool.execute(SQLQuery);
  return rows[0] || { total: 0, active: 0, inactive: 0 };
};
