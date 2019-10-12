import { fromObject, EventData } from "tns-core-modules/data/observable/observable";

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
