import { topmost, EventData } from "tns-core-modules/ui/frame/frame";
import { fromObject } from "tns-core-modules/data/observable/observable";
import * as httpr from "tns-core-modules/http";
import * as dialogs from "tns-core-modules/ui/dialogs";

import * as sinon from "sinon";

import { registerAccount} from "~/sign-up/sign-up-page";

describe("registerAccount", function() {
    it("should navigate to login page when account is created", async () => {
        const requireFake = sinon.fake.resolves({
            statusCode: 201,
            content: {toJSON: () => {return {message: "Usuário criado"}}}
        });
        sinon.replace(httpr, 'request', requireFake);
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;
        const fakePage: any = fromObject({
            username: "username",
            email: "name@email.com",
            password: "secret",
            confirmedPassword: "secret"
        });
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };

        try {
            await registerAccount(fakeEvent);

            assert.isTrue(requireFake.called);
            assert.isTrue(navigateFake.calledWithMatch({
                moduleName: "subscriptions-home/subscriptions-home-page",
                clearHistory: true
            }));
            sinon.restore();
        } catch (e) {
            sinon.restore();
            throw e;
        }
    });

    it("should display alert with error message when account creation fails", async () => {
        const requireFake = sinon.fake.resolves({
            statusCode: 400,
            content: {toJSON: () => {return {message: "Requisitos não atingidos"}}}
        });
        sinon.replace(httpr, 'request', requireFake);
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;
        const fakeAlert = sinon.fake();
        sinon.replace(dialogs, 'alert', fakeAlert);
        const fakePage: any = fromObject({
            username: "username",
            email: "name@email.com",
            password: "secret",
            confirmedPassword: "invalid"
        });
        fakePage.bindingContext = fakePage;
        const fakeEvent: EventData = {
            eventName: "test",
            object: fakePage
        };
        
        try {
            await registerAccount(fakeEvent);
        
            assert.isTrue(requireFake.called);
            assert.isFalse(navigateFake.called);
            assert.isTrue(fakeAlert.calledOnceWith("Requisitos não atingidos"));
            sinon.restore();
        } catch (e) {
            sinon.restore();
            throw e;
        }
    });
});
