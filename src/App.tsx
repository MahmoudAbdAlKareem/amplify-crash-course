/* src/App.js */
import React, {useEffect, useState} from "react";
import Amplify, {API, graphqlOperation} from "aws-amplify";
import {createTodo} from "./graphql/mutations";
import {listTodos} from "./graphql/queries";
import awsExports from "./aws-exports";
import {withAuthenticator} from "@aws-amplify/ui-react";
import {ToDoEntity} from "./types";
import {Alert, AppBar, Button, Grid, IconButton, TextField, Toolbar,} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import {onCreateTodo} from "./graphql/subscriptions";

Amplify.configure(awsExports);

const initialState = { name: "", description: "" };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState<ToDoEntity[]>([]);

  useEffect(() => {
    fetchTodos();
    (API.graphql(graphqlOperation(onCreateTodo)) as any).subscribe({
      next: ({ provider, value }: any) => {
        const todo = value.data.onCreateTodo;
        console.log("todo", todo, todos);
        setTodos((todos) => [...todos, todo]);
      },
      error: (error: any) => console.warn(error),
    });
  }, []);

  function setInput(key: string, value: string) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData: any = await API.graphql(graphqlOperation(listTodos));
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo: ToDoEntity = { ...formState };
      setFormState(initialState);
      await API.graphql(graphqlOperation(createTodo, { input: todo }));
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Amplify Crash Course By Mahmoud Abd Al Kareem
          </Typography>
          {
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </div>
          }
        </Toolbar>
      </AppBar>
      <Box m={3}>
        <Grid container>
          <Grid item xs={1} lg={4} />
          <Grid item container spacing={3} lg={4} xs={10}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                variant="outlined"
                value={formState.name}
                fullWidth
                onChange={(event) => setInput("name", event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                onChange={(event) =>
                  setInput("description", event.target.value)
                }
                value={formState.description}
                placeholder="Description"
                label="Description"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={addTodo} fullWidth>
                Create Todo
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={1} lg={4} />
        </Grid>
      </Box>
      <Box m={2}>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, textAlign: "center" }}
        >
          Already added todos
        </Typography>
        {todos.map((todo, index: number) => (
          <Box key={todo.id} p={0.5} m={2}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={6}>
                <Alert severity="success">
                  Name: {todo.name} | Description: {todo.description}
                </Alert>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default withAuthenticator(App);
