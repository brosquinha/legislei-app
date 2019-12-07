import { EventData, Page } from "tns-core-modules/ui/page/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { formatHouse, postAPI } from "~/utils";

export function onLoaded(args: EventData) {
    const page = <Page>args.object;
    const context_info = page.navigationContext;
    const selectedAssemblyman = context_info.assemblyman;
    const source = fromObject({
        isLoading: false, // TODO load assemblyman by id if any field is null
        formatHouse: formatHouse,
        assemblyman: selectedAssemblyman
    })
    page.bindingContext = source;
}

export async function choiceConfirmed(args: EventData) {
    const page = <Page>args.object;
    const assemblyman = page.bindingContext.get("assemblyman")
    page.bindingContext.set("isLoading", true);
    return await postAPI(`usuarios/inscricoes`, 
        {"casa": assemblyman.casa, "parlamentar": assemblyman.id},
        response => {
            if (response.statusCode != 201) {
                return alert("Não foi possível fazer a inscrição");
            }
            topmost().navigate({
                moduleName: "subscriptions-home/subscriptions-home-page",
                clearHistory: true
            });
        });
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}
