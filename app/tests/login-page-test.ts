import { topmost } from "tns-core-modules/ui/frame/frame";
import * as httpr from "tns-core-modules/http";

import { SecureStorage } from "nativescript-secure-storage";

import { LoginViewModel } from "../login/login-view-model";

const sinon = require('sinon');

describe("LoginViewModel", function() {
    afterEach(function() {
        sinon.verifyAndRestore();
        const secureStorage = new SecureStorage();
        secureStorage.removeAllSync();
    });

    describe("constructor", function() {
        
        it("should do nothing when there is no userToken", function() {
            sinon.replace(topmost(), 'navigate', sinon.fake())
            const navigateFake: any = topmost().navigate;

            let loginViewModel = new LoginViewModel();

            assert.isFalse(navigateFake.called)
        });
        
        it("should go to subscriptions-home when userToken exists", function() {
            let secureStorage = new SecureStorage();
            const result = secureStorage.setSync({
                key: "userToken",
                value: "token"
            });
            sinon.replace(topmost(), 'navigate', sinon.fake())
            const navigateFake: any = topmost().navigate;

            let loginViewModel = new LoginViewModel();

            assert.isTrue(navigateFake.calledWithMatch({
                moduleName: "subscriptions-home/subscriptions-home-page",
                clearHistory: true
            }));
        });
    });

    describe("onTap", function() {
        it("should save token when login suceeds", async () => {
            const secureStorage = new SecureStorage();
            const requireFake = sinon.fake.resolves({
                statusCode: 200,
                content: {toJSON: () => {return {token: "---userToken---"}}}
            });
            sinon.replace(httpr, 'request', requireFake);
            sinon.replace(topmost(), 'navigate', sinon.fake());
            const navigateFake: any = topmost().navigate;
            
            let loginViewModel = new LoginViewModel();
            loginViewModel.username = "user";
            loginViewModel.password = "password";
            await loginViewModel.onTap(null);
            
            assert.isTrue(requireFake.called);
            assert.equal(secureStorage.getSync({
                key: "userToken",
            }), "---userToken---");
            assert.isTrue(navigateFake.calledWithMatch({
                moduleName: "subscriptions-home/subscriptions-home-page",
                clearHistory: true
            }));
            assert.isFalse(loginViewModel.isLoading);
            sinon.restore();
        });
        
        it("when login fails", async () => {
            const secureStorage = new SecureStorage();
            const requireFake = sinon.fake.resolves({
                statusCode: 400,
                content: {toJSON: () => {return {message: "Login failed"}}}
            });
            sinon.replace(httpr, 'request', requireFake);
            sinon.replace(topmost(), 'navigate', sinon.fake());
            const navigateFake: any = topmost().navigate;
            
            let loginViewModel = new LoginViewModel();
            loginViewModel.username = "user";
            loginViewModel.password = "password";
            await loginViewModel.onTap(null);
            
            assert.isTrue(requireFake.called);
            assert.isNull(secureStorage.getSync({
                key: "userToken",
            }));
            assert.isFalse(navigateFake.called);
            assert.isFalse(loginViewModel.isLoading);
            sinon.restore();
        });
        
        it("when API timeouts", async () => {
            const requireFake = sinon.fake.rejects("Gateway timeouted");
            sinon.replace(httpr, 'request', requireFake);
            sinon.replace(topmost(), 'navigate', sinon.fake());
            const navigateFake: any = topmost().navigate;
            
            let loginViewModel = new LoginViewModel();
            loginViewModel.username = "user";
            loginViewModel.password = "password";
            await loginViewModel.onTap(null);
            
            assert.isTrue(requireFake.called);
            const secureStorage = new SecureStorage();
            assert.isNull(secureStorage.getSync({
                key: "userToken",
            }));
            assert.isFalse(navigateFake.called);
            assert.isFalse(loginViewModel.isLoading);
            sinon.restore();
        });
    });
});