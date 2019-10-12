import { EventData, fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { confirm } from "tns-core-modules/ui/dialogs";

import { getAPI, ensureLoginDecorator, subscribeToPushNotifications } from "../utils";

const notif = subscribeToPushNotifications();

export async function onPageLoaded(args: EventData) {
    const page = <Page>args.object;
    let source = fromObject({
        subscriptions: {
            parlamentares: [],
            intervalo: "Carregando"
        }
    })
    page.bindingContext = source;
    return await getAPI("usuarios/inscricoes", (data) => {
        source.set("subscriptions", data.content.toJSON());
    });
}

export function onCheckAssemblymanReports(args: EventData): void {
    const assemblyman_id = args.object.get("data-id")
    const assemblyman_house = args.object.get("data-house")
    const assemblyman_name = args.object.get("data-name")
    topmost().navigate({
        moduleName: "subscriptions-am-reports/subscriptions-am-reports-page",
        backstackVisible: true,
        context: {
            assemblyman_id: assemblyman_id,
            assemblyman_name: assemblyman_name,
            assemblyman_house: assemblyman_house
        }
    });
}

export async function confirmDelete(args: EventData) {
    return await confirm({
        title: "Deletar inscrição",
        message: "Tem certeza de que gostaria de deixar de seguir esse parlamentar?",
        okButtonText: "Remover inscrição",
        cancelButtonText: "Cancelar"
    }).then(result => {
        console.log(result ? "Deletar!" : "Nope");
    });
}

export async function confirmLogout(args: EventData) {
    return await confirm({
        title: "Sair",
        message: "Tem certeza de que gostaria de fazer logout?",
        okButtonText: "Fazer logout",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result)
            ensureLoginDecorator({statusCode: 401}, null);
    });
}
