import { PartialType } from '@nestjs/swagger';
import { CreateHelloWorldDto } from './create-hello-world.dto';

export class UpdateHelloWorldDto extends PartialType(CreateHelloWorldDto) {}
