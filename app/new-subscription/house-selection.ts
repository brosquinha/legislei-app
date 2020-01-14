import { EventData, Page } from "tns-core-modules/ui/page/page";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { getAPI } from "~/utils";

export async function loadAvailableHouses(args: EventData) {
    const page = <Page>args.object;
    const searchBar = <SearchBar>page.getViewById("searchBarField");
    searchBar.android.clearFocus();
    const selectedOffice = page.navigationContext;
    if (page.bindingContext) {
        return;
    }
    const source = fromObject({
        isLoading: true,
        houses: [],
        visibleHouses: []
    })
    page.bindingContext = source;
    return await getAPI(`casas/${(selectedOffice == 'Vereador' ? 'municipios' : 'estados')}`, response => {
        if (response.statusCode != 200) {
            return alert("Não foi possível obter as casas legislativas disponíveis");
        }
        const availableHouses = response.content.toJSON().casas;
        source.set("houses", availableHouses);
        source.set("visibleHouses", availableHouses);
        source.set("isLoading", false);
    });
}

export function filterList(args: EventData): void {
    const searchBar = <SearchBar>args.object;
    searchBar.android.clearFocus();
    const page = <Page>searchBar.page;
    const allHouses = page.bindingContext.get("houses");
    page.bindingContext.set("visibleHouses", allHouses.filter((x: string) => x.includes(searchBar.text.toUpperCase())));
}

export function clearFilter(args: EventData): void {
    const searchBar = <SearchBar>args.object;
    searchBar.android.clearFocus();
    const page = <Page>searchBar.page;
    const allHouses = page.bindingContext.get("houses");
    page.bindingContext.set("visibleHouses", allHouses);
}

export function goToAssemblymanSelection(args: EventData) {
    const page = <Page>args.object;
    topmost().navigate({
        moduleName: "new-subscription/assemblyman-selection",
        context: {house: page.bindingContext},
        backstackVisible: true,
        transition: {
            name: "slideLeft"
        }
    });
}

export function closeModal(args) {
    args.object.closeModal();
}

export function goBackTo(args: EventData): void {
    topmost().goBack();
}
