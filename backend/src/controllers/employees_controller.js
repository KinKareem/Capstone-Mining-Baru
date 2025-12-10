import {
  getAllEmployees,
  getEmployeeById,
  createNewEmployee as modelCreateEmployee,
  updateEmployee as modelUpdateEmployee,
  deleteEmployee as modelDeleteEmployee,
  getEmployeeStats as modelGetEmployeeStats,
} from "../models/employees_model.js";

export const getAllEmployeesHandler = async (req, res) => {
  try {
    const [data] = await getAllEmployees();
    res.json({
      message: "GET ALL Employees success",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

export const getEmployeeDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const [data] = await getEmployeeById(id);

    if (data.length === 0) {
      return res.status(404).json({
        message: "Employee tidak ditemukan",
        data: null,
      });
    }

    res.status(200).json({
      message: "GET detail employee success",
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

export const createNewEmployee = async (req, res) => {
  const { body } = req;

  if (!body.name || !body.position) {
    return res.status(400).json({
      message: "Failed data requested. name and position are required",
      data: null,
    });
  }

  try {
    await modelCreateEmployee(body);
    res.status(201).json({
      message: "CREATE new employee is success",
      data: body,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    await modelUpdateEmployee(body, id);
    res.status(200).json({
      message: "UPDATE employee is success",
      data: {
        id: id,
        ...body,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    await modelDeleteEmployee(id);
    res.status(200).json({
      message: "DELETE employee is success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};

export const getEmployeeStats = async (req, res) => {
  try {
    const stats = await modelGetEmployeeStats();
    res.status(200).json({
      message: "GET employee statistics success",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};
