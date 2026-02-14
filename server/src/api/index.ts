import { Router } from 'express';
import { recipesRouter } from './recipes.js';
import { profileRouter } from './profile.js';
import { shelfRouter } from './shelf.js';
import { appliancesRouter } from './appliances.js';
import { chatRouter } from '../chat/index.js';

export const apiRouter = Router();

apiRouter.use('/recipes', recipesRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/shelf', shelfRouter);
apiRouter.use('/appliances', appliancesRouter);
apiRouter.use('/chat', chatRouter);
