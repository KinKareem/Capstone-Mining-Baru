import { pool as dbPool } from "../config/database.js";

// Get all heavy equipment
export const getAllEquipments = () => {
  const SQLQuery = `
    SELECT 
      equipment_id,
      unit_code,
      equipment_type,
      capacity,
      default_status,
      model,
      capacity_unit,
      created_at,
      updated_at
    FROM heavy_equipment
    ORDER BY equipment_id DESC
  `;
  return dbPool.execute(SQLQuery);
};

// Get equipment by ID
export const getEquipmentById = (id) => {
  const SQLQuery = `
    SELECT 
      equipment_id,
      unit_code,
      equipment_type,
      capacity,
      default_status,
      model,
      capacity_unit,
      created_at,
      updated_at
    FROM heavy_equipment 
    WHERE equipment_id = ?
  `;
  return dbPool.execute(SQLQuery, [id]);
};

// Create new equipment
export const createNewEquipment = (body) => {
  const SQLQuery = `  
    INSERT INTO heavy_equipment
      (unit_code, equipment_type, capacity, default_status, model, capacity_unit)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  return dbPool.execute(SQLQuery, [
    body.unit_code,
    body.equipment_type,
    body.capacity || 0,
    body.default_status || "ready",
    body.model || "",
    body.capacity_unit || "tons",
  ]);
};

// Update equipment
export const updateEquipment = (body, id) => {
  const SQLQuery = `
    UPDATE heavy_equipment
    SET 
      unit_code = ?, 
      equipment_type = ?, 
      capacity = ?, 
      default_status = ?, 
      model = ?, 
      capacity_unit = ?
    WHERE equipment_id = ?
  `;

  return dbPool.execute(SQLQuery, [
    body.unit_code,
    body.equipment_type,
    body.capacity || 0,
    body.default_status || "ready",
    body.model || "",
    body.capacity_unit || "tons",
    id,
  ]);
};

// Delete equipment
export const deleteEquipment = (id) => {
  const SQLQuery = `DELETE FROM heavy_equipment WHERE equipment_id = ?`;
  return dbPool.execute(SQLQuery, [id]);
};
