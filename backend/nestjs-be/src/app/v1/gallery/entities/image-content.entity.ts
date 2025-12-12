import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('image_content')
export class ImageContentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 1024 })
  picture: string; // URL to S3 or CDN

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', default: 0 })
  likedBy: number;
}
