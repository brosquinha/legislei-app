import { EventData, fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { topmost } from "tns-core-modules/ui/frame/frame";

import { SecureStorage } from "nativescript-secure-storage";
import { request } from "tns-core-modules/http";
import * as applicationSettings from "tns-core-modules/application-settings";

export function onPageLoaded(args: EventData): void {
    const page = <Page>args.object;
    const serverURI: String = applicationSettings.getString("serverURI");
    const secureStorage = new SecureStorage();
    const userToken = secureStorage.getSync({
        key: "userToken",
    });

    let source = fromObject({
        subscriptions: "Carregando"
    })
    page.bindingContext = source;
    request({
        url: "https://legislei-stg.herokuapp.com/v1/usuarios/inscricoes",
        method: "GET",
        headers: {"Authorization": userToken}
    }).then((response) => {
        console.log(response);
        if (response.statusCode == 401) {
            secureStorage.removeSync({
                key: "userToken",
            });
            topmost().navigate({
                moduleName: "login/login-page",
                backstackVisible: false,
                clearHistory: true
            });
        }
        source.set("subscriptions", response.content)
    })
}