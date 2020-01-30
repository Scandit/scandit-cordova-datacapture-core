/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

// Finish-blocking actions will be run immediately on the cordova thread where they're
// received. They'll also notify we should release the engine-thread.
interface ActionFinishBlocking : Action
