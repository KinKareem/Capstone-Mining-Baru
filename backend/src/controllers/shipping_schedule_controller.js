import {
    getAllShippingSchedules,
    getShippingScheduleById,
    createShippingSchedule,
    updateShippingSchedule,
    deleteShippingSchedule
} from "../models/shipping_schedule_model.js";

export const getShippingSchedules = async (req, res) => {
    try {
        const schedules = await getAllShippingSchedules();
        res.status(200).json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Error in getShippingSchedules:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getShippingSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await getShippingScheduleById(id);
        res.status(200).json({
            success: true,
            data: schedule
        });
    } catch (error) {
        console.error('Error in getShippingSchedule:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const createNewShippingSchedule = async (req, res) => {
    try {
        const scheduleData = {
            ...req.body,
            created_by: req.user?.id || 1 // Default to user 1 if not authenticated
        };

        const newSchedule = await createShippingSchedule(scheduleData);
        res.status(201).json({
            success: true,
            message: 'Shipping schedule created successfully',
            data: newSchedule
        });
    } catch (error) {
        console.error('Error in createNewShippingSchedule:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateExistingShippingSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSchedule = await updateShippingSchedule(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Shipping schedule updated successfully',
            data: updatedSchedule
        });
    } catch (error) {
        console.error('Error in updateExistingShippingSchedule:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteExistingShippingSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteShippingSchedule(id);
        res.status(200).json({
            success: true,
            message: 'Shipping schedule deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteExistingShippingSchedule:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};
