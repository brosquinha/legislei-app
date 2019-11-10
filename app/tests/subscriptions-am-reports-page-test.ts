import { topmost } from "tns-core-modules/ui/frame/frame";
import * as httpr from "tns-core-modules/http";
import { Observable } from "tns-core-modules/ui/page/page";
import { fromObject, EventData } from "tns-core-modules/data/observable/observable";

import * as sinon from "sinon";

import * as reportsPage from "../subscriptions-am-reports/subscriptions-am-reports-page";

describe("onPageLoaded", function() {
    it("should set context with values returned from API if no values already present", async () => {
        const requireFakeResponse = [
            {data_final: "2019-03-30T00:00:00-03:00"}
        ];
        const requireFake = sinon.fake.resolves({
            statusCode: 200,
            content: {toJSON: () => {return requireFakeResponse}}
        });
        sinon.replace(httpr, 'request', requireFake);
        const fakePage: any = fromObject({});
        fakePage.navigationContext = {
            assemblyman_name: "name",
            assemblyman_house: "BR1"
        }
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        
        try {
            await reportsPage.onPageLoaded(fakeEvent);
            let fakeBindingContext: any = fakePage;
            fakeBindingContext = fakeBindingContext.bindingContext;
            
            assert.isTrue(requireFake.called);
            assert.deepEqual(fakeBindingContext.get("reports"), [
                {data_final: "2019-03-30T00:00:00-03:00", data_final_str: "30/03/2019"}
            ])
            assert.isFalse(fakeBindingContext.get("isLoading"));
        } catch(e) {
            sinon.restore();
            throw e
        }
        sinon.restore();
    });

    it("should do nothing if values already present", async () => {
        const requireFakeResponse = [
            {data_final: "2019-03-30T00:00:00-03:00"}
        ];
        const requireFake = sinon.fake.resolves({
            statusCode: 200,
            content: {toJSON: () => {return requireFakeResponse}}
        });
        sinon.replace(httpr, 'request', requireFake);
        const fakePage: any = fromObject({});
        fakePage.bindingContext = true;
        fakePage.navigationContext = {
            assemblyman_name: "name",
            assemblyman_house: "BR1"
        }
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        
        try {
            await reportsPage.onPageLoaded(fakeEvent);
            let fakeBindingContext: any = fakePage;
            fakeBindingContext = fakeBindingContext.bindingContext;
            
            assert.isFalse(requireFake.called);
            assert.isTrue(fakeBindingContext);
        } catch(e) {
            sinon.restore();
            throw e
        }
        sinon.restore();
    })
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
        
        reportsPage.goToReportPage(fakeEvent);
        
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
