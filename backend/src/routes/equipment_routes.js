import express from "express";

import { 
    getAllEquipment,
    createNewEquipment,
    updateEquipment,
    deleteEquipment,  
    getEquipmentDetail
} from "../controllers/equipment_controller.js";

const router = express.Router();

router.post("/", createNewEquipment);

router.get("/", getAllEquipment);

router.get("/:idEquipment", getEquipmentDetail);

router.patch("/:idEquipment", updateEquipment);

router.delete("/:idEquipment", deleteEquipment);

export default router;