import { getAPI, formatHouse } from "../utils";
import { EventData, Page } from "tns-core-modules/ui/page/page";
import { fromObject, Observable } from "tns-core-modules/data/observable/observable";
import * as utils from "tns-core-modules/utils/utils";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { alert, action } from "tns-core-modules/ui/dialogs";

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
        report.eventos_ausentes_filtered = report.eventos_ausentes.filter((e) => e.presenca != 'Ausência esperada');
        const initialDate = new Date(Date.parse(report.data_inicial))
        const finalDate = new Date(Date.parse(report.data_final))
        const formattedInitialDate = ("0" + initialDate.getDate()).slice(-2)  + "/" + ("0" + (initialDate.getMonth()+1)).slice(-2) + "/" + initialDate.getFullYear();
        const formattedFinalDate = ("0" + finalDate.getDate()).slice(-2)  + "/" + ("0" + (finalDate.getMonth()+1)).slice(-2) + "/" + finalDate.getFullYear();
        source.set("report", report);
        source.set("title", 'Relatório | ' + report.parlamentar.nome + ' | ' + formattedInitialDate + ' - ' + formattedFinalDate);
    });
}

export async function openProposition(args: EventData) {
    const page = <Page>args.object;
    const proposition = page.bindingContext;
    return await action({
        title: "Opções proposição",
        actions: ["Abrir URL", "Avaliar"],
    }).then((result) => {
        if (result == "Abrir URL")
            utils.openUrl(args.object.get("data-url"));
        else if (result == "Avaliar") {
            rateItem(proposition)
        }
    })
}

export async function rateItem(reportItem: any) {
    return await action({
        title: "Avaliar item de relatório",
        message: "O que você achou dessa ação do parlamentar?",
        actions: ["Ótima", "Boa", "Ruim", "Péssima"],
    }).then((rating) => {
        // TODO chamada à API para salvar avaliação
        if (rating)
            alert(`You chose ${rating} for ${reportItem.id}`)
    })
}

export function showEventDetails(args: EventData) {
    const page = <Page>args.object;
    const event = page.bindingContext;
    if (event.pautas.length) {
        topmost().navigate({
            moduleName: "report/event-details-page",
            context: event
        })
    } else {
        alert("Evento sem pauta")
    }
}

export function listAllEvents(args: EventData) {
    const page = <Page>args.object;
    const source = page.bindingContext;
    const report = source.get("report");
    topmost().navigate({
        moduleName: "report/all-absent-events-page",
        context: report.eventos_ausentes
    })
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}
