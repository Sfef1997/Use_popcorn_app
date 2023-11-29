import { useState, useEffect } from "react";

const Key = "77a39bea";
export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      //   callback?.();
      const controller = new AbortController();
      async function fetchData() {
        try {
          setError("");
          setLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${Key}&s=${query}
      `,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Somgthing Wrong With Your Movies Download");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie Not Found");
          setMovies(data.Search);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setLoading(false);
        }
        if (query.length < 3) {
          setMovies([]);
          setError("");
          return;
        }
      }
      //   handelCloseMovie();
      fetchData();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, loading, error };
}
