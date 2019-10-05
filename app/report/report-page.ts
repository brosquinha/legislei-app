import { getAPI, formatHouse } from "../utils";
import { EventData, Page } from "tns-core-modules/ui/page/page";
import { fromObject, Observable } from "tns-core-modules/data/observable/observable";
import * as utils from "tns-core-modules/utils/utils";
import { topmost } from "tns-core-modules/ui/frame/frame";

export async function loadReport(args: EventData) {
    const page = <Page>args.object;
    const context_info = page.navigationContext;
    const source = fromObject({
        report: null,
        title: "Relatório ...",
        formatHouse: formatHouse
    })
    page.bindingContext = source;
    return await getAPI(`relatorios/${context_info.reportId}`, (data) => {
        const report = data.content.toJSON();
        const initialDate = new Date(Date.parse(report.data_inicial))
        const finalDate = new Date(Date.parse(report.data_final))
        const formattedInitialDate = ("0" + initialDate.getDate()).slice(-2)  + "/" + ("0" + (initialDate.getMonth()+1)).slice(-2) + "/" + initialDate.getFullYear();
        const formattedFinalDate = ("0" + finalDate.getDate()).slice(-2)  + "/" + ("0" + (finalDate.getMonth()+1)).slice(-2) + "/" + finalDate.getFullYear();
        console.log(initialDate);
        source.set("report", report);
        source.set("title", 'Relatório | ' + report.parlamentar.nome + ' | ' + formattedInitialDate + ' - ' + formattedFinalDate);
    });
}

export function openProposition(args: EventData) {
    utils.openUrl(args.object.get("data-url"));
}

export function showEventDetails(args: EventData) {
    const page = <Page>args.object;
    let event = page.bindingContext;
    if (event._map)
        event = event._map;
    event.isVisible = !event.isVisible;
    page.bindingContext = fromObject(event);
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}
