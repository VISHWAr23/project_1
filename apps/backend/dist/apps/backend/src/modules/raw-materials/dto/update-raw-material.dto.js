"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRawMaterialDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_raw_material_dto_1 = require("./create-raw-material.dto");
class UpdateRawMaterialDto extends (0, mapped_types_1.PartialType)(create_raw_material_dto_1.CreateRawMaterialDto) {
}
exports.UpdateRawMaterialDto = UpdateRawMaterialDto;
//# sourceMappingURL=update-raw-material.dto.js.map