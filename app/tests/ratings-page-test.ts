import * as httpr from "tns-core-modules/http";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { EventData } from "tns-core-modules/ui/page/page";

import * as sinon from "sinon";

import * as ratingsPage from "~/ratings/ratings-page";

describe("loadRatings", function() {
    it("should set context with ratings from API if no value are present", async () => {
        const fakeRatingsResponse = [
            {"avaliacao": "1"},
            {"avaliacao": "-1"},
            {"avaliacao": "-2"},
            {"avaliacao": "2"},
        ]
        const fakeRequire = sinon.fake.resolves({
            statusCode: 200,
            content: {toJSON: () => fakeRatingsResponse}
        });
        sinon.replace(httpr, 'request', fakeRequire);
        const fakePage: any = fromObject({});
        fakePage.navigationContext = {
            assemblyman: {
                "id": "id",
                "nome": "name",
                "casa": "house",
                "partido": "party",
                "uf": "state",
                "foto": "picture"
            }
        }
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };

        try {
            await ratingsPage.loadRatings(fakeEvent);
            let fakeBindingContext: any = fakePage;
            fakeBindingContext = fakeBindingContext.bindingContext;

            assert.isTrue(fakeRequire.calledOnce);
            assert.equal(fakeBindingContext.get("overallScore"), 0);
            assert.equal(fakeBindingContext.get("loveRatings").length, 1);
            assert.equal(fakeBindingContext.get("likeRatings").length, 1);
            assert.equal(fakeBindingContext.get("dislikeRatings").length, 1);
            assert.equal(fakeBindingContext.get("hateRatings").length, 1);
            assert.equal(fakeBindingContext.get("generalFeeling"), "Você não tem um veredito sobre esse parlamentar ainda");
        } catch (e) {
            sinon.restore();
            throw e;
        }
        sinon.restore();
    });
    
    it("should do nothing id values already present", async () => {
        const fakeRequire = sinon.fake();
        sinon.replace(httpr, 'request', fakeRequire);
        const fakePage: any = fromObject({});
        fakePage.bindingContext = true;
        fakePage.navigationContext = {
            assemblyman: {
                "id": "id",
                "nome": "name",
                "casa": "house",
                "partido": "party",
                "uf": "state",
                "foto": "picture"
            }
        }
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        
        await ratingsPage.loadRatings(fakeEvent);
        
        assert.isFalse(fakeRequire.called);
        sinon.restore();
    });
});
