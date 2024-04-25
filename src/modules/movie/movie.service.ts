import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FindManyOptions, In, MoreThan } from 'typeorm';
import Movie from '../../entities/movie.entity';
import { MovieRepository } from '../../repositories';
import CreateMovieDto from './dto/create-movie.dto';
import UpdateMovieDto from './dto/update-movie.dto';
import SearchMovieService from './search-movie.service';

@Injectable()
export default class MovieService {
  constructor(
    private movieRepository: MovieRepository,
    private searchMovieService: SearchMovieService,
  ) {}

  async getMovies(
    offset?: number,
    limit?: number,
    startId?: number,
    options?: FindManyOptions<Movie>,
  ) {
    const where: FindManyOptions<Movie>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.movieRepository.count();
    }

    const [items, count] = await this.movieRepository.findAndCount({
      where,
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
      ...options,
    });

    return {
      items,
      count: startId ? separateCount : count,
    };
  }

  async getMoviesWithAuthors(
    offset?: number,
    limit?: number,
    startId?: number,
  ) {
    return this.getMovies(offset, limit, startId);
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
    });
    if (movie) {
      return movie;
    }
    Logger.warn('Tried to access a movie that does not exist');
    throw new NotFoundException(`Movie with id ${id} not found`);
  }

  async createMovie(body: CreateMovieDto) {
    const newMovie = await this.movieRepository.create(body);
    await this.movieRepository.save(newMovie);
    this.searchMovieService.indexMovie(newMovie);
    return newMovie;
  }

  async updateMovie(id: number, movie: UpdateMovieDto) {
    let updatedMovie = await this.movieRepository.findOne({
      where: {
        id,
      },
    });
    if (updatedMovie) {
      updatedMovie = this.movieRepository.merge(updatedMovie, movie);
      await this.movieRepository.update(id, updatedMovie);
      await this.searchMovieService.update(updatedMovie);
      return updatedMovie;
    }
    throw new NotFoundException(`Movie with id ${id} not found`);
  }

  async deleteMovie(id: number) {
    const deleteResponse = await this.movieRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    await this.searchMovieService.remove(id);
  }

  async searchForMovies(
    text: string,
    offset?: number,
    limit?: number,
    startId?: number,
  ) {
    const { results, count } = await this.searchMovieService.search(
      text,
      offset,
      limit,
      startId,
    );
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return {
        items: [],
        count,
      };
    }
    const items = await this.movieRepository.find({
      where: { id: In(ids) },
    });
    return {
      items,
      count,
    };
  }
}
