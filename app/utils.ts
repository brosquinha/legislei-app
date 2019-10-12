import { topmost, EventData } from "tns-core-modules/ui/frame/frame";

import { SecureStorage } from "nativescript-secure-storage";
import { request, HttpResponse } from "tns-core-modules/http";
import * as applicationSettings from "tns-core-modules/application-settings";

/**
 * Makes a GET request to Legislei REST API
 * 
 * @param path Request configuration
 * @param callback Callback when requests succeeds
 */
export async function getAPI(path: string, callback: any): Promise<void> {
    const serverURI: String = applicationSettings.getString("serverURI");
    const secureStorage = new SecureStorage();
    const userToken = secureStorage.getSync({
        key: "userToken",
    });
    return await request({
        url: `https://legislei-stg.herokuapp.com/v1/${path}`,
        method: "GET",
        headers: {
            "Authorization": userToken,
            // "X-Fields": "id,data_inicial,data_final"
        }
    }).then(r => ensureLoginDecorator(r, callback), (e) => alert(e.message));
}

export async function postAPI(path: string, body: object, callback: any): Promise<void> {
    const serverURI: String = applicationSettings.getString("serverURI");
    const secureStorage = new SecureStorage();
    const userToken = secureStorage.getSync({
        key: "userToken",
    });
    return await request({
        url: `https://legislei-stg.herokuapp.com/v1/${path}`,
        method: "POST",
        content: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            "Authorization": userToken,
        }
    }).then(r => ensureLoginDecorator(r, callback), (e) => alert(e.message));
}

export function ensureLoginDecorator(response: any, callback: any) {
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

export function formatHouse(house: string): string {
    if (house == "BR1" || house == "BR2")
        return "deputado federal";
    else if (house.length == 2)
        return "deputado estadual";
    return "vereador";
}
