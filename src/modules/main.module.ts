import { Module } from '@nestjs/common';
import { ArticleModule } from './article/article.module';
import { CoreModule } from './core/core.module';
import { MovieModule } from './movie/movie.module';

@Module({
  imports: [CoreModule, ArticleModule, MovieModule],
  providers: [],
  exports: [],
})
export class MainModule {}
