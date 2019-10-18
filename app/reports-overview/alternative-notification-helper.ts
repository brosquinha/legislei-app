import { getAPI } from "../utils";

export async function getReportsInfos(reportsIds: string[] | null[]) {
    let reports = [];
    let assemblymen = [];
    if (hasFailedReports(reportsIds)) {
        assemblymen = await getAssemblymenFromSubscriptions();
    }
    for (let i=0; i<reportsIds.length; i++) {
        let reportId = reportsIds[i];
        if (reportId === null) {
            continue;
        }
        console.log(`Getting ${reportId}...`)
        await getAPI(`relatorios/${reportId}`, (data) => {
            let report = data.content.toJSON();
            removeAssemblymanFromList(report.parlamentar.id, assemblymen);
            reports.push(formatReport(report))
        });
    }
    assignRemainingAssemblymenToFailedReports(assemblymen, reports);
    return reports
}

function hasFailedReports(reportsIds: string[] | null[]): boolean {
    return reportsIds.find((e) => e == null) !== undefined
}

async function getAssemblymenFromSubscriptions() {
    let subscriptions = [];
    console.log("Getting subscriptions...")
    await getAPI("usuarios/inscricoes", (data) => {
        // TODO Se o token estiver expirado, usuário é levado para tela de login
        subscriptions = data.content.toJSON().parlamentares;
        console.log(subscriptions)
    });
    return subscriptions;
}

function removeAssemblymanFromList(assemblymanId: string, subscriptions: any[]): void {
    if (subscriptions) {
        subscriptions.splice(subscriptions.findIndex((a) => a.id == assemblymanId), 1);
    }
}

function formatReport(report: any): any {
    report._id = report.id
    report.orgaos = report.orgaos.length
    report.proposicoes = report.proposicoes.length
    report.eventosPresentes = report.eventos_presentes.length
    report.eventosPrevistos = report.eventos_previstos.length
    report.eventosAusentes = report.eventos_ausentes.length
    return report
}

function assignRemainingAssemblymenToFailedReports(assemblymen: any[], reports: any[]): void {
    assemblymen.forEach(element => {
        reports.push({
            _id: null,
            parlamentar: element
        })
    });
    console.log(assemblymen)
}
