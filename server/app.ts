import express, { Express } from 'express';
import cors from 'cors';
// Config
import config from 'config';

// Routes
import { Users } from '@api';
import { LoginRouter, RegisterRouter } from '@auth';

// Middlewares
import { dbConnectionMW, isJwtAuthenticatedMW } from '@mw';
import { PassportAuth } from '@auth';
import { User } from '@db/couchbase/Schemas/User';

const allowedOrigins = config.get('allowedOrigins') as string[];

const corsOptions = {
  origin: allowedOrigins, // Restrict to a specific origin
  credentials: true, // Allow cookies, authorization headers, etc.
  optionsSuccessStatus: 204 // Respond with a 204 status for preflight requests
};

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
    this.app.use(cors(corsOptions));
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

    this.app.use('/auth/verify', (req, res) => {
      const user = req.user as User;
      const responseBody = {
        id: user.id,
        token: req.headers['authorization'],
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      };
      res.send(responseBody);
    });

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