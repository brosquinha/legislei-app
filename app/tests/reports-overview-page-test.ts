import { topmost } from "tns-core-modules/ui/frame/frame";
import * as httpr from "tns-core-modules/http";
import { Observable } from "tns-core-modules/ui/page/page";
import { fromObject, EventData } from "tns-core-modules/data/observable/observable";

import * as sinon from "sinon";

import * as reportsOverview from "../reports-overview/reports-overview-page";

describe("onPageLoaded", function() {
    it("should set bindingContext with received event for default notification", async () => {
        const fakeReportsOverview = [
            {
                "id": "5d7d4882d03d3b0003c16cd8",
                "parlamentar": {
                    "nome": "TABATA AMARAL",
                    "partido": "PDT",
                    "uf": "SP",
                    "foto": "https://www.camara.leg.br/internet/deputado/bandep/204534.jpg"
                },
                "proposicoes": 4,
                "eventos_presentes": 13,
                "eventos_previstos": 17
            },
            {
                "id": "5d0bbc36c7d37e000331e13a",
                "parlamentar": {
                    "nome": "Marina Helou",
                    "partido": "REDE",
                    "uf": "SP",
                    "foto": "https://www3.al.sp.gov.br/repositorio/deputadoPortal/fotos/20190315-153714-id=518-PEQ.png"
                },
                "proposicoes": 0,
                "eventos_presentes": 1,
                "eventos_previstos": 1
            },
            {
                "id": "5d0bba74c7d37e000331e139",
                "parlamentar": {
                    "nome": "GLEISI HOFFMANN",
                    "partido": "PT",
                    "uf": "SP",
                    "foto": "https://www.camara.leg.br/internet/deputado/bandep/107283.jpg"
                },
                "proposicoes": 0,
                "eventos_presentes": 4,
                "eventos_previstos": 16
            }
        ];
        const fakePage: any = fromObject({});
        fakePage.navigationContext = {
            reports: fakeReportsOverview,
            reportsIds: null
        }
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };

        await reportsOverview.onPageLoaded(fakeEvent);
        let fakeBindingContext: any = fakePage;
        fakeBindingContext = fakeBindingContext.bindingContext;

        assert.deepEqual(fakeBindingContext.get("reports"), fakeReportsOverview);
    });

    it("should get all reports by ids and subscriptions list for any failed report for alternative notificaiton", async () => {
        const fakeAlternativeNotification = [
            "5d7d4882d03d3b0003c16cd8",
            "5d0bbc36c7d37e000331e13a",
            null,
            "5d0bba74c7d37e000331e139",
        ]
        const fakeReportSubscriptions = {
            id: "14",
            orgaos: [1, 2, 3],
            proposicoes: [1, 2],
            eventos_presentes: [1],
            eventos_previstos: [1 ,2],
            eventos_ausentes: [1, 2, 3]
        };
        const fakeReportResult = {
            _id: "14",
            orgaos: 3,
            proposicoes: 2,
            eventosPresentes: 1,
            eventosPrevistos: 2,
            eventosAusentes: 3
        }
        const requireFakeResponse = {
            statusCode: 200,
            content: {toJSON: () => {return fakeReportSubscriptions}}
 
        }
        const requireFake = sinon.fake.resolves(requireFakeResponse);
        sinon.replace(httpr, 'request', requireFake);
        const fakePage: any = fromObject({});
        fakePage.getViewById = (id: string) => {
            return {refresh: () => {}}
        };
        fakePage.navigationContext = {
            reports: null,
            reportsIds: fakeAlternativeNotification
        }
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };

        const reportsInfos = await reportsOverview.onPageLoaded(fakeEvent);

        assert.equal(requireFake.callCount, 3);
        assert.equal(reportsInfos.reports.length, 3);
        assert.equal(reportsInfos.fails, 1);
        sinon.restore();
    });
});

describe("goToReportPage", function() {
    it("should go to report page with reportId", function() {
        const reportId = "14";
        const fakePage: Observable = fromObject({
            "data-id": reportId
        });
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;
        
        reportsOverview.goToReportPage(fakeEvent);
        
        assert.isTrue(navigateFake.calledWithMatch({
            moduleName: "report/report-page",
            backstackVisible: true,
            context: {
                reportId: reportId
            }
        }));
        sinon.restore();
    });
});
