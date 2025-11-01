import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import ActivityLog from "../models/activityLogModel.js";
import { buildQuery } from "../utils/queryHelper.js";

// ✅ Utility: log task-related activity
const logActivity = async (projectId, userId, action) => {
  await ActivityLog.create({
    project: projectId,
    performedBy: userId,
    action,
  });
};

// ✅ @desc Create a new task
// @route POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate, projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // Only Admin or Project Manager who owns this project can add tasks
    if (
      req.user.role !== "Admin" &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to create tasks in this project" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
      project: projectId,
      createdBy: req.user._id,
    });

    await logActivity(projectId, req.user._id, `Task "${title}" created`);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ @desc Get all tasks (with search, filter, sort, pagination)
// @route GET /api/tasks
export const getAllTasks = async (req, res) => {
  try {
    const user = req.user;
    let baseFilter = {};

    // Role-based access filtering
    if (user.role === "Admin") {
      baseFilter = {}; // all tasks
    } else if (user.role === "ProjectManager") {
      // tasks from projects they created
      baseFilter = { createdBy: user._id };
    } else {
      // tasks assigned to team member
      baseFilter = { assignedTo: user._id };
    }

    // Build dynamic query using helper
    const { filter, sort, skip, limit, page } = buildQuery(req.query, ["title", "description"]);
    const finalFilter = { ...baseFilter, ...filter };

    const total = await Task.countDocuments(finalFilter);

    const tasks = await Task.find(finalFilter)
      .populate("assignedTo", "name email role")
      .populate("project", "name description status")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      total,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ @desc Get single task
// @route GET /api/tasks/:id
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("project", "name description");

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ @desc Update task
// @route PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Authorization: Admin, project manager, or assigned team member can update
    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

    if (!(req.user.role === "Admin" || isOwner || isAssignee)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this task" });
    }

    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignedTo = assignedTo || task.assignedTo;
    task.dueDate = dueDate || task.dueDate;

    const updated = await task.save();
    await logActivity(task.project, req.user._id, `Task "${task.title}" updated`);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ @desc Delete task
// @route DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Only Admin or creator can delete
    if (
      req.user.role !== "Admin" &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this task" });
    }

    await logActivity(task.project, req.user._id, `Task "${task.title}" deleted`);
    await task.deleteOne();

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
