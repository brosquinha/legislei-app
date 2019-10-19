import { topmost, EventData } from "tns-core-modules/ui/frame/frame";

import { SecureStorage } from "nativescript-secure-storage";
import { request, HttpResponse } from "tns-core-modules/http";
import * as applicationSettings from "tns-core-modules/application-settings";
import { messaging, Message } from "nativescript-plugin-firebase/messaging";
import { confirm } from "tns-core-modules/ui/dialogs";
import * as platform from "tns-core-modules/platform";

import { environment } from "./environment";

/**
 * Makes a GET request to Legislei REST API
 * 
 * @param path Request configuration
 * @param callback Callback when requests succeeds
 */
export async function getAPI(path: string, callback: any): Promise<void> {
    const serverURI: String = applicationSettings.getString("serverURI", environment.apiEndpoint);
    const secureStorage = new SecureStorage();
    const userToken = secureStorage.getSync({
        key: "userToken",
    });
    return await request({
        url: `${serverURI}${path}`,
        method: "GET",
        headers: {
            "Authorization": userToken,
            // "X-Fields": "id,data_inicial,data_final"
        }
    }).then(r => ensureLoginDecorator(r, callback), (e) => alert(e.message));
}

export async function postAPI(path: string, body: object, callback: any, method="POST"): Promise<void> {
    const serverURI: String = applicationSettings.getString("serverURI", environment.apiEndpoint);
    const secureStorage = new SecureStorage();
    const userToken = secureStorage.getSync({
        key: "userToken",
    });
    return await request({
        url: `${serverURI}${path}`,
        method: method,
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

export async function receiveNotification(message: Message) {
    const goToReportOverview = () => {
        const reportsInfoRaw = message.data.reports;
        const reportsIdsRaw = message.data.reportsIds;
        topmost().navigate({
            moduleName: "reports-overview/reports-overview-page",
            context: {
                reports: (reportsInfoRaw) ? JSON.parse(reportsInfoRaw) : null,
                reportsIds: (reportsIdsRaw) ? JSON.parse(reportsIdsRaw) : null
            }
        });
    };
    console.log(message);
    if (message.foreground) {
        await confirm({
            title: message.title,
            message: message.body,
            okButtonText: "Ver relatórios",
            cancelButtonText: "Depois",
            neutralButtonText: "Cancelar"
        }).then((result) => {
            if (result) {
                return goToReportOverview();
            }
        });
    } else {
        return setTimeout(goToReportOverview, 1000);
    }
}

export function subscribeToPushNotifications() {
    console.log("Subscribing to good stuff...")
    messaging.registerForPushNotifications({
        onPushTokenReceivedCallback: (token: string): void => {
            console.log("Firebase plugin received a push token: " + token);
            syncDeviceToken(token)
        },
    
        onMessageReceivedCallback: receiveNotification,
        
        // Whether you want this plugin to automatically display the notifications or just notify the callback. Currently used on iOS only. Default true.
        showNotifications: true,
        
        // Whether you want this plugin to always handle the notifications when the app is in foreground. Currently used on iOS only. Default false.
        showNotificationsWhenInForeground: true
    }).then(() => console.log("Registered for push"));
}

export async function syncDeviceToken(token: string) {
    const uuid = platform.device.uuid;
    await getAPI("usuarios/dispositivos", async (data) => {
        if (data.statusCode != 200) {
            console.warn("Could not get user devices")
            return
        }
        const deviceList: any[] = data.content.toJSON();
        const thisDevice = deviceList.find((x) => x.uuid == uuid);
        if (thisDevice) {
            if (thisDevice.token == token) {
                console.log("Token already synced")
            } else {
                await postAPI(`usuarios/dispositivos/${uuid}`, {
                    token: token,
                }, (data) => {
                    if (data.statusCode == 200)
                        console.log("Token successfully synced");
                    else
                        console.warn(`Update device route returned ${data.statusCode}`)
                }, "PATCH")
            }
        } else {
            await postAPI("usuarios/dispositivos", {
                uuid: uuid,
                token: token,
                name: `${platform.device.manufacturer} ${platform.device.model}`,
                os: `${platform.device.os} ${platform.device.osVersion}`
            }, (data) => {
                if (data.statusCode == 201)
                    console.log("Token successfully synced");
                else
                    console.warn(`New device route returned ${data.statusCode}`)
            })
        }
    });
}
