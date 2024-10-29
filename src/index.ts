
import type { Config } from './types';
import common from './common';
import backend from './backend';

module.exports = function(config: Config) {
    if (config.common) common(config);
    if (config.backend) backend(config);
};
