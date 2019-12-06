import { EventData, Page } from "tns-core-modules/ui/page/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { topmost } from "tns-core-modules/ui/frame/frame";
import * as dialog from "tns-core-modules/ui/dialogs";
import { postAPI } from "~/utils";
import { LoginViewModel } from "~/login/login-view-model";

export function onLoaded(args: EventData) {
    const page = <Page>args.object;
    const source = fromObject({
        isLoading: false,
        username: '',
        email: '',
        password: '',
        confirmedPassword: ''
    });
    page.bindingContext = source;
}

export async function registerAccount(args: EventData) {
    const page = <Page>args.object;
    const form = page.bindingContext;
    form.set("isLoading", true);
    return await postAPI("usuarios", {
        "username": form.username,
        "email": form.email,
        "senha": form.password,
        "senha_confirmada": form.confirmedPassword
    }, (response) => {
        form.set("isLoading", false);
        if (response.statusCode == 201) {
            const loginModel = new LoginViewModel();
            loginModel.username = form.username;
            loginModel.password = form.password;
            loginModel.onTap(null);
        } else if (response.statusCode >= 400) {
            dialog.alert(response.content.toJSON().message);
        }
    })
}
