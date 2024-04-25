import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, MoreThan } from 'typeorm';
import Article from '../../entities/article.entity';
import { ArticleRepository } from '../../repositories';
import CreateArticleDto from './dto/create-article.dto';
import UpdateArticleDto from './dto/update-article.dto';
import SearchArticleService from './search-article.service';

@Injectable()
export default class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: ArticleRepository,
    private searchArticleService: SearchArticleService,
  ) {}

  async getArticles(
    offset?: number,
    limit?: number,
    startId?: number,
    options?: FindManyOptions<Article>,
  ) {
    const where: FindManyOptions<Article>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.articleRepository.count();
    }

    const [items, count] = await this.articleRepository.findAndCount({
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

  async getArticlesWithAuthors(
    offset?: number,
    limit?: number,
    startId?: number,
  ) {
    return this.getArticles(offset, limit, startId);
  }

  async getArticleById(id: number) {
    const article = await this.articleRepository.findOne({
      where: { id },
    });
    if (article) {
      return article;
    }
    Logger.warn('Tried to access a article that does not exist');
    throw new NotFoundException(`Article with id ${id} not found`);
  }

  async createArticle(body: CreateArticleDto) {
    const newArticle = await this.articleRepository.create(body);
    await this.articleRepository.save(newArticle);
    this.searchArticleService.indexArticle(newArticle);
    return newArticle;
  }

  async updateArticle(id: number, article: UpdateArticleDto) {
    let updatedArticle = await this.articleRepository.findOne({
      where: {
        id,
      },
    });
    if (updatedArticle) {
      updatedArticle = this.articleRepository.merge(updatedArticle, article);
      await this.articleRepository.update(id, updatedArticle);
      await this.searchArticleService.update(updatedArticle);
      return updatedArticle;
    }
    throw new NotFoundException(`Article with id ${id} not found`);
  }

  async deleteArticle(id: number) {
    const deleteResponse = await this.articleRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    await this.searchArticleService.remove(id);
  }

  async searchForArticles(
    text: string,
    offset?: number,
    limit?: number,
    startId?: number,
  ) {
    const { results, count } = await this.searchArticleService.search(
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
    const items = await this.articleRepository.find({
      where: { id: In(ids) },
    });
    return {
      items,
      count,
    };
  }
}
