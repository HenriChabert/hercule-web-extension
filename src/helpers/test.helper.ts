export const shutConsoleUp = () => {
    jest.spyOn(console, 'error')
    // @ts-ignore jest.spyOn adds this functionallity
    console.error.mockImplementation(() => null);
}

export const restoreConsole = () => {
    // @ts-ignore jest.spyOn adds this functionallity
    if (console.error.mockRestore) {
        // @ts-ignore jest.spyOn adds this functionallity
        console.error.mockRestore()
    };
}