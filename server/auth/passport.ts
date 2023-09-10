import passport from 'passport';
import passportJWT, { VerifiedCallback } from 'passport-jwt';
import HeaderAPIKeyStrategy from 'passport-headerapikey';
import config from 'config';
import getByDocId from '@db/couchbase/Queries/getById';
import { Request } from 'express';
import { CbConfig } from '@db/couchbase/connectCouchbase';

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const jwtOptions: passportJWT.StrategyOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get('jwtSecretKey'),
  passReqToCallback: true
};

const couchbaseConfig: CbConfig = config.get('couchbase');

const jwtStrategy = new JWTStrategy(
  jwtOptions,
  async (
    req: Request,
    payload: Record<string, string>,
    done: VerifiedCallback
  ) => {
    const userDocId = `${couchbaseConfig.bucket}::user::${payload.id}`;
    try {
      const user = await getByDocId(userDocId, req?.couchbase?.bucket);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  }
);

const headerApiKeyStrategy = new HeaderAPIKeyStrategy(
  { header: 'Authorization', prefix: 'api_key ' },
  false,
  function (apikey: string, done: VerifiedCallback) {
    if (config.get('api_key') === apikey) {
      return done(null, true);
    }
    return done(null, false);
  }
);

passport.use(jwtStrategy);
passport.use(headerApiKeyStrategy);

export default passport;
