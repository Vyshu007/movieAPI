const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const getMovieNameObject = (dbObject) => {
    return {
        movieName = dbObject.movie_name,
    };
};

//API1 
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      *
    FROM
      movie;`;
  const booksArray = await db.all(getMoviesQuery);
  response.send(booksArray.map((eachItem) => getMovieNameObject(eachItem)));
});

//API2 
app.post("/movies",async(request,response) =>{
    const movieDetails = request.body;
    const {directorId,movieName,leadActor} = movieDetails;
    const postMovieQuery = `
        INSERT INTO movie (director_id,movie_name,lead_actor)
        VALUES ('${directorId}','${movieName}','${leadActor}');
    `;
    const dbResponse = await db.run(postMovieQuery);
    const movieId = dbResponse.lastID;
    response.send("Movie Successfully Added");
});

const getMovieObject = (dbObject) => {
    return {
        movieId: dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor,
    };
};

//API3 
app.get("/movies/:movieId",async(request,response) =>{
    const {movieId} = request.params;
    const singleMovieQuery = `
        SELECT * FROM movie WHERE movie_id = '${movieId}';
    `;
    const mov = await db.get(singleMovieQuery);
    response.send(getMovieObject(mov));
});

//API4 
app.put("/movies/:movieId",async(request,response) =>{
    const {movieId} = request.params;
    const updateMovieDetails = request.body;
    const {directorId,movieName,leadActor} = updateMovieDetails;
    const updateMovieQuery = `
       UPDATE movie SET 
         director_id = '${directorId}',
         movie_name = '${movieName}',
         lead_actor = '${leadActor} WHERE movie_id = ${movieId};
    `;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
});

//API5 
app.delete("/movies/:movieId",async(request,response) =>{
    const {movieId} = request.params;
    const deleteMovieQuery = `
        DELETE FROM movie WHERE movie_id = ${movieId};
    `;
    await db.run(deleteBookQuery);
    response.send("Movie Removed");
});

const getAllDirectorsListAsObject = (dbObject) =>{
    return {
        directorId: dbObject.director_id,
        directorName: dbObject.director_name,
    };
};

//API6 
app.get("/directors/",async(request,response) =>{
    const getDirectorQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(directorArray.map((eachItem) =>getAllDirectorsListAsObject(eachItem)));
});

const getMovieNameByDirectorObject = (dbObject) =>{
    return {
        movieName: dbObject.movie_name,
    };
};

//API7 
app.get("/directors/:directorId/movies/",async(request,response) =>{
    const {directorId} = request.params;
    const getOneQuery = `
        SELECT * FROM movie WHERE director_id = ${directorId}
        group by movie_id;
    `;
    const dbResponse = await db.all(getOneQuery);
    response.send(
        dbResponse.map((eachItem) => getMovieNameByDirectorObject(eachItem))
    );
});

module.exports = app;