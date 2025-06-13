import cron from 'node-cron';

export const startLiveScoreJob = () => {
  cron.schedule('30 * * * * *', async () => {
    try {
      console.log('Running live score update at second 30');
    } catch (error) {
      console.error('Error in live score job:', error);
    }
  });
};
