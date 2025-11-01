import Project from "../models/projectModel.js";
import ActivityLog from "../models/activityLogModel.js";
import { buildQuery } from "../utils/queryHelper.js";

// ✅ Utility: log project activity
const logActivity = async (projectId, userId, action) => {
  await ActivityLog.create({
    project: projectId,
    performedBy: userId,
    action,
  });
};

// ✅ @desc Create a new project
// @route POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { name, description, teamMembers } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      teamMembers,
    });

    await logActivity(project._id, req.user._id, "Project created");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ @desc Get all projects (supports search, filtering, sorting, pagination)
// @route GET /api/projects
export const getAllProjects = async (req, res) => {
  try {
    const user = req.user;
    let baseFilter = {};

    // Role-based restrictions
    if (user.role === "ProjectManager") {
      baseFilter.createdBy = user._id;
    } else if (user.role === "TeamMember") {
      baseFilter.teamMembers = user._id;
    }

    // Apply query helper
    const { filter, sort, skip, limit, page } = buildQuery(req.query, ["name", "description"]);
    const finalFilter = { ...baseFilter, ...filter };

    const total = await Project.countDocuments(finalFilter);

    const projects = await Project.find(finalFilter)
      .populate("createdBy teamMembers", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      total,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ @desc Get single project
// @route GET /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy teamMembers", "name email role");

    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ @desc Update project
// @route PUT /api/projects/:id
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });

    // Only Admin or the ProjectManager who created it can update
    if (
      req.user.role !== "Admin" &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to update this project" });
    }

    const { name, description, status, teamMembers } = req.body;

    project.name = name || project.name;
    project.description = description || project.description;
    project.status = status || project.status;
    project.teamMembers = teamMembers || project.teamMembers;

    const updated = await project.save();
    await logActivity(project._id, req.user._id, "Project updated");

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ @desc Delete project
// @route DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });

    // Only Admin or the creator can delete
    if (
      req.user.role !== "Admin" &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this project" });
    }

    await project.deleteOne();
    await logActivity(project._id, req.user._id, "Project deleted");

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ @desc Get project activity logs
// @route GET /api/projects/:id/logs
export const getProjectLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ project: req.params.id })
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadProjectDocument = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check permissions: Admin or ProjectManager who created it
    if (
      req.user.role !== "Admin" &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to upload files to this project" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileData = {
      filename: req.file.filename,
      path: req.file.path,
    };

    project.documents.push(fileData);
    await project.save();

    await logActivity(project._id, req.user._id, `Uploaded document: ${req.file.filename}`);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: fileData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};