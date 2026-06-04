var express = require("express");
var router = express.Router();
var auth = require("../middleware/auth");

module.exports = function (tasks, nextTaskId) {
  // --- GET /api/tasks --- get all tasks for logged in user
  router.get("/", auth.authenticateToken, function (req, res) {
    console.log("GET /api/tasks hit");
    console.log("getting tasks for userId:", req.user.userId);

    var userTasks = [];
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].userId === req.user.userId) {
        userTasks.push(tasks[i]);
      }
    }

    console.log("found", userTasks.length, "tasks for this user");
    return res.status(200).json({ tasks: userTasks });
  });

  // --- POST /api/tasks --- create a new task
  router.post("/", auth.authenticateToken, function (req, res) {
    console.log("POST /api/tasks hit");
    console.log("request body:", req.body);

    var title = req.body.title;
    var description = req.body.description;
    var status = req.body.status;
    var priority = req.body.priority;
    var dueDate = req.body.dueDate;

    // --- Validate required fields ---
    if (!title || !description || !status) {
      console.log("validation failed - missing required fields");
      return res
        .status(400)
        .json({ error: "Title, description, and status are required" });
    }

    if (title.length < 3 || title.length > 100) {
      console.log("validation failed - title length:", title.length);
      return res
        .status(400)
        .json({ error: "Title must be between 3 and 100 characters" });
    }

    if (description.length < 10) {
      console.log("validation failed - description too short");
      return res
        .status(400)
        .json({ error: "Description must be at least 10 characters" });
    }

    var validStatuses = ["todo", "in-progress", "completed"];
    var statusIsValid = false;
    for (var i = 0; i < validStatuses.length; i++) {
      if (validStatuses[i] === status) {
        statusIsValid = true;
        break;
      }
    }

    if (!statusIsValid) {
      console.log("validation failed - invalid status:", status);
      return res
        .status(400)
        .json({ error: "Status must be todo, in-progress, or completed" });
    }

    var validPriorities = ["low", "medium", "high"];
    if (priority !== undefined) {
      var priorityIsValid = false;
      for (var j = 0; j < validPriorities.length; j++) {
        if (validPriorities[j] === priority) {
          priorityIsValid = true;
          break;
        }
      }
      if (!priorityIsValid) {
        console.log("validation failed - invalid priority:", priority);
        return res
          .status(400)
          .json({ error: "Priority must be low, medium, or high" });
      }
    }

    var newTask = {
      id: nextTaskId.value,
      title: title,
      description: description,
      status: status,
      priority: priority || "medium",
      dueDate: dueDate || null,
      userId: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    nextTaskId.value = nextTaskId.value + 1;
    tasks.push(newTask);

    console.log("new task created with id:", newTask.id);
    console.log("tasks array now has", tasks.length, "tasks");

    return res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  });

  // --- PUT /api/tasks/:id --- update a task
  router.put("/:id", auth.authenticateToken, function (req, res) {
    console.log("PUT /api/tasks/:id hit");
    console.log("task id from url:", req.params.id);
    console.log("request body:", req.body);

    var taskId = parseInt(req.params.id);

    var foundTask = null;
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === taskId) {
        foundTask = tasks[i];
        break;
      }
    }

    if (foundTask === null) {
      console.log("task not found with id:", taskId);
      return res.status(404).json({ error: "Task not found" });
    }

    console.log("task found:", foundTask);
    console.log(
      "checking ownership - task userId:",
      foundTask.userId,
      "req userId:",
      req.user.userId,
    );

    if (foundTask.userId !== req.user.userId) {
      console.log("ownership check failed - user does not own this task");
      return res
        .status(403)
        .json({ error: "You can only update your own tasks" });
    }

    if (req.body.title !== undefined) {
      foundTask.title = req.body.title;
    }
    if (req.body.description !== undefined) {
      foundTask.description = req.body.description;
    }
    if (req.body.status !== undefined) {
      foundTask.status = req.body.status;
    }
    if (req.body.priority !== undefined) {
      foundTask.priority = req.body.priority;
    }
    if (req.body.dueDate !== undefined) {
      foundTask.dueDate = req.body.dueDate;
    }

    foundTask.updatedAt = new Date();

    console.log("task updated successfully:", foundTask);

    return res
      .status(200)
      .json({ message: "Task updated successfully", task: foundTask });
  });

  // --- DELETE /api/tasks/:id --- delete a task
  router.delete("/:id", auth.authenticateToken, function (req, res) {
    console.log("DELETE /api/tasks/:id hit");
    console.log("task id from url:", req.params.id);

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

    console.log("task found at index:", taskIndex);
    console.log(
      "checking ownership - task userId:",
      tasks[taskIndex].userId,
      "req userId:",
      req.user.userId,
    );

    if (tasks[taskIndex].userId !== req.user.userId) {
      console.log("ownership check failed - user does not own this task");
      return res
        .status(403)
        .json({ error: "You can only delete your own tasks" });
    }

    var deletedTask = tasks.splice(taskIndex, 1);
    console.log("task deleted:", deletedTask);
    console.log("tasks array now has", tasks.length, "tasks");

    return res.status(200).json({ message: "Task deleted successfully" });
  });

  return router;
};
