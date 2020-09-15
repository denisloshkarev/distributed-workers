import { getManager } from 'typeorm';
import axios from 'axios';
import Job from '../entity/Job';
import JobStatus from '../entity/JobStatus';

export default class Worker {
  private job: Job;

  private static async findNewJob(): Promise<Job> {
    return getManager().transaction<Job>(
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
  }

  private static async countNewJobs(): Promise<number> {
    return getManager().getRepository(Job).count({
      where: { status: JobStatus.NEW },
    });
  }

  public async loadNewJob(): Promise<void> {
    this.job = await Worker.findNewJob();

    let retry = 0;
    let count = 1;
    while (count && !this.job && retry < 3) {
      // eslint-disable-next-line no-await-in-loop
      this.job = await Worker.findNewJob();
      // eslint-disable-next-line no-await-in-loop
      count = await Worker.countNewJobs();
      retry += 1;
    }
  }

  public async run(): Promise<void> {
    await this.loadNewJob();

    const currentJob = this.job;

    if (currentJob) {
      try {
        const response = await axios.get(currentJob.url, { timeout: 5000 });
        currentJob.http_code = response.status;
        currentJob.status = JobStatus.DONE;
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (e?.response?.status) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          currentJob.http_code = e.response?.status;
          currentJob.status = JobStatus.DONE;
        } else {
          currentJob.status = JobStatus.ERROR;
        }
      }

      await getManager().save(currentJob);

      switch (currentJob.status) {
        case JobStatus.DONE:
          console.log(`Job ${currentJob.id}: successfully processed`);
          break;
        case JobStatus.ERROR:
          console.log(`Job ${currentJob.id}: error on processing`);
          break;
        default:
      }
    } else {
      console.log('New jobs not found');
    }
  }
}
