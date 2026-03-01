"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAuctionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_auction_dto_1 = require("./create-auction.dto");
class UpdateAuctionDto extends (0, mapped_types_1.PartialType)(create_auction_dto_1.CreateAuctionDto) {
}
exports.UpdateAuctionDto = UpdateAuctionDto;
//# sourceMappingURL=update-auction.dto.js.map