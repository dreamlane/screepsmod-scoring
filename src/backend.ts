import type { Config } from './types';
const express = require('express');


export default function (config: Config) {
  if (config.common === undefined) {
    return;
  }
  if (config.backend) {
    let storage = config.common.storage;
  
    config.backend.on('expressPreConfig', function (app) {
      
      // /api/leaderboard/
      app.use('/api/leaderboard', serveLeaderboard());
    });
    function serveLeaderboard() {
      var router = new express.Router();
      
      router.get('/', (req: any, res: any) => {
          var collection = storage.db['scoreHistory'];
          collection.find().then((result: any) => {
              res.send({ ok: 1, result});
          });
      }); 
      return router;
    }
  }
}
