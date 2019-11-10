import { fromObject, EventData } from "tns-core-modules/data/observable/observable";
import * as coreUtils from "tns-core-modules/utils/utils";
import * as dialogs from "tns-core-modules/ui/dialogs";

import * as sinon from "sinon";

import * as eventDetails from "../report/event-details-page";

describe("loadEvent", function() {
    it("should set bindingContext with received event", function() {
        const fakeReportEvent = {
            id: "14"
        };
        const fakePage: any = fromObject({});
        fakePage.navigationContext = fakeReportEvent
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };

        eventDetails.loadEvent(fakeEvent);
        let fakeBindingContext: any = fakePage;
        fakeBindingContext = fakeBindingContext.bindingContext;

        assert.deepEqual(fakeBindingContext.get("event"), fakeReportEvent);
    });
});

describe("openProposition", function() {
    it("should open proposition URL", async () => {
        const fakeOpenUrl = sinon.fake();
        sinon.replace(coreUtils, "openUrl", fakeOpenUrl);
        const fakePage: any = fromObject({
            "data-url": "https://url.com.br"
        });
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };

        eventDetails.openProposition(fakeEvent);

        assert.isTrue(fakeOpenUrl.calledWith("https://url.com.br"));
        sinon.restore();
    });
});

describe("showFullEventTitle", function () {
    it("should show full event title", function() {
        const fakePage: any = fromObject({
            event: {nome: "Full very long name"}
        });
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        const fakeAlert = sinon.fake();
        sinon.replace(dialogs, "alert", fakeAlert);

        eventDetails.showFullEventTitle(fakeEvent);

        assert.isTrue(fakeAlert.calledOnceWith({
            message: fakePage.event.nome,
            okButtonText: "Ok"
        }));
        sinon.restore();
    });
});

describe("rateEvent", function() {
    it("should call rate item action dialog", function() {
        const fakePage: any = fromObject({
            event: {id: "123"}
        });
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        const fakeAction = sinon.fake();
        sinon.replace(dialogs, "action", fakeAction);

        eventDetails.rateEvent(fakeEvent);

        assert.isTrue(fakeAction.called);
        sinon.restore();
    });
});
