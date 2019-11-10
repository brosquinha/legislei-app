import { EventData, fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { topmost } from "tns-core-modules/ui/frame/frame";

import { getAPI } from "../utils";
import { getReportsInfos } from "./alternative-notification-helper";

export async function onPageLoaded(args: EventData) {
    const page = <Page>args.object;
    const context_info = page.navigationContext;
    if (context_info.reports) {
        const source = fromObject({
            reports: context_info.reports,
            alternativeFails: 0,
            isLoading: false
        })
        page.bindingContext = source;
        return context_info.reports;
    } else {
        const source = fromObject({
            reports: [],
            alternativeFails: 0,
            isLoading: true
        })
        page.bindingContext = source;
        const reportsView: any = page.getViewById("reportsView");
        const reportsInfos = await getReportsInfos(context_info.reportsIds);
        source.set("reports", reportsInfos.reports);
        source.set("alternativeFails", reportsInfos.fails);
        source.set("isLoading", false);
        reportsView.refresh();
        return reportsInfos;
    }
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
