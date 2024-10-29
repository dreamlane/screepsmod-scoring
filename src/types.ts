export interface Config {
    
    backend?: {
        features?: Array<{ name: string; version: number }>;
        on: (event: string, callback: (app: any) => void) => void;
        router: {
          get: (path: string, handler: (request: any, response: any) => void) => void;
        }
    }
    common?: {
        dbCollections: [string];
        storage: {
            db: {
                users: any;
                leaderboardSeason3: any;
                collection: any;
                createCollection: any;
                scoreHistory: any;
                addCollection: any;
            }
            env: {
                get: (key: string) => {};
                set: (key: string, value: string) => {};
                keys: string[];
            }
        }
    }
    cronjobs?: {
        myScoringFunction: [number, (config: Config) => void];
    }
    cli?: {
        on: (event: string, callback: (app: any) => void) => void;
    }
  }

export interface ScoreEntry {
    userId: string;
    score: number;
    timestamp: string;
}