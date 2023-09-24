import express, { Express } from 'express';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import http, { Server as HttpServer } from 'http';
import Jwt, { JwtPayload } from 'jsonwebtoken';
import { cbCluster } from '@db/index';

// Config
import config from 'config';

// Routes
import { Users, Documents } from '@routes';
import { LoginRouter, RegisterRouter } from '@auth';

// Websockets
import { documentsWebSocket } from '@websockets/documents';
import { YSocketIO } from 'y-socket.io/dist/server';

// Middlewares
import {
  dbConnectionMW,
  isJwtAuthenticatedMW,
  isSocketAuthenticated
} from '@mw';
import { PassportAuth } from '@auth';
import { User } from '@db/couchbase/Schemas/User';
import { connectToCouchbase } from '@db';
import { CbConfig } from '@db/couchbase/connectCouchbase';
import getByDocId from '@db/couchbase/Queries/getById';

const couchbaseConfig: CbConfig = config.get('couchbase');

const allowedOrigins = config.get('allowedOrigins') as string[];

const corsOptions = {
  origin: allowedOrigins, // Restrict to a specific origin
  credentials: true, // Allow cookies, authorization headers, etc.
  optionsSuccessStatus: 204 // Respond with a 204 status for preflight requests
};

class DocuHubApiService {
  private app: Express;
  private server: HttpServer;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
  }

  async initSocketIO() {
    // initialise socket io server
    const io = new Server(this.server, {
      cors: corsOptions
    });

    // DB Middleware
    io.use(async (socket: Socket, next) => {
      try {
        const couchbaseConfig: CbConfig = config.get('couchbase');

        const cluster = await connectToCouchbase();
        if (cluster) {
          const bucket = cluster?.bucket(couchbaseConfig.bucket);
          socket.couchbase = { cluster, bucket };
          next();
        } else {
          next(new Error('Unable to establish DB connection'));
        }
      } catch (err) {
        console.log('Failed to connect to couchbase, error: ', err);
        err instanceof Error
          ? next(err)
          : next(new Error('Unable to establish DB connection'));
      }
    });

    // Auth middleware
    io.use(isSocketAuthenticated);

    const ysocketio = new YSocketIO(io, {
      authenticate: async (arg) => {
        const authToken = arg.auth.token;
        try {
          const decodedToken = Jwt.verify(
            authToken.split(' ')[1],
            config.get('jwtSecretKey') as string
          ) as JwtPayload;

          const userId = decodedToken.id;
          const userDocId = `${couchbaseConfig.bucket}::user::${userId}`;
          const cbBucket = (await cbCluster)?.bucket(couchbaseConfig.bucket);
          const user = (await getByDocId(userDocId, cbBucket)) as User;

          return user ? true : false;
        } catch (err) {
          return false;
        }
      }
    });

    // Execute initialize method
    ysocketio.initialize();

    // Documents websocket
    documentsWebSocket(ysocketio);
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
    this.app.use('/users', isJwtAuthenticatedMW, Users);
    this.app.use('/documents', isJwtAuthenticatedMW, Documents);

    // initialise socket io
    this.initSocketIO();
  }

  start() {
    const port = process.env.PORT || config.get('port');

    this.server.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  }
}

export default DocuHubApiService;
