import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllSchemas } from '../../entities';
import { AllRepository } from '../../repositories';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(AllSchemas)],
  providers: [...AllRepository],
  exports: [TypeOrmModule, ...AllRepository],
})
export class CoreModule {}
