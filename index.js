const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser=require('body-parser')
const cors = require("cors");



const app = express();
app.use(express.json());
app.use(cors());

const filePath = path.join(__dirname, "data", "jokes.json");
app.use(bodyParser.urlencoded({extended:true}))

function getJokes() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function saveJokes(jokes) {
  fs.writeFileSync(filePath, JSON.stringify(jokes, null, 2));
}


// all jokes
app.get("/jokes", (req, res) => {
  const jokes = getJokes();
  res.json(jokes);
});

//random jokes
app.get("/jokes/random", (req, res) => {
  const jokes = getJokes();
  const randomIndex = Math.floor(Math.random() * jokes.length);
  res.json(jokes[randomIndex]);
});


//create new joke
app.post("/jokes", (req, res) => {
  const jokes = getJokes();
    console.log(req.body)
  const newJoke = {
    id: jokes[jokes.length - 1].id + 1,
    joke: req.body.joke
  };

  jokes.push(newJoke);
  fs.writeFileSync(filePath, JSON.stringify(jokes, null, 2));

  res.status(201).json(newJoke);``
});
 
//Put=> update full jokes
app.put("/jokes/:id", (req, res) => {
  const jokes = getJokes();
  const id = Number(req.params.id);

  const jokeIndex = jokes.findIndex(j => j.id === id);
  if (jokeIndex === -1) {
    return res.status(404).json({ error: "Joke not found" });
  }

  if (!req.body.joke) {
    return res.status(400).json({ error: "Joke is required" });
  }

  jokes[jokeIndex].joke = req.body.joke;
  saveJokes(jokes);

  res.json(jokes[jokeIndex]);
});

//patch=>Update partial Joke
app.patch("/jokes/:id", (req, res) => {
  const jokes = getJokes();
  const id = Number(req.params.id);

  const joke = jokes.find(j => j.id === id);
  if (!joke) {
    return res.status(404).json({ error: "Joke not found" });
  }

  if (req.body.joke) {
    joke.joke = req.body.joke;
  }

  saveJokes(jokes);
  res.json(joke);
});

//delete joke
app.delete("/jokes/:id", (req, res) => {
  const jokes = getJokes();
  const id = Number(req.params.id);

  const filteredJokes = jokes.filter(j => j.id !== id);

  if (filteredJokes.length === jokes.length) {
    return res.status(404).json({ error: "Joke not found" });
  }

  saveJokes(filteredJokes);

  res.json({ message: "Joke deleted successfully" });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
