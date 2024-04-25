import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
class Movie {
  @PrimaryGeneratedColumn()
  public id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  public title: string;

  @Column('text')
  public content: string;
}

export default Movie;
