import { Module } from '@nestjs/common';
import 'dotenv/config';
import { UsecasesModule } from './usecase/usecase.module';
import { EthereumController } from './ethereum.controller';

@Module({
  imports: [
    UsecasesModule
  ],
  providers: [
  ],
  controllers: [
    EthereumController
  ]
})
export class EthereumModule {}