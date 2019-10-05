import * as httpr from "tns-core-modules/http";

import * as sinon from "sinon";

import * as report from "../report/report-page";
import { fromObject, EventData } from "tns-core-modules/data/observable/observable";

describe("loadReport", function() {
    it("should load report", async () => {
        const requireFakeResponse = {
            id: "reportId"
        };
        const requireFake = sinon.fake.resolves({
            statusCode: 200,
            content: {toJSON: () => {return requireFakeResponse}}
        });
        sinon.replace(httpr, 'request', requireFake);
        const fakePage: any = fromObject({});
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
            assert.deepEqual(fakeBindingContext.get("report"), requireFakeResponse);
        } catch(e) {
            sinon.restore();
            throw e
        }
        sinon.restore();
    });
});
