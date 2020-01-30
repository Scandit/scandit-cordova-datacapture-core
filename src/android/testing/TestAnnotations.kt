/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.testing

/**
 * Annotating a class with this [OpenForTesting] annotation won't do anything.
 * This is required so that the test plugins can override this annotation's behaviour and open classes to allow
 * mockito-android to do its mocking magic.
 */
@Target(AnnotationTarget.CLASS)
annotation class OpenForTesting
