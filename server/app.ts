import express, { Express } from 'express';

// Config
import config from 'config';

// Routes
import { Users } from '@api';
import { LoginRouter, RegisterRouter } from '@auth';

// Middlewares
import { dbConnectionMW, isJwtAuthenticatedMW } from '@mw';
import { PassportAuth } from '@auth';

class DocuHubApiService {
  private app: Express;

  constructor() {
    this.app = express();
  }

  async init() {
    // initilies express body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded());

    // setup middlewares
    this.app.use(dbConnectionMW);
    this.app.use(PassportAuth.initialize());

    // initialise authentication routes
    this.app.use(
      '/register',
      PassportAuth.authenticate('headerapikey', {
        session: false
      }),
      RegisterRouter
    );
    this.app.use(
      '/login',
      PassportAuth.authenticate('headerapikey', {
        session: false
      }),
      LoginRouter
    );

    this.app.use(isJwtAuthenticatedMW);

    // initialise api routes
    this.app.use('/users', Users);
  }

  start() {
    const port = config.get('port');

    this.app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  }
}

export default DocuHubApiService;
