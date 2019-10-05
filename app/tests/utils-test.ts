import { topmost } from "tns-core-modules/ui/frame/frame";
import * as httpr from "tns-core-modules/http";

import { SecureStorage } from "nativescript-secure-storage";
import * as sinon from "sinon";

import * as utils from "../utils";

describe("utils", function() {
    it("should call ensureLoginDecorator when HTTP request suceeds", async () => {
        const secureStorage = new SecureStorage();
        secureStorage.setSync({
            key: "userToken",
            value: "token"
        });
        const requireFakeResponse = {
            statusCode: 200,
            content: {toJSON: () => {return {message: "Ok"}}}
        }
        const requireFake = sinon.fake.resolves(requireFakeResponse);
        sinon.replace(httpr, 'request', requireFake);
        const callback = sinon.fake();

        await utils.getAPI("/test", callback);

        assert.isTrue(requireFake.called);
        assert.isTrue(callback.called);
        sinon.restore();
    });

    it("should remove userToken when API responds with 401", async () => {
        const secureStorage = new SecureStorage();
        secureStorage.setSync({
            key: "userToken",
            value: "token"
        });
        const requireFakeResponse = {
            statusCode: 401,
            content: {toJSON: () => {return {message: "Unauthorized"}}}
        }
        const requireFake = sinon.fake.resolves(requireFakeResponse);
        sinon.replace(httpr, 'request', requireFake);
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;
        const callback = sinon.fake();

        await utils.getAPI("/test", callback);

        assert.isTrue(requireFake.called);
        assert.isFalse(callback.called);
        assert.isNull(secureStorage.getSync({
            key: "userToken",
        }));
        assert.isTrue(navigateFake.calledWithMatch({
            moduleName: "login/login-page",
            clearHistory: true
        }));
        sinon.restore();
    });
})