import { expect } from "chai";
import { getSP, testSettings } from "../main.js";
import "@pnp/sp/webs";
import "@pnp/sp/related-items/web";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import "@pnp/sp/folders/list";
import "@pnp/sp/files/folder";
import { IList } from "@pnp/sp/lists";
import { getRandomString } from "@pnp/core";
import { SPFI } from "@pnp/sp";

describe("Related Items", function () {

    if (testSettings.enableWebTests) {
        let _spfi: SPFI = null;
        let sourceList: IList = null;
        let targetList: IList = null;
        let sourceListName = "";
        let targetListName = "";
        let webUrl = "";

        before(async function (done) {
            _spfi = getSP();

            // we need two lists to use for creating related items.
            const ler1 = await _spfi.web.lists.ensure("RelatedItemsSourceList", "", 107);
            const ler2 = await _spfi.web.lists.ensure("RelatedItemsTargetList", "", 107);

            webUrl = await _spfi.web.select("ServerRelativeUrl")().then(r => r.ServerRelativeUrl);

            sourceList = ler1.list;
            targetList = ler2.list;

            sourceListName = await sourceList.select("Id")().then(r => r.Id);
            targetListName = await targetList.select("Id")().then(r => r.Id);
            done();
        });

        it("addSingleLink", async function () {

            const sourceItem = await sourceList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);
            const targetItem = await targetList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);

            await _spfi.web.relatedItems.addSingleLink(sourceListName, sourceItem.Id, webUrl, targetListName, targetItem.Id, webUrl);
        });

        it("addSingleLinkToUrl", async function () {

            const file = await _spfi.web.defaultDocumentLibrary.rootFolder.files
                .addUsingPath(`test${getRandomString(4)}.txt`, "Test File", { Overwrite: true }).then(r => r.data);
            const targetItem = await targetList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);

            await _spfi.web.relatedItems.addSingleLinkToUrl(targetListName, targetItem.Id, file.ServerRelativeUrl);
        });

        // I can't figure out a reason for this method to exist or how to really test it.
        it("addSingleLinkFromUrl");

        it("deleteSingleLink", async function () {

            const sourceItem = await sourceList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);
            const targetItem = await targetList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);
            await _spfi.web.relatedItems.addSingleLink(sourceListName, sourceItem.Id, webUrl, targetListName, targetItem.Id, webUrl);

            await _spfi.web.relatedItems.deleteSingleLink(sourceListName, sourceItem.Id, webUrl, targetListName, targetItem.Id, webUrl);
        });

        it("getRelatedItems", async function () {

            const sourceItem = await sourceList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);
            const targetItem = await targetList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);
            await _spfi.web.relatedItems.addSingleLink(sourceListName, sourceItem.Id, webUrl, targetListName, targetItem.Id, webUrl);

            const targetItem2 = await targetList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);
            await _spfi.web.relatedItems.addSingleLink(sourceListName, sourceItem.Id, webUrl, targetListName, targetItem2.Id, webUrl);

            const items = await _spfi.web.relatedItems.getRelatedItems(sourceListName, sourceItem.Id);

            return expect(items).to.be.an.instanceOf(Array).and.have.lengthOf(2);
        });

        it("getPageOneRelatedItems", async function () {

            const sourceItem = await sourceList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);
            const targetItem = await targetList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);
            await _spfi.web.relatedItems.addSingleLink(sourceListName, sourceItem.Id, webUrl, targetListName, targetItem.Id, webUrl);

            const targetItem2 = await targetList.items.add({ Title: `Item ${getRandomString(4)}` }).then(r => r.data);
            await _spfi.web.relatedItems.addSingleLink(sourceListName, sourceItem.Id, webUrl, targetListName, targetItem2.Id, webUrl);

            const items = await _spfi.web.relatedItems.getPageOneRelatedItems(sourceListName, sourceItem.Id);

            return expect(items).to.be.an.instanceOf(Array).and.have.lengthOf(2);
        });
    }
});
