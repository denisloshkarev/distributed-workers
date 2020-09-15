import { getManager } from 'typeorm';
import Job from '../entity/Job';
import JobStatus from '../entity/JobStatus';

export default class Worker {
  static async run(): Promise<void> {
    const currentJob = await getManager().transaction<Job>(
      'SERIALIZABLE',
      async (em): Promise<Job> => {
        const repository = em.getRepository(Job);
        const job = await repository.findOne({
          where: { status: JobStatus.NEW },
        });

        if (!job) return null;

        job.status = JobStatus.PROCESSING;

        try {
          await em.save(job);
        } catch (e) {
          return null;
        }

        return job;
      },
    );

    if (currentJob) {

    }
  }
}
