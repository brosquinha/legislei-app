import { topmost } from "tns-core-modules/ui/frame/frame";
import * as httpr from "tns-core-modules/http";
import * as dialog from "tns-core-modules/ui/dialogs";

import { SecureStorage } from "nativescript-secure-storage";
import { messaging, Message } from "nativescript-plugin-firebase/messaging";
import * as sinon from "sinon";

import * as utils from "../utils";
import * as platform from "tns-core-modules/platform";

describe("getAPI", function() {
    it("should call ensureLoginDecorator when HTTP request succeeds", async () => {
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

    it("should not call callback if request return 500 status code", async () => {
        const secureStorage = new SecureStorage();
        secureStorage.setSync({
            key: "userToken",
            value: "token"
        });
        const requireFakeResponse = {
            statusCode: 500,
            content: {toJSON: () => {return {message: "Error ☹️"}}}
        }
        const requireFake = sinon.fake.resolves(requireFakeResponse);
        sinon.replace(httpr, 'request', requireFake);
        const callback = sinon.fake();

        await utils.getAPI("/test", callback);

        assert.isTrue(requireFake.called);
        assert.isFalse(callback.called);
        sinon.restore();
    });
});

describe("postAPI", function() {
    it("should call API with POST request", async () => {
        const secureStorage = new SecureStorage();
        secureStorage.setSync({
            key: "userToken",
            value: "token"
        });
        const requireFakeResponse = {
            statusCode: 201,
            content: {toJSON: () => {return {message: "Ok"}}}
        }
        const requireFake = sinon.fake.resolves(requireFakeResponse);
        sinon.replace(httpr, 'request', requireFake);
        const callback = sinon.fake();

        await utils.postAPI("/test", {test: "testing"}, callback);

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

        await utils.postAPI("/test", {test: "testing"}, callback);

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
});

describe("formatHouse", function() {
    it("should return deputado federal when input is BR1", function() {
        const input = 'BR1';

        const output = utils.formatHouse(input);

        assert.equal(output, "deputado federal");
    });

    it("should return senador when input is BR2", function() {
        const input = 'BR2';

        const output = utils.formatHouse(input);

        assert.equal(output, "senador");
    });

    it("should return deputado estadual when input is two characters long", function() {
        const input1 = 'SP';
        const input2 = 'BA';

        const output1 = utils.formatHouse(input1);
        const output2 = utils.formatHouse(input2);

        assert.equal(output1, "deputado estadual");
        assert.equal(output2, "deputado estadual");
    });

    it("should return vereador when input is longer than two characters long", function() {
        const input1 = 'São Paulo';
        const input2 = 'Manaus';

        const output1 = utils.formatHouse(input1);
        const output2 = utils.formatHouse(input2);

        assert.equal(output1, "vereador");
        assert.equal(output2, "vereador");
    });
});

describe("parseDate", function() {
    it("should return a valid Date object", function() {
        const input = "2019-01-22T23:48:21.839Z";

        const output = utils.parseDate(input);

        assert.equal(output.toISOString(), new Date("2019-01-22T23:48:21.839Z").toISOString());
    });
});

describe("formatDate", function() {
    it("should properly format date to DD/MM/YYYY format", function() {
        const input = new Date("2019-01-22T23:48:21.839Z");

        const output = utils.formatDate(input)

        assert.equal(output, "22/01/2019");
    });
});

describe("formatDateTime", function() {
    it("should properly format date to DD/MM/YYY HH:MM format", function() {
        const input = new Date("2019-01-22T23:48:21.839Z");
        const currentLocalHour = input.getHours();

        const output = utils.formatDateTime(input)

        assert.equal(output, `22/01/2019 ${currentLocalHour}:48`);
    })
})

describe("receiveNotification", function() {
    this.timeout(3000);
    it("should go to reports overview page after 1 sec if notification on background", async () => {
        const sleep = (ms: number) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        const reportsInfoFake = [1, 2, 3];
        const messageFake: Message = {
            title: "I'm fake",
            body: "I'm not real",
            data: {reports: JSON.stringify(reportsInfoFake)},
            foreground: false
        }
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;

        try {
            await utils.receiveNotification(messageFake);
            await sleep(1000);

            assert.isTrue(navigateFake.calledWithMatch({
                moduleName: "reports-overview/reports-overview-page",
                context: {reports: reportsInfoFake, reportsIds: null}
            }));
        } catch(e) {
            sinon.restore();
            throw e;
        }

        sinon.restore();
    });

    it("should go to reports overview page if notification on foreground and user confirms", async () => {
        const reportsInfoFake = [1, 2, 3];
        const messageFake: Message = {
            title: "I'm fake",
            body: "I'm not real",
            data: {reports: JSON.stringify(reportsInfoFake)},
            foreground: true
        }
        const confirmFake = sinon.fake.resolves(true);
        sinon.replace(dialog, "confirm", confirmFake);
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;

        await utils.receiveNotification(messageFake);

        assert.isTrue(confirmFake.called);
        assert.isTrue(navigateFake.calledWithMatch({
            moduleName: "reports-overview/reports-overview-page",
            context: {reports: reportsInfoFake, reportsIds: null}
        }));

        sinon.restore();
    });

    it("should do nothing if notification in foreground and user cancels confirm", async () => {
        const reportsInfoFake = [1, 2, 3];
        const messageFake: Message = {
            title: "I'm fake",
            body: "I'm not real",
            data: {reports: JSON.stringify(reportsInfoFake)},
            foreground: true
        }
        const confirmFake = sinon.fake.resolves(false);
        sinon.replace(dialog, "confirm", confirmFake);
        sinon.replace(topmost(), 'navigate', sinon.fake());
        const navigateFake: any = topmost().navigate;

        await utils.receiveNotification(messageFake);

        assert.isTrue(confirmFake.called);
        assert.isFalse(navigateFake.called);

        sinon.restore();
    });
});

describe("syncDeviceToken", function() {
    it("should request new device route if no device with same uuid is found", async () => {
        const secureStorage = new SecureStorage();
        secureStorage.setSync({
            key: "userToken",
            value: "token"
        });
        const fakeDeviceList = [
            {uuid: "123"}
        ]
        const requireFakeResponse = {
            statusCode: 200,
            content: {toJSON: () => {return fakeDeviceList}}
        }
        const requireFake = sinon.fake.resolves(requireFakeResponse);
        sinon.replace(httpr, 'request', requireFake);

        await utils.syncDeviceToken("---token---")

        try {
            const requireFakePostCallArg = requireFake.lastCall.lastArg;
            assert.isTrue(requireFake.called);
            assert.equal(requireFake.callCount, 2);
            assert.equal(requireFakePostCallArg.method, "POST")
            assert.include(requireFakePostCallArg.url, "usuarios/dispositivos")
        } catch (e) {
            sinon.restore();
            throw e
        }

        sinon.restore();
    });

    it("should request update route if there is a device with current uuid, but token does not match", async () => {
        const secureStorage = new SecureStorage();
        secureStorage.setSync({
            key: "userToken",
            value: "token"
        });
        const fakeDeviceList = [
            {uuid: "123"}, {uuid: platform.device.uuid, token: "imdifferent"}
        ]
        const requireFakeResponse = {
            statusCode: 200,
            content: {toJSON: () => {return fakeDeviceList}}
        }
        const requireFake = sinon.fake.resolves(requireFakeResponse);
        sinon.replace(httpr, 'request', requireFake);

        await utils.syncDeviceToken("---token---")

        try {
            const requireFakePostCallArg = requireFake.lastCall.lastArg;
            assert.isTrue(requireFake.called);
            assert.equal(requireFake.callCount, 2);
            assert.equal(requireFakePostCallArg.method, "PATCH")
            assert.include(requireFakePostCallArg.url, `usuarios/dispositivos/${platform.device.uuid}`)
        } catch (e) {
            sinon.restore();
            throw e
        }

        sinon.restore();
    });

    it("should make no further API requests if current device has same token", async () => {
        const secureStorage = new SecureStorage();
        secureStorage.setSync({
            key: "userToken",
            value: "token"
        });
        const fakeDeviceList = [
            {uuid: "123"}, {uuid: platform.device.uuid, token: "---token---"}
        ]
        const requireFakeResponse = {
            statusCode: 200,
            content: {toJSON: () => {return fakeDeviceList}}
        }
        const requireFake = sinon.fake.resolves(requireFakeResponse);
        sinon.replace(httpr, 'request', requireFake);

        await utils.syncDeviceToken("---token---")

        try {
            const requireFakePostCallArg = requireFake.lastCall.lastArg;
            assert.isTrue(requireFake.called);
            assert.equal(requireFake.callCount, 1);
            assert.equal(requireFakePostCallArg.method, "GET")
            assert.include(requireFakePostCallArg.url, "usuarios/dispositivos")
        } catch (e) {
            sinon.restore();
            throw e
        }

        sinon.restore();        
    })
});
