const express = require("express");
const app = express();
const PORT = 4000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//New imports
const http = require("http").Server(app);
const cors = require("cors");
app.use(cors());

// socket

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("taskDragged", (data) => {
    const { source, destination } = data;
    //👇🏻 Gets the item that was dragged
    const itemMoved = {
      ...tasks[source.droppableId].items[source.index],
    };
    console.log(data);
    console.log("DraggedItem>>> ", itemMoved);
    //👇🏻 Removes the item from the its source
    tasks[source.droppableId].items.splice(source.index, 1);
    //👇🏻 Add the item to its destination using its destination index
    tasks[destination.droppableId].items.splice(
      destination.index,
      0,
      itemMoved
    );
    //👇🏻 Sends the updated tasks object to the React app
    socket.emit("tasks", tasks);
    /* 👇🏻 Print the items at the Source and Destination
        console.log("Source >>>", tasks[source.droppableId].items);
        console.log("Destination >>>", tasks[destination.droppableId].items);
        */
  });

  socket.on("createTask", (data) => {
    // 👇🏻 Constructs an object according to the data structure
    const newTask = { id: fetchID(), title: data.task, comments: [] };
    // 👇🏻 Adds the task to the pending category
    tasks["pending"].items.push(newTask);
    /* 
    👇🏻 Fires the tasks event for update
     */
    socket.emit("tasks", tasks);
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});

// routes
//👇🏻 server/index.js
//👇🏻 Generates a random string
const fetchID = () => Math.random().toString(36).substring(2, 10);
//👇🏻 Nested object
let tasks = {
  pending: {
    title: "pending",
    items: [
      {
        id: fetchID(),
        title: "Send the Figma file to Dima",
        comments: [],
      },
    ],
  },
  ongoing: {
    title: "ongoing",
    items: [
      {
        id: fetchID(),
        title: "Review GitHub issues",
        comments: [
          {
            name: "David",
            text: "Ensure you review before merging",
            id: fetchID(),
          },
        ],
      },
    ],
  },
  completed: {
    title: "completed",
    items: [
      {
        id: fetchID(),
        title: "Create technical contents",
        comments: [
          {
            name: "Dima",
            text: "Make sure you check the requirements",
            id: fetchID(),
          },
        ],
      },
    ],
  },
};
//👇🏻 host the tasks object via the /api route
app.get("/api", (req, res) => {
  res.json(tasks);
});

// server listen
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
