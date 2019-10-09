import { EventData, Page } from "tns-core-modules/ui/page/page";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { fromObject } from "tns-core-modules/data/observable/observable";

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

