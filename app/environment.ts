import { environment as devEnvironment } from './environment.dev';
import { environment as prodEnvironment } from './environment.prod';

export const environment = (() => {
    if (
        typeof process !== 'undefined' && process &&
        Object.prototype.hasOwnProperty.call(process, 'env') && process.env &&
        Object.prototype.hasOwnProperty.call(process.env, 'environment') && process.env.environment
    ) {
        switch (process.env.environment) {
            case 'prod':
                return prodEnvironment;
        }
    }
    return devEnvironment;
})();
