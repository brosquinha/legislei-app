import { EventData, Page } from "tns-core-modules/ui/page/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { getAPI, formatHouse } from "~/utils";
import { topmost } from "tns-core-modules/ui/frame/frame";

export async function loadRatings(args: EventData) {
    const page = <Page>args.object;
    const context_info = page.navigationContext;
    if (page.bindingContext) {
        return;
    }
    const source = fromObject({
        title: `Minhas avaliações de ${context_info.nome}`,
        formatHouse: formatHouse,
        overallScore: 'Carregando...',
        loveCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        hateCount: 0,
        generalFeeling: null,
        ...context_info
    });
    page.bindingContext = source;
    return await getAPI(`parlamentares/${context_info.casa}/${context_info.id}/avaliacoes`, (response) => {
        if (response.statusCode != 200) {
            return alert("Não foi possível buscar suas avaliações desse parlamentar");
        }
        const ratings: Array<any> = response.content.toJSON();
        let overallScore: number = 0;
        let likeCount: number = 0
        let dislikeCount: number = 0;
        let loveCount: number = 0;
        let hateCount: number = 0;
        ratings.forEach((rating) => {
            const score = parseInt(rating.avaliacao);
            if (score == 1) {
                overallScore++;
                likeCount++;
            } else if (score == -1) {
                overallScore--;
                dislikeCount++;
            } else if (score > 1) {
                overallScore += 10;
                loveCount++;
            } else if (score < -1) {
                overallScore -= 10;
                hateCount++;
            }
        });
        let generalFeeling: string;
        if (overallScore > 10) {
            generalFeeling = "Você está adorando a atuação desse parlamentar 😍";
        } else if (overallScore <= 10 && overallScore > 0) {
            generalFeeling = "Você está curtindo a atuação desse parlamentar 🙂";
        } else if (overallScore < 0 && overallScore >= -10) {
            generalFeeling = "Você está reprovando a atuação desse parlamentar 🙁";
        } else if (overallScore < -10) {
            generalFeeling = "Você está rejeitando a atuação desse parlamentar ☠️";
        } else if (loveCount + likeCount + dislikeCount + hateCount) {
            generalFeeling = "Você não tem um veredito sobre esse parlamentar ainda";
        } else {
            generalFeeling = "Você ainda não avaliou nenhuma atividade desse parlamentar";
        }
        source.set("overallScore", overallScore);
        source.set("loveCount", loveCount);
        source.set("likeCount", likeCount);
        source.set("dislikeCount", dislikeCount);
        source.set("hateCount", hateCount);
        source.set("generalFeeling", generalFeeling);
    })
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}
