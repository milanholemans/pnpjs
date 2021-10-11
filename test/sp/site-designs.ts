
import { getRandomString } from "@pnp/core";
import { expect } from "chai";
import "@pnp/sp/webs";
import "@pnp/sp/site-designs";
import "@pnp/sp/site-users/web";
import { ISiteDesignRun } from "@pnp/sp/site-designs";
import { getSP, testSettings } from "../main.js";
import { SPFI } from "@pnp/sp";

const sleep = (ms: number) => new Promise<void>(r => setTimeout(() => {
    r();
}, ms));

describe("SiteDesigns", function () {

    const testuser = testSettings.testUser;

    if (testSettings.enableWebTests) {
        let _spfi: SPFI = null;

        before(function () {
            _spfi = getSP();
        });

        const createdSiteDesignIds: string[] = [];

        it("creates a site design", function () {

            const title = `Test_create_sitedesign_${getRandomString(8)}`;
            const p = _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            }).then(sd => createdSiteDesignIds.push(sd.Id));

            return expect(p, `site design '${title}' should've been created`).to.eventually.be.fulfilled;
        });

        it("deletes a site design", async function () {

            const title = `Test_to_be_deleted_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            return expect(_spfi.siteDesigns.deleteSiteDesign(sd.Id),
                `site design '${title}' should've been deleted`).to.eventually.be.fulfilled;
        });

        it("fails to delete a site design with non-existing id", function () {

            return expect(_spfi.siteDesigns.deleteSiteDesign(null),
                "site design should NOT have been deleted").to.eventually.be.rejected;
        });

        it("gets the site design metadata", async function () {

            const title = `Test_get_metadata_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);

            return expect(_spfi.siteDesigns.getSiteDesignMetadata(sd.Id),
                `metadata of site design '${title}' should have been retrieved`).to.eventually.be.fulfilled;
        });

        it("applies a site designs", async function () {

            const title = `Test_applying_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);
            // TODO: Validate this test
            return expect(_spfi.siteDesigns.applySiteDesign(sd.Id, testSettings.sp.webUrl),
                `site design '${title}' should've been applied to site '${testSettings.sp.webUrl}'`).to.eventually.be.fulfilled;
        });

        it("updates a site designs", async function () {

            const title = `Test_to_update_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);

            const updatedTitle = `Test_updated_sitedesign_${getRandomString(8)}`;
            return expect(_spfi.siteDesigns.updateSiteDesign({
                Id: sd.Id,
                Title: updatedTitle,
            }), `site design '${title}' should've been updated`).to.eventually.be.fulfilled;
        });

        it("gets all the site designs", async function () {

            return expect(_spfi.siteDesigns.getSiteDesigns(),
                "all the site designs should've been fetched").to.eventually.be.fulfilled;
        });

        it("gets the site designs rights", async function () {

            const title = `Test_to_get_sitedesign_rights__${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);

            return expect(_spfi.siteDesigns.getSiteDesignRights(sd.Id),
                `rights for the site design '${title}' should've been fetched`).to.eventually.be.fulfilled;
        });

        it("grants the site design rights", async function () {

            const title = `Test_grant_rights_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);

            return expect(_spfi.siteDesigns.grantSiteDesignRights(
                sd.Id,
                [testuser],
            ), `rights of site design '${title}' should have been granted to user '${testuser}'`).to.eventually.be.fulfilled;
        });

        it("revokes the site design rights", async function () {

            const title = `Test_revoke_rights_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);

            await _spfi.siteDesigns.grantSiteDesignRights(sd.Id, [testuser]);

            return expect(_spfi.siteDesigns.revokeSiteDesignRights(sd.Id, [testuser]),
                `rights of site design '${title}' should have been revoked from user '${testuser}'`).to.eventually.be.fulfilled;
        });

        it("gets the site design runs", async function () {

            return expect(_spfi.web.getSiteDesignRuns(),
                "site design runs should've been fetched").to.eventually.be.fulfilled;
        });

        it("adds a site design task with absolute web url", async function () {

            const title = `Test_add_task_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);
            // TODO: Validate this test
            return expect(_spfi.siteDesigns.addSiteDesignTask(testSettings.sp.webUrl, sd.Id),
                "site design task should've been created with absolute web url").to.eventually.be.fulfilled;
        });

        it("adds a site design task", async function () {

            const title = `Test_add_task_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);
            const siteDesignTask = await _spfi.web.addSiteDesignTask(sd.Id);

            return expect(siteDesignTask,
                "site design task should've been created").to.not.be.null;
        });

        it("gets a site design task", async function () {

            const title = `Test_get_task_run_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);

            const originalTask = await _spfi.web.addSiteDesignTask(sd.Id);

            return expect(_spfi.siteDesigns.getSiteDesignTask(originalTask.ID),
                "site design task should've been fetched").to.eventually.be.fulfilled;
        });

        it("gets a site design run status", async function () {

            const title = `Test_add_task_run_sitedesign_${getRandomString(8)}`;
            const sd = await _spfi.siteDesigns.createSiteDesign({
                Title: title,
                WebTemplate: "68",
            });

            createdSiteDesignIds.push(sd.Id);

            const originalTask = await _spfi.web.addSiteDesignTask(sd.Id);

            let task = null;
            do {
                await sleep(10000);
                task = await _spfi.siteDesigns.getSiteDesignTask(originalTask.ID);
            }
            while (task != null);

            const siteDesignRuns: ISiteDesignRun[] = await _spfi.web.getSiteDesignRuns();

            return expect(_spfi.web.getSiteDesignRunStatus(siteDesignRuns[0].ID),
                "site design task should've been created").to.eventually.be.fulfilled;
        });

        after(function () {
            return Promise.all(createdSiteDesignIds.map((sdId) => {
                return _spfi.siteDesigns.deleteSiteDesign(sdId);
            }));
        });
    }
});
