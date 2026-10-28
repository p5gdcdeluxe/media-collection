import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { Media, MediaFormat, MediaType } from './media.entity';
import { BoxSet } from './boxset.entity';

/**
 * Controller for managing media collection operations including
 * media items, TV shows, seasons, wishlists, loan history, and collection analytics.
 * Handles all HTTP requests for the media collection manager API.
 */
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async findAll(): Promise<Media[]> {
    return await this.mediaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Media> {
    return await this.mediaService.findOne(id);
  }

  @Get('ean/:ean')
  async findByEan(@Param('ean') ean: string): Promise<Media> {
    return await this.mediaService.findByEan(ean);
  }

  @Post()
  async create(@Body() media: Partial<Media>): Promise<Media> {
    return await this.mediaService.create(media);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() media: Partial<Media>): Promise<Media> {
    return await this.mediaService.update(id, media);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return await this.mediaService.delete(id);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('format') format: MediaFormat,
    @Query('genre') genre: string,
    @Query('country') country: string,
    @Query('year') year: number,
    @Query('loaned') loaned: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12
  ): Promise<{ data: Media[], total: number }> {
    const filters = {};
    if (format) filters['format'] = format;
    if (genre) filters['genre'] = genre;
    if (country) filters['country'] = country;
    if (year) filters['releaseYear'] = year;
    if (loaned !== undefined) filters['loaned'] = loaned;
    
    return await this.mediaService.search(query, filters, page, limit);
  }

  @Get('stats')
  async getStats(): Promise<any> {
    return await this.mediaService.getStats();
  }

  @Get('genres')
  async getAllGenres(): Promise<string[]> {
    return await this.mediaService.getAllGenres();
  }

  @Get('directors')
  async getAllDirectors(): Promise<string[]> {
    return await this.mediaService.getAllDirectors();
  }

  @Get('countries')
  async getAllCountries(): Promise<string[]> {
    return await this.mediaService.getAllCountries();
  }

  @Get('formats')
  async getAllFormats(): Promise<MediaFormat[]> {
    return await this.mediaService.getAllFormats();
  }

  @Get('ratings')
  async getAllRatings(): Promise<number[]> {
    return await this.mediaService.getAllRatings();
  }

  @Get('years')
  async getAllYears(): Promise<number[]> {
    return await this.mediaService.getAllYears();
  }

  @Get('collections')
  async getAllCollections(): Promise<any[]> {
    return await this.mediaService.getAllCollections();
  }

  // TV Show endpoints
  @Post('tvshows')
  async createTvShow(@Body() tvShow: Partial<TvShow>): Promise<TvShow> {
    return await this.mediaService.createTvShow(tvShow);
  }

  @Get('tvshows')
  async getTvShows(): Promise<TvShow[]> {
    return await this.mediaService.getTvShows();
  }

  @Get('tvshows/:id')
  async getTvShowById(@Param('id') id: number): Promise<TvShow> {
    return await this.mediaService.getTvShowById(id);
  }

  @Put('tvshows/:id')
  async updateTvShow(@Param('id') id: number, @Body() tvShow: Partial<TvShow>): Promise<TvShow> {
    return await this.mediaService.updateTvShow(id, tvShow);
  }

  @Delete('tvshows/:id')
  async deleteTvShow(@Param('id') id: number): Promise<void> {
    return await this.mediaService.deleteTvShow(id);
  }

  // Season endpoints
  @Post('seasons')
  async createSeason(@Body() season: Partial<Media>): Promise<Media> {
    return await this.mediaService.createSeason(season);
  }

  @Get('seasons/:tvShowId')
  async getSeasonsByTvShow(@Param('tvShowId') tvShowId: number): Promise<Media[]> {
    return await this.mediaService.getSeasonsByTvShow(tvShowId);
  }

  // BoxSet endpoints
  @Post('boxsets')
  async createBoxSet(@Body() boxSet: Partial<BoxSet>): Promise<BoxSet> {
    return await this.mediaService.createBoxSet(boxSet);
  }

  @Post('boxsets/:boxSetId/media/:mediaId')
  async addMediaToBoxSet(
    @Param('boxSetId') boxSetId: number,
    @Param('mediaId') mediaId: number
  ): Promise<BoxSet> {
    return await this.mediaService.addMediaToBoxSet(boxSetId, mediaId);
  }

  // Wishlist endpoints
  @Post('wishlist')
  async addToWishlist(@Body() body: { userId: string; mediaId: number; notes?: string }): Promise<Wishlist> {
    return await this.mediaService.addToWishlist(body.userId, body.mediaId, body.notes);
  }

  @Get('wishlist/:userId')
  async getWishlist(@Param('userId') userId: string): Promise<Wishlist[]> {
    return await this.mediaService.getWishlist(userId);
  }

  @Delete('wishlist/:userId/:wishlistId')
  async removeFromWishlist(@Param('userId') userId: string, @Param('wishlistId') wishlistId: number): Promise<void> {
    return await this.mediaService.removeFromWishlist(userId, wishlistId);
  }

  @Put('wishlist/:userId/:wishlistId/mark-completed')
  async markAsCompleted(@Param('userId') userId: string, @Param('wishlistId') wishlistId: number): Promise<Wishlist> {
    return await this.mediaService.markAsCompleted(userId, wishlistId);
  }

  @Delete('boxsets/:boxSetId/media/:mediaId')
  async removeMediaFromBoxSet(
    @Param('boxSetId') boxSetId: number,
    @Param('mediaId') mediaId: number
  ): Promise<BoxSet> {
    return await this.mediaService.removeMediaFromBoxSet(boxSetId, mediaId);
  }

  @Get('boxsets')
  async getBoxSets(): Promise<BoxSet[]> {
    return await this.mediaService.getBoxSets();
  }

  @Get('boxsets/:id')
  async getBoxSetById(@Param('id') id: number): Promise<BoxSet> {
    return await this.mediaService.getBoxSetById(id);
  }

  // Collection endpoints
  @Post('collections/:collectionId/media/:mediaId')
  async addMediaToCollection(
    @Param('collectionId') collectionId: number,
    @Param('mediaId') mediaId: number
  ): Promise<Media> {
    return await this.mediaService.addMediaToCollection(collectionId, mediaId);
  }

  @Delete('collections/:collectionId/media/:mediaId')
  async removeMediaFromCollection(
    @Param('collectionId') collectionId: number,
    @Param('mediaId') mediaId: number
  ): Promise<Media> {
    return await this.mediaService.removeMediaFromCollection(collectionId, mediaId);
  }

  @Get('collections/:id')
  async getCollectionsByMedia(@Param('id') id: number): Promise<Media[]> {
    return await this.mediaService.getCollectionsByMedia(id);
  }

  @Post('export')
  async exportData(): Promise<any> {
    return await this.mediaService.exportData();
  }

  @Post('import')
  async importData(@Body() data: any): Promise<void> {
    return await this.mediaService.importData(data);
  }

  @Get('export/csv')
  async exportToCsv(): Promise<string> {
    return await this.mediaService.exportToCsv();
  }

  @Get('export/pdf')
  async exportToPdf(): Promise<string> {
    return await this.mediaService.exportToPdf();
  }

  // Loan History Endpoints
  /**
   * Record a loan for a media item
   * @param mediaId ID of the media item being loaned
   * @param body Request body containing userId and optional borrowerName
   * @returns The created loan history record
   */
  @Post('loan/:mediaId')
  async recordLoan(
    @Param('mediaId') mediaId: number,
    @Body() body: { userId: string; borrowerName?: string }
  ): Promise<LoanHistory> {
    return await this.mediaService.recordLoan(mediaId, body.userId, body.borrowerName);
  }

  /**
   * Record the return of a loaned media item
   * @param loanId ID of the loan history record
   * @returns The updated loan history record
   */
  @Post('loan/:loanId/return')
  async returnLoan(@Param('loanId') loanId: number): Promise<LoanHistory> {
    return await this.mediaService.returnLoan(loanId);
  }

  /**
   * Get complete loan history for all media items
   * @returns Array of loan history records ordered by loan date descending
   */
  @Get('loan-history')
  async getLoanHistory(): Promise<LoanHistory[]> {
    return await this.mediaService.getLoanHistory();
  }

  /**
   * Get loan history for a specific media item
   * @param mediaId ID of the media item
   * @returns Array of loan history records for the specified media item
   */
  @Get('loan-history/:mediaId')
  async getLoanHistoryByMedia(@Param('mediaId') mediaId: number): Promise<LoanHistory[]> {
    return await this.mediaService.getLoanHistoryByMedia(mediaId);
  }

  // Collection Value History Endpoints
  /**
   * Record current collection value for tracking over time
   * @returns The created collection value history record
   */
  @Post('collection-value')
  async recordCollectionValue(): Promise<CollectionValueHistory> {
    return await this.mediaService.recordCollectionValue();
  }

  /**
   * Get collection value history for time-based analysis
   * @param limit Number of records to return (default: 30)
   * @returns Array of collection value history records ordered by date descending
   */
  @Get('collection-value/history')
  async getCollectionValueHistory(
    @Query('limit') limit: number = 30
  ): Promise<CollectionValueHistory[]> {
    return await this.mediaService.getCollectionValueHistory(limit);
  }

  /**
   * Get collection growth analytics for trend analysis
   * @returns Object containing growth data and statistics
   */
  @Get('collection-growth-analytics')
  async getCollectionGrowthAnalytics(): Promise<any> {
    return await this.mediaService.getCollectionGrowthAnalytics();
  }
}