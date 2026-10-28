// Import required modules for NestJS application
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * Bootstrap function to initialize and start the NestJS application
 * Sets the default port to 8999 for the media collection manager
 */
async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);
  
  // Add global validation pipe for request validation
  app.useGlobalPipes(new ValidationPipe());
  
  // Listen on port 8999 (consolidated default port)
  await app.listen(8999);
}

// Execute the bootstrap function
bootstrap();
