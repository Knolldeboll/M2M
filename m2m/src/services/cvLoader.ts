import cvModule from '@techstark/opencv-js'

// lazyload cv 
//const cv = await import('@techstark/opencv-js');

/*
console.log("what is cv? ", cv)
console.log("what is cv type? ", typeof cv)
console.log("isPromise:", cv instanceof Promise);
console.log("default:", cv.default);*/cvModule
//const cvModule = await cv.default;

console.log("cvModule:", cvModule);
console.log("typeof:", typeof cvModule);
console.log("isPromise:", cvModule instanceof Promise);


let cvPromise: Promise<any> | null = null;

async function loadOpenCv() {
    if (cvModule instanceof Promise) {
        return await cvModule;
    }

    if (cvModule.Mat) {
        return cvModule;
    }

    await new Promise<void>((resolve) => {
        cvModule.onRuntimeInitialized = () => resolve();
    });

    return cvModule;
}

/**Singleton cv provider */
export function getCv() {
    if (!cvPromise) {
        cvPromise = loadOpenCv();
    }
    return cvPromise;
}