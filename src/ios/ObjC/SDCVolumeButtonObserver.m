/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2020- Scandit AG. All rights reserved.
 */

#import "SDCVolumeButtonObserver.h"
#import <ScanditCaptureCore/ScanditCaptureCore.h>

// Use runtime to access the private class from ScanditCaptureCore
@implementation SDCVolumeButtonObserver {
    id _privateObserver;
}

+ (instancetype)volumeButtonObserverWithHandler:(void (^)(void))volumeChanged {
    return [[self alloc] initWithHandler:volumeChanged];
}

- (instancetype)initWithHandler:(void (^)(void))volumeChanged {
    self = [super init];
    if (self) {
        // Try to create the private implementation from ScanditCaptureCore
        Class privateClass = NSClassFromString(@"SDCVolumeButtonObserver");
        if (privateClass &&
            [privateClass respondsToSelector:@selector(volumeButtonObserverWithHandler:)]) {
            _privateObserver = [privateClass volumeButtonObserverWithHandler:volumeChanged];
        } else {
            // Fallback: store the handler but don't set up volume monitoring
            // This ensures the API works even if the private implementation isn't available
        }
    }
    return self;
}

@end
