import { EventData, fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";
import { topmost, goBack } from "tns-core-modules/ui/frame/frame";

import { getAPI } from "../utils";

export async function onPageLoaded(args: EventData) {
    const page = <Page>args.object;
    let context_info = page.navigationContext;
    let reports = [];
    if (page.bindingContext)
        return
    let source = fromObject({
        reports: reports,
        isLoading: true,
        assemblyman_name: context_info.assemblyman_name
    })
    page.bindingContext = source;
    return await getAPI(`relatorios?casa=${encodeURIComponent(context_info.assemblyman_house)}&parlamentar=${context_info.assemblyman_id}`, (data) => {
        reports = data.content.toJSON();
        reports.forEach(report => {
            let finalDate = new Date(Date.parse(report.data_final));
            report.data_final_str = ("0" + finalDate.getDate()).slice(-2)  + "/" + ("0" + (finalDate.getMonth()+1)).slice(-2) + "/" + finalDate.getFullYear();
        });
        source.set("reports", reports)
        source.set("isLoading", false)
    }, ["id", "data_inicial", "data_final"]);
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
