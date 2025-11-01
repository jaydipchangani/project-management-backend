import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Admin-only routes
router.get("/", protect, authorizeRoles("Admin"), getAllUsers);
router.get("/:id", protect, authorizeRoles("Admin"), getUserById);
router.put("/:id/role", protect, authorizeRoles("Admin"), updateUserRole);
router.delete("/:id", protect, authorizeRoles("Admin"), deleteUser);

export default router;
