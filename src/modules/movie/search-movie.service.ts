import { Injectable } from '@nestjs/common';
import Movie from '../../entities/movie.entity';
import { SearchService } from '../../shared/services/search.service';
import MovieCountResult from './interface/movie-count-result.interface';
import MovieSearchBody from './interface/movie-search-body.interface';
import MovieSearchResult from './interface/movie-search-result.interface';

@Injectable()
export default class SearchMovieService {
  index = 'movies';

  constructor(private readonly searchService: SearchService) {}

  async indexMovie(movie: Movie) {
    return this.searchService.elastic.index<MovieSearchResult, MovieSearchBody>(
      {
        index: this.index,
        body: {
          id: movie.id,
          title: movie.title,
          content: movie.content,
        },
      },
    );
  }

  async count(query: string, fields: string[]) {
    const { body } = await this.searchService.elastic.count<MovieCountResult>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query,
            fields,
          },
        },
      },
    });
    return body.count;
  }

  async search(text: string, offset?: number, limit?: number, startId = 0) {
    let separateCount = 0;
    if (startId) {
      separateCount = await this.count(text, ['title', 'content']);
    }
    const { body } = await this.searchService.elastic.search<MovieSearchResult>(
      {
        index: this.index,
        from: offset,
        size: limit,
        body: {
          query: {
            bool: {
              must: {
                multi_match: {
                  query: text,
                  fields: ['title', 'content'],
                },
              },
              filter: {
                range: {
                  id: {
                    gt: startId,
                  },
                },
              },
            },
          },
          sort: {
            _score: {
              order: 'desc',
            },
          },
        },
      },
    );
    const count = body.hits.total.value;
    const hits = body.hits.hits;
    const results = hits.map((item) => item._source);
    return {
      count: startId ? separateCount : count,
      results,
    };
  }

  async remove(movieId: number) {
    this.searchService.elastic.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: movieId,
          },
        },
      },
    });
  }

  async update(movie: Movie) {
    const newBody: MovieSearchBody = {
      id: movie.id,
      title: movie.title,
      content: movie.content,
    };

    const script = Object.entries(newBody).reduce((result, [key, value]) => {
      return `${result} ctx._source.${key}='${value}';`;
    }, '');

    return this.searchService.elastic.updateByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: movie.id,
          },
        },
        script: {
          inline: script,
        },
      },
    });
  }
}
