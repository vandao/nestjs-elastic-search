import { ArticleRepository } from './article-repository';
import { MovieRepository } from './movie-repository';

export * from './article-repository';
export * from './movie-repository';

export const AllRepository = [ArticleRepository, MovieRepository];
