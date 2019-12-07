import { EventData, Page } from "tns-core-modules/ui/page/page";
import { ListPicker } from "tns-core-modules/ui/list-picker";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { topmost } from "tns-core-modules/ui/frame/frame";

export function onLoaded(args: EventData) {
    const page = <Page>args.object;
    const source = fromObject({
        offices: [
            "Deputado federal",
            "Deputado estadual",
            "Vereador"
        ],
        selectedOffice: 0
    });
    page.bindingContext = source;
}

export function onListPickerLoaded(args: EventData) {
    const listPicker = <ListPicker>args.object;
    const page = listPicker.page;
    listPicker.on("selectedIndexChange", (lpargs) => {
        const picker = <ListPicker>lpargs.object;
        page.bindingContext.set("selectedOffice", picker.selectedIndex);
    });
}

export function goToHouseSelection(args: EventData): void {
    const page = <Page>args.object;
    if (page.bindingContext.get("offices")[page.bindingContext.get("selectedOffice")] == "Deputado federal") {
        topmost().navigate({
            moduleName: "new-subscription/assemblyman-selection",
            context: {house: "BR1"},
            backstackVisible: true,
            transition: {
                name: "slideLeft"
            }
        });
    } else {
        topmost().navigate({
            moduleName: "new-subscription/house-selection",
            backstackVisible: true,
            context: page.bindingContext,
            transition: {
                name: "slideLeft"
            }
        })
    }
}

export function onShownModally(args) {
    console.log(args.context)
    console.log(args.closeCallback)
}

export function closeModal(args) {
    args.object.closeModal();
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}
