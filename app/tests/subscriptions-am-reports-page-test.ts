import { topmost } from "tns-core-modules/ui/frame/frame";
import * as httpr from "tns-core-modules/http";
import { Observable } from "tns-core-modules/ui/page/page";
import { fromObject, EventData } from "tns-core-modules/data/observable/observable";

import * as sinon from "sinon";

import * as reportsPage from "../subscriptions-am-reports/subscriptions-am-reports-page";

describe("onPageLoaded", function() {
    it("should set context with values returned from API", async () => {
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
});
