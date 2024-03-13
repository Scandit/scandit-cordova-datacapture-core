export declare class VolumeButtonObserver {
    private didChangeVolume;
    private proxy;
    constructor(didChangeVolume: () => void);
    dispose(): void;
    private initialize;
}
