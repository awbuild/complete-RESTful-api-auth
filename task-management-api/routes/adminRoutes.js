var express = require("express");
var router = express.Router();
var auth = require("../middleware/auth");

module.exports = function (users, tasks) {
  // --- GET /api/admin/tasks --- view all tasks from all users
  router.get(
    "/tasks",
    auth.authenticateToken,
    auth.requireAdmin,
    function (req, res) {
      console.log("GET /api/admin/tasks hit");
      console.log("admin user requesting all tasks:", req.user.email);
      console.log("total tasks in system:", tasks.length);

      var tasksWithOwner = [];
      for (var i = 0; i < tasks.length; i++) {
        var currentTask = tasks[i];
        var taskOwner = null;

        for (var j = 0; j < users.length; j++) {
          if (users[j].id === currentTask.userId) {
            taskOwner = users[j];
            break;
          }
        }

        tasksWithOwner.push({
          id: currentTask.id,
          title: currentTask.title,
          description: currentTask.description,
          status: currentTask.status,
          priority: currentTask.priority,
          dueDate: currentTask.dueDate,
          createdAt: currentTask.createdAt,
          updatedAt: currentTask.updatedAt,
          owner: taskOwner
            ? {
                id: taskOwner.id,
                username: taskOwner.username,
                email: taskOwner.email,
              }
            : null,
        });
      }

      console.log("returning", tasksWithOwner.length, "tasks with owner info");
      return res.status(200).json({ tasks: tasksWithOwner });
    },
  );

  // --- DELETE /api/admin/tasks/:id --- admin can delete any task
  router.delete(
    "/tasks/:id",
    auth.authenticateToken,
    auth.requireAdmin,
    function (req, res) {
      console.log("DELETE /api/admin/tasks/:id hit");
      console.log("admin deleting task id:", req.params.id);

      var taskId = parseInt(req.params.id);
      var taskIndex = -1;

      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
          taskIndex = i;
          break;
        }
      }

      if (taskIndex === -1) {
        console.log("task not found with id:", taskId);
        return res.status(404).json({ error: "Task not found" });
      }

      var deletedTask = tasks.splice(taskIndex, 1);
      console.log("admin deleted task:", deletedTask);
      return res
        .status(200)
        .json({ message: "Task deleted by admin successfully" });
    },
  );

  return router;
};
