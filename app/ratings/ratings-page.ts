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
        loveRatings: 0,
        likeRatings: 0,
        dislikeRatings: 0,
        hateRatings: 0,
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
        let likeRatings: Array<any> = [];
        let dislikeRatings: Array<any> = [];
        let loveRatings: Array<any> = [];
        let hateRatings: Array<any> = [];
        ratings.forEach((rating) => {
            const score = parseInt(rating.avaliacao);
            if (score == 1) {
                overallScore++;
                likeRatings.push(rating);
            } else if (score == -1) {
                overallScore--;
                dislikeRatings.push(rating);
            } else if (score > 1) {
                overallScore += 10;
                loveRatings.push(rating);
            } else if (score < -1) {
                overallScore -= 10;
                hateRatings.push(rating);
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
        } else if (loveRatings.length + likeRatings.length + dislikeRatings.length + hateRatings.length) {
            generalFeeling = "Você não tem um veredito sobre esse parlamentar ainda";
        } else {
            generalFeeling = "Você ainda não avaliou nenhuma atividade desse parlamentar";
        }
        source.set("overallScore", overallScore);
        source.set("loveRatings", loveRatings);
        source.set("likeRatings", likeRatings);
        source.set("dislikeRatings", dislikeRatings);
        source.set("hateRatings", hateRatings);
        source.set("generalFeeling", generalFeeling);
    })
}

export function goToAssemblymanRatings(args: EventData): void {
    const page = <Page>args.object;
    topmost().navigate({
        moduleName: "ratings/ratings-details-page",
        context: page.bindingContext,
        backstackVisible: true
    });
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}
