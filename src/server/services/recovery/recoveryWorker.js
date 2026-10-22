import { recoverySchedulerService } from './recoverySchedulerService.js';
import { logger } from '../../utils/logger.js';

let workerInterval = null;
let isTicking = false;

export const recoveryWorker = {
  /**
   * Start periodic worker loop
   * @param {number} [intervalMs=30000] Polling interval in ms (default 30 seconds)
   */
  start(intervalMs = 30000) {
    if (workerInterval) return;

    logger.info(`[RECOVERY WORKER] Starting recovery worker scheduler with ${intervalMs}ms interval...`);
    workerInterval = setInterval(async () => {
      if (isTicking) return;
      isTicking = true;
      try {
        await recoverySchedulerService.runWorkerTick(10);
      } catch (err) {
        logger.error('[RECOVERY WORKER ERROR] Worker tick unhandled failure:', err.message);
      } finally {
        isTicking = false;
      }
    }, intervalMs);
  },

  /**
   * Stop periodic worker loop
   */
  stop() {
    if (workerInterval) {
      clearInterval(workerInterval);
      workerInterval = null;
      logger.info('[RECOVERY WORKER] Stopped recovery worker scheduler.');
    }
  },

  /**
   * Manually trigger an immediate tick (useful in tests and manual sync)
   */
  async triggerImmediateTick() {
    return recoverySchedulerService.runWorkerTick(20);
  }
};
