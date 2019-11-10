import { fromObject, EventData } from "tns-core-modules/data/observable/observable";
import * as dialogs from "tns-core-modules/ui/dialogs";

import * as sinon from "sinon";

import * as absentEvents from "../report/all-absent-events-page";

describe("loadEvent", function() {
    it("should set bindingContext with received events", function() {
        const fakeReportEvent = {
            id: "14"
        };
        const fakePage: any = fromObject({});
        fakePage.navigationContext = [fakeReportEvent]
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };

        absentEvents.loadEvents(fakeEvent);
        let fakeBindingContext: any = fakePage;
        fakeBindingContext = fakeBindingContext.bindingContext;

        assert.deepEqual(fakeBindingContext.get("events"), [fakeReportEvent]);
    });
});

describe("showFullEventTitle", function() {
    it("should show full event title and rate dialog if rate button is clicked", async () => {
        const fakePage: any = fromObject({});
        fakePage.bindingContext = {nome: "Full very long event name"};
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        const fakeConfirm = sinon.fake.resolves(true);
        sinon.replace(dialogs, "confirm", fakeConfirm);
        const fakeAction = sinon.fake();
        sinon.replace(dialogs, "action", fakeAction);

        await absentEvents.showFullEventTitle(fakeEvent);

        assert.isTrue(fakeConfirm.called);
        assert.isTrue(fakeAction.called);
        sinon.restore();
    });

    it("should show full event name but do nothing else if rate button is not clicked", async () => {
        const fakePage: any = fromObject({});
        fakePage.bindingContext = {nome: "Full very long event name"};
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        const fakeConfirm = sinon.fake.resolves(false);
        sinon.replace(dialogs, "confirm", fakeConfirm);
        const fakeAction = sinon.fake();
        sinon.replace(dialogs, "action", fakeAction);

        await absentEvents.showFullEventTitle(fakeEvent);

        assert.isTrue(fakeConfirm.called);
        assert.isFalse(fakeAction.called);
        sinon.restore();
    });
});
