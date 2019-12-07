export let closeCallback;

export function onShownModally(args) {
    closeCallback = args.closeCallback;
}
