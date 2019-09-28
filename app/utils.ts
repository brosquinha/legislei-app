import { topmost } from "tns-core-modules/ui/frame/frame";

import { SecureStorage } from "nativescript-secure-storage";
import { request } from "tns-core-modules/http";
import * as applicationSettings from "tns-core-modules/application-settings";

/**
 * Makes a GET request to Legislei REST API
 * 
 * @param path Request configuration
 * @param callback Callback when requests succeeds
 */
export function getAPI(path: string, callback: any): void {
    const serverURI: String = applicationSettings.getString("serverURI");
    const secureStorage = new SecureStorage();
    const userToken = secureStorage.getSync({
        key: "userToken",
    });
    request({
        url: `https://legislei-stg.herokuapp.com/v1/${path}`,
        method: "GET",
        headers: {
            "Authorization": userToken,
            // "X-Fields": "id,data_inicial,data_final"
        }
    }).then(r => ensure_login_decorator(r, callback))
}

export function ensure_login_decorator(response: any, callback: any) {
    const secureStorage = new SecureStorage();
    const userToken = secureStorage.getSync({
        key: "userToken",
    });
    if (response.statusCode == 401) {
        secureStorage.removeSync({
            key: "userToken",
        });
        topmost().navigate({
            moduleName: "login/login-page",
            clearHistory: true
        });
    }
    else
        callback(response);
}
