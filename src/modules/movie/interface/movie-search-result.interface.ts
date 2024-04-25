import MovieSearchBody from './movie-search-body.interface';

interface MovieSearchResult {
  hits: {
    total: {
      value: number;
    };
    hits: Array<{
      _source: MovieSearchBody;
    }>;
  };
}

export default MovieSearchResult;
