import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './media.entity';
import { BoxSet } from './boxset.entity';
import { TvShow } from './tvshow.entity';
import { Wishlist } from './wishlist.entity';
import { LoanHistory } from './loanhistory.entity';
import { CollectionValueHistory } from './collectionvaluehistory.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Media, BoxSet, TvShow, Wishlist, LoanHistory, CollectionValueHistory])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
