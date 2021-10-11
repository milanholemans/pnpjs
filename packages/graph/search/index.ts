import { SearchRequest as ISearchRequestType, SearchResponse as ISearchResponseType } from "@microsoft/microsoft-graph-types";
import { Search } from "./types.js";
import { GraphFI } from "../fi.js";

export {
    ISearch,
    Search,
} from "./types.js";

declare module "../fi" {
    interface GraphFI {
        query(...requests: ISearchRequestType[]): Promise<ISearchResponseType[]>;
    }
}

GraphFI.prototype.query = async function (this: GraphFI, ...requests: ISearchRequestType[]): Promise<ISearchResponseType[]> {
    return this.create(Search).executeQuery({ requests });
};
