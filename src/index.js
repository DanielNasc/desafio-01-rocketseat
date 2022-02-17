const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(usr => usr.username === username)

  if (!user) return response.status(404).json({ message: "User not found" })

  request.user = user;
  return next()
}

/*
 * A rota deve receber `name`, e `username` dentro do corpo da requisição. 
 * Ao cadastrar um novo usuário, ele deve ser armazenado dentro de um objeto no seguinte formato:  

  {
    id: 'uuid', // precisa ser um uuid
    name: 'Danilo Vieira', 
    username: 'danilo', 
    todos: []
  }

  * Certifique-se que o ID seja um UUID, e de sempre iniciar a lista `todos` como um array vazio.
  * O objeto do usuário deve ser retornado na resposta da requisição.
*/
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (users.some(user => user.username === username)) {
    return response.status(400).json({ error: "Username already exists" })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

/*
 * A rota deve receber, pelo header da requisição, uma propriedade username contendo o username do usuário 
 * e retornar uma lista com todas as tarefas desse usuário.
*/
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(200).json(todos)
});

/*
 * A rota deve receber title e deadline dentro do corpo da requisição e, 
 * uma propriedade username contendo o username do usuário dentro do header da requisição. 
 * Ao criar um novo todo, ele deve ser armazenada dentro da lista todos do usuário que está criando essa tarefa.
*/
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)
  return response.status(201).json(todo)
});

/*
 * A rota deve receber, pelo header da requisição, uma propriedade username contendo o username do usuário 
 * e receber as propriedades title e deadline dentro do corpo. 
 * É preciso alterar apenas o title e o deadline da tarefa que possua o id igual 
 * ao id presente nos parâmetros da rota.
  */
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) return response.status(404).json({ error: "Todo not found" })

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

/*
 *A rota deve receber, pelo header da requisição, uma propriedade username contendo o username do usuário e 
 * alterar a propriedade done para true no todo que possuir um 
 * id igual ao id presente nos parâmetros da rota.
*/
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) return response.status(404).json({ error: "Todo not found" })

  todo.done = true;
  return response.json(todo)
});

/*
 * A rota deve receber, pelo header da requisição, uma propriedade username contendo o username do usuário 
 * e excluir o todo que possuir um id igual ao id presente nos parâmetros da rota.
*/
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) return response.status(404).json({ error: "Todo not found" })

  user.todos.splice(user.todos.indexOf(todo), 1)

  return response.status(204).send()
});

module.exports = app;
