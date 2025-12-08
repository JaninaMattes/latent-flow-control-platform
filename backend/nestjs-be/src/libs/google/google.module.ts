import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleService } from './google-api.service';

const services = [
    GoogleService
];

@Module({
    imports: [HttpModule],
    providers: services,
    exports: services
})
export class GoogleModule {}
