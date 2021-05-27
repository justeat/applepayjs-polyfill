// Copyright (c) Just Eat, 2016. All rights reserved.
// Licensed under the Apache 2.0 license.

(function () {
    if ("ApplePaySession" in window === false) {

        /**
         * Object used to drive the ApplePaySession polyfill.
         */
        ApplePaySessionPolyfill = (function () {

            var latestApplePayVersion = 10;
            var self = {};

            self.hasActiveSession = false;
            self.isApplePaySetUp = true;
            self.paymentsEnabled = true;
            self.paymentRequest = null;
            self.merchantIdentifier = "";
            self.supportedVersions = [];
            self.shippingContactTimeout = 30000;
            self.authorizationTimeout = 30000;
            self.activityTimeoutId = 0;
            self.validationURL = "https://apple-pay-gateway-cert.apple.com/paymentservices/startSession";
            self.version = latestApplePayVersion;

            var version;

            for (version = 1; version <= latestApplePayVersion; version++) {
                self.supportedVersions.push(version);
            }

            /**
             * Disables payments with ApplePaySession.
             */
            self.disablePayments = function () {
                self.paymentsEnabled = false;
            };

            /**
             * Enables payments with ApplePaySession.
             */
            self.enablePayments = function () {
                self.paymentsEnabled = true;
            };

            /**
             * Sets the merchant identifier to use for payment.
             * @param {String} merchantIdentifier - The merchant identifier to use.
             */
            self.setMerchantIdentifier = function (merchantIdentifier) {
                self.merchantIdentifier = merchantIdentifier;
            };

            /**
             * Sets whether the user has set up Apple Pay.
             * @param {Boolean} isSetUp - Whether Apple Pay has been set up by the user on the device.
             */
            self.setUserSetupStatus = function (isSetUp) {
                self.isApplePaySetUp = isSetUp;
            };

            /**
             * Sets the time you must complete the shipping contanct selection with after "onshippingcontactselected" is called.
             * @param {Number} milliseconds - Timeout to use in milliseconds.
             */
            self.setShippingContactTimeout = function (milliseconds) {
                self.shippingContactTimeout = milliseconds;
            };

            /**
             * Sets the time you must complete the payment with after "onpaymentauthorized" is called.
             * @param {Number} milliseconds - Timeout to use in milliseconds.
             */
            self.setAuthorizationTimeout = function (milliseconds) {
                self.authorizationTimeout = milliseconds;
            };

            /**
             * Sets the validation URL to use for merchant validation.
             * @param {String} validationURL - The URL to use for merchant validation.
             */
            self.setValidationURL = function (validationURL) {
                self.validationURL = validationURL;
            };

            /**
             * Creates a PaymentContact to use for billing.
             * @param {Object} session - The current ApplePaySession.
             * @returns {PaymentContact} The PaymentContact created for billing.
             */
            self.createBillingContact = function (session) {
                throw "You must implement ApplePaySessionPolyfill.createBillingContact()";
            };

            /**
             * Creates a PaymentContact to use for shipping.
             * @param {Object} session - The current ApplePaySession.
             * @returns {PaymentContact} The PaymentContact created for shipping.
             */
            self.createShippingContact = function (session) {
                throw "You must implement ApplePaySessionPolyfill.createShippingContact()";
            };

            /**
             * Creates a PaymentToken for an authorized payment.
             * @param {Object} session - The current ApplePaySession.
             * @returns {PaymentToken} The PaymentToken created for an authorized payment.
             */
            self.createPaymentToken = function (session) {
                throw "You must implement ApplePaySessionPolyfill.createPaymentToken()";
            };

            /**
             * Callback for when a new ApplePaySession is initialized.
             * @param {Object} session - The current ApplePaySession.
             * @param {Number} version - The version passed to the ApplePaySession.
             * @param {PaymentRequest} paymentRequest - The payment request passed to the ApplePaySession.
             */
            self.onInit = function (session, version, paymentRequest) {

                if (self.hasActiveSession === true) {
                    throw "Page already has an active payment session.";
                }

                if (self.supportedVersions.indexOf(version) === -1) {
                    throw "\"" + version + "\" is not a supported version.";
                }

                if (!paymentRequest || !("countryCode" in paymentRequest)) {
                    throw "Missing country code.";
                }

                var countryCodes = [
                    "AE",
                    "AT",
                    "AU",
                    "BE",
                    "BG",
                    "BR",
                    "CA",
                    "CH",
                    "CN",
                    "CY",
                    "CZ",
                    "DE",
                    "DK",
                    "EE",
                    "ES",
                    "FR",
                    "FI",
                    "GB",
                    "GG",
                    "GR",
                    "HK",
                    "HR",
                    "HU",
                    "IE",
                    "IM",
                    "IS",
                    "IT",
                    "JE",
                    "JP",
                    "KZ",
                    "LI",
                    "LT",
                    "LU",
                    "LV",
                    "MT",
                    "NL",
                    "NO",
                    "NZ",
                    "PL",
                    "PT",
                    "RO",
                    "RU",
                    "SA",
                    "SG",
                    "SI",
                    "SK",
                    "SM",
                    "SW",
                    "TW",
                    "UA",
                    "US",
                    "VA"
                ];

                var currencyCodes = [
                    "AED",
                    "AUD",
                    "BGN",
                    "BRL",
                    "CAD",
                    "CHF",
                    "CNY",
                    "CZK",
                    "DKK",
                    "EUR",
                    "GBP",
                    "HKD",
                    "HRK",
                    "HUF",
                    "ISK",
                    "JPY",
                    "KZT",
                    "NOK",
                    "NZD",
                    "RON",
                    "RUB",
                    "SAR",
                    "SEK",
                    "SGD",
                    "TWD",
                    "UAH",
                    "USD"
                ];

                var merchantCapabilities = ["supports3DS", "supportsEMV", "supportsCredit", "supportsDebit"];
                var paymentNetworks = ["amex", "discover", "interac", "masterCard", "privateLabel", "visa"];

                if (version >= 2) {
                    paymentNetworks.push("jcb");
                }

                if (version >= 4) {
                    paymentNetworks.push("cartesBancaires");
                    paymentNetworks.push("eftpos");
                    paymentNetworks.push("electron");
                    paymentNetworks.push("maestro");
                    paymentNetworks.push("vPay");
                }

                if (version >= 5) {
                    paymentNetworks.push("elo");
                    paymentNetworks.push("mada");
                }

                if (countryCodes.indexOf(paymentRequest.countryCode) === -1) {
                    throw "\"" + paymentRequest.countryCode + "\" is not valid country code.";
                }

                if (!("currencyCode" in paymentRequest)) {
                    throw "Missing currency code.";
                }

                if (currencyCodes.indexOf(paymentRequest.currencyCode) === -1) {
                    throw "\"" + paymentRequest.currencyCode + "\" is not valid currency code.";
                }

                if (!("supportedNetworks" in paymentRequest) || paymentRequest.supportedNetworks.length === 0) {
                    throw "Missing supported networks";
                }

                var i;

                for (i = 0; i < paymentRequest.supportedNetworks.length; i++) {
                    var network = paymentRequest.supportedNetworks[i];
                    if (paymentNetworks.indexOf(network) === -1) {
                        throw "\"" + network + "\" is not valid payment network.";
                    }
                }

                if (!("merchantCapabilities" in paymentRequest) || paymentRequest.merchantCapabilities.length === 0) {
                    throw "Missing merchant capabilities";
                }

                for (i = 0; i < paymentRequest.merchantCapabilities.length; i++) {
                    var capability = paymentRequest.merchantCapabilities[i];
                    if (merchantCapabilities.indexOf(capability) === -1) {
                        throw "\"" + capability + "\" is not valid merchant capability.";
                    }
                }

                if (!("total" in paymentRequest) || !("label" in paymentRequest.total)) {
                    throw "Missing total label.";
                }

                if (!("amount" in paymentRequest.total)) {
                    throw "Missing total amount.";
                }

                var isValidAmount = /^[0-9]+(\.[0-9][0-9])?$/.test(paymentRequest.total.amount);

                if (isValidAmount === true && version < 4) {
                    isValidAmount = paymentRequest.total.amount !== "0.00";
                }

                if (isValidAmount !== true) {
                    throw "\"" + paymentRequest.total.amount + "\" is not a valid amount.";
                }

                self.hasActiveSession = true;
                self.paymentRequest = paymentRequest;
            };

            /**
             * Callback for ApplePaySession.abort().
             * @param {Object} session - The current ApplePaySession.
             */
            self.onAbort = function (session) {
            };

            /**
             * Callback for ApplePaySession.begin().
             * @param {Object} session - The current ApplePaySession.
             */
            self.onBegin = function (session) {

                var applePayValidateMerchantEvent = {
                    validationURL: self.validationURL
                };

                session.onvalidatemerchant(applePayValidateMerchantEvent);
            };

            /**
             * Callback for ApplePaySession.canMakePayments().
             * @param {Object} session - The current ApplePaySession.
             * @return {Boolean} The value to return from ApplePaySession.canMakePayments().
             */
            self.onCanMakePayments = function (session) {
                return self.paymentsEnabled === true;
            };

            /**
             * Callback for ApplePaySession.canMakePaymentsWithActiveCard().
             * @param {Object} session - The current ApplePaySession.
             * @param {String} merchantIdentifier - The merchant identifier passed to the function.
             * @return {Boolean} The value to return from ApplePaySession.canMakePaymentsWithActiveCard().
             */
            self.onCanMakePaymentsWithActiveCard = function (session, merchantIdentifier) {

                var result =
                    self.paymentsEnabled === true &&
                    merchantIdentifier &&
                    merchantIdentifier === self.merchantIdentifier;

                return Promise.resolve(result);
            };

            /**
             * Callback for ApplePaySession.completeMerchantValidation().
             * @param {Object} session - The current ApplePaySession.
             * @param {MerchantSession} merchantSession - The merchant session passed to the function.
             */
            self.onCompleteMerchantValidation = function (session, merchantSession) {

                if (typeof session.onshippingcontactselected === "function") {

                    var applePayShippingContactSelectedEvent = {
                        shippingContact: self.createShippingContact(session)
                    };

                    self.onShippingContactSelectedWithTimeout(session, applePayShippingContactSelectedEvent)
                } else {
                    var applePayPaymentAuthorizedEvent = {
                        payment: {
                            token: self.createPaymentToken(session),
                            billingContact: self.createBillingContact(session),
                            shippingContact: self.createShippingContact(session)
                        }
                    };

                    self.onPaymentAuthorizedWithTimeout(session, applePayPaymentAuthorizedEvent);
                }
            };

            /**
             * Callback for ApplePaySession.completePayment() for Apple Pay JS versions 1 and 2.
             * @param {Object} session - The current ApplePaySession.
             * @param {Number} status - The status code passed to the function.
             */
            self.onCompletePayment = function (session, status) {
                self.hasActiveSession = false;
                self.paymentRequest = null;

                clearTimeout(self.activityTimeoutId);
            };

            /**
             * Callback for ApplePaySession.completePayment() for Apple Pay JS version 3 and above.
             * @param {Object} session - The current ApplePaySession.
             * @param {Object} result - The result of the payment authorization, including its status and list of errors.
             */
            self.onCompletePaymentV3 = function (session, result) {
                self.hasActiveSession = false;
                self.paymentRequest = null;

                clearTimeout(self.activityTimeoutId);
            };

            /**
             * Callback for ApplePaySession.completePaymentMethodSelection() for Apple Pay JS versions 1 and 2.
             * @param {Object} session - The current ApplePaySession.
             * @param {Object} newTotal - The new total passed to the function.
             * @param {Object} newLineItems - The new line items passed to the function.
             */
            self.onCompletePaymentMethodSelection = function (session, newTotal, newLineItems) {

            };

            /**
             * Callback for ApplePaySession.completePaymentMethodSelection() for Apple Pay JS version 3 and above.
             * @param {Object} session - The current ApplePaySession.
             * @param {Object} update - The updated payment method.
             */
            self.onCompletePaymentMethodSelectionV3 = function (session, update) {

            };

            /**
             * Used internally to set the contact shipping selection timeout before calling "onshippingcontactselected".
             * @param {Object} session - The current ApplePaySession.
             * @param {Object} applePayShippingContactSelectedEvent - The event sent to onshippingcontactselected.
             */
            self.onShippingContactSelectedWithTimeout = function (session, applePayShippingContactSelectedEvent) {
                session.onshippingcontactselected(applePayShippingContactSelectedEvent);

                self.activityTimeoutId = setTimeout(() => {
                    alert('Apple Pay Not Finished - The site was not able to complete the payment. Please, try again.');
                }, self.shippingContactTimeout);
            };

            /**
             * Used internally to set the payment timeout before calling "onpaymentauthorized".
             * @param {Object} session - The current ApplePaySession.
             * @param {Object} applePayPaymentAuthorizedEvent - The event sent to onpaymentauthorized.
             */
            self.onPaymentAuthorizedWithTimeout = function (session, applePayPaymentAuthorizedEvent) {
                session.onpaymentauthorized(applePayPaymentAuthorizedEvent);

                self.activityTimeoutId = setTimeout(() => {
                    alert('Apple Pay Not Finished - The site was not able to complete the payment. Please, try again.');
                }, self.authorizationTimeout);
            };

            /**
             * Callback for ApplePaySession.completeShippingContactSelection() for Apple Pay JS versions 1 and 2.
             * @param {Object} session - The current ApplePaySession.
             * @param {Number} status - The status code passed to the function.
             * @param {Object} newShippingMethods - The new shipping methods passed to the function.
             * @param {Object} newTotal - The new total passed to the function.
             * @param {Object} newLineItems - The new line items passed to the function.
             */
            self.onCompleteShippingContactSelection = function (session, status, newShippingMethods, newTotal, newLineItems) {
                clearTimeout(self.activityTimeoutId);

                if (status === ApplePaySession.STATUS_SUCCESS) {
                    var applePayPaymentAuthorizedEvent = {
                        payment: {
                            token: self.createPaymentToken(session),
                            billingContact: self.createBillingContact(session),
                            shippingContact: self.createShippingContact(session)
                        }
                    };

                    self.onPaymentAuthorizedWithTimeout(session, applePayPaymentAuthorizedEvent);
                }
            };

            /**
             * Callback for ApplePaySession.completeShippingContactSelection() for Apple Pay JS version 3 and above.
             * @param {Object} session - The current ApplePaySession.
             * @param {Object} update - The updated shipping contact.
             */
            self.onCompleteShippingContactSelectionV3 = function (session, update) {
                clearTimeout(self.activityTimeoutId);

                if (!update.errors || update.errors.length === 0) {
                    var applePayPaymentAuthorizedEvent = {
                        payment: {
                            token: self.createPaymentToken(session),
                            billingContact: self.createBillingContact(session),
                            shippingContact: self.createShippingContact(session)
                        }
                    };

                    self.onPaymentAuthorizedWithTimeout(session, applePayPaymentAuthorizedEvent);
                }
            };

            /**
             * Callback for ApplePaySession.completeShippingMethodSelection() for Apple Pay JS versions 1 and 2.
             * @param {Object} session - The current ApplePaySession.
             * @param {Number} status - The status code passed to the function.
             * @param {Object} newTotal - The new total passed to the function.
             * @param {Object} newLineItems - The new line items passed to the function.
             */
            self.onCompleteShippingMethodSelection = function (session, status, newTotal, newLineItems) {

            };

            /**
             * Callback for ApplePaySession.completeShippingMethodSelection() for Apple Pay JS version 3 and above.
             * @param {Object} session - The current ApplePaySession.
             * @param {Object} update - The updated shipping method.
             */
            self.onCompleteShippingMethodSelectionV3 = function (session, update) {

            };

            /**
             * Callback for ApplePaySession.openPaymentSetup().
             * @param {Object} session - The current ApplePaySession.
             * @param {String} merchantIdentifier - The merchant identifier passed to the function.
             */
            self.onOpenPaymentSetup = function (session, merchantIdentifier) {

                var result =
                    self.paymentsEnabled === true &&
                    merchantIdentifier &&
                    merchantIdentifier === self.merchantIdentifier;

                if (result === true) {
                    result = self.isApplePaySetUp;
                }

                return Promise.resolve(result);
            };

            /**
             * Callback for ApplePaySession.supportsVersion().
             * @param {Object} session - The current ApplePaySession.
             * @param {Number} version - The version passed to the function.
             * @return {Boolean} The value to return from ApplePaySession.supportsVersion().
             */
            self.onSupportsVersion = function (session, version) {
                return self.supportedVersions.indexOf(version) !== -1;
            };

            return self;
        })();

        ApplePaySession = function (version, request) {

            this.oncancel = null;
            this.onpaymentauthorized = null;
            this.onpaymentmethodselected = null;
            this.onshippingcontactselected = null;
            this.onshippingmethodselected = null;
            this.onvalidatemerchant = null;
            this.version = version;

            ApplePaySessionPolyfill.onInit(this, version, request);
        };

        ApplePaySession.STATUS_SUCCESS = 0;
        ApplePaySession.STATUS_FAILURE = 1;
        ApplePaySession.STATUS_INVALID_BILLING_POSTAL_ADDRESS = 2;
        ApplePaySession.STATUS_INVALID_SHIPPING_POSTAL_ADDRESS = 3;
        ApplePaySession.STATUS_INVALID_SHIPPING_CONTACT = 4;
        ApplePaySession.STATUS_PIN_REQUIRED = 5;
        ApplePaySession.STATUS_PIN_INCORRECT = 6;
        ApplePaySession.STATUS_PIN_LOCKOUT = 7;

        ApplePaySession.canMakePayments = function () {
            return ApplePaySessionPolyfill.onCanMakePayments(this);
        };

        ApplePaySession.canMakePaymentsWithActiveCard = function (merchantIdentifier) {
            return ApplePaySessionPolyfill.onCanMakePaymentsWithActiveCard(this, merchantIdentifier);
        };

        ApplePaySession.openPaymentSetup = function (merchantIdentifier) {
            return ApplePaySessionPolyfill.onOpenPaymentSetup(this, merchantIdentifier);
        };

        ApplePaySession.supportsVersion = function (version) {
            return ApplePaySessionPolyfill.onSupportsVersion(this, version);
        };

        ApplePaySession.prototype.abort = function () {
            ApplePaySessionPolyfill.onAbort(this);
        };

        ApplePaySession.prototype.begin = function () {
            ApplePaySessionPolyfill.onBegin(this);
        };

        ApplePaySession.prototype.completeMerchantValidation = function (merchantSession) {
            ApplePaySessionPolyfill.onCompleteMerchantValidation(this, merchantSession);
        };

        ApplePaySession.prototype.completePayment = function (...args) {
            if (this.version >= 3) {
                var result = args[0];
                ApplePaySessionPolyfill.onCompletePaymentV3(this, result);
            } else {
                var status = args[0];
                ApplePaySessionPolyfill.onCompletePayment(this, status);
            }
        };

        ApplePaySession.prototype.completePaymentMethodSelection = function (...args) {
            if (this.version >= 3) {
                var update = args[0];
                ApplePaySessionPolyfill.onCompletePaymentMethodSelectionV3(this, update);
            } else {
                var newTotal = args[0];
                var newLineItems = args[1];
                ApplePaySessionPolyfill.onCompletePaymentMethodSelection(this, newTotal, newLineItems);
            }
        };

        ApplePaySession.prototype.completeShippingContactSelection = function (...args) {
            if (this.version >= 3) {
                var update = args[0];
                ApplePaySessionPolyfill.onCompleteShippingContactSelectionV3(this, update);
            } else {
                var status = args[0];
                var newShippingMethods = args[1];
                var newTotal = args[2];
                var newLineItems = args[3];
                ApplePaySessionPolyfill.onCompleteShippingContactSelection(this, status, newShippingMethods, newTotal, newLineItems);
            }
        };

        ApplePaySession.prototype.completeShippingMethodSelection = function (...args) {
            if (this.version >= 3) {
                var update = args[0];
                ApplePaySessionPolyfill.onCompleteShippingMethodSelectionV3(this, update);
            } else {
                var status = args[0];
                var newTotal = args[1];
                var newLineItems = args[2];
                ApplePaySessionPolyfill.onCompleteShippingMethodSelection(this, status, newTotal, newLineItems);
            }
        };
    }
}());
