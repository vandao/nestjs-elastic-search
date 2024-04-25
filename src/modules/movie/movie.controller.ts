import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import PaginationParamsDto from '../../common/dto/pagination-params.dto';
import Movie from '../../entities/movie.entity';
import CreateMovieDto from './dto/create-movie.dto';
import UpdateMovieDto from './dto/update-movie.dto';
import MovieService from './movie.service';

@Controller('movie')
@ApiTags('movie')
export default class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async getMovies(@Query() query: PaginationParamsDto) {
    const { search, limit, offset, startId } = query;

    if (search) {
      return this.movieService.searchForMovies(search, offset, limit, startId);
    }
    return this.movieService.getMoviesWithAuthors(offset, limit, startId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a movie that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'A movie has been successfully fetched',
    type: Movie,
  })
  @ApiResponse({
    status: 404,
    description: 'A movie with given id does not exist.',
  })
  getMovieById(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.getMovieById(Number(id));
  }

  @Post()
  async createMovie(@Body() body: CreateMovieDto) {
    return this.movieService.createMovie(body);
  }

  @Patch(':id')
  async updateMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.updateMovie(Number(id), body);
  }

  @Delete(':id')
  async deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.deleteMovie(Number(id));
  }
}
