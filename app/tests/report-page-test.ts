import * as httpr from "tns-core-modules/http";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as coreUtils from "tns-core-modules/utils/utils";
import { fromObject, EventData, Observable } from "tns-core-modules/data/observable/observable";
import { topmost } from "tns-core-modules/ui/frame/frame";

import * as sinon from "sinon";

import * as report from "../report/report-page";

describe("loadReport", function() {
    it("should show modal and load report if no report already present", async () => {
        const requireFakeResponse = {
            id: "reportId",
            parlamentar: {
                id: "123",
                nome: "Parlamentar",
                partido: "PPartido",
                uf: "BR",
                casa: "BR1",
                foto: "https://foto.com.br"
            },
            data_inicial: "2019-10-11T23:40:28.066Z",
            data_final: "2019-10-11T23:40:28.066Z",
            eventos_ausentes: [
                {presenca: "Presente"},
                {presenca: "Ausência esperada"},
            ]
        };
        const requireFake = sinon.fake.resolves({
            statusCode: 200,
            content: {toJSON: () => {return requireFakeResponse}}
        });
        sinon.replace(httpr, 'request', requireFake);
        const fakePage: any = fromObject({});
        const fakeShowModal = sinon.fake.returns({closeModal: () => null});
        fakePage.showModal = fakeShowModal;
        fakePage.navigationContext = {
            reportId: "14"
        }
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        
        try {
            await report.loadReport(fakeEvent)
            let fakeBindingContext: any = fakePage;
            fakeBindingContext = fakeBindingContext.bindingContext;
            
            assert.isTrue(requireFake.called);
            assert.isTrue(fakeShowModal.called);
            assert.deepEqual(fakeBindingContext.get("report"), requireFakeResponse);
        } catch(e) {
            sinon.restore();
            throw e
        }
        sinon.restore();
    });

    it("should do nothing if report already present", async () => {
        const requireFakeResponse = {
            id: "reportId",
            parlamentar: {
                id: "123",
                nome: "Parlamentar",
                partido: "PPartido",
                uf: "BR",
                casa: "BR1",
                foto: "https://foto.com.br"
            },
            data_inicial: "2019-10-11T23:40:28.066Z",
            data_final: "2019-10-11T23:40:28.066Z",
            eventos_ausentes: [
                {presenca: "Presente"},
                {presenca: "Ausência esperada"},
            ]
        };
        const requireFake = sinon.fake.resolves({
            statusCode: 200,
            content: {toJSON: () => {return requireFakeResponse}}
        });
        sinon.replace(httpr, 'request', requireFake);
        const fakePage: any = fromObject({});
        fakePage.bindingContext = true;
        const fakeShowModal = sinon.fake.returns({closeModal: () => null});
        fakePage.showModal = fakeShowModal;
        fakePage.navigationContext = {
            reportId: "14"
        }
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        
        try {
            await report.loadReport(fakeEvent)
            let fakeBindingContext: any = fakePage;
            fakeBindingContext = fakeBindingContext.bindingContext;
            
            assert.isFalse(requireFake.called);
            assert.isFalse(fakeShowModal.called);
            assert.isTrue(fakeBindingContext);
        } catch(e) {
            sinon.restore();
            throw e
        }
        sinon.restore();
    })
});

describe("openProposition", function() {
    it("should open URL when user chooses open URL", async () => {
        const fakeAction = sinon.fake.resolves("Abrir URL");
        const fakeOpenUrl = sinon.fake();
        sinon.replace(dialogs, "action", fakeAction);
        sinon.replace(coreUtils, "openUrl", fakeOpenUrl);
        const fakePage: any = fromObject({
            "data-url": "https://url.com.br"
        });
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };

        await report.openProposition(fakeEvent);

        assert.isTrue(fakeAction.called);
        assert.isTrue(fakeOpenUrl.calledWith("https://url.com.br"))

        sinon.restore();
    });

    it("should open rate item dialog when user chooses to rate item", async () => {
        const fakeAction = sinon.fake.resolves("Avaliar");
        sinon.replace(dialogs, "action", fakeAction);
        const fakePage: any = fromObject({});
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };

        await report.openProposition(fakeEvent);

        assert.equal(fakeAction.callCount, 2);

        sinon.restore();
    });
});

describe("rateItem", function() {
    it("should rate item with chosen user rate", async () => {
        const requireFake = sinon.fake.resolves({
            statusCode: 201,
            content: {toJSON: () => {return {}}}
        });
        sinon.replace(httpr, 'request', requireFake);
        const fakeAction = sinon.fake.resolves("Boa");
        sinon.replace(dialogs, "action", fakeAction);
        const fakeAlert = sinon.fake();
        sinon.replace(dialogs, "alert", fakeAlert);

        try {
            await report.rateItem({id: "123"});

            assert.isTrue(fakeAction.called);
            assert.isTrue(requireFake.called);
            assert.isTrue(fakeAlert.calledWith("Item avaliado como \"Boa\""));
        } catch(e) {
            sinon.restore();
            throw e;
        }
        sinon.restore();
    });

    it("should present with an alert when API fails", async () => {
        const requireFake = sinon.fake.resolves({
            statusCode: 400,
            content: {toJSON: () => {return {message: "validation error"}}}
        });
        sinon.replace(httpr, 'request', requireFake);
        const fakeAction = sinon.fake.resolves("Boa");
        sinon.replace(dialogs, "action", fakeAction);
        const fakeAlert = sinon.fake();
        sinon.replace(dialogs, "alert", fakeAlert);

        try {
            await report.rateItem({id: "123"});

            assert.isTrue(fakeAction.called);
            assert.isTrue(requireFake.called);
            assert.isTrue(fakeAlert.calledWith("Ocorreu o seguinte erro: validation error"));
        } catch(e) {
            sinon.restore();
            throw e;
        }
        sinon.restore();
    });

    it("should do nothing if user cancels", async () => {
        const requireFake = sinon.fake();
        sinon.replace(httpr, 'request', requireFake);
        const fakeAction = sinon.fake.resolves("");
        sinon.replace(dialogs, "action", fakeAction);
        const fakeAlert = sinon.fake();
        sinon.replace(dialogs, "alert", fakeAlert);

        try {
            await report.rateItem({id: "123"});

            assert.isTrue(fakeAction.called);
            assert.isFalse(requireFake.called);
            assert.isFalse(fakeAlert.called);
        } catch(e) {
            sinon.restore();
            throw e;
        }
        sinon.restore();
    });
});

describe("showEventDetails", function() {
    it("should navigate to event-details-page when event has pauta", function() {
        const fakeReportEvent = {
            pautas: [1, 2, 3]
        }
        const fakePage: any = fromObject(fakeReportEvent);
        fakePage.bindingContext = fakeReportEvent;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;

        report.showEventDetails(fakeEvent);

        assert.isTrue(navigateFake.calledWith({
            moduleName: "report/event-details-page",
            context: fakeReportEvent
        }));
        sinon.restore();
    });

    it("should show an alert when event has no pauta", function() {
        const fakeReportEvent = {
            pautas: []
        }
        const fakePage: any = fromObject(fakeReportEvent);
        fakePage.bindingContext = fakeReportEvent;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        const fakeAlert = sinon.fake();
        sinon.replace(dialogs, "alert", fakeAlert);
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;

        report.showEventDetails(fakeEvent);

        assert.isFalse(navigateFake.called);
        assert.isTrue(fakeAlert.calledWith("Evento sem pauta"));
        sinon.restore();
    });
});

describe("listAllEvents", function() {
    it("should navigate to all-absent-events-page", function() {
        const fakeReport = {
            eventos_ausentes: []
        }
        const fakePage: any = fromObject({
            "report": fakeReport
        });
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;

        report.listAllEvents(fakeEvent);

        assert.isTrue(navigateFake.calledWith({
            moduleName: "report/all-absent-events-page",
            context: fakeReport.eventos_ausentes
        }));
        sinon.restore();
    });
});
