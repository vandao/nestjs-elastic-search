import { Module } from '@nestjs/common';
import MovieController from './movie.controller';
import MovieService from './movie.service';
import SearchMovieService from './search-movie.service';

const providers = [MovieService, SearchMovieService];

@Module({
  imports: [],
  controllers: [MovieController],
  providers: [...providers],
  exports: [...providers],
})
export class MovieModule {}
