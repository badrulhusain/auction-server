"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStudentGroupDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_student_group_dto_1 = require("./create-student-group.dto");
class UpdateStudentGroupDto extends (0, mapped_types_1.PartialType)(create_student_group_dto_1.CreateStudentGroupDto) {
}
exports.UpdateStudentGroupDto = UpdateStudentGroupDto;
//# sourceMappingURL=update-student-group.dto.js.map