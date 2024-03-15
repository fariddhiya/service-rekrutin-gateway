import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menus')
export class MenuEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  slug: string;

  @Column({ type: 'varchar' })
  url_prefix: string;

  @Column({ type: 'number' })
  position: number;

  @Column({ type: 'number' })
  status: number;

  @Column({ type: 'timestamp', default: null })
  created_at: Date;

  @Column({ type: 'timestamp', default: null })
  updated_at: Date;
}
