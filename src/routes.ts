import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  return res.json({api: '1.0'})
});

export {router};