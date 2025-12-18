import { Module } from '@nestjs/common';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { GoogleAuthModule } from './Google-auth/Google-auth.module';
import { GalleryModule } from './gallery/gallery.module';
import { ContentModule } from './content/content.module';

const imports = [
  HelloWorldModule,
  GoogleAuthModule,
  GalleryModule,
  ContentModule,
];

@Module({
  imports: imports,
  controllers: [],
})
export class V1Module {}
