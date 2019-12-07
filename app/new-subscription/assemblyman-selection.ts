import { EventData, Page } from "tns-core-modules/ui/page/page";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { getAPI } from "~/utils";
import { SearchBar } from "tns-core-modules/ui/search-bar/search-bar";
import { fromObject } from "tns-core-modules/data/observable/observable";

export async function loadAssemblymen(args: EventData) {
    const page = <Page>args.object;
    const searchBar = <SearchBar>page.getViewById("searchBarField");
    searchBar.android.clearFocus();
    const context_info = page.navigationContext;
    const selectedHouse = context_info.house;
    if (page.bindingContext) {
        return;
    }
    const source = fromObject({
        isLoading: true,
        assemblymen: [],
        visibleAssemblymen: []
    })
    page.bindingContext = source;
    return await getAPI(`parlamentares/${selectedHouse}`, response => {
        if (response.statusCode != 200) {
            return alert("Não foi possível obter os parlamentares da casa selecionada");
        }
        const allAssemblymen = response.content.toJSON();
        source.set("assemblymen", allAssemblymen);
        source.set("visibleAssemblymen", allAssemblymen);
        source.set("isLoading", false);
    });
}

export function filterList(args: EventData): void {
    const searchBar = <SearchBar>args.object;
    searchBar.android.clearFocus();
    const page = <Page>searchBar.page;
    const allAssemblymen = page.bindingContext.get("assemblymen");
    page.bindingContext.set("visibleAssemblymen", allAssemblymen.filter((x: any) => `${x.nome} (${x.partido} - ${x.uf})`.toLowerCase().includes(searchBar.text.toLowerCase())));
}

export function clearFilter(args: EventData): void {
    const searchBar = <SearchBar>args.object;
    searchBar.android.clearFocus();
    const page = <Page>searchBar.page;
    const allAssemblymen = page.bindingContext.get("assemblymen");
    page.bindingContext.set("visibleAssemblymen", allAssemblymen);
}

export function goToConfirmation(args: EventData) {
    const page = <Page>args.object;
    topmost().navigate({
        moduleName: "new-subscription/confirm-choice",
        context: {assemblyman: page.bindingContext},
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
