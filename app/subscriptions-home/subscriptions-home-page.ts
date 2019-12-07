import { EventData, fromObject } from "tns-core-modules/data/observable";
import { Page, ShowModalOptions } from "tns-core-modules/ui/page";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { confirm } from "tns-core-modules/ui/dialogs";

import { getAPI, ensureLoginDecorator, subscribeToPushNotifications, deleteAPI } from "../utils";

export async function onPageLoaded(args: EventData) {
    const page = <Page>args.object;
    if (page.bindingContext)
        return;
    let source = fromObject({
        isLoading: true,
        subscriptions: {
            parlamentares: [],
            intervalo: "Carregando"
        }
    })
    page.bindingContext = source;
    return await getAPI("usuarios/inscricoes", (data) => {
        const notif = subscribeToPushNotifications();
        source.set("isLoading", false);
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

export function goToAssemblymanRatings(args: EventData): void {
    const page = <Page>args.object;
    const assemblyman = page.bindingContext;
    topmost().navigate({
        moduleName: "ratings/ratings-page",
        backstackVisible: true,
        context: assemblyman
    });
}

export async function confirmDelete(args: EventData) {
    const page = <Page>args.object;
    const assemblyman = page.bindingContext;
    return await confirm({
        title: "Deletar inscrição",
        message: "Tem certeza de que gostaria de deixar de seguir esse parlamentar?",
        okButtonText: "Remover inscrição",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (!result)
            return
        deleteAPI(`usuarios/inscricoes/${assemblyman.casa}/${assemblyman.id}`, response => {
            if (response.statusCode != 200) {
                alert(response.content.toJSON().message);
            } else {
                const subscriptions = page.page.bindingContext.get("subscriptions");
                page.page.bindingContext.set("subscriptions", []); // possible TNS bug? Without this line, view will not refresh
                subscriptions.parlamentares = subscriptions.parlamentares.filter(x => x.id != assemblyman.id);
                page.page.bindingContext.set("subscriptions", subscriptions);
            }
        });
    });
}

export function newSubscription(args: EventData) {
    // const page = <Page>args.object;
    // const modalOptions: ShowModalOptions = {
    //     context: {},
    //     closeCallback: null,
    //     fullscreen: true
    // }
    // const modal = page.showModal("new-subscription/office-selection", modalOptions);
    topmost().navigate({
        moduleName: "new-subscription/office-selection",
        backstackVisible: true
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
            ensureLoginDecorator({statusCode: 401, headers: null}, null);
    });
}
