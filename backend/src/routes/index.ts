import express from 'express';

import getDiffRouter from './getMessage';

const router = express.Router();

router.use(
  '/get-message',
  getDiffRouter,
);

export default router;
