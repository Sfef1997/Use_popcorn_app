import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorage";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const Key = "77a39bea";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { movies, loading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorage([], "watched");

  // const [watched, setWatched] = useState([]);

  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  function handelCloseMovie() {
    setSelectedId(null);
  }

  function handelAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handelDeletWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </Navbar>

      <Main>
        <Box movies={movies}>
          {loading && <Loader />}
          {!loading && !error && (
            <MovieList
              movies={movies}
              selectedId={selectedId}
              onSelectmovie={handleSelectedMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handelCloseMovie}
              onAddWatched={handelAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeletWatched={handelDeletWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>❌</span>
      {message}
    </p>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Loader() {
  return <p className="loader"> Loading...</p>;
}

function MovieList({ movies, onSelectmovie, selectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectmovie={onSelectmovie} />
      ))}
    </ul>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState("");
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Rated: reated,
    Released: released,
    Runtime: runtime,
    Actors: actors,
    imdbRating: imdbRating,
    plot: plot,
    Director: director,
    Genre: genre,
    Poster: poster,
  } = movie;

  const newWatchedMovie = {
    imdbID: selectedId,
    title,
    poster,
    imdbRating: Number(imdbRating),
    runtime: Number(runtime?.split(" ").at(0)),
    userRating,
    countRatingDesisicions: countRef.current,
  };

  const isTop = imdbRating > 7;

  // const [avgRating, setAvrge] = useState(0);

  function handelAdd() {
    onAddWatched(newWatchedMovie);
    onCloseMovie();

    // setAvrge(Number((avgRating) => (avgRating + userRating) / 2));
  }

  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        setLoading(true);
        const res =
          await fetch(`http://www.omdbapi.com/?apikey=${Key}&i=${selectedId}
      `);
        const data = await res.json();
        setMovie(data);
        setLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      {loading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2> {title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p> {genre}</p>
              <p>
                <span>✨</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handelAdd}>
                      Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>You Reated This Movie {watchedUserRating} ✨ </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p> Starring {actors}</p>
            <p> Diercted By {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Movie({ movie, onSelectmovie }) {
  return (
    <li onClick={() => onSelectmovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeletWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovieLi
          key={movie.imdbID}
          movie={movie}
          onDeletWatched={onDeletWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovieLi({ movie, onDeletWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeletWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
