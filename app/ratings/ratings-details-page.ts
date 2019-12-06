import { EventData, Page } from "tns-core-modules/ui/page/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { action, confirm } from "tns-core-modules/ui/dialogs/dialogs";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { openUrl } from "tns-core-modules/utils/utils";
import { deleteAPI } from "~/utils";

export function onLoaded(args: EventData) {
    const page = <Page>args.object;
    const context_info = page.navigationContext;
    if (page.bindingContext) {
        return;
    }
    const source = fromObject({
        title: `Minhas avaliações de atividades de ${context_info.nome}`,
        loveRatings: context_info.loveRatings,
        likeRatings: context_info.likeRatings,
        dislikeRatings: context_info.dislikeRatings,
        hateRatings: context_info.hateRatings,
    })
    page.bindingContext = source;
}

export async function showItemOptions(args: EventData) {
    const page = <Page>args.object;
    const item = page.bindingContext;
    return await action({
        title: "Opções",
        actions: ["Abrir relatório", "Ver detalhes", "Excluir avaliação"]
    }).then(result => {
        if (result == "Abrir relatório") {
            topmost().navigate({
                moduleName: "report/report-page",
                backstackVisible: true,
                context: {
                    reportId: item.relatorio_id
                }
            });
        }
        else if (result == "Ver detalhes") {
            if (item.item_avaliado.urlDocumento) {
                openUrl(item.item_avaliado.urlDocumento);
            } else if (item.item_avaliado.orgaos) {
                if (!item.item_avaliado.data_inicial) {
                    item.item_avaliado.data_inicial = item.item_avaliado.dataInicial;
                }
                if (!item.item_avaliado.data_final) {
                    item.item_avaliado.data_final = item.item_avaliado.dataFinal;
                }
                topmost().navigate({
                    moduleName: "report/event-details-page",
                    backstackVisible: true,
                    context: item.item_avaliado
                })
            } else {
                console.log(item.item_avaliado)
                alert("Não sei exibir detalhes dessa avaliação")
            }
        } else if (result == "Excluir avaliação") {
            confirm({
                title: "Deletar avaliação",
                message: "Tem certeza de que gostaria de apagar sua avaliações dessa atividade?",
                okButtonText: "Apagar avaliação",
                cancelButtonText: "Cancelar"
            }).then(r => {
                if (!r)
                    return
                deleteAPI(`relatorios/${item.relatorio_id}/avaliacoes/${item.id}`, (response) => {
                    if (response.statusCode != 200) {
                        alert(response.content.toJSON().message);
                    } else {
                        page.parent.bindingContext.set("loveRatings", page.parent.bindingContext.get("loveRatings").filter(x => x.id != item.id))
                        page.parent.bindingContext.set("likeRatings", page.parent.bindingContext.get("likeRatings").filter(x => x.id != item.id))
                        page.parent.bindingContext.set("dislikeRatings", page.parent.bindingContext.get("dislikeRatings").filter(x => x.id != item.id))
                        page.parent.bindingContext.set("hateRatings", page.parent.bindingContext.get("hateRatings").filter(x => x.id != item.id))
                    }
                });
            })
        }
    });
}
