/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

// Blocking actions will be run synchronously on the calling thread, and will freeze the
// engine-thread until a ActionFinishBlocking action is executed.
interface ActionBlocking : Action
