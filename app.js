const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null
app.use(express.json())
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertForMovie = dbObject => {
  return {
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

//get all
app.get('/movies/', async (request, response) => {
  const query = `
    SELECT
      *
    FROM
      movie;`
  const result = await db.all(query)
  response.send(result.map(each => convertForMovie(each)))
})

//post

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const query = ` INSERT INTO movie (director_id,movie_name,lead_actor) VALUES(
    ${directorId}, "${movieName}","${leadActor}"
    );`
  const result = await db.run(query)
  response.send('Movie Successfully Added')
})

//get one
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const query = ` SELECT * FROM movie WHERE movie_id =${movieId};`
  const result = await db.get(query)
  response.send(convertForMovie(result))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const query = `
  UPDATE movie SET director_id=${directorId}, movie_name="${movieName}",lead_actor="${leadActor};"
  WHERE movie_id=${movieId};
  `
  await db.run(query)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const query = `
  DELETE FROM movie WHERE movie_id= ${movieId};
  `
  await db.run(query)
  response.send('Movie Removed')
})

const convertForDirector = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const query = `
  SELECT * FROM director;
  `
  const result = await db.all(query)
  response.send(result.map(each => convertForDirector(each)))
})

const changing = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const query = `
  SELECT movie_name 
  FROM movie 
  WHERE director_id= ${directorId}
  `
  const result = await db.all(query)
  response.send(result.map(each => changing(each)))
})
