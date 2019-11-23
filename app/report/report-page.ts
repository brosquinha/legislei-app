import { getAPI, formatDate, formatDateTime, formatHouse, parseDate, postAPI } from "../utils";
import { EventData, Page } from "tns-core-modules/ui/page/page";
import * as application from "tns-core-modules/application";
import { fromObject } from "tns-core-modules/data/observable/observable";
import * as utils from "tns-core-modules/utils/utils";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { ShowModalOptions } from "tns-core-modules/ui/core/view";
import { alert, action } from "tns-core-modules/ui/dialogs";
import { showFullEventTitle } from "./all-absent-events-page";

let reportId: string;

export async function loadReport(args: EventData) {
    const page = <Page>args.object;
    const context_info = page.navigationContext;
    if (page.bindingContext)
        return;
    const modalOptions: ShowModalOptions = {
        context: {},
        closeCallback: null,
        fullscreen: true
    }
    const modal = page.showModal("report/loading-modal", modalOptions);
    const source = fromObject({
        report: null,
        title: "Relatório ...",
        formatHouse: formatHouse
    })
    application.getResources().formatDate = (date: string) => { return formatDate(parseDate(date)); }
    application.getResources().formatDateTime = (date: string) => { return formatDateTime(parseDate(date)); };
    page.bindingContext = source;
    return await getAPI(`relatorios/${context_info.reportId}`, (data) => {
        if (data.statusCode != 200)
            return alert("Não foi possível obter esse relatório").then(() => {topmost().goBack();})
        const report = data.content.toJSON();
        reportId = report.id;
        report.eventos_ausentes_filtered = report.eventos_ausentes.filter((e) => e.presenca != 'Ausência esperada');
        const initialDate = new Date(Date.parse(report.data_inicial))
        const finalDate = new Date(Date.parse(report.data_final))
        source.set("report", report);
        source.set("title", 'Relatório | ' + report.parlamentar.nome + ' | ' + formatDate(initialDate) + ' - ' + formatDate(finalDate));
        modal.closeModal();
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
        const ratingValue = {
            "Ótima": "2",
            "Boa": "1",
            "Ruim": "-1",
            "Péssima": "-2"
        }
        if (ratingValue[rating] === undefined)
            return;
        postAPI(`relatorios/${reportId}/avaliacoes`, {
            item_id: reportItem.id,
            avaliacao: ratingValue[rating]
        }, (response) => {
            if (response.statusCode == 201)
                alert(`Item avaliado como "${rating}"`)
            else {
                alert(`Ocorreu o seguinte erro: ${response.content.toJSON().message}`)
            }
        })
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
        showFullEventTitle(args);
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

export { showFullEventTitle }
