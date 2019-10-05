import { topmost } from "tns-core-modules/ui/frame/frame";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { Page, EventData, Observable } from "tns-core-modules/ui/page";
import * as httpr from "tns-core-modules/http";

import * as sinon from "sinon";

import * as home from "../subscriptions-home/subscriptions-home-page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { SecureStorage } from "nativescript-secure-storage";

describe("onPageLoaded", function() {
    this.afterAll(function() {
        sinon.restore()
    })

    it("should get users subscriptions", async () => {
        const requireFakeResponse = {
            parlamentares: [],
            intervalo: 7
        };
        const requireFake = sinon.fake.resolves({
            statusCode: 200,
            content: {toJSON: () => {return requireFakeResponse}}
        });
        sinon.replace(httpr, 'request', requireFake);
        const fakePage: Observable = fromObject({});
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        
        try {
            await home.onPageLoaded(fakeEvent);
            let fakeBindingContext: any = fakePage;
            fakeBindingContext = fakeBindingContext.bindingContext;
            
            assert.isTrue(requireFake.called);
            assert.equal(fakeBindingContext.get("subscriptions"), requireFakeResponse)
        } catch(e) {
            sinon.restore();
            throw e
        }
        sinon.restore();
    });
});

describe("onCheckAssemblymanReports", function() {
    it("should navigate to subscriptions-reports", () => {
        const assemblyman_id = "14";
        const assemblyman_name = "name";
        const assemblyman_house = "BR1";
        const fakePage: Observable = fromObject({
            "data-id": assemblyman_id,
            "data-house": assemblyman_house,
            "data-name": assemblyman_name
        });
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;
        
        home.onCheckAssemblymanReports(fakeEvent);
        let fakeBindingContext: any = fakePage;
        fakeBindingContext = fakeBindingContext.bindingContext;
        
        assert.isTrue(navigateFake.calledWithMatch({
            moduleName: "subscriptions-am-reports/subscriptions-am-reports-page",
            backstackVisible: true,
            context: {
                assemblyman_id: assemblyman_id,
                assemblyman_name: assemblyman_name,
                assemblyman_house: assemblyman_house
            }
        }));
        sinon.restore();
    });
});

describe("confirmDelete", function() {
    it("should for now do nothing when user confirms deletion", async () => {
        const confirmFake = sinon.fake.resolves(true);
        sinon.replace(dialogs, "confirm", confirmFake);

        await home.confirmDelete(null);

        assert.isTrue(confirmFake.called);
        sinon.restore();
    });
    
    it("should for now do nothing when user cancels deletion", async () => {
        const confirmFake = sinon.fake.resolves(false);
        sinon.replace(dialogs, "confirm", confirmFake);

        await home.confirmDelete(null);

        assert.isTrue(confirmFake.called);
        sinon.restore();
    });
});

describe("confirmLogout", function() {
    it("should remove userToken and go to login page when user confirms logout", async () => {
        const secureStorage = new SecureStorage();
        secureStorage.setSync({
            key: "userToken",
            value: "token"
        });
        const confirmFake = sinon.fake.resolves(true);
        sinon.replace(dialogs, "confirm", confirmFake);
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;
        
        await home.confirmLogout(null);
        
        assert.isNull(secureStorage.getSync({
            key: "userToken",
        }));
        assert.isTrue(navigateFake.calledWithMatch({
            moduleName: "login/login-page",
            clearHistory: true
        }));
        assert.isTrue(confirmFake.called);
        sinon.restore();
    });

    it("should do nothing if user cancels logout", async () => {
        const secureStorage = new SecureStorage();
        secureStorage.setSync({
            key: "userToken",
            value: "token"
        });
        const confirmFake = sinon.fake.resolves(false);
        sinon.replace(dialogs, "confirm", confirmFake);
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;
        
        await home.confirmLogout(null);
        
        assert.equal(secureStorage.getSync({
            key: "userToken",
        }), "token");
        assert.isFalse(navigateFake.called);
        assert.isTrue(confirmFake.called);
        sinon.restore();
    });
});
