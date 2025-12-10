import {
  getAllEquipments,
  getEquipmentById,
  createNewEquipment as modelCreateEquipment,
  updateEquipment as modelUpdateEquipment,
  deleteEquipment as modelDeleteEquipment,
} from "../models/equipment_model.js";

export const getAllEquipment = async (req, res) => {
  try {
    const [data] = await getAllEquipments();
    res.json({
      message: "GET ALL Equipments success",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

export const getEquipmentDetail = async (req, res) => {
  const { idEquipment } = req.params;

  try {
    const [data] = await getEquipmentById(idEquipment);

    if (data.length === 0) {
      return res.status(404).json({
        message: "Equipment tidak ditemukan",
        data: null,
      });
    }

    res.status(200).json({
      message: "GET detail equipment success",
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

export const createNewEquipment = async (req, res) => {
  const { body } = req;

  if (!body.unit_code || !body.equipment_type) {
    return res.status(400).json({
      message:
        "Failed data requested. unit_code and equipment_type are required",
      data: null,
    });
  }

  try {
    await modelCreateEquipment(body);
    res.status(201).json({
      message: "CREATE new equipment is success",
      data: body,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};

export const updateEquipment = async (req, res) => {
  const { idEquipment } = req.params;
  const { body } = req;

  console.log(body);

  try {
    await modelUpdateEquipment(body, idEquipment);
    res.status(200).json({
      message: "UPDATE equipment is success",
      data: {
        id: idEquipment,
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

export const deleteEquipment = async (req, res) => {
  const { idEquipment } = req.params;

  try {
    await modelDeleteEquipment(idEquipment);
    res.status(200).json({
      message: "DELETE equipment is success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};
