import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getAllTasks)
  .post(authorizeRoles("Admin", "ProjectManager"), createTask);

router
  .route("/:id")
  .get(getTaskById)
  .put(authorizeRoles("Admin", "ProjectManager", "TeamMember"), updateTask)
  .delete(authorizeRoles("Admin", "ProjectManager"), deleteTask);

export default router;
