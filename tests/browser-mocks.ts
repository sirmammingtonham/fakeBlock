// only need this file because it gets run before the jest.mocks are hoisted,
// so the variables are actually initialized
export const storageGet = jest.fn();
export const sendMessage = jest.fn();
