import express from "express";
import {
  getAllEmployeesHandler,
  createNewEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeDetail,
  getEmployeeStats,
} from "../controllers/employees_controller.js";

const router = express.Router();

// CRUD routes
router.get("/", getAllEmployeesHandler);
router.get("/stats", getEmployeeStats);
router.get("/:id", getEmployeeDetail);
router.post("/", createNewEmployee);
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
