import { Observable, EventData } from "tns-core-modules/data/observable";
import { SecureStorage } from "nativescript-secure-storage";

import { request } from "tns-core-modules/http";
import * as applicationSettings from "tns-core-modules/application-settings";
import { Button } from "tns-core-modules/ui/button/button";
import { topmost } from "tns-core-modules/ui/frame/frame";

export class LoginViewModel extends Observable {
    constructor() {
        super();
        let secureStorage = new SecureStorage();
        const result = secureStorage.getSync({
            key: "userToken",
        });
        if (result)
            topmost().navigate({
                moduleName: "subscriptions-home/subscriptions-home-page",
                clearHistory: true
            });
    }

    username: String = "";
    password: String = "";

    onTap(args: EventData) {
        const serverURI: String = applicationSettings.getString("serverURI");
        let secureStorage = new SecureStorage();
        request({
            url: "https://legislei-stg.herokuapp.com/v1/usuarios/token_acesso",
            method: "POST",
            headers: {"Content-Type": "application/json"},
            content: JSON.stringify({
                username: this.username,
                senha: this.password
            })
        }).then((response) => {
            console.log(response);
            if (response.statusCode >= 400)
                alert(response.content.toJSON().message);
            else {
                let userToken: string = response.content.toJSON().token;   
                const result = secureStorage.setSync({
                    key: "userToken",
                    value: userToken,
                });
                topmost().navigate({
                    moduleName: "subscriptions-home/subscriptions-home-page",
                    clearHistory: true
                });
            }
        }, (e) => {
            console.log(e);
            alert(e.message);
        });
    }
}
