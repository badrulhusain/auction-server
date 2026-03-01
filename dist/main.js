"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable Global Validation
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    // Enable Global Serialization (hides properties marked with @Exclude())
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map