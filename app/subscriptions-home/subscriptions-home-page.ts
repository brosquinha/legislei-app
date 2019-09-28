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
        subscriptions: {
            parlamentares: [],
            intervalo: "Carregando"
        }
    })
    page.bindingContext = source;
    request({
        url: "https://legislei-stg.herokuapp.com/v1/usuarios/inscricoes",
        method: "GET",
        headers: {"Authorization": userToken}
    }).then((response) => {
        let contentJSON = response.content.toJSON();
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
        source.set("subscriptions", contentJSON)
    })
}

export function onCheckAssemblymanReports(args: EventData): void {
    const assemblyman_id = args.object.get("data-id")
    const assemblyman_house = args.object.get("data-house")
    topmost().navigate({
        moduleName: "subscriptions-am-reports/subscriptions-am-reports-page",
        backstackVisible: true,
        context: {
            assemblyman_id: assemblyman_id,
            assemblyman_house: assemblyman_house
        }
    });
}
