import { EventData, fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";
import { topmost, goBack } from "tns-core-modules/ui/frame/frame";

import { getAPI } from "../utils";

export function onPageLoaded(args: EventData) {
    const page = <Page>args.object;
    let context_info = page.navigationContext;
    let source = fromObject({
        reports: context_info,
    })
    page.bindingContext = source;
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}

export function goToReportPage(args: EventData): void {
    topmost().navigate({
        moduleName: "report/report-page",
        backstackVisible: true,
        context: {
            reportId: args.object.get("data-id")
        }
    });
}
