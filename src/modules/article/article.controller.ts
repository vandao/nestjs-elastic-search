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
import Article from '../../entities/article.entity';
import ArticleService from './article.service';
import CreateArticleDto from './dto/create-article.dto';
import UpdateArticleDto from './dto/update-article.dto';

@Controller('article')
@ApiTags('article')
export default class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getArticles(@Query() query: PaginationParamsDto) {
    const { search, limit, offset, startId } = query;

    if (search) {
      return this.articleService.searchForArticles(
        search,
        offset,
        limit,
        startId,
      );
    }
    return this.articleService.getArticlesWithAuthors(offset, limit, startId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a article that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'A article has been successfully fetched',
    type: Article,
  })
  @ApiResponse({
    status: 404,
    description: 'A article with given id does not exist.',
  })
  getArticleById(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.getArticleById(Number(id));
  }

  @Post()
  async createArticle(@Body() body: CreateArticleDto) {
    return this.articleService.createArticle(body);
  }

  @Patch(':id')
  async updateArticle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateArticleDto,
  ) {
    return this.articleService.updateArticle(Number(id), body);
  }

  @Delete(':id')
  async deleteArticle(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.deleteArticle(Number(id));
  }
}
