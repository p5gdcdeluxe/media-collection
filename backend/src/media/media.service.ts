/**
 * Service for managing media collection operations including 
 * media items, TV shows, seasons, wishlists, loan history, and collection analytics.
 * Handles all business logic for the media collection manager application.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaFormat, MediaType } from './media.entity';
import { BoxSet } from './boxset.entity';
import { TvShow } from './tvshow.entity';
import { Wishlist } from './wishlist.entity';
import { LoanHistory } from './loanhistory.entity';
import { CollectionValueHistory } from './collectionvaluehistory.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(BoxSet)
    private boxSetRepository: Repository<BoxSet>,
    @InjectRepository(TvShow)
    private tvShowRepository: Repository<TvShow>,
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(LoanHistory)
    private loanHistoryRepository: Repository<LoanHistory>,
    @InjectRepository(CollectionValueHistory)
    private collectionValueHistoryRepository: Repository<CollectionValueHistory>,
  ) {}

  async findAll(): Promise<Media[]> {
    const medias = await this.mediaRepository.find({
      relations: ['tvShow', 'seasons']
    });
    
    // Add season count for TV shows
    return medias.map(media => {
      if (media.type === 'TV Show') {
        return {
          ...media,
          seasonCount: media.seasons ? media.seasons.length : 0
        };
      }
      return media;
    });
  }

  async findOne(id: number): Promise<Media> {
    return await this.mediaRepository.findOneBy({ id });
  }

  async findByEan(ean: string): Promise<Media> {
    return await this.mediaRepository.findOneBy({ ean13: ean });
  }

  async create(media: Partial<Media>): Promise<Media> {
    // Set default type if not provided
    if (!media.type) {
      media.type = MediaType.MOVIE;
    }
    
    const newMedia = this.mediaRepository.create(media);
    return await this.mediaRepository.save(newMedia);
  }

  async update(id: number, media: Partial<Media>): Promise<Media> {
    await this.mediaRepository.update(id, media);
    return await this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.mediaRepository.delete(id);
  }

  async search(query: string, filters?: any, page: number = 1, limit: number = 12): Promise<{ data: Media[], total: number }> {
    let qb = this.mediaRepository.createQueryBuilder('media');

    if (query) {
      qb = qb.where('media.title ILIKE :query OR media.director ILIKE :query OR media.genre ILIKE :query', { query: `%${query}%` });
    }

    if (filters?.format) {
      qb = qb.andWhere('media.format = :format', { format: filters.format });
    }

    if (filters?.genre) {
      qb = qb.andWhere('media.genre = :genre', { genre: filters.genre });
    }

    if (filters?.loaned !== undefined) {
      qb = qb.andWhere('media.isLoaned = :loaned', { loaned: filters.loaned });
    }

    if (filters?.country) {
      qb = qb.andWhere('media.country = :country', { country: filters.country });
    }

    if (filters?.releaseYear) {
      qb = qb.andWhere('media.releaseYear = :year', { year: filters.releaseYear });
    }

    // Handle type filtering
    if (filters?.type) {
      qb = qb.andWhere('media.type = :type', { type: filters.type });
    }

    const skip = (page - 1) * limit;
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    
    return { data, total };
  }

  /**
   * Get comprehensive statistics about the media collection
   * @returns Object containing various statistics about the collection
   */
  async getStats(): Promise<any> {
    const totalMedia = await this.mediaRepository.count();
    const loanedMedia = await this.mediaRepository.count({ where: { isLoaned: true } });
    
    // Get format distribution
    const formatStats = await this.mediaRepository
      .createQueryBuilder('media')
      .select('media.format', 'format')
      .addSelect('COUNT(*)', 'count')
      .groupBy('media.format')
      .getRawMany();
    
    // Get genres
    const genres = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.genre')
      .where('media.genre IS NOT NULL')
      .orderBy('media.genre')
      .getRawMany();
    
    // Get release year distribution
    const yearStats = await this.mediaRepository
      .createQueryBuilder('media')
      .select('media.releaseYear', 'year')
      .addSelect('COUNT(*)', 'count')
      .where('media.releaseYear IS NOT NULL')
      .groupBy('media.releaseYear')
      .orderBy('media.releaseYear')
      .getRawMany();
    
    // Get decade distribution
    const decadeStats = await this.mediaRepository
      .createQueryBuilder('media')
      .select('FLOOR(media.releaseYear / 10) * 10', 'decade')
      .addSelect('COUNT(*)', 'count')
      .where('media.releaseYear IS NOT NULL')
      .groupBy('FLOOR(media.releaseYear / 10) * 10')
      .orderBy('decade')
      .getRawMany();
    
    // Get countries
    const countries = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.country')
      .where('media.country IS NOT NULL')
      .orderBy('media.country')
      .getRawMany();
    
    // Get total price
    const totalPriceResult = await this.mediaRepository
      .createQueryBuilder('media')
      .select('SUM(COALESCE(media.price, 0))', 'totalPrice')
      .getRawOne();
    const totalPrice = totalPriceResult ? parseFloat(totalPriceResult.totalPrice) : 0;
    
    return {
      totalMedia,
      loanedMedia,
      totalPrice,
      formats: formatStats.reduce((acc, curr) => {
        acc[curr.format] = parseInt(curr.count);
        return acc;
      }, {}),
      genres: genres.map(g => g.genre),
      years: yearStats.reduce((acc, curr) => {
        acc[curr.year] = parseInt(curr.count);
        return acc;
      }, {}),
      decades: decadeStats.reduce((acc, curr) => {
        acc[curr.decade] = parseInt(curr.count);
        return acc;
      }, {}),
      countries: countries.map(c => c.country)
    };
  }

  // Loan History Methods
  /**
   * Record a loan for a media item
   * @param mediaId ID of the media item being loaned
   * @param userId ID of the user borrowing the item
   * @param borrowerName Optional name of the borrower
   * @returns The created loan history record
   */
  async recordLoan(mediaId: number, userId: string, borrowerName?: string): Promise<LoanHistory> {
    const media = await this.findOne(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    const loanHistory = this.loanHistoryRepository.create({
      media,
      userId,
      borrowerName,
      loanDate: new Date(),
      isReturned: false
    });

    return await this.loanHistoryRepository.save(loanHistory);
  }

  /**
   * Record the return of a loaned media item
   * @param loanId ID of the loan history record
   * @returns The updated loan history record
   */
  async returnLoan(loanId: number): Promise<LoanHistory> {
    const loan = await this.loanHistoryRepository.findOneBy({ id: loanId });
    if (!loan) {
      throw new Error('Loan not found');
    }

    loan.returnDate = new Date();
    loan.isReturned = true;

    return await this.loanHistoryRepository.save(loan);
  }

  /**
   * Get complete loan history for all media items
   * @returns Array of loan history records ordered by loan date descending
   */
  async getLoanHistory(): Promise<LoanHistory[]> {
    return await this.loanHistoryRepository.find({
      relations: ['media'],
      order: { loanDate: 'DESC' }
    });
  }

  /**
   * Get loan history for a specific media item
   * @param mediaId ID of the media item
   * @returns Array of loan history records for the specified media item
   */
  async getLoanHistoryByMedia(mediaId: number): Promise<LoanHistory[]> {
    return await this.loanHistoryRepository.find({
      where: { media: { id: mediaId } },
      order: { loanDate: 'DESC' }
    });
  }

  // Collection Value History Methods
  /**
   * Record current collection value for tracking over time
   * @returns The created collection value history record
   */
  async recordCollectionValue(): Promise<CollectionValueHistory> {
    const totalMedia = await this.mediaRepository.count();
    const loanedMedia = await this.mediaRepository.count({ where: { isLoaned: true } });
    
    // Get total price
    const totalPriceResult = await this.mediaRepository
      .createQueryBuilder('media')
      .select('SUM(COALESCE(media.price, 0))', 'totalPrice')
      .getRawOne();
    const totalPrice = totalPriceResult ? parseFloat(totalPriceResult.totalPrice) : 0;
    
    const collectionValue = this.collectionValueHistoryRepository.create({
      totalValue: totalPrice,
      totalItems: totalMedia,
      loanedItems: loanedMedia
    });

    return await this.collectionValueHistoryRepository.save(collectionValue);
  }

  /**
   * Get collection value history for time-based analysis
   * @param limit Number of records to return (default: 30)
   * @returns Array of collection value history records ordered by date descending
   */
  async getCollectionValueHistory(limit: number = 30): Promise<CollectionValueHistory[]> {
    return await this.collectionValueHistoryRepository.find({
      order: { recordedAt: 'DESC' },
      take: limit
    });
  }

  /**
   * Get collection growth analytics for trend analysis
   * @returns Object containing growth data and statistics
   */
  async getCollectionGrowthAnalytics(): Promise<any> {
    // Get collection value history for the last 30 days
    const history = await this.getCollectionValueHistory(30);
    
    // Calculate daily growth rates
    const growthData = [];
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      
      const valueChange = curr.totalValue - prev.totalValue;
      const itemChange = curr.totalItems - prev.totalItems;
      
      growthData.push({
        date: curr.recordedAt,
        valueChange,
        itemChange,
        totalValue: curr.totalValue,
        totalItems: curr.totalItems
      });
    }
    
    // Calculate overall statistics
    const firstRecord = history[history.length - 1];
    const lastRecord = history[0];
    
    const totalValueChange = lastRecord.totalValue - firstRecord.totalValue;
    const totalItemsChange = lastRecord.totalItems - firstRecord.totalItems;
    
    return {
      growthData,
      totalValueChange,
      totalItemsChange,
      currentTotalValue: lastRecord.totalValue,
      currentTotalItems: lastRecord.totalItems,
      firstRecord,
      lastRecord
    };
  }

  async getAllGenres(): Promise<string[]> {
    const genres = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.genre')
      .where('media.genre IS NOT NULL')
      .orderBy('media.genre')
      .getRawMany();

    return genres.map(g => g.genre);
  }

  async getAllDirectors(): Promise<string[]> {
    const directors = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.director')
      .where('media.director IS NOT NULL')
      .orderBy('media.director')
      .getRawMany();

    return directors.map(d => d.director);
  }

  async getAllCountries(): Promise<string[]> {
    const countries = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.country')
      .where('media.country IS NOT NULL')
      .orderBy('media.country')
      .getRawMany();

    return countries.map(c => c.country);
  }

  async getAllFormats(): Promise<MediaFormat[]> {
    const formats = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.format')
      .where('media.format IS NOT NULL')
      .orderBy('media.format')
      .getRawMany();

    return formats.map(f => f.format);
  }

  async getAllRatings(): Promise<number[]> {
    const ratings = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.rating')
      .where('media.rating IS NOT NULL')
      .orderBy('media.rating')
      .getRawMany();

    return ratings.map(r => r.rating);
  }

  async getAllYears(): Promise<number[]> {
    const years = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.releaseYear')
      .where('media.releaseYear IS NOT NULL')
      .orderBy('media.releaseYear')
      .getRawMany();

    return years.map(y => y.releaseYear);
  }

  async getAllCollections(): Promise<any[]> {
    // For now, we'll return box sets as collections since we don't have a dedicated collection entity
    // In a real implementation, we'd have a separate collections table
    const boxSets = await this.getBoxSets();
    return boxSets.map(boxSet => ({
      id: boxSet.id,
      name: boxSet.name,
      description: boxSet.description
    }));
  }

  // TV Show methods
  async createTvShow(tvShow: Partial<TvShow>): Promise<Media> {
    // Convert TvShow to Media with type TV Show
    const mediaData: Partial<Media> = {
      ...tvShow,
      type: MediaType.TV_SHOW,
      totalSeasons: tvShow.totalSeasons ? parseInt(tvShow.totalSeasons.toString()) : 0
    };
    
    const newMedia = this.mediaRepository.create(mediaData);
    return await this.mediaRepository.save(newMedia);
  }

  async getTvShows(): Promise<Media[]> {
    return await this.mediaRepository.find({ where: { type: MediaType.TV_SHOW } });
  }

  async getTvShowById(id: number): Promise<TvShow> {
    return await this.tvShowRepository.findOneBy({ id });
  }

  async updateTvShow(id: number, tvShow: Partial<TvShow>): Promise<Media> {
    // Convert TvShow to Media with type TV Show
    const mediaData: Partial<Media> = {
      ...tvShow,
      type: MediaType.TV_SHOW,
      totalSeasons: tvShow.totalSeasons ? parseInt(tvShow.totalSeasons.toString()) : 0
    };
    
    await this.mediaRepository.update(id, mediaData);
    return await this.findOne(id);
  }

  async deleteTvShow(id: number): Promise<void> {
    await this.tvShowRepository.delete(id);
  }

  // Season methods
  async createSeason(season: Partial<Media>): Promise<Media> {
    // Set type for season
    const seasonData: Partial<Media> = {
      ...season,
      type: MediaType.SEASON
    };
    
    const newSeason = this.mediaRepository.create(seasonData);
    return await this.mediaRepository.save(newSeason);
  }

  async getSeasonsByTvShow(tvShowId: number): Promise<Media[]> {
    return await this.mediaRepository.find({ where: { tvShowId } });
  }

  // BoxSet methods
  async createBoxSet(boxSet: Partial<BoxSet>): Promise<BoxSet> {
    const newBoxSet = this.boxSetRepository.create(boxSet);
    return await this.boxSetRepository.save(newBoxSet);
  }

  async addMediaToBoxSet(boxSetId: number, mediaId: number): Promise<BoxSet> {
    const boxSet = await this.boxSetRepository.findOneBy({ id: boxSetId });
    const media = await this.findOne(mediaId);

    if (!boxSet || !media) {
      throw new Error('BoxSet or Media not found');
    }

    boxSet.mediaItems.push(media);
    return await this.boxSetRepository.save(boxSet);
  }

  async removeMediaFromBoxSet(boxSetId: number, mediaId: number): Promise<BoxSet> {
    const boxSet = await this.boxSetRepository.findOneBy({ id: boxSetId });
    const media = await this.findOne(mediaId);

    if (!boxSet || !media) {
      throw new Error('BoxSet or Media not found');
    }

    boxSet.mediaItems = boxSet.mediaItems.filter(item => item.id !== mediaId);
    return await this.boxSetRepository.save(boxSet);
  }

  // Wishlist methods
  async addToWishlist(userId: string, mediaId: number, notes?: string): Promise<Wishlist> {
    const media = await this.findOne(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    const wishlistItem = this.wishlistRepository.create({
      userId,
      media,
      notes
    });

    return await this.wishlistRepository.save(wishlistItem);
  }

  async getWishlist(userId: string): Promise<Wishlist[]> {
    return await this.wishlistRepository.find({
      where: { userId },
      relations: ['media']
    });
  }

  async removeFromWishlist(userId: string, wishlistId: number): Promise<void> {
    await this.wishlistRepository.delete({ id: wishlistId, userId });
  }

  async markAsCompleted(userId: string, wishlistId: number): Promise<Wishlist> {
    const wishlistItem = await this.wishlistRepository.findOneBy({ id: wishlistId, userId });
    if (!wishlistItem) {
      throw new Error('Wishlist item not found');
    }

    wishlistItem.isCompleted = true;
    return await this.wishlistRepository.save(wishlistItem);
  }

  async getBoxSets(): Promise<BoxSet[]> {
    return await this.boxSetRepository.find();
  }

  async getBoxSetById(id: number): Promise<BoxSet> {
    return await this.boxSetRepository.findOneBy({ id });
  }

  async exportData(): Promise<any> {
    const [medias, boxSets] = await Promise.all([
      this.findAll(),
      this.getBoxSets()
    ]);
    
    return {
      medias,
      boxSets
    };
  }

  async importData(data: any): Promise<void> {
    // Clear existing data
    await this.mediaRepository.clear();
    await this.boxSetRepository.clear();
    
    // Import new data
    if (data.medias && data.medias.length > 0) {
      await this.mediaRepository.save(data.medias);
    }
    
    if (data.boxSets && data.boxSets.length > 0) {
      await this.boxSetRepository.save(data.boxSets);
    }
  }

  async exportToCsv(): Promise<string> {
    const medias = await this.findAll();
    const boxSets = await this.getBoxSets();
    
    // Create CSV header
    let csvContent = 'Title,Release Year,Genre,Director,Rating,Format,Edition,Cover Image,Loaned,Custom Notes,Location,Country,Price,Type,Total Seasons\n';
    
    // Add media items
    medias.forEach(media => {
      csvContent += `"${media.title.replace(/"/g, '""')}","${media.releaseYear}","${media.genre}","${media.director}","${media.rating}","${media.format}","${media.edition}","${media.coverImage}","${media.isLoaned}","${media.customNotes.replace(/"/g, '""')}","${media.location}","${media.country}","${media.price}","${media.type}","${media.totalSeasons || ''}"\n`;
    });
    
    // Add box sets
    boxSets.forEach(boxSet => {
      csvContent += `"${boxSet.name.replace(/"/g, '""')}","","","","","","","","","","","","","BoxSet",""\n`;
    });
    
    return csvContent;
  }

  async exportToPdf(): Promise<string> {
    const medias = await this.findAll();
    const boxSets = await this.getBoxSets();
    
    // Create a simple text-based "PDF" representation
    let pdfContent = '=== MEDIA COLLECTION REPORT ===\n\n';
    
    // Add statistics
    pdfContent += `Total Items: ${medias.length}\n`;
    pdfContent += `Box Sets: ${boxSets.length}\n\n`;
    
    // Add media items
    pdfContent += 'MEDIA ITEMS:\n';
    pdfContent += '=============\n';
    
    medias.forEach(media => {
      pdfContent += `\nTitle: ${media.title}\n`;
      pdfContent += `Release Year: ${media.releaseYear}\n`;
      pdfContent += `Genre: ${media.genre}\n`;
      pdfContent += `Director: ${media.director}\n`;
      pdfContent += `Rating: ${media.rating}\n`;
      pdfContent += `Format: ${media.format}\n`;
      pdfContent += `Edition: ${media.edition}\n`;
      pdfContent += `Loaned: ${media.isLoaned ? 'Yes' : 'No'}\n`;
      pdfContent += `Type: ${media.type}\n`;
      pdfContent += `Total Seasons: ${media.totalSeasons || 'N/A'}\n`;
      pdfContent += '---\n';
    });
    
    // Add box sets
    pdfContent += '\nBOX SETS:\n';
    pdfContent += '=========\n';
    
    boxSets.forEach(boxSet => {
      pdfContent += `\nName: ${boxSet.name}\n`;
      pdfContent += `Description: ${boxSet.description || 'N/A'}\n`;
      pdfContent += '---\n';
    });
    
    return pdfContent;
  }

  // Collection methods
  async addMediaToCollection(collectionId: number, mediaId: number): Promise<Media> {
    const collection = await this.findOne(collectionId);
    const media = await this.findOne(mediaId);

    if (!collection || !media) {
      throw new Error('Collection or Media not found');
    }

    // Check if media is already in collection
    if (!collection.collections) {
      collection.collections = [];
    }
    
    if (!collection.collections.some(item => item.id === mediaId)) {
      collection.collections.push(media);
      return await this.mediaRepository.save(collection);
    }
    
    return collection;
  }

  async removeMediaFromCollection(collectionId: number, mediaId: number): Promise<Media> {
    const collection = await this.findOne(collectionId);
    const media = await this.findOne(mediaId);

    if (!collection || !media) {
      throw new Error('Collection or Media not found');
    }

    if (collection.collections) {
      collection.collections = collection.collections.filter(item => item.id !== mediaId);
      return await this.mediaRepository.save(collection);
    }
    
    return collection;
  }

  async getCollectionsByMedia(mediaId: number): Promise<Media[]> {
    const media = await this.findOne(mediaId);
    if (!media || !media.collections) {
      return [];
    }
    return media.collections;
  }