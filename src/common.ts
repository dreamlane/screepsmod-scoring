import type { Config, ScoreEntry } from './types';
const _ = require('lodash');

let roomScoreMap = new Map<string, number>();

export default function (config: Config) {
  if (config.common) {
    var storage = config.common.storage;
    
    if (!_.includes(config.common.dbCollections, "scoreHistory")) {
        config.common.dbCollections.push("scoreHistory");
    }

    if(config.cronjobs) {
        config.cronjobs.myScoringFunction = [
            60,                              // interval in seconds
            function myScoringFunction() {
                // The first time through, we initialize the roomScoreMap.
                if ([...roomScoreMap.entries()].length < 1) {
                    initializeRoomScoreMap(storage);
                    return;
                }
                if (config.common === undefined) {
                    console.log("config.common undefined!");
                    return;
                }
                let userPromise = config.common.storage.db.users.find();
                userPromise.then((results: any) => {
                    let userScores: ScoreEntry[] = [];
                    results.forEach((user: any) => {
                        let userScore = 0;
                        if (user.rooms) {
                            user.rooms.forEach((room: string) => {
                                if (config.common === undefined) {
                                    console.log("config.common undefined!");
                                } else {
                                    userScore += getScoreForRoom(room, config.common.storage);
                                }
                            });
                        }
                        userScores.push({
                            userId: user.username,
                            score: userScore,
                            timestamp: new Date().toISOString(),
                        })
                    });
                    return userScores;
                }).then((scores: ScoreEntry[]) => {
                    // Store the score in the db
                    if (config.common) {
                        let scoreHistoryCollection = config.common.storage.db['scoreHistory'];
                        if (scoreHistoryCollection === undefined) {
                            console.log("scoreHistoryCollection is undefined");
                        }
                            // Prepare an array of promises to log each score
                            const scorePromises: Promise<any>[] = []
                            scores.forEach((score) => {
                                // Insert the score entry into the scoreHistory collection
                                if (score.score > 0) {
                                  scorePromises.push(scoreHistoryCollection.insert(score));
                                }
                            });
                            
                            // Wait for all score entries to be logged
                            Promise.all(scorePromises).then(() => 
                                {
                                    console.log('Scores logged successfully.');
                                })
                            .catch((err: any) => {
                                console.error('Error logging scores:', err);
                            });
                    } else {
                        console.log("config.common undefined!");
                    }
                });
            }
        ];
    }
  }
}

function getScoreForRoom(room: string, storage: any): number {
  if(roomScoreMap.get(room) !== undefined) {
      // This type assertion is safe, because we just checked that it is not undefined.
      return roomScoreMap.get(room) as number;
  } else {
      console.log("something went wrong, the room map needs to be initialized again!");
      // roomScoreMap = new Map<string, number>();
      return 0;
  }
}

function initializeRoomScoreMap(storage: any) {
  storage.db.rooms.find().then((rooms: any[]) => {
      rooms.forEach((room:any) => {
          // Figure out how many sources are in the room, and set the score map.
          storage.db['rooms.objects'].find({room:room._id, type:'source'}).then((sources: any) => {
              if (sources === undefined) {
                  console.log("Sources is undefined!");
                  return 0;
              } else if (sources.length === 1) {
                  roomScoreMap.set(room._id, 4);
                  return 4;
              } else if (sources.length === 2) {
                  roomScoreMap.set(room._id, 3);
                  return 3;
              } else if (sources.length === 3) {
                  roomScoreMap.set(room._id, 2);
                  return 2;
              } else if (sources.length === 4) {
                  roomScoreMap.set(room._id, 1);
                  return 1;
              }
          });
      });
  });
}