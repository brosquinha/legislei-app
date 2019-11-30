import { fromObject, EventData } from "tns-core-modules/data/observable/observable";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as coreUtils from "tns-core-modules/utils/utils";

import * as sinon from "sinon";

import * as ratingsDetails from "~/ratings/ratings-details-page";
import { topmost } from "tns-core-modules/ui/frame/frame";

describe("onLoaded", function() {
    it("should set bindingContext with context if there's nothing already", function() {
        const fakeContext = {
            loveRatings: [1],
            likeRatings: [2],
            dislikeRatings: [3],
            hateRatings: [4]
        }
        const fakePage: any = fromObject({});
        fakePage.navigationContext = fakeContext;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        }

        ratingsDetails.onLoaded(fakeEvent);
        let fakeBindingContext: any = fakePage;
        fakeBindingContext = fakeBindingContext.bindingContext;

        assert.equal(fakeBindingContext.get("loveRatings"), fakeContext.loveRatings)
        assert.equal(fakeBindingContext.get("likeRatings"), fakeContext.likeRatings)
        assert.equal(fakeBindingContext.get("dislikeRatings"), fakeContext.dislikeRatings)
        assert.equal(fakeBindingContext.get("hateRatings"), fakeContext.hateRatings)
        sinon.restore();
    });
    it("should do nothing if bindingContext already set", function() {
        const fakeContext = {
            loveRatings: [1],
            likeRatings: [2],
            dislikeRatings: [3],
            hateRatings: [4]
        }
        const fakePage: any = fromObject(fakeContext);
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        }

        ratingsDetails.onLoaded(fakeEvent);
        let fakeBindingContext: any = fakePage;
        fakeBindingContext = fakeBindingContext.bindingContext;

        assert.equal(fakeBindingContext.get("loveRatings"), fakeContext.loveRatings)
        assert.equal(fakeBindingContext.get("likeRatings"), fakeContext.likeRatings)
        assert.equal(fakeBindingContext.get("dislikeRatings"), fakeContext.dislikeRatings)
        assert.equal(fakeBindingContext.get("hateRatings"), fakeContext.hateRatings)
        sinon.restore();
    });
});

describe("showItemOptions", function() {
    it("should go to item's report page if user chooses to do so", async () => {
        const fakeRatingItem = {
            "id": "5db62c6dd497790003d8fa2b",
            "parlamentar": {
                "id": "107283",
                "nome": "GLEISI HOFFMANN",
                "partido": "PT",
                "uf": "PR",
                "casa": "BR1",
                "foto": "https://www.camara.leg.br/internet/deputado/bandep/107283.jpg"
            },
            "avaliacao": "-1",
            "item_avaliado": {
                "id": "2226790",
                "numero": "5661",
                "tipo": "PL",
                "ementa": "Altera as Leis nº 9.491, de 9 de setembro de 1997, e nº 13.303, de 30 de junho de 2006, para dispor sobre a realização de referendo prévio para alienação de ativos que resultem em perda de controle acionário pela União.",
                "urlDocumento": "http://www.camara.gov.br/proposicoesWeb/prop_mostrarintegra?codteor=1825419",
                "urlAutores": null,
                "dataApresentacao": "2019-10-23T18:07:00-03:00",
                "voto": null,
                "pauta": null
            },
            "relatorio_id": "5db460c4a1e0dd000302ebdd"
        }
        const fakeAction = sinon.fake.resolves("Abrir relatório");
        const fakeNavigate = sinon.fake();
        sinon.replace(dialogs, "action", fakeAction);
        sinon.replace(topmost(), "navigate", fakeNavigate);
        const fakePage: any = fromObject(fakeRatingItem);
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        }

        await ratingsDetails.showItemOptions(fakeEvent);

        assert.isTrue(fakeAction.calledOnce);
        assert.isTrue(fakeNavigate.calledWith({
            moduleName: "report/report-page",
            backstackVisible: true,
            context: {
                reportId: fakeRatingItem.relatorio_id
            }
        }));
        sinon.restore();
    });

    it("should open proposition URL if user chooses to see details and item is a proposition", async () => {
        const fakeRatingItem = {
            "id": "5db62c6dd497790003d8fa2b",
            "parlamentar": {
                "id": "107283",
                "nome": "GLEISI HOFFMANN",
                "partido": "PT",
                "uf": "PR",
                "casa": "BR1",
                "foto": "https://www.camara.leg.br/internet/deputado/bandep/107283.jpg"
            },
            "avaliacao": "-1",
            "item_avaliado": {
                "id": "2226790",
                "numero": "5661",
                "tipo": "PL",
                "ementa": "Altera as Leis nº 9.491, de 9 de setembro de 1997, e nº 13.303, de 30 de junho de 2006, para dispor sobre a realização de referendo prévio para alienação de ativos que resultem em perda de controle acionário pela União.",
                "urlDocumento": "http://www.camara.gov.br/proposicoesWeb/prop_mostrarintegra?codteor=1825419",
                "urlAutores": null,
                "dataApresentacao": "2019-10-23T18:07:00-03:00",
                "voto": null,
                "pauta": null
            },
            "relatorio_id": "5db460c4a1e0dd000302ebdd"
        }
        const fakeAction = sinon.fake.resolves("Ver detalhes");
        const fakeOpenUrl = sinon.fake();
        sinon.replace(dialogs, "action", fakeAction);
        sinon.replace(coreUtils, "openUrl", fakeOpenUrl);
        const fakePage: any = fromObject(fakeRatingItem);
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        }

        await ratingsDetails.showItemOptions(fakeEvent);

        assert.isTrue(fakeAction.calledOnce);
        assert.isTrue(fakeOpenUrl.calledWith(fakeRatingItem.item_avaliado.urlDocumento));
        sinon.restore();
    });

    it("should go to event details page if user chooses to see details and item is an event", async () => {
        const fakeRatingItem = {
            "id": "5db62c6dd497790003d8fa2b",
            "parlamentar": {
                "id": "107283",
                "nome": "GLEISI HOFFMANN",
                "partido": "PT",
                "uf": "PR",
                "casa": "BR1",
                "foto": "https://www.camara.leg.br/internet/deputado/bandep/107283.jpg"
            },
            "avaliacao": "-1",
            "item_avaliado": {
                "id": "57935",
                "nome": "Discussão e Votação de Propostas\r\n I - Requerimentos (Apresentados até às 18h do dia anterior ao da reunião)",
                "dataInicial": "2019-10-09T09:30:00-03:00",
                "dataFinal": "2019-10-09T11:53:00-03:00",
                "url": "https://dadosabertos.camara.leg.br/api/v2/eventos/57935",
                "situacao": "Encerrada",
                "presenca": 0,
                "pautas": [
                    {
                        "id": "2222408",
                        "numero": null,
                        "tipo": "REQ",
                        "ementa": null,
                        "urlDocumento": "http://www.camara.gov.br/proposicoesWeb/prop_mostrarintegra?codteor=1813439",
                        "urlAutores": "https://dadosabertos.camara.leg.br/api/v2/proposicoes/2222408/autores",
                        "dataApresentacao": null,
                        "voto": "ERROR",
                        "pauta": "Requer, nos termos regimentais, autorização para que a relatora desta Comissão Especial participe, em caráter de missão oficial, como palestrante na audiência Pública sobre o Financiamento da Educação no Estado do Rio Grande do Sul e a continuidade do Fundeb - Fundo de Manutenção e Desenvolvimento da Educação Básica e de Valorização dos Profissionais da Educação, a ser realizado nos dias 21 de outubro de 2019, na cidade de Porto Alegre, Estado do Rio Grande do Sul, representando este órgão técnico."
                    }
                ],
                "orgaos": [
                    {
                        "nome": "Comissão Especial destinada a proferir parecer à Proposta de Emenda à Constituição nº 15-A, de 2015, da Srª Raquel Muniz e outros, que \"insere parágrafo único no art. 193; inciso IX, no art. 206 e art. 212-A, todos na Constituição Federal, de forma a tornar o Fundo de Manutenção e Desenvolvimento da Educação Básica e de Valorização dos Profissionais da Educação - Fundeb instrumento permanente de financiamento da educação básica pública, incluir o planejamento na ordem social e inserir novo princípio no rol daqueles com base nos quais a educação será ministrada, e revoga o art. 60 do Ato das Disposições Constitucionais Transitórias\"",
                        "sigla": null,
                        "cargo": null,
                        "apelido": "PEC 015/15 - FUNDEB"
                    }
                ]
            },
            "relatorio_id": "5db460c4a1e0dd000302ebdd"
        }
        const fakeAction = sinon.fake.resolves("Ver detalhes");
        const fakeNavigate = sinon.fake();
        sinon.replace(dialogs, "action", fakeAction);
        sinon.replace(topmost(), "navigate", fakeNavigate);
        const fakePage: any = fromObject(fakeRatingItem);
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        }

        await ratingsDetails.showItemOptions(fakeEvent);

        assert.isTrue(fakeAction.calledOnce);
        assert.isTrue(fakeNavigate.called)
        assert.isTrue(fakeNavigate.calledWith({
            moduleName: "report/event-details-page",
            backstackVisible: true,
            context: fakeRatingItem.item_avaliado
        }));
        sinon.restore();
    });

    // it("should delete rating if user chooses to do so", async () => {

    // });

    it("should do nothing if user clicks away", async () => {
        const fakeRatingItem = {}
        const fakeAction = sinon.fake.resolves(false);
        const fakeOpenUrl = sinon.fake();
        const fakeNavigate = sinon.fake();
        sinon.replace(dialogs, "action", fakeAction);
        sinon.replace(coreUtils, "openUrl", fakeOpenUrl);
        sinon.replace(topmost(), "navigate", fakeNavigate);
        const fakePage: any = fromObject(fakeRatingItem);
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        }

        await ratingsDetails.showItemOptions(fakeEvent);

        assert.isTrue(fakeAction.calledOnce);
        assert.isFalse(fakeOpenUrl.called);
        assert.isFalse(fakeNavigate.called);
        sinon.restore();
    });
});
