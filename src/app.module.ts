import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import Article from './entities/article.entity';
import Movie from './entities/movie.entity';
import { MainModule } from './modules/main.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        ELASTICSEARCH_NODE: Joi.string(),
        // ELASTICSEARCH_USERNAME: Joi.string(),
        // ELASTICSEARCH_PASSWORD: Joi.string(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        logging: ['error'],
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [Article, Movie],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),

    SharedModule,

    MainModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
