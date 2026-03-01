"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionController = void 0;
const common_1 = require("@nestjs/common");
const auction_service_1 = require("./auction.service");
const create_auction_dto_1 = require("./dto/create-auction.dto");
const update_auction_dto_1 = require("./dto/update-auction.dto");
const create_auction_session_dto_1 = require("./dto/create-auction-session.dto");
const create_auction_item_dto_1 = require("./dto/create-auction-item.dto");
const auction_entity_1 = require("./entities/auction.entity");
let AuctionController = class AuctionController {
    constructor(auctionService) {
        this.auctionService = auctionService;
    }
    async create(createAuctionDto) {
        return new auction_entity_1.AuctionEntity(await this.auctionService.create(createAuctionDto));
    }
    async findAll() {
        const auctions = await this.auctionService.findAll();
        return auctions.map((auction) => new auction_entity_1.AuctionEntity(auction));
    }
    async findOne(id) {
        const auction = await this.auctionService.findOne(id);
        if (!auction) {
            throw new common_1.NotFoundException(`Auction with ID ${id} not found`);
        }
        return new auction_entity_1.AuctionEntity(auction); // Depending on your include, you might need a more complex entity that nests the others
    }
    async update(id, updateAuctionDto) {
        return new auction_entity_1.AuctionEntity(await this.auctionService.update(id, updateAuctionDto));
    }
    async remove(id) {
        return new auction_entity_1.AuctionEntity(await this.auctionService.remove(id));
    }
    async createSession(id, createSessionDto) {
        return this.auctionService.createSession(id, createSessionDto);
    }
    async createItem(sessionId, createItemDto) {
        return this.auctionService.createItem(sessionId, createItemDto);
    }
};
exports.AuctionController = AuctionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auction_dto_1.CreateAuctionDto]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_auction_dto_1.UpdateAuctionDto]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/session'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_auction_session_dto_1.CreateAuctionSessionDto]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('session/:sessionId/item'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_auction_item_dto_1.CreateAuctionItemDto]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "createItem", null);
exports.AuctionController = AuctionController = __decorate([
    (0, common_1.Controller)('auction'),
    __metadata("design:paramtypes", [auction_service_1.AuctionService])
], AuctionController);
//# sourceMappingURL=auction.controller.js.map