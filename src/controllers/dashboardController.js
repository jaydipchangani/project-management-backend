import Project from "../models/projectModel.js";
import Task from "../models/taskModel.js";

// @desc Dashboard overview stats
// @route GET /api/dashboard/overview
export const getDashboardOverview = async (req, res) => {
  try {
    const user = req.user;

    let projectFilter = {};
    let taskFilter = {};

    if (user.role === "ProjectManager") {
      projectFilter = { createdBy: user._id };
      taskFilter = { createdBy: user._id };
    } else if (user.role === "TeamMember") {
      projectFilter = { teamMembers: user._id };
      taskFilter = { assignedTo: user._id };
    }

    // Aggregate project and task stats
    const totalProjects = await Project.countDocuments(projectFilter);
    const activeProjects = await Project.countDocuments({ ...projectFilter, status: "Active" });
    const completedProjects = await Project.countDocuments({ ...projectFilter, status: "Completed" });

    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: "Completed" });
    const pendingTasks = await Task.countDocuments({ ...taskFilter, status: "Pending" });
    const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: "In Progress" });

    const recentProjects = await Project.find(projectFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name status createdAt");

    const recentTasks = await Task.find(taskFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status priority dueDate");

    res.status(200).json({
      role: user.role,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      recentProjects,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
