import { Module } from '@nestjs/common';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { GoogleAuthModule } from './Google-auth/Google-auth.module';

const imports = [
  HelloWorldModule,
  GoogleAuthModule,
];

@Module({
  imports: imports,
})
export class V1Module {}