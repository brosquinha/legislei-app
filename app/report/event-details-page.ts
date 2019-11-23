import { EventData, Page } from "tns-core-modules/ui/page/page";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { fromObject } from "tns-core-modules/data/observable/observable";
import * as utils from "tns-core-modules/utils/utils";
import * as dialog from "tns-core-modules/ui/dialogs";

import { rateItem } from "./report-page";
import { formatDateTime, parseDate } from "../utils";

export function loadEvent(args: EventData) {
    const page = <Page>args.object;
    const context_info = page.navigationContext;
    const source = fromObject({
        event: context_info,
        formatDateTime: (date: string) => { return formatDateTime(parseDate(date)); }
    })
    page.bindingContext = source;
}

export function openProposition(args: EventData) {
    utils.openUrl(args.object.get("data-url"));
}

export function showFullEventTitle(args: EventData) {
    const page = <Page>args.object;
    const source = page.bindingContext;
    const event = source.get("event");
    dialog.alert({
        message: event.nome,
        okButtonText: "Ok"
    });
}

export function rateEvent(args: EventData) {
    const page = <Page>args.object;
    const source = page.bindingContext;
    const event = source.get("event");
    rateItem(event);
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}

