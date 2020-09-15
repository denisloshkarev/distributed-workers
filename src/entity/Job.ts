import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import JobStatus from './JobStatus';

@Entity()
export default class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  status: JobStatus;

  @Column()
  http_code: number;
}
