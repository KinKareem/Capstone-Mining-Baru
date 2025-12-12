import {
  getAllShippingVessels,
  getShippingVesselById,
  createShippingVessel,
  updateShippingVessel,
  deleteShippingVessel,
  getShippingVesselStats,
  getVesselLoadingDetails,
  getVesselStockpileAllocation,
} from "../models/shipping_vessel_model.js";

export const getShippingVessels = async (req, res) => {
  try {
    const vessels = await getAllShippingVessels();
    res.status(200).json({
      success: true,
      data: vessels,
    });
  } catch (error) {
    console.error("Error in getShippingVessels:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getShippingVessel = async (req, res) => {
  try {
    const { id } = req.params;
    const vessel = await getShippingVesselById(id);

    const loadingDetails = await getVesselLoadingDetails(id);
    const stockpileAllocation = await getVesselStockpileAllocation(id);

    res.status(200).json({
      success: true,
      data: {
        ...vessel,
        loading_details: loadingDetails,
        stockpile_allocation: stockpileAllocation,
      },
    });
  } catch (error) {
    console.error("Error in getShippingVessel:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const createNewShippingVessel = async (req, res) => {
  try {
    const vesselData = req.body;

    if (
      !vesselData.vessel_code ||
      !vesselData.vessel_name ||
      !vesselData.eta_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Vessel code, vessel name, and ETA date are required",
      });
    }

    const newVessel = await createShippingVessel(vesselData);
    res.status(201).json({
      success: true,
      message: "Shipping vessel created successfully",
      data: newVessel,
    });
  } catch (error) {
    console.error("Error in createNewShippingVessel:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateExistingShippingVessel = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVessel = await updateShippingVessel(id, req.body);
    res.status(200).json({
      success: true,
      message: "Shipping vessel updated successfully",
      data: updatedVessel,
    });
  } catch (error) {
    console.error("Error in updateExistingShippingVessel:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteExistingShippingVessel = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteShippingVessel(id);
    res.status(200).json({
      success: true,
      message: "Shipping vessel deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteExistingShippingVessel:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const getShippingVesselStatistics = async (req, res) => {
  try {
    const stats = await getShippingVesselStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in getShippingVesselStatistics:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVesselLoadingDetailsController = async (req, res) => {
  try {
    const { id } = req.params;
    const loadingDetails = await getVesselLoadingDetails(id);
    res.status(200).json({
      success: true,
      data: loadingDetails,
    });
  } catch (error) {
    console.error("Error in getVesselLoadingDetails:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVesselStockpileAllocationController = async (req, res) => {
  try {
    const { id } = req.params;
    const stockpileAllocation = await getVesselStockpileAllocation(id);
    res.status(200).json({
      success: true,
      data: stockpileAllocation,
    });
  } catch (error) {
    console.error("Error in getVesselStockpileAllocation:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
