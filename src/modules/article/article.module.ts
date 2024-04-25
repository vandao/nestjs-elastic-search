import { Module } from '@nestjs/common';
import ArticleController from './article.controller';
import ArticleService from './article.service';
import SearchArticleService from './search-article.service';

const providers = [ArticleService, SearchArticleService];

@Module({
  imports: [],
  controllers: [ArticleController],
  providers: [...providers],
  exports: [...providers],
})
export class ArticleModule {}
