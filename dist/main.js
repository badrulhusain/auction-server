"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable Global Validation
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    // Enable Global Serialization (hides properties marked with @Exclude())
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    // Swagger setup
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Auction API')
        .setDescription('The Auction API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, documentFactory);
    // Enable CORS for production so frontend clients can access the API
    app.enableCors();
    // Render dynamically assigns a PORT environment variable to web services
    const port = process.env.PORT || 3000;
    await app.listen((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map