import { Observable } from "tns-core-modules/data/observable";
import { SecureStorage } from "nativescript-secure-storage";

import { request, getFile, getImage, getJSON, getString } from "tns-core-modules/http";
import * as applicationSettings from "tns-core-modules/application-settings";

export class LoginViewModel extends Observable {
    constructor() {
        super();
    }

    username: String = "";
    password: String = "";

    onTap(args) {
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
                alert("Logado");
                let userToken: string = response.content.toJSON().token;   
                const result = secureStorage.setSync({
                    key: "userToken",
                    value: userToken,
                })
            }
        }, (e) => {
            console.log(e);
            alert(e.message);
        });
    }
}
