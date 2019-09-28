import { EventData, fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";
import { topmost, goBack } from "tns-core-modules/ui/frame/frame";

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
    let context_info = page.navigationContext;
    let reports = null;
    request({
        url: `https://legislei-stg.herokuapp.com/v1/relatorios?casa=${context_info.assemblyman_house}&parlamentar=${context_info.assemblyman_id}`,
        method: "GET",
        headers: {
            "Authorization": userToken,
            "X-Fields": "id,data_inicial,data_final"
        }
    }).then((response) => {
        let contentJSON = response.content.toJSON();
        if (response.statusCode == 401) {
            secureStorage.removeSync({
                key: "userToken",
            });
            topmost().navigate({
                moduleName: "login/login-page",
                backstackVisible: false,
            });
        }
        reports = contentJSON;
        reports.forEach(report => {
            let finalDate = new Date(Date.parse(report.data_final));;
            report.data_final_str = finalDate.toLocaleDateString() + "; ";
        });
    
        let source = fromObject({
            reports: reports,
            isLoading: false
        })
        page.bindingContext = source;
    })
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}
