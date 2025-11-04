import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectLogs,
  uploadProjectDocument,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect); // all routes need authentication

router
  .route("/")
  .get(getAllProjects)
  .post(authorizeRoles("Admin", "ProjectManager"),upload.array("files", 10), createProject);

router
  .route("/:id")
  .get(getProjectById)
  .put(authorizeRoles("Admin", "ProjectManager"),upload.array("files", 10), updateProject)
  .delete(authorizeRoles("Admin", "ProjectManager"), deleteProject);

router.get("/:id/logs", getProjectLogs);

router.post(
  "/:id/upload",
  protect,
  upload.array("files", 10),
  uploadProjectDocument
);

export default router;
