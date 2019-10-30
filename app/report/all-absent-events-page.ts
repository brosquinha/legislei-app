import { EventData, Page } from "tns-core-modules/ui/page/page";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { fromObject } from "tns-core-modules/data/observable/observable";

import * as dialog from "tns-core-modules/ui/dialogs";
import { rateItem } from "./report-page";

export function loadEvents(args: EventData) {
    const page = <Page>args.object;
    const context_info = page.navigationContext;
    const source = fromObject({
        events: context_info
    })
    page.bindingContext = source;
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}

export async function showFullEventTitle(args: EventData) {
    const page = <Page>args.object;
    const event = page.bindingContext;
    return await dialog.confirm({
        message: event.nome,
        cancelButtonText: "Ok",
        okButtonText: "Avaliar"
    }).then(result => {
        if (result)
            rateItem(event);
    })
}
