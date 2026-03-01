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
exports.StudentGroupController = void 0;
const common_1 = require("@nestjs/common");
const student_group_service_1 = require("./student-group.service");
const create_student_group_dto_1 = require("./dto/create-student-group.dto");
const update_student_group_dto_1 = require("./dto/update-student-group.dto");
let StudentGroupController = class StudentGroupController {
    constructor(studentGroupService) {
        this.studentGroupService = studentGroupService;
    }
    create(createStudentGroupDto) {
        return this.studentGroupService.create(createStudentGroupDto);
    }
    findAll() {
        return this.studentGroupService.findAll();
    }
    findOne(id) {
        return this.studentGroupService.findOne(id);
    }
    update(id, updateStudentGroupDto) {
        return this.studentGroupService.update(id, updateStudentGroupDto);
    }
    remove(id) {
        return this.studentGroupService.remove(id);
    }
};
exports.StudentGroupController = StudentGroupController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_group_dto_1.CreateStudentGroupDto]),
    __metadata("design:returntype", void 0)
], StudentGroupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudentGroupController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentGroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_group_dto_1.UpdateStudentGroupDto]),
    __metadata("design:returntype", void 0)
], StudentGroupController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentGroupController.prototype, "remove", null);
exports.StudentGroupController = StudentGroupController = __decorate([
    (0, common_1.Controller)('student-group'),
    __metadata("design:paramtypes", [student_group_service_1.StudentGroupService])
], StudentGroupController);
//# sourceMappingURL=student-group.controller.js.map