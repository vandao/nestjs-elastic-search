import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import Article from '../entities/article.entity';

@Injectable()
export class ArticleRepository extends Repository<Article> {
  constructor(private dataSource: DataSource) {
    super(Article, dataSource.createEntityManager());
  }
}
