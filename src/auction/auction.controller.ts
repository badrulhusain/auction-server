import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { CreateAuctionSessionDto } from './dto/create-auction-session.dto';
import { CreateAuctionItemDto } from './dto/create-auction-item.dto';
import { AuctionEntity } from './entities/auction.entity';

@Controller('auction')
export class AuctionController {
    constructor(private readonly auctionService: AuctionService) { }

    @Post()
    async create(@Body() createAuctionDto: CreateAuctionDto) {
        return new AuctionEntity(await this.auctionService.create(createAuctionDto));
    }

    @Get()
    async findAll() {
        const auctions = await this.auctionService.findAll();
        return auctions.map((auction) => new AuctionEntity(auction));
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const auction = await this.auctionService.findOne(id);
        if (!auction) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }
        return new AuctionEntity(auction); // Depending on your include, you might need a more complex entity that nests the others
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateAuctionDto: UpdateAuctionDto) {
        return new AuctionEntity(await this.auctionService.update(id, updateAuctionDto));
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return new AuctionEntity(await this.auctionService.remove(id));
    }

    @Post(':id/session')
    async createSession(
        @Param('id') id: string,
        @Body() createSessionDto: CreateAuctionSessionDto
    ) {
        return this.auctionService.createSession(id, createSessionDto);
    }

    @Post('session/:sessionId/item')
    async createItem(
        @Param('sessionId') sessionId: string,
        @Body() createItemDto: CreateAuctionItemDto
    ) {
        return this.auctionService.createItem(sessionId, createItemDto);
    }
}
