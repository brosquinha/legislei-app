import { getAPI } from "../utils";

export async function getReportsInfos(reportsIds: string[] | null[]) {
    let reports = [];
    let failedReports = 0;
    for (let i=0; i<reportsIds.length; i++) {
        let reportId = reportsIds[i];
        if (reportId === null) {
            failedReports++;
            continue;
        }
        console.log(`Getting ${reportId}...`)
        await getAPI(`relatorios/${reportId}`, (data) => {
            let report = data.content.toJSON();
            reports.push(formatReport(report))
        });
    }
    return {
        reports: reports,
        fails: failedReports
    }
}

function formatReport(report: any): any {
    report._id = (report.id) ? report.id : 0
    report.orgaos = (report.orgaos) ? report.orgaos.length : 0
    report.proposicoes = (report.proposicoes) ? report.proposicoes.length : 0
    report.eventosPresentes = (report.eventos_presentes) ? report.eventos_presentes.length : 0
    report.eventosPrevistos = (report.eventos_previstos) ? report.eventos_previstos.length : 0
    report.eventosAusentes = (report.eventos_ausentes) ? report.eventos_ausentes.length : 0
    return report
}
