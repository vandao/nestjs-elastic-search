import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import Movie from '../entities/movie.entity';

@Injectable()
export class MovieRepository extends Repository<Movie> {
  constructor(private dataSource: DataSource) {
    super(Movie, dataSource.createEntityManager());
  }
}
