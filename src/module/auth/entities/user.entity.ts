import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  token: string;

  @Column({ type: 'int' })
  user_type: number;

  @Column({ type: 'varchar' })
  skill: string;

  @Column({ type: 'text' })
  image: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'varchar', default: null })
  deleted_by: Date;

  @Column({ type: 'timestamp', default: null })
  created_at: Date;

  @Column({ type: 'timestamp', default: null })
  updated_at: Date;

  @Column({ type: 'timestamp', default: null })
  deleted_at: Date;
}
