import type { Config } from './types';

export default function (config: Config) {
  if (config.cli) {
    config.cli.on("cliSandbox", function(sandbox) {
      sandbox.clearSeasonStats = () => {
        if (config.common) {
          var db = config.common.storage.db;
          db['scoreHistory'].clear();
        }
      }
    })
  }
    
}