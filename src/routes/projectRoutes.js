import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectLogs,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { uploadProjectDocument } from "../controllers/projectController.js";

const router = express.Router();

router.use(protect); // all routes need authentication

router
  .route("/")
  .get(getAllProjects)
  .post(authorizeRoles("Admin", "ProjectManager"), createProject);

router
  .route("/:id")
  .get(getProjectById)
  .put(authorizeRoles("Admin", "ProjectManager"), updateProject)
  .delete(authorizeRoles("Admin", "ProjectManager"), deleteProject);

router.get("/:id/logs", getProjectLogs);

router.post(
  "/:id/upload",
  protect,
  upload.single("document"),
  uploadProjectDocument
);

export default router;
