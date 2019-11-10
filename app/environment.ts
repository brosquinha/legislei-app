import { environment as devEnvironment } from './environment.dev';
import { environment as prodEnvironment } from './environment.prod';

export const environment = (() => {
    try {
        switch (process.env.environment) {
            case 'prod':
                return prodEnvironment;
        }
    } catch {
        return devEnvironment;
    }
    return devEnvironment;
})();
