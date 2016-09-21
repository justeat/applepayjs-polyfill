// Copyright (c) Just Eat, 2016. All rights reserved.
// Licensed under the Apache 2.0 license.

(function () {
    if ("ApplePaySession" in window === false) {

        ApplePaySession = function (version, request) {
            this.oncancel = null;
            this.onpaymentauthorized = null;
            this.onpaymentmethodselected = null;
            this.onshippingcontactselected = null;
            this.onshippingmethodselected = null;
            this.onvalidatemerchant = null;
        };

        ApplePaySession.STATUS_SUCCESS = 0;
        ApplePaySession.STATUS_FAILURE = 1;
        ApplePaySession.STATUS_INVALID_BILLING_POSTAL_ADDRESS = 2;
        ApplePaySession.STATUS_INVALID_SHIPPING_POSTAL_ADDRESS = 3;
        ApplePaySession.STATUS_INVALID_SHIPPING_CONTACT = 4;
        ApplePaySession.STATUS_PIN_REQUIRED = 5;
        ApplePaySession.STATUS_PIN_INCORRECT = 6;
        ApplePaySession.STATUS_PIN_LOCKOUT = 7;

        // Add your own token here intercepted from the browser console from a
        // transaction using your Merchant Identity Certificate with sandbox tester.
        ApplePaySession.paymentToken = {
            paymentData: {
                data: "",
                signature: "",
                header: {
                    publicKeyHash: "",
                    ephemeralPublicKey: "",
                    transactionId: ""
                },
                version: ""
            },
            transactionIdentifier: "",
            paymentMethod: {
                network: "",
                type: "",
                displayName: ""
            }
        };

        ApplePaySession.canMakePayments = function () {
            return true;
        };

        ApplePaySession.canMakePaymentsWithActiveCard = function (merchantIdentifier) {
            return Promise.resolve(true);
        };

        ApplePaySession.supportsVersion = function (version) {
            return version === 1;
        };

        ApplePaySession.prototype.abort = function () {
        };

        ApplePaySession.prototype.begin = function () {

            var event = {
                validationURL: "https://apple-pay-gateway-cert.apple.com/paymentservices/startSession"
            };

            this.onvalidatemerchant(event);
        };

        ApplePaySession.prototype.completeMerchantValidation = function (merchantSession) {

            // Populate shipping details and call the onshippingcontactselected
            // function to simulate user interaction with the Apple Pay sheet.
            var event = {
                shippingContact: {
                    emailAddress: "",
                    phoneNumber: "",
                    familyName: "",
                    givenName: "",
                    addressLines: [""],
                    locality: "",
                    postalCode: "",
                    administrativeArea: "",
                    country: "m",
                    countryCode: ""
                }
            };

            this.onshippingcontactselected(event);
        };

        ApplePaySession.prototype.completePayment = function (status) {
        };

        ApplePaySession.prototype.completePaymentMethodSelection = function (newTotal, newLineItems) {
        };

        ApplePaySession.prototype.completeShippingContactSelection = function (status, newShippingMethods, newTotal, newLineItems) {

            if (status === ApplePaySession.STATUS_SUCCESS) {

                // Populate billing and shipping details and call the onpaymentauthorized
                // function to simulate user interaction with the Apple Pay sheet.
                var event = {
                    payment: {
                        token: ApplePaySession.paymentToken,
                        billingContact: {
                            emailAddress: "",
                            phoneNumber: "",
                            familyName: "",
                            givenName: "",
                            addressLines: [""],
                            locality: "",
                            postalCode: "",
                            administrativeArea: "",
                            country: "",
                            countryCode: ""
                        },
                        shippingContact: {
                            emailAddress: "",
                            phoneNumber: "",
                            familyName: "",
                            givenName: "",
                            addressLines: [""],
                            locality: "",
                            postalCode: "",
                            administrativeArea: "",
                            country: "",
                            countryCode: ""
                        }
                    }
                };

                this.onpaymentauthorized(event);
            }
        };

        ApplePaySession.prototype.completeShippingMethodSelection = function (status, newTotal, newLineItems) {
        };
    }
}());
