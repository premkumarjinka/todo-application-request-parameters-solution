const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const path = require("path");
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

/*app.get("/todos/", async (request, response) => {
  const { status } = request.query;
  console.log(status);
  const getAllQuery = `
    SELECT * FROM todo WHERE status LIKE '%${status}%'
    `;
  const getAllResponse = await db.all(getAllQuery);
  console.log(getAllResponse);
  response.send(getAllResponse);
});
app.get("/todos/", async (request, response) => {
  const { priority } = request.query;
  console.log(priority);
  const getAllHighQuery = `
    SELECT * FROM todo WHERE priority LIKE '%${priority}%';
    `;
  const getHighResponse = await db.all(getAllHighQuery);

  response.send(getHighResponse);
});*/

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoIdQuery = `
    SELECT * FROM todo WHERE id=${todoId}
    `;
  const getTodoResponse = await db.get(getTodoIdQuery);
  response.send(getTodoResponse);
});
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const insertTodoQuery = `INSERT INTO todo(id,todo,priority,status)
    VALUES(${id},"${todo}","${priority}","${status}")
    `;
  const insertTodoResponse = await db.run(insertTodoQuery);
  response.send("Todo Successfully Added");
});
/*app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status } = request.body;
  const updateQuery = `
    UPDATE todo SET status="${status}" WHERE id=${todoId}
    `;
  const updatedStatusResponse = await db.run(updateQuery);
  response.send("Status Updated");
});

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { priority } = request.body;
  const updatePriorityQuery = `
    UPDATE todo SET priority="${priority}" WHERE id=${todoId}
    `;
  const updatedPriority = await db.run(updatePriorityQuery);
  response.send("Priority Updated");
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo } = request.body;
  const updateTodoQuery = `
    UPDATE todo SET todo="${todo}" WHERE id=${todoId}
    `;
  const updatedTodoResponse = await db.run(updateTodoQuery);
  response.send("Todo Updated");
});*/

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM todo WHERE id=${todoId}
    `;
  const deleteResponse = await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
