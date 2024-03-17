export default {
    async scheduled(event, env, ctx) {
        const CLOUDFLARE_API_URL = "https://api.cloudflare.com/client/v4";
        let success = true;
        let statusText = 'All zones processed successfully.';
        // Check explicitly for 'true' or 'false'
        const notifyOnFailureOnly = env.NOTIFY_ON_FAILURE_ONLY === 'true';
        const enableWebhook = env.ENABLE_WEBHOOK === 'true';

        try {
            const zones = await this.fetchPaginated(env.CLOUDFLARE_API_TOKEN, `${CLOUDFLARE_API_URL}/zones`);

            console.log(zones);
            for (const zone of zones) {
                const dnsExport = await this.fetchFromUrl(env.CLOUDFLARE_API_TOKEN, `${CLOUDFLARE_API_URL}/zones/${zone.id}/dns_records/export`);
                const currentDate = new Date();
                const datePart = currentDate.toJSON().slice(0, 10);
                const timePart = currentDate.toTimeString().slice(0, 8).replace(/:/g, "-");
                const filename = `${zone.name}/${datePart}-${timePart}`;
                await env.DNS_BACKUPS_BUCKET.put(filename, dnsExport);
            }
        } catch (error) {
            console.error("Error: ", error);
            success = false;
            statusText = 'Failed processing zones: ' + error.message;
        }

        // Send webhook notification based on conditions
        if (enableWebhook && (!success || !notifyOnFailureOnly)) {
            const message = this.constructMessage(success, statusText);
            await this.sendWebhookNotification(env.WEBHOOK_URL, message);
        }
    },

    async fetchPaginated(token, url, params = {}) {
        const allResults = [];
        let page = 1;
        let totalPages = 1;

        do {
            const currentParams = { ...params, page };
            const filteredParams = Object.fromEntries(
                Object.entries(currentParams).filter(([_, v]) => v !== undefined)
            );
            const urlSearchParams = new URLSearchParams(filteredParams).toString();
            const response = await fetch(`${url}?${urlSearchParams}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch from ${url}. Status: ${response.status}`);
            }
            const data = await response.json();
            allResults.push(...data.result);

            const perPage = data.result_info.per_page;
            const totalCount = data.result_info.total_count;
            totalPages = Math.ceil(totalCount / perPage)
            page++;
        } while (page <= totalPages);

        return allResults;
    },

    async fetchFromUrl(token, url, params = {}) {
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined)
        );
        const urlSearchParams = new URLSearchParams(filteredParams).toString();
        const response = await fetch(`${url}?${urlSearchParams}`, {
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch from ${url}. Status: ${response.status}`);
        }
        return await response.text();
    },

    constructMessage(success, statusText) {
        const title = success ? 'DNS Backup successful' : 'DNS Backup failed';
        return {
            title,
            text: statusText,
            color: success ? '#00FF00' : '#FF0000',
        };
    },

    async sendWebhookNotification(webhookUrl, message) {
        if (!webhookUrl) {
            console.log('Webhook URL not provided, skipping notification.');
            return;
        }
        const payload = JSON.stringify(message);

        await fetch(webhookUrl, {
            method: 'POST',
            body: payload,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
};
